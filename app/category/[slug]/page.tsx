'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Filter } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
  slug: string;
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

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.slug) {
      fetchCategory(params.slug);
    }
  }, [params.slug]);

  const fetchCategory = async (slug: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error fetching category:', error);
        return;
      }

      setCategory(data);
      fetchPosts(data.id);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchPosts = async (categoryId: number) => {
    try {
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
        .eq('category_id', categoryId)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        return;
      }

      setPosts(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  if (!category && !isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl font-bold mb-6">Category Not Found</h1>
        <p className="text-gray-600 mb-8">The category you're looking for doesn't exist.</p>
        <Link href="/blog" passHref legacyBehavior>
          <Button asChild>
            <a>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </a>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Header */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500 bg-opacity-30 mb-6">
              <BookOpen className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              {isLoading ? 'Loading...' : category?.name}
            </h1>
            <p className="text-xl text-blue-100">
              {isLoading ? 'Loading category details...' : `Explore all articles in ${category?.name}`}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {isLoading ? 'Loading articles...' : `${posts.length} Articles`}
            </h2>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
                        <div>
                          <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
                          <div className="h-2 bg-gray-200 rounded w-12"></div>
                        </div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {posts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No articles found</h3>
                  <p className="text-gray-600 mb-6">
                    There are no articles in this category yet.
                  </p>
                  <Link href="/blog" passHref legacyBehavior>
                    <Button asChild>
                      <a>
                        Browse All Articles
                      </a>
                    </Button>
                  </Link>
                </div>
              ) : (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {posts.map((post) => (
                    <motion.div key={post.id} variants={fadeIn}>
                      <BlogPostCard post={post} className="h-full" />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </>
          )}

          <div className="text-center mt-12">
            <Link href="/blog" passHref legacyBehavior>
              <Button variant="outline" asChild>
                <a>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to All Articles
                </a>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}