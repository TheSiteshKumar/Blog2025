'use client';

import { cn } from '@/lib/utils';

interface AdPlaceholderProps {
  title: string;
  height?: string;
}

export default function AdPlaceholder({ title, height = "h-[250px]" }: AdPlaceholderProps) {
  return (
    <div className={cn(
      "bg-white rounded-lg shadow-md overflow-hidden border border-gray-200",
      height
    )}>
      <div className="p-2 bg-gray-100 border-b border-gray-200 text-xs text-gray-500">
        {title}
      </div>
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center">
          <p className="text-gray-400 text-sm">Advertisement</p>
          <p className="text-gray-300 text-xs mt-1">Your ad could be here</p>
        </div>
      </div>
    </div>
  );
}