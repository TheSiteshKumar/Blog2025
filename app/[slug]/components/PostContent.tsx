'use client';

import { useRef, useEffect } from 'react';
import { sanitizeHtml } from '@/lib/sanitize-html';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-sql';

interface PostContentProps {
  content: string;
  excerpt?: string;
  onHeadingsExtracted: (headings: { id: string; text: string; level: number }[]) => void;
}

export default function PostContent({ content, excerpt, onHeadingsExtracted }: PostContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Sanitize content
  const sanitizedContent = sanitizeHtml(content);

  // Extract headings from content
  useEffect(() => {
    if (contentRef.current) {
      const headingElements = contentRef.current.querySelectorAll('h2, h3, h4, h5, h6');
      const extractedHeadings: { id: string; text: string; level: number }[] = [];
      
      headingElements.forEach((heading) => {
        const headingText = heading.textContent || '';
        const id = heading.id || headingText.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        
        if (!heading.id) {
          heading.id = id;
        }
        
        extractedHeadings.push({
          id,
          text: headingText,
          level: parseInt(heading.tagName.substring(1))
        });
      });
      
      onHeadingsExtracted(extractedHeadings);
    }
  }, [sanitizedContent, onHeadingsExtracted]);

  // Process content for enhanced features
  useEffect(() => {
    if (contentRef.current) {
      // Process code blocks for syntax highlighting
      const codeBlocks = contentRef.current.querySelectorAll('pre code');
      codeBlocks.forEach((codeBlock) => {
        // Try to determine language from class
        const classes = codeBlock.className.split(' ');
        let language = '';
        for (const cls of classes) {
          if (cls.startsWith('language-')) {
            language = cls.replace('language-', '');
            break;
          }
        }

        // If no language specified, default to javascript
        if (!language) {
          codeBlock.classList.add('language-javascript');
        }
      });

      // Apply syntax highlighting
      Prism.highlightAllUnder(contentRef.current);

      // Add lazy loading to images
      const images = contentRef.current.querySelectorAll('img');
      images.forEach((img) => {
        if (!img.hasAttribute('loading')) {
          img.setAttribute('loading', 'lazy');
        }
        // Add alt text if missing
        if (!img.hasAttribute('alt') || img.getAttribute('alt') === '') {
          img.setAttribute('alt', 'Blog post image');
        }
      });

      // Make tables responsive
      const tables = contentRef.current.querySelectorAll('table');
      tables.forEach((table) => {
        if (!table.parentElement?.classList.contains('overflow-x-auto')) {
          const wrapper = document.createElement('div');
          wrapper.className = 'overflow-x-auto';
          table.parentNode?.insertBefore(wrapper, table);
          wrapper.appendChild(table);
        }
      });

      // Add target="_blank" to external links
      const links = contentRef.current.querySelectorAll('a');
      links.forEach((link) => {
        const href = link.getAttribute('href');
        if (href && (href.startsWith('http') || href.startsWith('https'))) {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        }
      });
    }
  }, [sanitizedContent]);

  return (
    <div className="p-8" ref={contentRef}>
      {excerpt && (
        <div className="mb-8 text-xl text-gray-600 font-serif italic border-l-4 border-blue-500 pl-4 py-2">
          {excerpt}
        </div>
      )}
      
      <div className="prose prose-lg max-w-none blog-content">
        <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
      </div>
    </div>
  );
}