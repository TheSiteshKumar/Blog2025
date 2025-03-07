'use client';

import Link from 'next/link';
import { format } from 'date-fns';

interface RelatedPost {
  id: number;
  title: string;
  slug: string;
  image_url: string;
  created_at: string;
}

interface RelatedPostsProps {
  posts: RelatedPost[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts || posts.length === 0) return null;
  
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link href={`/${post.slug}`} key={post.id} className="block">
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
              {post.image_url ? (
                <img 
                  src={post.image_url} 
                  alt={post.title}
                  className="w-full h-40 object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No image</span>
                </div>
              )}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-lg mb-2 line-clamp-2 flex-grow">{post.title}</h3>
                <p className="text-sm text-gray-500 mt-auto pt-2">
                  {format(new Date(post.created_at), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}