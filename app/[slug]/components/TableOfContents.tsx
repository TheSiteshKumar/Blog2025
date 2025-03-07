'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { List, ChevronUp } from 'lucide-react';

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
  const [isOpen, setIsOpen] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);

  // Track scroll position for reading progress
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === 'undefined') return;
      
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrollTop = window.scrollY;
      
      const progress = (scrollTop / documentHeight) * 100;
      setReadingProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Check if a heading is active or one of its children is active
  const isActiveOrChild = (heading: Heading, activeHeadingId: string) => {
    if (heading.id === activeHeadingId) return true;
    
    // Find the index of the current heading and the active heading
    const headingIndex = headings.findIndex(h => h.id === heading.id);
    const activeIndex = headings.findIndex(h => h.id === activeHeadingId);
    
    // If the active heading comes after this heading but before the next heading of the same or lower level
    if (activeIndex > headingIndex) {
      const nextSameLevelIndex = headings.findIndex((h, i) => 
        i > headingIndex && h.level <= heading.level
      );
      
      return nextSameLevelIndex === -1 || activeIndex < nextSameLevelIndex;
    }
    
    return false;
  };

  // Group headings by their hierarchy
  const groupedHeadings = headings.reduce((acc: any[], heading) => {
    if (heading.level === 2) {
      acc.push({
        ...heading,
        children: []
      });
    } else {
      const lastParent = acc[acc.length - 1];
      if (lastParent) {
        lastParent.children.push(heading);
      }
    }
    return acc;
  }, []);

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-blue-600"
        >
          <List className="h-4 w-4" />
          <span>{isOpen ? 'Hide' : 'Show'} Table of Contents</span>
        </button>
        
        {isOpen && (
          <div className="mt-2 p-4 bg-white rounded-lg shadow-md">
            {/* Reading progress bar */}
            <div className="h-1 w-full bg-gray-200 rounded-full mb-3">
              <div 
                className="h-1 bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${readingProgress}%` }}
              ></div>
            </div>
            
            <ScrollArea className="max-h-[300px]">
              <nav className="toc-list">
                {headings.map((heading) => (
                  <button
                    key={heading.id}
                    onClick={() => scrollToHeading(heading.id)}
                    className={cn(
                      "toc-item block w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors",
                      activeId === heading.id ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                      heading.level === 2 ? "font-medium" : "font-normal",
                      heading.level === 3 ? "pl-4" : "",
                      heading.level === 4 ? "pl-6" : "",
                      heading.level === 5 ? "pl-8" : "",
                      heading.level === 6 ? "pl-10" : ""
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
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-24">
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Contents</h4>
          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500 hover:text-gray-700">
            <ChevronUp className={cn("h-4 w-4 transition-transform", !isOpen && "rotate-180")} />
          </button>
        </div>
        
        {isOpen && (
          <>
            {/* Reading progress bar */}
            <div className="h-1 w-full bg-gray-200">
              <div 
                className="h-1 bg-blue-500 transition-all duration-300"
                style={{ width: `${readingProgress}%` }}
              ></div>
            </div>
            
            <ScrollArea className="max-h-[calc(100vh-200px)]">
              <div className="p-3">
                <nav className="toc-list">
                  {groupedHeadings.map((heading) => (
                    <div key={heading.id} className="mb-2">
                      <button
                        onClick={() => scrollToHeading(heading.id)}
                        className={cn(
                          "block w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors",
                          isActiveOrChild(heading, activeId) ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        )}
                      >
                        {heading.text}
                      </button>
                      
                      {heading.children.length > 0 && (
                        <div className="ml-3 mt-1 space-y-1 border-l-2 border-gray-100 pl-2">
                          {heading.children.map((child: Heading) => (
                            <button
                              key={child.id}
                              onClick={() => scrollToHeading(child.id)}
                              className={cn(
                                "block w-full text-left px-2 py-1 text-xs rounded-md transition-colors",
                                activeId === child.id ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                              )}
                            >
                              {child.text}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
              </div>
            </ScrollArea>
          </>
        )}
      </div>
    </>
  );
}