'use client';

import { Badge } from '@/components/ui/badge';

interface PostTagsProps {
  tags: string[];
}

export default function PostTags({ tags }: PostTagsProps) {
  if (!tags || tags.length === 0) return null;
  
  return (
    <div className="px-8 py-6 border-t border-gray-200">
      <h3 className="text-lg font-medium mb-3">Tags</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <Badge key={index} variant="outline">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}