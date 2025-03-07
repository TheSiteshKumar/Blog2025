'use client';

import { Badge } from '@/components/ui/badge';

interface PostHeaderProps {
  title: string;
  categoryName?: string;
  hasImage: boolean;
}

export default function PostHeader({ title, categoryName, hasImage }: PostHeaderProps) {
  if (hasImage) return null;
  
  return (
    <div className="p-8 border-b">
      {categoryName && (
        <Badge variant="secondary" className="text-xs uppercase font-semibold mb-4">
          {categoryName}
        </Badge>
      )}
      <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
    </div>
  );
}