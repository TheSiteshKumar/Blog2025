'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { List } from 'lucide-react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  headings: Heading[];
  activeId: string;
}

export default function TableOfContents({ headings, activeId }: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Scroll to element with offset for fixed header
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
    
    // Close mobile TOC after clicking
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <List className="h-4 w-4" />
          <span>{isOpen ? 'Hide' : 'Show'} Table of Contents</span>
        </button>
        
        {isOpen && (
          <div className="mt-2 p-4 bg-white rounded-lg shadow-md">
            <ScrollArea className="h-[300px]">
              <nav className="space-y-1">
                {headings.map((heading) => (
                  <button
                    key={heading.id}
                    onClick={() => scrollToHeading(heading.id)}
                    className={cn(
                      "block text-left w-full px-2 py-1 text-sm rounded-md transition-colors",
                      heading.level === 2 ? "font-medium" : "font-normal",
                      heading.level === 3 ? "pl-4" : "",
                      heading.level === 4 ? "pl-6" : "",
                      heading.level === 5 ? "pl-8" : "",
                      heading.level === 6 ? "pl-10" : "",
                      activeId === heading.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    )}
                  >
                    {heading.text}
                  </button>
                ))}
              </nav>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Desktop TOC */}
      <div className="hidden lg:block">
        <h4 className="font-medium text-gray-900 mb-4">Table of Contents</h4>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <nav className="space-y-1 pr-4">
            {headings.map((heading) => (
              <button
                key={heading.id}
                onClick={() => scrollToHeading(heading.id)}
                className={cn(
                  "block text-left w-full px-2 py-1 text-sm rounded-md transition-colors",
                  heading.level === 2 ? "font-medium" : "font-normal",
                  heading.level === 3 ? "pl-4" : "",
                  heading.level === 4 ? "pl-6" : "",
                  heading.level === 5 ? "pl-8" : "",
                  heading.level === 6 ? "pl-10" : "",
                  activeId === heading.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                {heading.text}
              </button>
            ))}
          </nav>
        </ScrollArea>
      </div>
    </>
  );
}