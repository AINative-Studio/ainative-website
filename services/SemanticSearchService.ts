/**
 * Semantic Search Service
 * Handles search suggestions and semantic search via ZeroDB backend
 */

import apiClient from '@/lib/api-client';
import type { SearchSuggestionsResponse, SearchSuggestionsOptions } from '@/types/search';

export interface VectorSearchResult {
  id: string;
  score: number;
  vector?: number[];
  metadata?: Record<string, any>;
  payload?: Record<string, any>;
}

export interface VectorSearchResponse {
  results: VectorSearchResult[];
  query_time_ms: number;
  total_results: number;
}

export interface SearchContentRequest {
  collection_name: string;
  query_text: string;
  top_k?: number;
  filter?: Record<string, any>;
  include_metadata?: boolean;
}

export interface ContentItem {
  id: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface IndexContentRequest {
  collection_name: string;
  items: Array<{
    id: string;
    content: string;
    metadata?: Record<string, any>;
  }>;
}

export interface IndexContentResponse {
  indexed_count: number;
  operation_time_ms: number;
}

export interface EmbeddingsRequest {
  model_id: string;
  texts: string[];
}

export interface EmbeddingsResponse {
  embeddings: number[][];
  processing_time_ms: number;
}

export const semanticSearchService = {
  /**
   * Get search suggestions based on partial query
   * @param query - The search query (minimum 2 characters)
   * @param options - Optional configuration
   * @returns Promise with suggestions response
   */
  async getSuggestions(
    query: string,
    options: SearchSuggestionsOptions = {}
  ): Promise<SearchSuggestionsResponse> {
    const { limit = 5, minQueryLength = 2 } = options;

    // Validate query length
    if (!query || query.trim().length < minQueryLength) {
      return {
        suggestions: [],
        query: query.trim(),
        total_suggestions: 0,
      };
    }

    try {
      // Build URL with query parameters
      const fullEndpoint = `/v1/public/zerodb/search/suggestions?q=${encodeURIComponent(query.trim())}&limit=${limit}`;

      const response = await apiClient.get<SearchSuggestionsResponse>(fullEndpoint);

      return response.data;
    } catch (error: unknown) {
      console.error('Failed to get search suggestions:', error);

      // Return empty response on error
      return {
        suggestions: [],
        query: query.trim(),
        total_suggestions: 0,
      };
    }
  },

  /**
   * Search content using semantic similarity
   * @param request - Search parameters including collection name and query text
   * @returns Promise with search results
   */
  async searchContent(request: SearchContentRequest): Promise<VectorSearchResponse> {
    try {
      const response = await apiClient.post<VectorSearchResponse>(
        '/v1/public/zerodb/vectors/search/text',
        {
          collection_name: request.collection_name,
          query_text: request.query_text,
          top_k: request.top_k || 10,
          filter: request.filter,
          include_metadata: request.include_metadata !== false,
        }
      );

      return response.data;
    } catch (error: unknown) {
      console.error('Failed to search content:', error);
      throw new Error(
        `Content search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },

  /**
   * Get related content based on a content item ID
   * @param collectionName - The collection to search in
   * @param contentId - The ID of the content item to find related items for
   * @param topK - Number of related items to return (default: 10)
   * @param filter - Optional metadata filter
   * @returns Promise with related content results
   */
  async getRelatedContent(
    collectionName: string,
    contentId: string,
    topK: number = 10,
    filter?: Record<string, any>
  ): Promise<VectorSearchResponse> {
    try {
      const response = await apiClient.post<VectorSearchResponse>(
        '/v1/public/zerodb/vectors/search/related',
        {
          collection_name: collectionName,
          content_id: contentId,
          top_k: topK,
          filter,
          include_metadata: true,
        }
      );

      return response.data;
    } catch (error: unknown) {
      console.error('Failed to get related content:', error);
      throw new Error(
        `Related content search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },

  /**
   * Generate embeddings for text content
   * @param modelId - The embedding model ID to use
   * @param texts - Array of text strings to embed
   * @returns Promise with embeddings and processing time
   */
  async generateEmbeddings(
    modelId: string,
    texts: string[]
  ): Promise<EmbeddingsResponse> {
    try {
      const response = await apiClient.post<EmbeddingsResponse>(
        `/v1/public/zerodb/zeroml/models/${modelId}/embed`,
        { texts }
      );

      return response.data;
    } catch (error: unknown) {
      console.error('Failed to generate embeddings:', error);
      throw new Error(
        `Embedding generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },

  /**
   * Index content items into a collection for semantic search
   * @param request - Index request with collection name and content items
   * @returns Promise with indexing results
   */
  async indexContent(request: IndexContentRequest): Promise<IndexContentResponse> {
    try {
      const response = await apiClient.post<IndexContentResponse>(
        '/v1/public/zerodb/vectors/index',
        {
          collection_name: request.collection_name,
          items: request.items,
        }
      );

      return response.data;
    } catch (error: unknown) {
      console.error('Failed to index content:', error);
      throw new Error(
        `Content indexing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },

  /**
   * Get mock suggestions for development/testing
   * This can be removed once the backend endpoint is live
   */
  async getMockSuggestions(
    query: string,
    limit: number = 5
  ): Promise<SearchSuggestionsResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const mockSuggestions = [
      {
        text: `${query} tutorial`,
        relevance_score: 0.95,
        category: 'tutorial',
        result_count: 12,
      },
      {
        text: `${query} best practices`,
        relevance_score: 0.88,
        category: 'blog_post',
        result_count: 8,
      },
      {
        text: `${query} examples`,
        relevance_score: 0.82,
        category: 'showcase',
        result_count: 15,
      },
      {
        text: `${query} guide`,
        relevance_score: 0.78,
        category: 'resource',
        result_count: 6,
      },
      {
        text: `${query} documentation`,
        relevance_score: 0.75,
        category: 'resource',
        result_count: 10,
      },
    ];

    return {
      suggestions: mockSuggestions.slice(0, limit),
      query: query.trim(),
      total_suggestions: mockSuggestions.length,
    };
  },
};
