/**
 * Community Content Search API Client
 * Handles semantic search using ZeroDB vector database via Strapi backend
 */

import axios from 'axios';

// Strapi backend URL (handles ZeroDB authentication)
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://ainative-community-production.up.railway.app';
const SIMILARITY_THRESHOLD = 0.7;

export interface SearchResult {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  description?: string;
  url: string;
  content_type: string;
  category?: string;
  tags?: string[];
  published_date?: string;
  similarity: number;
  metadata: Record<string, unknown>;
}

export interface SearchOptions {
  limit?: number;
  threshold?: number;
  contentTypes?: string[];
  categories?: string[];
  tags?: string[];
}

/**
 * Search community content using semantic similarity
 */
export async function searchCommunityContent(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const {
    limit = 20,
    threshold = SIMILARITY_THRESHOLD,
    contentTypes,
  } = options;

  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    // Call Strapi backend search endpoint (handles ZeroDB auth)
    const contentType = contentTypes && contentTypes.length > 0 ? contentTypes[0] : undefined;

    const response = await axios.post(
      `${STRAPI_URL}/api/search`,
      {
        query: query.trim(),
        contentType,
        limit,
        threshold,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const results = response.data.results || [];

    return results.map((result: Record<string, unknown>) => {
      const metadata = result.metadata as Record<string, unknown>;
      return {
        id: metadata.id as number,
        title: metadata.title as string,
        slug: metadata.slug as string,
        excerpt: metadata.excerpt as string | undefined,
        description: metadata.description as string | undefined,
        url: metadata.url as string,
        content_type: metadata.content_type as string,
        category: metadata.category as string | undefined,
        tags: metadata.tags as string[] | undefined,
        published_date: metadata.published_date as string | undefined,
        similarity: result.similarity as number,
        metadata,
      };
    });
  } catch (error: unknown) {
    console.error('Search failed:', error);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 429) {
        throw new Error('Too many requests. Please try again in a moment.');
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('Authentication failed. Invalid API key.');
      } else if (error.response?.status === 404) {
        throw new Error('Search endpoint not found. Please check the API configuration.');
      }
    }

    throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Find related content based on a specific content item
 * Uses Strapi backend to query ZeroDB
 */
export async function findRelatedContent(
  contentId: number,
  contentType: string,
  limit: number = 5
): Promise<SearchResult[]> {
  try {
    // Call Strapi backend for related content (handles ZeroDB auth)
    const response = await axios.post(
      `${STRAPI_URL}/api/search/related`,
      {
        contentId,
        contentType,
        limit: limit + 1, // Get one extra to exclude self
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const results = (response.data.results || [])
      .filter((r: Record<string, unknown>) => {
        const metadata = r.metadata as Record<string, unknown>;
        return metadata.id !== contentId || metadata.content_type !== contentType;
      })
      .slice(0, limit);

    return results.map((result: Record<string, unknown>) => {
      const metadata = result.metadata as Record<string, unknown>;
      return {
        id: metadata.id as number,
        title: metadata.title as string,
        slug: metadata.slug as string,
        excerpt: metadata.excerpt as string | undefined,
        description: metadata.description as string | undefined,
        url: metadata.url as string,
        content_type: metadata.content_type as string,
        category: metadata.category as string | undefined,
        tags: metadata.tags as string[] | undefined,
        published_date: metadata.published_date as string | undefined,
        similarity: result.similarity as number,
        metadata,
      };
    });
  } catch (error: unknown) {
    console.error('Failed to find related content:', error);
    return [];
  }
}

/**
 * Get search suggestions based on partial query
 */
export async function getSearchSuggestions(partialQuery: string): Promise<string[]> {
  if (!partialQuery || partialQuery.length < 2) {
    return [];
  }

  try {
    // This would ideally use a dedicated suggestions endpoint
    // For now, we'll do a basic search and extract titles
    const results = await searchCommunityContent(partialQuery, { limit: 5 });
    return results.map(r => r.title);
  } catch (error) {
    console.error('Failed to get search suggestions:', error);
    return [];
  }
}

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
