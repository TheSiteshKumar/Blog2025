// lib/sanitize-html.ts
import DOMPurify from 'isomorphic-dompurify';

// Configure allowed content
const ALLOWED_URI_REGEXP = /^(?:(?:https?|mailto|ftp|tel):|[#/]|data:image)/i;

// Add security hooks
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  // Add security attributes to external links
  if (node.tagName === 'A' && node.getAttribute('href')?.startsWith('http')) {
    node.setAttribute('rel', 'noopener noreferrer nofollow');
    node.setAttribute('target', '_blank');
    node.setAttribute('aria-label', `${node.textContent} (Opens in new window)`);
  }

  // Force HTTPS for external resources
  if (node.tagName === 'IMG') {
    const src = node.getAttribute('src');
    if (src && src.startsWith('http:')) {
      node.setAttribute('src', src.replace(/^http:/, 'https:'));
    }
    
    // Add lazy loading to images
    if (!node.hasAttribute('loading')) {
      node.setAttribute('loading', 'lazy');
    }
    
    // Add alt text if missing
    if (!node.hasAttribute('alt') || node.getAttribute('alt') === '') {
      node.setAttribute('alt', 'Blog post image');
    }
  }
  
  // Add heading IDs for anchor links
  if (/^H[1-6]$/.test(node.tagName)) {
    if (!node.hasAttribute('id') && node.textContent) {
      const id = node.textContent
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');
      node.setAttribute('id', id);
    }
  }
});

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr',
      'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
      'em', 'strong', 'del', 'a', 'img', 'table', 'thead',
      'tbody', 'tr', 'th', 'td', 'div', 'span', 'figure',
      'figcaption', 'iframe', 'caption'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'id', 
      'width', 'height', 'target', 'rel', 'loading',
      'frameborder', 'allowfullscreen', 'sandbox', 'allow',
      'data-internal', 'aria-label'
    ],
    ALLOWED_URI_REGEXP,
    FORBID_TAGS: ['script', 'style', 'form', 'input', 'textarea', 'button'],
    FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick', 'onmouseover'],
    ADD_ATTR: ['loading', 'aria-label'],
    ADD_TAGS: ['iframe'],
    SANITIZE_DOM: true,
    WHOLE_DOCUMENT: false
  });
}