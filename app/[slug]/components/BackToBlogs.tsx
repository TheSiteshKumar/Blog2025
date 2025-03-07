'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function BackToBlogs() {
  return (
    <div className="mt-12 text-center">
      <Link href="/blog" passHref legacyBehavior>
        <Button variant="outline" className="inline-flex items-center" asChild>
          <a>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Articles
          </a>
        </Button>
      </Link>
    </div>
  );
}