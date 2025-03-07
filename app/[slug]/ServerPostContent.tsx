import { sanitizeHtml } from '@/lib/sanitize-html';

interface ServerPostContentProps {
  content: string;
  excerpt?: string;
}

/**
 * Server component for rendering blog post content
 * This component sanitizes and processes HTML on the server side
 */
export default function ServerPostContent({ content, excerpt }: ServerPostContentProps) {
  // Sanitize the HTML content
  let sanitizedContent = sanitizeHtml(content);
  
  // Process the content on the server side
  if (typeof window === 'undefined' && sanitizedContent) {
    // Create a DOM parser to manipulate the HTML
    const DOMParser = require('linkedom').DOMParser;
    const document = new DOMParser().parseFromString(
      `<!DOCTYPE html><html><body>${sanitizedContent}</body></html>`,
      'text/html'
    );
    
    // Process headings to add IDs for anchor links
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach((heading: Element) => {
      const text = heading.textContent || '';
      const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      heading.setAttribute('id', id);
    });
    
    // Process images to add loading="lazy" and proper alt text
    const images = document.querySelectorAll('img');
    images.forEach((img: Element) => {
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
      if (!img.hasAttribute('alt') || img.getAttribute('alt') === '') {
        img.setAttribute('alt', 'Blog post image');
      }
    });
    
    // Process links to add target="_blank" and rel attributes for external links
    const links = document.querySelectorAll('a');
    links.forEach((link: Element) => {
      const href = link.getAttribute('href');
      if (href && (href.startsWith('http') || href.startsWith('https'))) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });
    
    // Get the processed HTML
    sanitizedContent = document.body.innerHTML;
  }
  
  return (
    <div className="p-8">
      {excerpt && (
        <div className="mb-8 text-xl text-gray-600 font-serif italic border-l-4 border-primary pl-4 py-2">
          {excerpt}
        </div>
      )}
      
      <div className="prose prose-lg max-w-none blog-content">
        <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
      </div>
    </div>
  );
}