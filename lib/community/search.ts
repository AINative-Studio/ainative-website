/**
 * Community Search Utilities
 * Helper functions for search functionality
 */

/**
 * Get content type display name
 */
export function getContentTypeLabel(contentType: string): string {
  const labels: Record<string, string> = {
    blog_post: 'Blog Post',
    tutorial: 'Tutorial',
    showcase: 'Showcase',
    resource: 'Resource',
  };
  return labels[contentType] || contentType;
}

/**
 * Get content type icon
 */
export function getContentTypeIcon(contentType: string): string {
  const icons: Record<string, string> = {
    blog_post: '📝',
    tutorial: '📚',
    showcase: '🎨',
    resource: '🔧',
  };
  return icons[contentType] || '📄';
}
