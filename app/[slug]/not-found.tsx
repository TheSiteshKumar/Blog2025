'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div 
        className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <FileQuestion className="h-16 w-16 text-blue-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Post Not Found</h1>
        <p className="text-gray-600 mb-8">
          The blog post you're looking for doesn't exist or has been removed.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/blog" passHref legacyBehavior>
            <Button asChild>
              <a>Browse All Articles</a>
            </Button>
          </Link>
          <Link href="/" passHref legacyBehavior>
            <Button variant="outline" asChild>
              <a>Go to Homepage</a>
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}