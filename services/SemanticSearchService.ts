/**
 * Semantic Search Service
 * Handles search suggestions and semantic search via ZeroDB backend
 * Refs #434
 */

import apiClient from '@/lib/api-client';
import type { SearchSuggestionsResponse, SearchSuggestionsOptions, SearchSuggestion } from '@/types/search';

/** Configuration for semantic search service */
export interface SemanticSearchConfig {
    /** Default collection name for searches */
    defaultCollection: string;
    /** Default embedding model ID */
    defaultModelId: string;
    /** Enable fallback to vector search when suggestions API fails */
    enableVectorFallback: boolean;
    /** Maximum retries for API calls */
    maxRetries: number;
    /** Retry delay in milliseconds */
    retryDelayMs: number;
}

/** Default configuration values */
const DEFAULT_CONFIG: SemanticSearchConfig = {
    defaultCollection: 'search_content',
    defaultModelId: 'text-embedding-ada-002',
    enableVectorFallback: true,
    maxRetries: 2,
    retryDelayMs: 500,
};

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

/** Custom error class for semantic search errors */
export class SemanticSearchError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly statusCode?: number,
        public readonly originalError?: Error
    ) {
        super(message);
        this.name = 'SemanticSearchError';
    }
}

/** Service configuration - can be updated at runtime */
let serviceConfig: SemanticSearchConfig = { ...DEFAULT_CONFIG };

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retry wrapper for API calls
 */
async function withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = serviceConfig.maxRetries,
    delayMs: number = serviceConfig.retryDelayMs
): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (attempt < maxRetries) {
                await sleep(delayMs * Math.pow(2, attempt));
            }
        }
    }

    throw lastError;
}

export const semanticSearchService = {
    /**
     * Update service configuration
     * @param config - Partial configuration to merge
     */
    configure(config: Partial<SemanticSearchConfig>): void {
        serviceConfig = { ...serviceConfig, ...config };
    },

    /**
     * Get current service configuration
     * @returns Current configuration
     */
    getConfig(): SemanticSearchConfig {
        return { ...serviceConfig };
    },

    /**
     * Get search suggestions based on partial query using ZeroDB API
     * Falls back to vector search if the suggestions endpoint fails
     * @param query - The search query (minimum 2 characters)
     * @param options - Optional configuration
     * @returns Promise with suggestions response
     */
    async getSuggestions(
        query: string,
        options: SearchSuggestionsOptions = {}
    ): Promise<SearchSuggestionsResponse> {
        const { limit = 5, minQueryLength = 2 } = options;
        const trimmedQuery = query.trim();

        // Validate query length
        if (!trimmedQuery || trimmedQuery.length < minQueryLength) {
            return {
                suggestions: [],
                query: trimmedQuery,
                total_suggestions: 0,
            };
        }

        try {
            // Primary: Call ZeroDB suggestions API with retry logic
            const response = await withRetry(async () => {
                const fullEndpoint = `/v1/public/zerodb/search/suggestions?q=${encodeURIComponent(trimmedQuery)}&limit=${limit}`;
                return apiClient.get<SearchSuggestionsResponse>(fullEndpoint);
            });

            return response.data;
        } catch (primaryError: unknown) {
            console.warn(
                'ZeroDB suggestions API failed, attempting vector search fallback:',
                primaryError instanceof Error ? primaryError.message : primaryError
            );

            // Fallback: Use vector search to generate suggestions
            if (serviceConfig.enableVectorFallback) {
                try {
                    return await this.getSuggestionsViaVectorSearch(trimmedQuery, limit);
                } catch (fallbackError: unknown) {
                    console.error(
                        'Vector search fallback also failed:',
                        fallbackError instanceof Error ? fallbackError.message : fallbackError
                    );
                }
            }

            // If all attempts fail, throw a semantic search error
            throw new SemanticSearchError(
                `Failed to get search suggestions: ${primaryError instanceof Error ? primaryError.message : 'Unknown error'}`,
                'SUGGESTIONS_FAILED',
                undefined,
                primaryError instanceof Error ? primaryError : undefined
            );
        }
    },

    /**
     * Generate suggestions using vector search as a fallback mechanism
     * @param query - The search query
     * @param limit - Maximum number of suggestions to return
     * @returns Promise with suggestions response generated from vector search
     */
    async getSuggestionsViaVectorSearch(
        query: string,
        limit: number = 5
    ): Promise<SearchSuggestionsResponse> {
        const searchResponse = await this.searchContent({
            collection_name: serviceConfig.defaultCollection,
            query_text: query,
            top_k: limit,
            include_metadata: true,
        });

        // Transform vector search results into suggestion format
        const suggestions: SearchSuggestion[] = searchResponse.results
            .filter((result) => result.metadata?.title || result.payload?.title)
            .map((result) => ({
                text: String(result.metadata?.title || result.payload?.title || query),
                relevance_score: result.score,
                category: String(result.metadata?.category || result.payload?.category || 'general'),
                result_count: 1,
            }));

        return {
            suggestions,
            query,
            total_suggestions: suggestions.length,
        };
    },

    /**
     * Search content using semantic similarity via ZeroDB vector search
     * @param request - Search parameters including collection name and query text
     * @returns Promise with search results
     */
    async searchContent(request: SearchContentRequest): Promise<VectorSearchResponse> {
        try {
            const response = await withRetry(async () =>
                apiClient.post<VectorSearchResponse>(
                    '/v1/public/zerodb/vectors/search/text',
                    {
                        collection_name: request.collection_name,
                        query_text: request.query_text,
                        top_k: request.top_k || 10,
                        filter: request.filter,
                        include_metadata: request.include_metadata !== false,
                    }
                )
            );

            return response.data;
        } catch (error: unknown) {
            console.error('Failed to search content:', error);
            throw new SemanticSearchError(
                `Content search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                'CONTENT_SEARCH_FAILED',
                undefined,
                error instanceof Error ? error : undefined
            );
        }
    },

    /**
     * Get related content based on a content item ID via ZeroDB
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
        filter?: Record<string, unknown>
    ): Promise<VectorSearchResponse> {
        try {
            const response = await withRetry(async () =>
                apiClient.post<VectorSearchResponse>(
                    '/v1/public/zerodb/vectors/search/related',
                    {
                        collection_name: collectionName,
                        content_id: contentId,
                        top_k: topK,
                        filter,
                        include_metadata: true,
                    }
                )
            );

            return response.data;
        } catch (error: unknown) {
            console.error('Failed to get related content:', error);
            throw new SemanticSearchError(
                `Related content search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                'RELATED_CONTENT_FAILED',
                undefined,
                error instanceof Error ? error : undefined
            );
        }
    },

    /**
     * Generate embeddings for text content via ZeroDB ZeroML API
     * @param modelId - The embedding model ID to use
     * @param texts - Array of text strings to embed
     * @returns Promise with embeddings and processing time
     */
    async generateEmbeddings(
        modelId: string,
        texts: string[]
    ): Promise<EmbeddingsResponse> {
        if (!texts || texts.length === 0) {
            return { embeddings: [], processing_time_ms: 0 };
        }

        try {
            const response = await withRetry(async () =>
                apiClient.post<EmbeddingsResponse>(
                    `/v1/public/zerodb/zeroml/models/${modelId}/embed`,
                    { texts }
                )
            );

            return response.data;
        } catch (error: unknown) {
            console.error('Failed to generate embeddings:', error);
            throw new SemanticSearchError(
                `Embedding generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                'EMBEDDINGS_FAILED',
                undefined,
                error instanceof Error ? error : undefined
            );
        }
    },

    /**
     * Index content items into a collection for semantic search via ZeroDB
     * @param request - Index request with collection name and content items
     * @returns Promise with indexing results
     */
    async indexContent(request: IndexContentRequest): Promise<IndexContentResponse> {
        if (!request.items || request.items.length === 0) {
            return { indexed_count: 0, operation_time_ms: 0 };
        }

        try {
            const response = await withRetry(async () =>
                apiClient.post<IndexContentResponse>(
                    '/v1/public/zerodb/vectors/index',
                    {
                        collection_name: request.collection_name,
                        items: request.items,
                    }
                )
            );

            return response.data;
        } catch (error: unknown) {
            console.error('Failed to index content:', error);
            throw new SemanticSearchError(
                `Content indexing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                'INDEXING_FAILED',
                undefined,
                error instanceof Error ? error : undefined
            );
        }
    },

    /**
     * Health check for the semantic search service
     * Verifies connectivity to ZeroDB endpoints
     * @returns Promise with health status
     */
    async healthCheck(): Promise<{ healthy: boolean; latencyMs: number; message: string }> {
        const startTime = Date.now();
        try {
            await apiClient.get('/v1/public/zerodb/health');
            return {
                healthy: true,
                latencyMs: Date.now() - startTime,
                message: 'ZeroDB connection healthy',
            };
        } catch (error: unknown) {
            return {
                healthy: false,
                latencyMs: Date.now() - startTime,
                message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    },
};
