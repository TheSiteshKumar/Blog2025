"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";

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

export default function Home() {
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedPosts();
    fetchCategories();
  }, []);

  const fetchFeaturedPosts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          profiles!posts_author_id_fkey (
            email,
            role,
            full_name
          )
        `
        )
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) {
        console.error("Error fetching posts:", error);
        return;
      }

      setFeaturedPosts(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name")
        .limit(4);

      if (error) {
        console.error("Error fetching categories:", error);
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-10 -top-10 w-72 h-72 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -left-10 -bottom-10 w-72 h-72 bg-blue-400 rounded-full opacity-20 blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Discover Insights & Knowledge
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Explore our collection of thoughtful articles, tutorials, and the
              latest updates from our expert writers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/blog" passHref legacyBehavior>
                <Button
                  size="lg"
                  variant="default"
                  className="bg-white text-blue-700 font-semibold rounded-lg shadow-lg px-6 py-3 transition-all duration-300 transform hover:scale-105 hover:bg-blue-100"
                  asChild
                >
                  <a className="px-8">Explore All Articles</a>
                </Button>
              </Link>
              <Link href="/category" passHref legacyBehavior>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white text-blue-700 font-semibold rounded-lg shadow-lg px-6 py-3 transition-all duration-300 transform hover:scale-105 hover:bg-blue-100"
                  
                  asChild
                >
                  <a className="px-8">Browse Categories</a>
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Posts Section */}
      <section className="py-16 md:py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <motion.div
            className="text-center mb-12 lg:mb-16 xl:mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 lg:mb-6">
              Featured Articles
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              Dive into our most popular and insightful content
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10 xl:gap-12">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse"
                >
                  {/* Image placeholder */}
                  <div className="h-48 md:h-56 lg:h-60 bg-gray-200"></div>

                  <div className="p-6 md:p-8">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4 md:mb-6"></div>
                    <div className="h-8 bg-gray-200 rounded mb-4 md:mb-6"></div>
                    <div className="space-y-2 mb-6">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                        <div className="space-y-1">
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                          <div className="h-2 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10 xl:gap-12"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {featuredPosts.map((post) => (
                <motion.div
                  key={post.id}
                  variants={fadeIn}
                  className="hover:transform hover:-translate-y-2 transition-all duration-300"
                >
                  <BlogPostCard
                    post={post}
                    className="h-full shadow-md hover:shadow-lg transition-shadow duration-300"
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="text-center mt-12 md:mt-16 lg:mt-20">
            <Link href="/blog" passHref legacyBehavior>
              <Button
                variant="outline"
                size="lg"
                className="group px-8 md:px-10 py-4 md:py-5 text-base md:text-lg"
                asChild
              >
                <a>
                  View All Articles
                  <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-20 lg:py-24 bg-blue-50">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
    <motion.div
      className="text-center mb-12 lg:mb-16"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeIn}
    >
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 lg:mb-6">
        Explore Categories
      </h2>
      <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
        Find content that matches your interests
      </p>
    </motion.div>

    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8 xl:gap-10"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {categories.map((category, index) => (
        <motion.div key={category.id} variants={fadeIn}>
          <Link href={`/category/${category.slug}`} className="block group">
            <div className="bg-white rounded-xl shadow-md p-6 lg:p-8 hover:shadow-lg transition-shadow duration-300 h-full flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4 lg:mb-6 group-hover:bg-blue-200 transition-colors">
                {index % 4 === 0 && (
                  <BookOpen className="h-8 w-8 lg:h-10 lg:w-10 text-blue-600" />
                )}
                {index % 4 === 1 && (
                  <Sparkles className="h-8 w-8 lg:h-10 lg:w-10 text-blue-600" />
                )}
                {index % 4 === 2 && (
                  <TrendingUp className="h-8 w-8 lg:h-10 lg:w-10 text-blue-600" />
                )}
                {index % 4 === 3 && (
                  <Users className="h-8 w-8 lg:h-10 lg:w-10 text-blue-600" />
                )}
              </div>
              <h3 className="text-xl lg:text-2xl font-semibold mb-2 lg:mb-3 text-gray-900">
                {category.name}
              </h3>
              <p className="text-gray-600 lg:text-lg flex-grow mb-4">
                Explore articles in {category.name}
              </p>
              <div className="mt-auto text-blue-600 font-medium flex items-center lg:text-lg group-hover:text-blue-700 transition-colors">
                Browse Category
                <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>

    <div className="text-center mt-12 lg:mt-16">
      <Link href="/category" passHref legacyBehavior>
        <Button 
          variant="outline" 
          size="lg" 
          className="group px-8 lg:px-10 py-4 text-base lg:text-lg"
          asChild
        >
          <a>
            View All Categories
            <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5 transition-transform group-hover:translate-x-1" />
          </a>
        </Button>
      </Link>
    </div>
  </div>
</section>

      {/* Newsletter Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Stay Updated
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Subscribe to our newsletter to get the latest articles, tutorials,
              and updates delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto min-w-[300px]"
              />
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Subscribe
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
