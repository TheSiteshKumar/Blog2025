import { Metadata, ResolvingMetadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import BlogPostView from './BlogPostView';
import { sanitizeHtml } from '@/lib/sanitize-html';

// This function is required for static site generation with dynamic routes
export async function generateStaticParams() {
  try {
    // Create a Supabase client for server components
    const supabase = createServerSupabaseClient();
    
    // Fetch all published posts
    const { data } = await supabase
      .from('posts')
      .select('slug')
      .eq('status', 'published');
    
    // Return the slugs for static generation
    return (data || []).map((post: { slug: string }) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error('Error fetching posts for static generation:', error);
    return [];
  }
}

// Generate metadata for the page
export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    // Create a Supabase client for server components
    const supabase = createServerSupabaseClient();
    
    const { data } = await supabase
      .from('posts')
      .select('title, meta_title, meta_description, excerpt, image_url, content')
      .eq('slug', params.slug)
      .single();
    
    if (!data) {
      return {
        title: 'Blog Post Not Found',
        description: 'The requested blog post could not be found'
      };
    }
    
    // Extract a clean description from content if needed
    let description = data.meta_description || data.excerpt;
    if (!description && data.content) {
      // Strip HTML tags and limit to 160 characters
      const textContent = data.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      description = textContent.substring(0, 160) + (textContent.length > 160 ? '...' : '');
    }
    
    return {
      title: data.meta_title || data.title,
      description: description || `Read more about ${data.title}`,
      openGraph: {
        title: data.meta_title || data.title,
        description: description || `Read more about ${data.title}`,
        type: 'article',
        url: `/${params.slug}`,
        images: data.image_url ? [{ url: data.image_url }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: data.meta_title || data.title,
        description: description || `Read more about ${data.title}`,
        images: data.image_url ? [data.image_url] : undefined,
      }
    };
  } catch (error) {
    console.error('Error fetching post metadata:', error);
    return {
      title: 'Blog Post',
      description: 'Blog post content'
    };
  }
}

// Server component to fetch post data
async function getPostData(slug: string) {
  try {
    // Create a Supabase client for server components
    const supabase = createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles!posts_author_id_fkey (
          email,
          role,
          full_name
        )
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();
    
    if (error) {
      console.error('Error fetching post:', error);
      return null;
    }
    
    // Sanitize HTML content on the server
    if (data && data.content) {
      data.content = sanitizeHtml(data.content);
    }
    
    return data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  // Pre-fetch the post data on the server
  const postData = await getPostData(params.slug);
  
  return <BlogPostView slug={params.slug} initialPostData={postData} />;
}