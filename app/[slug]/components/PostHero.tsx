'use client';

import { Badge } from '@/components/ui/badge';

interface PostHeroProps {
  title: string;
  imageUrl?: string;
  imageAlt?: string;
  categoryName?: string;
}

export default function PostHero({ title, imageUrl, imageAlt, categoryName }: PostHeroProps) {
  if (!imageUrl) return null;
  
  return (
    <div className="w-full h-[50vh] relative">
      <img
        src={imageUrl}
        alt={imageAlt || title}
        className="w-full h-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 max-w-4xl mx-auto">{title}</h1>
          {categoryName && (
            <Badge variant="secondary" className="text-sm uppercase font-semibold bg-white text-gray-800">
              {categoryName}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};