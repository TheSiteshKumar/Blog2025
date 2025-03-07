'use client';

import { format } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Clock } from 'lucide-react';

interface AuthorInfoProps {
  authorName: string;
  authorInitials: string;
  avatarUrl: string;
  formattedDate: string;
  isUpdated: boolean;
  readingTime: number;
}

export default function AuthorInfo({
  authorName,
  authorInitials,
  avatarUrl,
  formattedDate,
  isUpdated,
  readingTime
}: AuthorInfoProps) {
  return (
    <div className="p-8 border-b border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center">
          <Avatar className="h-12 w-12 border-2 border-white shadow-md mr-4">
            <AvatarImage src={avatarUrl} alt={authorName} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {authorInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-base font-medium text-gray-900">{authorName}</p>
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-2">Technical Writer</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{isUpdated ? 'Updated' : 'Published'} {formattedDate}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{readingTime} min read</span>
          </div>
        </div>
      </div>
    </div>
  );
}