/**
 * Security Utilities for XSS Prevention and Input Sanitization
 * Provides functions to safely handle user input and prevent injection attacks
 */

/**
 * Sanitizes user input by escaping HTML special characters
 * @param input - User input string to sanitize
 * @returns Escaped string safe for HTML context
 */
export const sanitizeHtml = (input: string | null | undefined): string => {
  if (!input) return '';
  
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Sanitizes a URL to prevent javascript: and data: protocols
 * @param url - URL to sanitize
 * @returns Safe URL or empty string if invalid
 */
export const sanitizeUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  
  try {
    const parsed = new URL(url, window.location.origin);
    
    // Whitelist safe protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    
    return parsed.toString();
  } catch {
    return '';
  }
};

/**
 * Sanitizes attribute values to prevent injection
 * @param value - Attribute value to sanitize
 * @returns Escaped value safe for HTML attributes
 */
export const sanitizeAttribute = (value: string | null | undefined): string => {
  if (!value) return '';
  
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Removes potentially dangerous HTML tags and attributes
 * @param html - HTML string to clean
 * @returns Cleaned HTML with dangerous elements removed
 */
export const stripDangerousHtml = (html: string | null | undefined): string => {
  if (!html) return '';
  
  const dangerousTags = ['script', 'iframe', 'object', 'embed', 'link', 'style'];
  const dangerousAttrs = ['onclick', 'onerror', 'onload', 'onmouseover', 'onchange', 'onsubmit'];
  
  let cleaned = html;
  
  // Remove script tags and their content
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gi');
    cleaned = cleaned.replace(regex, '');
  });
  
  // Remove dangerous event attributes
  dangerousAttrs.forEach(attr => {
    const regex = new RegExp(`\\s${attr}=["']?[^"'\\s>]*["']?`, 'gi');
    cleaned = cleaned.replace(regex, '');
  });
  
  return cleaned;
};

/**
 * Validates and sanitizes JSON input
 * @param input - JSON string to validate
 * @returns Parsed object or null if invalid
 */
export const safeJsonParse = (input: string | null | undefined): any => {
  if (!input) return null;
  
  try {
    return JSON.parse(input);
  } catch (error) {
    console.warn('Invalid JSON input detected', error);
    return null;
  }
};
