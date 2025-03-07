'use client';

import { useEffect, useRef } from 'react';
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

interface BlogContentProps {
  content: string;
}

export default function BlogContent({ content }: BlogContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Sanitize content on client-side as well for extra security
  const sanitizedContent = sanitizeHtml(content);

  useEffect(() => {
    // Process headings to add IDs for anchor links
    if (contentRef.current) {
      const headings = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach((heading) => {
        const id = heading.textContent?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || '';
        heading.setAttribute('id', id);
      });

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
    }

    // Add lazy loading to images
    if (contentRef.current) {
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
    }

    // Make tables responsive
    if (contentRef.current) {
      const tables = contentRef.current.querySelectorAll('table');
      tables.forEach((table) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'overflow-x-auto';
        table.parentNode?.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      });
    }

    // Add target="_blank" to external links
    if (contentRef.current) {
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
    <div 
      ref={contentRef} 
      className="blog-content"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}