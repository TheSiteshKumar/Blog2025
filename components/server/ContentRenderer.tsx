import { sanitizeHtml } from '@/lib/sanitize-html';

interface ContentRendererProps {
  content: string;
  className?: string;
}

/**
 * Server component for rendering sanitized HTML content
 * This component sanitizes HTML on the server side before rendering
 */
export default function ContentRenderer({ content, className = "blog-content" }: ContentRendererProps) {
  // Sanitize the HTML content on the server
  const sanitizedContent = sanitizeHtml(content);
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}