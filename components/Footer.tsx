'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Code, BookOpen, Mail, Twitter, Facebook, Instagram, Linkedin, Github } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subscribeMessage, setSubscribeMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')
        .limit(6);
      
      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }
      
      setCategories(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // This is a placeholder for newsletter subscription functionality
      // In a real application, you would integrate with a newsletter service
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubscribeMessage({
        type: 'success',
        text: 'Thank you for subscribing to our newsletter!'
      });
      setEmail('');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSubscribeMessage(null);
      }, 5000);
    } catch (error) {
      setSubscribeMessage({
        type: 'error',
        text: 'Failed to subscribe. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold text-white">BlogHub</span>
            </Link>
            <p className="text-gray-400 mb-4">
              Discover insights, tutorials, and the latest updates from our team of expert writers.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-800 pb-2">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-blue-400 transition-colors">
                  All Posts
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-blue-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Contact
                </Link>
              </li>

              <li>
                <Link href="/auth/login" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-800 pb-2">Categories</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link 
                    href={`/category/${category.slug}`} 
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-blue-400 transition-colors">
                  View All →
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-800 pb-2">Newsletter</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to our newsletter to get the latest updates.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex">
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="rounded-r-none bg-gray-800 border-gray-700 text-white"
                />
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="rounded-l-none bg-blue-600 hover:bg-blue-700"
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
              {subscribeMessage && (
                <p className={subscribeMessage.type === 'success' ? 'text-green-400 text-sm' : 'text-red-400 text-sm'}>
                  {subscribeMessage.text}
                </p>
              )}
            </form>
          </div>
        </div>

       <div className="border-t border-gray-800 mt-20" >
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
              <p className="text-sm text-center md:text-left">
                © {new Date().getFullYear()} Ascensive HR Consultants Pvt. Ltd. All rights reserved.
              </p>
              <div className="flex items-center text-sm text-gray-400">
                <span className="px-2">|</span>
                <Code className="w-4 h-4 text-[#e31e24]" />
                <span className="px-2">Developed by</span>
                <a 
                  href="https://siteshkumar.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#e31e24] hover:text-white transition-colors duration-200 font-medium"
                >
                  Sitesh Kumar
                </a>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="hover:text-[#e31e24] transition-colors duration-200">
                Terms & Conditions
              </a>
              <a href="/privacy-policy" className="hover:text-[#e31e24] transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-[#e31e24] transition-colors duration-200">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>
      </div>
    </footer>
  );
}