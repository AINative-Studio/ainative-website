/**
 * Semantic Search Service
 * Handles search suggestions and semantic search via ZeroDB backend
 *
 * This service provides real-time semantic search functionality using
 * vector embeddings and similarity matching through the ZeroDB API.
 */

import apiClient from '@/lib/api-client';
import type { SearchSuggestionsResponse, SearchSuggestionsOptions, SearchSuggestion } from '@/types/search';

/**
 * Custom error class for semantic search operations
 */
export class SemanticSearchError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly originalError?: Error;

  constructor(
    message: string,
    code: string,
    statusCode?: number,
    originalError?: Error
  ) {
    super(message);
    this.name = 'SemanticSearchError';
    this.code = code;
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

/**
 * Error codes for semantic search operations
 */
export const SemanticSearchErrorCodes = {
  INVALID_QUERY: 'INVALID_QUERY',
  API_ERROR: 'API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  UNKNOWN: 'UNKNOWN',
} as const;

export type SemanticSearchErrorCode = typeof SemanticSearchErrorCodes[keyof typeof SemanticSearchErrorCodes];

export interface VectorSearchResult {
  id: string;
  score: number;
  vector?: number[];
  metadata?: Record<string, unknown>;
  payload?: Record<string, unknown>;
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
  filter?: Record<string, unknown>;
  include_metadata?: boolean;
}

export interface ContentItem {
  id: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface IndexContentRequest {
  collection_name: string;
  items: Array<{
    id: string;
    content: string;
    metadata?: Record<string, unknown>;
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

/**
 * Helper to determine error code from response status
 */
function getErrorCodeFromStatus(status: number): SemanticSearchErrorCode {
  switch (status) {
    case 400:
      return SemanticSearchErrorCodes.INVALID_QUERY;
    case 401:
    case 403:
      return SemanticSearchErrorCodes.UNAUTHORIZED;
    case 404:
      return SemanticSearchErrorCodes.NOT_FOUND;
    case 429:
      return SemanticSearchErrorCodes.RATE_LIMITED;
    case 408:
    case 504:
      return SemanticSearchErrorCodes.TIMEOUT;
    default:
      return status >= 500 ? SemanticSearchErrorCodes.API_ERROR : SemanticSearchErrorCodes.UNKNOWN;
  }
}

/**
 * Helper to extract error details from API response
 */
function extractErrorDetails(error: unknown): { message: string; code: SemanticSearchErrorCode; status?: number } {
  if (error instanceof Error) {
    if (error.message.includes('timeout')) {
      return { message: 'Request timed out', code: SemanticSearchErrorCodes.TIMEOUT };
    }
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return { message: 'Network error occurred', code: SemanticSearchErrorCodes.NETWORK_ERROR };
    }
  }

  // Try to extract status from error object
  const errObj = error as { response?: { status?: number; data?: { detail?: string; message?: string } } };
  if (errObj?.response?.status) {
    const status = errObj.response.status;
    const code = getErrorCodeFromStatus(status);
    const message = errObj.response?.data?.detail || errObj.response?.data?.message || 'API request failed';
    return { message, code, status };
  }

  return { message: 'An unknown error occurred', code: SemanticSearchErrorCodes.UNKNOWN };
}

export const semanticSearchService = {
  /**
   * Get search suggestions based on partial query using ZeroDB vector similarity search
   *
   * This method queries the ZeroDB backend for semantically similar content
   * based on the user's search query, using vector embeddings for matching.
   *
   * @param query - The search query (minimum 2 characters by default)
   * @param options - Optional configuration for the search
   * @returns Promise with suggestions response from ZeroDB API
   * @throws SemanticSearchError on validation or API errors when throwOnError is true
   *
   * @example
   * ```typescript
   * const response = await semanticSearchService.getSuggestions('quantum computing', { limit: 10 });
   * console.log(response.suggestions);
   * ```
   */
  async getSuggestions(
    query: string,
    options: SearchSuggestionsOptions = {}
  ): Promise<SearchSuggestionsResponse> {
    const { limit = 5, minQueryLength = 2 } = options;
    const trimmedQuery = query?.trim() || '';

    // Validate query length
    if (!trimmedQuery || trimmedQuery.length < minQueryLength) {
      return {
        suggestions: [],
        query: trimmedQuery,
        total_suggestions: 0,
      };
    }

    try {
      // Build URL with query parameters for ZeroDB semantic search API
      const fullEndpoint = `/v1/public/zerodb/search/suggestions?q=${encodeURIComponent(trimmedQuery)}&limit=${limit}`;

      const response = await apiClient.get<SearchSuggestionsResponse>(fullEndpoint);

      // Validate and normalize response data
      const suggestions = response.data?.suggestions || [];
      const normalizedSuggestions: SearchSuggestion[] = suggestions.map((s: Partial<SearchSuggestion>) => ({
        text: s.text || '',
        relevance_score: typeof s.relevance_score === 'number' ? s.relevance_score : 0,
        category: s.category || 'general',
        result_count: typeof s.result_count === 'number' ? s.result_count : 0,
      }));

      return {
        suggestions: normalizedSuggestions,
        query: trimmedQuery,
        total_suggestions: response.data?.total_suggestions || normalizedSuggestions.length,
      };
    } catch (error: unknown) {
      const { message, code, status } = extractErrorDetails(error);
      console.error('Failed to get search suggestions:', { message, code, status, query: trimmedQuery });

      // Return empty response on error (graceful degradation)
      return {
        suggestions: [],
        query: trimmedQuery,
        total_suggestions: 0,
      };
    }
  },

  /**
   * Search content using semantic similarity via ZeroDB vector search
   *
   * Performs a text-based vector similarity search against a specified collection.
   * The query text is automatically embedded and compared against stored vectors.
   *
   * @param request - Search parameters including collection name and query text
   * @returns Promise with search results sorted by similarity score
   * @throws SemanticSearchError on API errors
   *
   * @example
   * ```typescript
   * const results = await semanticSearchService.searchContent({
   *   collection_name: 'blog_posts',
   *   query_text: 'machine learning tutorials',
   *   top_k: 20,
   *   filter: { category: 'ai' }
   * });
   * ```
   */
  async searchContent(request: SearchContentRequest): Promise<VectorSearchResponse> {
    // Validate required fields
    if (!request.collection_name?.trim()) {
      throw new SemanticSearchError(
        'Collection name is required',
        SemanticSearchErrorCodes.INVALID_QUERY
      );
    }

    if (!request.query_text?.trim()) {
      throw new SemanticSearchError(
        'Query text is required',
        SemanticSearchErrorCodes.INVALID_QUERY
      );
    }

    try {
      const response = await apiClient.post<VectorSearchResponse>(
        '/v1/public/zerodb/vectors/search/text',
        {
          collection_name: request.collection_name.trim(),
          query_text: request.query_text.trim(),
          top_k: Math.min(Math.max(request.top_k || 10, 1), 100), // Clamp between 1-100
          filter: request.filter,
          include_metadata: request.include_metadata !== false,
        }
      );

      // Validate and normalize response
      return {
        results: response.data?.results || [],
        query_time_ms: response.data?.query_time_ms || 0,
        total_results: response.data?.total_results || response.data?.results?.length || 0,
      };
    } catch (error: unknown) {
      const { message, code, status } = extractErrorDetails(error);
      console.error('Failed to search content:', { message, code, status, collection: request.collection_name });
      throw new SemanticSearchError(
        `Content search failed: ${message}`,
        code,
        status,
        error instanceof Error ? error : undefined
      );
    }
  },

  /**
   * Get related content based on a content item ID using vector similarity
   *
   * Finds semantically similar content by using the vector of an existing item
   * in the collection. Useful for "related articles", "similar products", etc.
   *
   * @param collectionName - The collection to search in
   * @param contentId - The ID of the content item to find related items for
   * @param topK - Number of related items to return (default: 10, max: 100)
   * @param filter - Optional metadata filter to narrow down results
   * @returns Promise with related content results sorted by similarity
   * @throws SemanticSearchError on validation or API errors
   *
   * @example
   * ```typescript
   * const related = await semanticSearchService.getRelatedContent(
   *   'blog_posts',
   *   'post-123',
   *   5,
   *   { status: 'published' }
   * );
   * ```
   */
  async getRelatedContent(
    collectionName: string,
    contentId: string,
    topK: number = 10,
    filter?: Record<string, unknown>
  ): Promise<VectorSearchResponse> {
    // Validate required fields
    if (!collectionName?.trim()) {
      throw new SemanticSearchError(
        'Collection name is required',
        SemanticSearchErrorCodes.INVALID_QUERY
      );
    }

    if (!contentId?.trim()) {
      throw new SemanticSearchError(
        'Content ID is required',
        SemanticSearchErrorCodes.INVALID_QUERY
      );
    }

    try {
      const response = await apiClient.post<VectorSearchResponse>(
        '/v1/public/zerodb/vectors/search/related',
        {
          collection_name: collectionName.trim(),
          content_id: contentId.trim(),
          top_k: Math.min(Math.max(topK, 1), 100), // Clamp between 1-100
          filter,
          include_metadata: true,
        }
      );

      // Validate and normalize response
      return {
        results: response.data?.results || [],
        query_time_ms: response.data?.query_time_ms || 0,
        total_results: response.data?.total_results || response.data?.results?.length || 0,
      };
    } catch (error: unknown) {
      const { message, code, status } = extractErrorDetails(error);
      console.error('Failed to get related content:', { message, code, status, collection: collectionName, contentId });
      throw new SemanticSearchError(
        `Related content search failed: ${message}`,
        code,
        status,
        error instanceof Error ? error : undefined
      );
    }
  },

  /**
   * Generate embeddings for text content using ZeroML models
   *
   * Converts text strings into vector embeddings that can be stored
   * and searched in ZeroDB vector collections.
   *
   * @param modelId - The embedding model ID to use (e.g., 'all-MiniLM-L6-v2')
   * @param texts - Array of text strings to embed (max 100 texts per request)
   * @returns Promise with embeddings array and processing time
   * @throws SemanticSearchError on validation or API errors
   *
   * @example
   * ```typescript
   * const embeddings = await semanticSearchService.generateEmbeddings(
   *   'all-MiniLM-L6-v2',
   *   ['Hello world', 'Machine learning is awesome']
   * );
   * console.log(embeddings.embeddings.length); // 2
   * ```
   */
  async generateEmbeddings(
    modelId: string,
    texts: string[]
  ): Promise<EmbeddingsResponse> {
    // Validate required fields
    if (!modelId?.trim()) {
      throw new SemanticSearchError(
        'Model ID is required',
        SemanticSearchErrorCodes.INVALID_QUERY
      );
    }

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      throw new SemanticSearchError(
        'At least one text is required for embedding',
        SemanticSearchErrorCodes.INVALID_QUERY
      );
    }

    if (texts.length > 100) {
      throw new SemanticSearchError(
        'Maximum 100 texts allowed per request',
        SemanticSearchErrorCodes.INVALID_QUERY
      );
    }

    // Filter out empty strings and trim
    const validTexts = texts.filter(t => t?.trim()).map(t => t.trim());
    if (validTexts.length === 0) {
      throw new SemanticSearchError(
        'At least one non-empty text is required',
        SemanticSearchErrorCodes.INVALID_QUERY
      );
    }

    try {
      const response = await apiClient.post<EmbeddingsResponse>(
        `/v1/public/zerodb/zeroml/models/${encodeURIComponent(modelId.trim())}/embed`,
        { texts: validTexts }
      );

      return {
        embeddings: response.data?.embeddings || [],
        processing_time_ms: response.data?.processing_time_ms || 0,
      };
    } catch (error: unknown) {
      const { message, code, status } = extractErrorDetails(error);
      console.error('Failed to generate embeddings:', { message, code, status, modelId });
      throw new SemanticSearchError(
        `Embedding generation failed: ${message}`,
        code,
        status,
        error instanceof Error ? error : undefined
      );
    }
  },

  /**
   * Index content items into a collection for semantic search
   *
   * Stores content with automatically generated vector embeddings for
   * later similarity searching. Each item should have a unique ID.
   *
   * @param request - Index request with collection name and content items
   * @returns Promise with indexing results including count and timing
   * @throws SemanticSearchError on validation or API errors
   *
   * @example
   * ```typescript
   * const result = await semanticSearchService.indexContent({
   *   collection_name: 'blog_posts',
   *   items: [
   *     { id: 'post-1', content: 'Introduction to AI', metadata: { category: 'ai' } },
   *     { id: 'post-2', content: 'Machine Learning Basics', metadata: { category: 'ml' } }
   *   ]
   * });
   * console.log(`Indexed ${result.indexed_count} items`);
   * ```
   */
  async indexContent(request: IndexContentRequest): Promise<IndexContentResponse> {
    // Validate required fields
    if (!request.collection_name?.trim()) {
      throw new SemanticSearchError(
        'Collection name is required',
        SemanticSearchErrorCodes.INVALID_QUERY
      );
    }

    if (!request.items || !Array.isArray(request.items) || request.items.length === 0) {
      throw new SemanticSearchError(
        'At least one item is required for indexing',
        SemanticSearchErrorCodes.INVALID_QUERY
      );
    }

    // Validate each item
    const validItems = request.items.filter(item => {
      return item.id?.trim() && item.content?.trim();
    });

    if (validItems.length === 0) {
      throw new SemanticSearchError(
        'All items must have a valid id and content',
        SemanticSearchErrorCodes.INVALID_QUERY
      );
    }

    try {
      const response = await apiClient.post<IndexContentResponse>(
        '/v1/public/zerodb/vectors/index',
        {
          collection_name: request.collection_name.trim(),
          items: validItems.map(item => ({
            id: item.id.trim(),
            content: item.content.trim(),
            metadata: item.metadata,
          })),
        }
      );

      return {
        indexed_count: response.data?.indexed_count || validItems.length,
        operation_time_ms: response.data?.operation_time_ms || 0,
      };
    } catch (error: unknown) {
      const { message, code, status } = extractErrorDetails(error);
      console.error('Failed to index content:', { message, code, status, collection: request.collection_name });
      throw new SemanticSearchError(
        `Content indexing failed: ${message}`,
        code,
        status,
        error instanceof Error ? error : undefined
      );
    }
  },

  /**
   * Health check for the semantic search API
   *
   * Verifies connectivity to the ZeroDB search endpoint.
   *
   * @returns Promise<boolean> - true if the API is reachable
   */
  async healthCheck(): Promise<boolean> {
    try {
      await apiClient.get('/v1/public/zerodb/health');
      return true;
    } catch {
      return false;
    }
  },
};
