'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Sparkles, TrendingUp, Users, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

interface Category {
  id: number;
  name: string;
  slug: string;
  post_count?: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(category => 
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [searchQuery, categories]);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      
      // First get all categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        return;
      }
      
      // For each category, count the number of published posts
      const categoriesWithCounts = await Promise.all(
        (categoriesData || []).map(async (category) => {
          const { count, error } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('status', 'published');
          
          return {
            ...category,
            post_count: count || 0
          };
        })
      );
      
      setCategories(categoriesWithCounts);
      setFilteredCategories(categoriesWithCounts);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getIconForCategory = (index: number) => {
    switch (index % 4) {
      case 0:
        return <BookOpen className="h-8 w-8 text-blue-600" />;
      case 1:
        return <Sparkles className="h-8 w-8 text-blue-600" />;
      case 2:
        return <TrendingUp className="h-8 w-8 text-blue-600" />;
      case 3:
        return <Users className="h-8 w-8 text-blue-600" />;
      default:
        return <BookOpen className="h-8 w-8 text-blue-600" />;
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
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-4">Browse Categories</h1>
            <p className="text-xl text-blue-100 mb-8">
              Explore our content organized by topics
            </p>
            <div className="relative max-w-md mx-auto">
              <Input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-6 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:bg-white/20"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {filteredCategories.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No categories found</h3>
                  <p className="text-gray-600 mb-6">
                    No categories match your search query.
                  </p>
                  <Button onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                </div>
              ) : (
                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredCategories.map((category, index) => (
                    <motion.div key={category.id} variants={fadeIn}>
                      <Link href={`/category/${category.slug}`} className="block">
                        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow h-full flex flex-col items-center text-center">
                          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                            {getIconForCategory(index)}
                          </div>
                          <h3 className="text-xl font-semibold mb-2 text-gray-900">{category.name}</h3>
                          <p className="text-gray-600 flex-grow">
                            {category.post_count === 1 
                              ? '1 article' 
                              : `${category.post_count} articles`}
                          </p>
                          <div className="mt-4 text-blue-600 font-medium flex items-center">
                            Browse Category
                            <ArrowRight className="ml-1 h-4 w-4" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </>
          )}

          <div className="text-center mt-12">
            <Link href="/blog" passHref legacyBehavior>
              <Button variant="outline" size="lg" className="group" asChild>
                <a>
                  View All Articles
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}