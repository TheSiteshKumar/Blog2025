'use client';

import { format } from 'date-fns';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface BlogPostCardProps {
  post: {
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
      avatar_url?: string; // Added avatar_url
    };
  };
  isAdmin?: boolean;
  className?: string;
}

export function BlogPostCard({ post, isAdmin, className }: BlogPostCardProps) {
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (post.category_id) {
      fetchCategory(post.category_id);
    }
  }, [post.category_id]);

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

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const authorName = post.profiles.full_name || post.profiles.email.split('@')[0];
  const authorInitials = getInitials(authorName);
  const formattedDate = format(new Date(post.updated_at || post.created_at), 'MMM d yyyy');
  const isUpdated = post.updated_at && new Date(post.updated_at) > new Date(post.created_at);
  const postUrl = `/${post.slug}`;

  return (
    <Card className={cn("overflow-hidden group hover:shadow-lg transition-all duration-300", className)}>
      <Link href={postUrl} className="block relative overflow-hidden">
        {post.image_url ? (
          <img
            src={post.image_url}
            alt={post.image_alt || post.title}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:rotate-3 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-700 text-xl font-semibold px-4 text-center">
              {post.title}
            </span>
          </div>
        )}
      </Link>

      <CardContent className="p-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
         {category ? (
            <Badge variant="secondary" className="text-xs uppercase font-semibold">
              {category.name.toUpperCase()}
            </Badge>
          ) : (
            (post.tags?.length ?? 0) > 0 && (
              <Badge variant="secondary" className="text-xs uppercase font-semibold">
                {post.tags?.[0]?.toUpperCase()}
              </Badge>
            )
          )}
        </div>

        <Link href={postUrl}>
          <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {post.title}
          </h2>
        </Link>

        <p className="text-gray-600 mb-6 line-clamp-3">
          {truncateText(post.excerpt || post.content, 150)}
        </p>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
              <AvatarImage src={post.profiles.avatar_url || ''} alt={authorName} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {authorInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-900">{authorName}</p>
              <p className="text-xs text-gray-500">Technical Writer</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-500">{isUpdated ? 'Updated' : 'Published'}</p>
            <p className="text-sm font-medium text-gray-700">{formattedDate}</p>
            {isAdmin && (
              <Badge 
                variant={post.status === 'published' ? 'default' : 'secondary'}
                className="mt-1"
              >
                {post.status === 'published' ? 'Published' : 'Draft'}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}