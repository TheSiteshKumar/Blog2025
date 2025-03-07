'use client';

import './posts.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Editor } from '@/components/editor/Editor';
import CommentSection from '@/components/blog/CommentSection';

import { 
  Calendar, 
  Clock, 
  Share2, 
  ArrowLeft,
  Bookmark,
  MessageCircle,
  ThumbsUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Post {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  created_at: string;
  updated_at?: string;
  status: string;
  image_url: string;
  image_alt: string;
  tags: string[];
  category_id: number | null;
  meta_title: string;
  meta_description: string;
  profiles: {
    email: string;
    role?: string;
    full_name?: string;
  };
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface RelatedPost {
  id: number;
  title: string;
  slug: string;
  image_url: string;
  created_at: string;
}

export default function BlogPostClient({ slug }: { slug: string }) {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [readingTime, setReadingTime] = useState<number>(0);
  const [isPostPage, setIsPostPage] = useState(false);

  useEffect(() => {
    if (slug) {
      checkIfPostExists(slug);
    }
  }, [slug]);

  const checkIfPostExists = async (slug: string) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', slug)
        .single();

      if (data) {
        setIsPostPage(true);
        fetchPost(slug);
      } else {
        // This is not a blog post URL, let Next.js handle it
        setIsPostPage(false);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error checking post:', error);
      setIsPostPage(false);
      setIsLoading(false);
    }
  };

  const fetchPost = async (slug: string) => {
    try {
      setIsLoading(true);
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
        router.push('/blog');
        return;
      }

      setPost(data);
      
      // Calculate reading time (average reading speed: 200 words per minute)
      const wordCount = data.content.split(/\s+/).length;
      const readTime = Math.ceil(wordCount / 200);
      setReadingTime(readTime);

      // Fetch category if available
      if (data.category_id) {
        fetchCategory(data.category_id);
        fetchRelatedPosts(data.category_id, data.id);
      } else if (data.tags && data.tags.length > 0) {
        // If no category, fetch related posts by tag
        fetchRelatedPostsByTag(data.tags[0], data.id);
      }

      // Generate avatar URL
      const name = data.profiles.full_name || data.profiles.email.split('@')[0];
      const encodedName = encodeURIComponent(name);
      setAvatarUrl(`https://ui-avatars.com/api/?name=${encodedName}&background=0D8ABC&color=fff&size=128`);
    } catch (error) {
      console.error('Error:', error);
      router.push('/blog');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategory = async (categoryId: number) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single();
      
      if (error) {
        console.error('Error fetching category:', error);
        return;
      }
      
      setCategory(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchRelatedPosts = async (categoryId: number, currentPostId: number) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, slug, image_url, created_at')
        .eq('category_id', categoryId)
        .eq('status', 'published')
        .neq('id', currentPostId)
        .limit(3);

      if (error) {
        console.error('Error fetching related posts:', error);
        return;
      }

      setRelatedPosts(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchRelatedPostsByTag = async (tag: string, currentPostId: number) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, slug, image_url, created_at')
        .contains('tags', [tag])
        .eq('status', 'published')
        .neq('id', currentPostId)
        .limit(3);

      if (error) {
        console.error('Error fetching related posts by tag:', error);
        return;
      }

      setRelatedPosts(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // If this is not a post page, let Next.js handle it
  if (!isLoading && !isPostPage) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <p className="text-gray-600 mb-6">The post you're looking for doesn't exist or has been removed.</p>
          <Button 
            onClick={() => router.push('/blog')}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  const authorName = post.profiles.full_name || post.profiles.email.split('@')[0];
  const authorInitials = getInitials(post.profiles.full_name || authorName);
  const formattedDate = format(new Date(post.updated_at || post.created_at), 'MMM d, yyyy');
  const isUpdated = post.updated_at && new Date(post.updated_at) > new Date(post.created_at);

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Hero Section with Featured Image */}
      {post.image_url && (
        <div className="w-full h-[50vh] relative">
          <img
            src={post.image_url}
            alt={post.image_alt || post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 max-w-4xl mx-auto">{post.title}</h1>
              {category && (
                <Badge variant="secondary" className="text-sm uppercase font-semibold bg-white text-gray-800">
                  {category.name}
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Main Content Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* If no featured image in hero, show title here */}
            {!post.image_url && (
              <div className="p-8 border-b">
                {category && (
                  <Badge variant="secondary" className="text-xs uppercase font-semibold mb-4">
                    {category.name}
                  </Badge>
                )}
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
              </div>
            )}

            {/* Author and Metadata */}
            <div className="p-8 border-b border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-md mr-4">
                    <AvatarImage src={avatarUrl} alt={authorName} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {authorInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-base font-medium text-gray-900">{authorName}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-2">Technical Writer</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{isUpdated ? 'Updated' : 'Published'} {formattedDate}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{readingTime} min read</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-0">
              {post.excerpt && (
                <div className="mb-8 text-xl text-gray-600 font-serif italic border-l-4 border-primary pl-4">
                  {post.excerpt}
                </div>
              )}
              
              <div className="prose prose-lg max-w-none">
                <Editor content={post.content} editable={false} />
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="px-8 py-6 border-t border-gray-200">
                <h3 className="text-lg font-medium mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Social Sharing and Actions */}
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
              <div className="flex flex-wrap justify-between items-center">
                <div className="flex items-center space-x-2 mb-4 sm:mb-0">
                  <Button variant="outline" size="sm">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Like
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Comment
                  </Button>
                  <Button variant="outline" size="sm">
                    <Bookmark className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 mr-2">Share:</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-facebook" viewBox="0 0 16 16">
                      <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                    </svg>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-twitter-x" viewBox="0 0 16 16">
                      <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"/>
                    </svg>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-linkedin" viewBox="0 0 16 16">
                      <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link href={`/${relatedPost.slug}`} key={relatedPost.id}>
                    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      {relatedPost.image_url ? (
                        <img 
                          src={relatedPost.image_url} 
                          alt={relatedPost.title}
                          className="w-full h-40 object-cover"
                        />
                      ) : (
                        <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">No image</span>
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2 line-clamp-2">{relatedPost.title}</h3>
                        <p className="text-sm text-gray-500">
                          {format(new Date(relatedPost.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {/* Comments Section */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden mt-8 p-8">
                <CommentSection postId={post.id} postTitle={post.title} />
              </div>

          {/* Back to Blog */}
          <div className="mt-12 text-center">
            <Link href="/blog">
              <Button variant="outline" className="inline-flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to All Articles
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}