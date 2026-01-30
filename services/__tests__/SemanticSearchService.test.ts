/**
 * SemanticSearchService Tests
 * Comprehensive tests for semantic search operations via ZeroDB API
 * Refs #434
 */

import apiClient from '@/lib/api-client';

// Mock apiClient
jest.mock('@/lib/api-client', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
    },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

import {
    semanticSearchService,
    SemanticSearchError,
    SemanticSearchConfig,
} from '../SemanticSearchService';
import type { SearchSuggestionsResponse } from '@/types/search';

describe('SemanticSearchService', () => {
    // Store original config to restore after tests
    let originalConfig: SemanticSearchConfig;

    beforeEach(() => {
        jest.clearAllMocks();
        // Store and reset config before each test
        originalConfig = semanticSearchService.getConfig();
        semanticSearchService.configure({
            maxRetries: 0, // Disable retries for faster tests
            retryDelayMs: 10,
            enableVectorFallback: true,
        });
    });

    afterEach(() => {
        // Restore original config
        semanticSearchService.configure(originalConfig);
    });

    describe('configure()', () => {
        it('should update service configuration', () => {
            semanticSearchService.configure({
                defaultCollection: 'test_collection',
                maxRetries: 5,
            });

            const config = semanticSearchService.getConfig();
            expect(config.defaultCollection).toBe('test_collection');
            expect(config.maxRetries).toBe(5);
        });

        it('should preserve other config values when partially updating', () => {
            const initialConfig = semanticSearchService.getConfig();
            semanticSearchService.configure({ maxRetries: 10 });

            const config = semanticSearchService.getConfig();
            expect(config.maxRetries).toBe(10);
            expect(config.defaultModelId).toBe(initialConfig.defaultModelId);
        });
    });

    describe('getConfig()', () => {
        it('should return a copy of the configuration', () => {
            const config1 = semanticSearchService.getConfig();
            const config2 = semanticSearchService.getConfig();

            expect(config1).toEqual(config2);
            expect(config1).not.toBe(config2); // Different references
        });
    });

    describe('getSuggestions()', () => {
        const mockSuggestionsResponse: SearchSuggestionsResponse = {
            suggestions: [
                { text: 'react tutorial', relevance_score: 0.95, category: 'tutorial', result_count: 12 },
                { text: 'react best practices', relevance_score: 0.88, category: 'blog_post', result_count: 8 },
            ],
            query: 'react',
            total_suggestions: 2,
        };

        it('should return suggestions from ZeroDB API', async () => {
            mockedApiClient.get.mockResolvedValueOnce({
                data: mockSuggestionsResponse,
                status: 200,
                statusText: 'OK',
            });

            const result = await semanticSearchService.getSuggestions('react');

            expect(mockedApiClient.get).toHaveBeenCalledWith(
                '/v1/public/zerodb/search/suggestions?q=react&limit=5'
            );
            expect(result).toEqual(mockSuggestionsResponse);
        });

        it('should respect custom limit option', async () => {
            mockedApiClient.get.mockResolvedValueOnce({
                data: mockSuggestionsResponse,
                status: 200,
                statusText: 'OK',
            });

            await semanticSearchService.getSuggestions('react', { limit: 10 });

            expect(mockedApiClient.get).toHaveBeenCalledWith(
                '/v1/public/zerodb/search/suggestions?q=react&limit=10'
            );
        });

        it('should return empty response for queries shorter than minQueryLength', async () => {
            const result = await semanticSearchService.getSuggestions('a', { minQueryLength: 2 });

            expect(result).toEqual({
                suggestions: [],
                query: 'a',
                total_suggestions: 0,
            });
            expect(mockedApiClient.get).not.toHaveBeenCalled();
        });

        it('should return empty response for empty query', async () => {
            const result = await semanticSearchService.getSuggestions('');

            expect(result).toEqual({
                suggestions: [],
                query: '',
                total_suggestions: 0,
            });
            expect(mockedApiClient.get).not.toHaveBeenCalled();
        });

        it('should return empty response for whitespace-only query', async () => {
            const result = await semanticSearchService.getSuggestions('   ');

            expect(result).toEqual({
                suggestions: [],
                query: '',
                total_suggestions: 0,
            });
        });

        it('should trim query whitespace', async () => {
            mockedApiClient.get.mockResolvedValueOnce({
                data: mockSuggestionsResponse,
                status: 200,
                statusText: 'OK',
            });

            await semanticSearchService.getSuggestions('  react  ');

            expect(mockedApiClient.get).toHaveBeenCalledWith(
                '/v1/public/zerodb/search/suggestions?q=react&limit=5'
            );
        });

        it('should URL encode special characters in query', async () => {
            mockedApiClient.get.mockResolvedValueOnce({
                data: { suggestions: [], query: 'c++', total_suggestions: 0 },
                status: 200,
                statusText: 'OK',
            });

            await semanticSearchService.getSuggestions('c++');

            expect(mockedApiClient.get).toHaveBeenCalledWith(
                '/v1/public/zerodb/search/suggestions?q=c%2B%2B&limit=5'
            );
        });

        it('should fall back to vector search when suggestions API fails', async () => {
            semanticSearchService.configure({ enableVectorFallback: true });

            mockedApiClient.get.mockRejectedValueOnce(new Error('API unavailable'));
            mockedApiClient.post.mockResolvedValueOnce({
                data: {
                    results: [
                        { id: '1', score: 0.9, metadata: { title: 'React Guide', category: 'tutorial' } },
                    ],
                    query_time_ms: 15,
                    total_results: 1,
                },
                status: 200,
                statusText: 'OK',
            });

            const result = await semanticSearchService.getSuggestions('react');

            expect(result.suggestions).toHaveLength(1);
            expect(result.suggestions[0].text).toBe('React Guide');
        });

        it('should throw SemanticSearchError when all attempts fail', async () => {
            semanticSearchService.configure({ enableVectorFallback: true });

            mockedApiClient.get.mockRejectedValueOnce(new Error('Suggestions API failed'));
            mockedApiClient.post.mockRejectedValueOnce(new Error('Vector search failed'));

            await expect(semanticSearchService.getSuggestions('react')).rejects.toThrow(
                SemanticSearchError
            );
        });

        it('should throw immediately when fallback is disabled', async () => {
            semanticSearchService.configure({ enableVectorFallback: false });

            mockedApiClient.get.mockRejectedValueOnce(new Error('API unavailable'));

            await expect(semanticSearchService.getSuggestions('react')).rejects.toThrow(
                SemanticSearchError
            );
            expect(mockedApiClient.post).not.toHaveBeenCalled();
        });
    });

    describe('getSuggestionsViaVectorSearch()', () => {
        it('should transform vector search results into suggestions', async () => {
            mockedApiClient.post.mockResolvedValueOnce({
                data: {
                    results: [
                        { id: '1', score: 0.95, metadata: { title: 'React Hooks Tutorial', category: 'tutorial' } },
                        { id: '2', score: 0.88, payload: { title: 'React State Management', category: 'guide' } },
                    ],
                    query_time_ms: 20,
                    total_results: 2,
                },
                status: 200,
                statusText: 'OK',
            });

            const result = await semanticSearchService.getSuggestionsViaVectorSearch('react', 5);

            expect(result.suggestions).toHaveLength(2);
            expect(result.suggestions[0]).toEqual({
                text: 'React Hooks Tutorial',
                relevance_score: 0.95,
                category: 'tutorial',
                result_count: 1,
            });
            expect(result.suggestions[1]).toEqual({
                text: 'React State Management',
                relevance_score: 0.88,
                category: 'guide',
                result_count: 1,
            });
        });

        it('should filter out results without titles', async () => {
            mockedApiClient.post.mockResolvedValueOnce({
                data: {
                    results: [
                        { id: '1', score: 0.95, metadata: { title: 'React Guide' } },
                        { id: '2', score: 0.88, metadata: { description: 'No title here' } },
                    ],
                    query_time_ms: 15,
                    total_results: 2,
                },
                status: 200,
                statusText: 'OK',
            });

            const result = await semanticSearchService.getSuggestionsViaVectorSearch('react', 5);

            expect(result.suggestions).toHaveLength(1);
            expect(result.suggestions[0].text).toBe('React Guide');
        });
    });

    describe('searchContent()', () => {
        const mockSearchResponse = {
            results: [
                { id: 'doc-1', score: 0.95, metadata: { title: 'Document 1' } },
                { id: 'doc-2', score: 0.85, metadata: { title: 'Document 2' } },
            ],
            query_time_ms: 25,
            total_results: 2,
        };

        it('should search content via ZeroDB vector search API', async () => {
            mockedApiClient.post.mockResolvedValueOnce({
                data: mockSearchResponse,
                status: 200,
                statusText: 'OK',
            });

            const result = await semanticSearchService.searchContent({
                collection_name: 'documents',
                query_text: 'machine learning',
            });

            expect(mockedApiClient.post).toHaveBeenCalledWith(
                '/v1/public/zerodb/vectors/search/text',
                {
                    collection_name: 'documents',
                    query_text: 'machine learning',
                    top_k: 10,
                    filter: undefined,
                    include_metadata: true,
                }
            );
            expect(result).toEqual(mockSearchResponse);
        });

        it('should use custom top_k and filter', async () => {
            mockedApiClient.post.mockResolvedValueOnce({
                data: mockSearchResponse,
                status: 200,
                statusText: 'OK',
            });

            await semanticSearchService.searchContent({
                collection_name: 'documents',
                query_text: 'AI',
                top_k: 20,
                filter: { category: 'tutorial' },
            });

            expect(mockedApiClient.post).toHaveBeenCalledWith(
                '/v1/public/zerodb/vectors/search/text',
                expect.objectContaining({
                    top_k: 20,
                    filter: { category: 'tutorial' },
                })
            );
        });

        it('should throw SemanticSearchError on failure', async () => {
            mockedApiClient.post.mockRejectedValueOnce(new Error('Search timeout'));

            await expect(
                semanticSearchService.searchContent({
                    collection_name: 'documents',
                    query_text: 'test',
                })
            ).rejects.toThrow(SemanticSearchError);
        });

        it('should include error code CONTENT_SEARCH_FAILED', async () => {
            mockedApiClient.post.mockRejectedValueOnce(new Error('API error'));

            try {
                await semanticSearchService.searchContent({
                    collection_name: 'documents',
                    query_text: 'test',
                });
            } catch (error) {
                expect(error).toBeInstanceOf(SemanticSearchError);
                expect((error as SemanticSearchError).code).toBe('CONTENT_SEARCH_FAILED');
            }
        });
    });

    describe('getRelatedContent()', () => {
        const mockRelatedResponse = {
            results: [
                { id: 'related-1', score: 0.92, metadata: { title: 'Related Article 1' } },
            ],
            query_time_ms: 18,
            total_results: 1,
        };

        it('should fetch related content via ZeroDB API', async () => {
            mockedApiClient.post.mockResolvedValueOnce({
                data: mockRelatedResponse,
                status: 200,
                statusText: 'OK',
            });

            const result = await semanticSearchService.getRelatedContent(
                'articles',
                'content-123',
                5
            );

            expect(mockedApiClient.post).toHaveBeenCalledWith(
                '/v1/public/zerodb/vectors/search/related',
                {
                    collection_name: 'articles',
                    content_id: 'content-123',
                    top_k: 5,
                    filter: undefined,
                    include_metadata: true,
                }
            );
            expect(result).toEqual(mockRelatedResponse);
        });

        it('should support filter parameter', async () => {
            mockedApiClient.post.mockResolvedValueOnce({
                data: mockRelatedResponse,
                status: 200,
                statusText: 'OK',
            });

            await semanticSearchService.getRelatedContent(
                'articles',
                'content-123',
                10,
                { status: 'published' }
            );

            expect(mockedApiClient.post).toHaveBeenCalledWith(
                '/v1/public/zerodb/vectors/search/related',
                expect.objectContaining({
                    filter: { status: 'published' },
                })
            );
        });

        it('should throw SemanticSearchError on failure', async () => {
            mockedApiClient.post.mockRejectedValueOnce(new Error('Content not found'));

            await expect(
                semanticSearchService.getRelatedContent('articles', 'invalid-id')
            ).rejects.toThrow(SemanticSearchError);
        });
    });

    describe('generateEmbeddings()', () => {
        const mockEmbeddingsResponse = {
            embeddings: [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]],
            processing_time_ms: 50,
        };

        it('should generate embeddings via ZeroDB ZeroML API', async () => {
            mockedApiClient.post.mockResolvedValueOnce({
                data: mockEmbeddingsResponse,
                status: 200,
                statusText: 'OK',
            });

            const result = await semanticSearchService.generateEmbeddings(
                'text-embedding-ada-002',
                ['Hello world', 'How are you']
            );

            expect(mockedApiClient.post).toHaveBeenCalledWith(
                '/v1/public/zerodb/zeroml/models/text-embedding-ada-002/embed',
                { texts: ['Hello world', 'How are you'] }
            );
            expect(result).toEqual(mockEmbeddingsResponse);
        });

        it('should return empty response for empty texts array', async () => {
            const result = await semanticSearchService.generateEmbeddings('model-id', []);

            expect(result).toEqual({ embeddings: [], processing_time_ms: 0 });
            expect(mockedApiClient.post).not.toHaveBeenCalled();
        });

        it('should throw SemanticSearchError on failure', async () => {
            mockedApiClient.post.mockRejectedValueOnce(new Error('Model not found'));

            await expect(
                semanticSearchService.generateEmbeddings('invalid-model', ['test'])
            ).rejects.toThrow(SemanticSearchError);
        });

        it('should include error code EMBEDDINGS_FAILED', async () => {
            mockedApiClient.post.mockRejectedValueOnce(new Error('API error'));

            try {
                await semanticSearchService.generateEmbeddings('model', ['test']);
            } catch (error) {
                expect(error).toBeInstanceOf(SemanticSearchError);
                expect((error as SemanticSearchError).code).toBe('EMBEDDINGS_FAILED');
            }
        });
    });

    describe('indexContent()', () => {
        const mockIndexResponse = {
            indexed_count: 3,
            operation_time_ms: 150,
        };

        it('should index content via ZeroDB API', async () => {
            mockedApiClient.post.mockResolvedValueOnce({
                data: mockIndexResponse,
                status: 200,
                statusText: 'OK',
            });

            const items = [
                { id: 'doc-1', content: 'First document', metadata: { source: 'test' } },
                { id: 'doc-2', content: 'Second document', metadata: { source: 'test' } },
            ];

            const result = await semanticSearchService.indexContent({
                collection_name: 'documents',
                items,
            });

            expect(mockedApiClient.post).toHaveBeenCalledWith(
                '/v1/public/zerodb/vectors/index',
                {
                    collection_name: 'documents',
                    items,
                }
            );
            expect(result).toEqual(mockIndexResponse);
        });

        it('should return empty response for empty items array', async () => {
            const result = await semanticSearchService.indexContent({
                collection_name: 'documents',
                items: [],
            });

            expect(result).toEqual({ indexed_count: 0, operation_time_ms: 0 });
            expect(mockedApiClient.post).not.toHaveBeenCalled();
        });

        it('should throw SemanticSearchError on failure', async () => {
            mockedApiClient.post.mockRejectedValueOnce(new Error('Collection not found'));

            await expect(
                semanticSearchService.indexContent({
                    collection_name: 'invalid',
                    items: [{ id: '1', content: 'test' }],
                })
            ).rejects.toThrow(SemanticSearchError);
        });

        it('should include error code INDEXING_FAILED', async () => {
            mockedApiClient.post.mockRejectedValueOnce(new Error('API error'));

            try {
                await semanticSearchService.indexContent({
                    collection_name: 'docs',
                    items: [{ id: '1', content: 'test' }],
                });
            } catch (error) {
                expect(error).toBeInstanceOf(SemanticSearchError);
                expect((error as SemanticSearchError).code).toBe('INDEXING_FAILED');
            }
        });
    });

    describe('healthCheck()', () => {
        it('should return healthy status when ZeroDB is available', async () => {
            mockedApiClient.get.mockResolvedValueOnce({
                data: { status: 'ok' },
                status: 200,
                statusText: 'OK',
            });

            const result = await semanticSearchService.healthCheck();

            expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/public/zerodb/health');
            expect(result.healthy).toBe(true);
            expect(result.message).toBe('ZeroDB connection healthy');
            expect(result.latencyMs).toBeGreaterThanOrEqual(0);
        });

        it('should return unhealthy status when ZeroDB is unavailable', async () => {
            mockedApiClient.get.mockRejectedValueOnce(new Error('Connection refused'));

            const result = await semanticSearchService.healthCheck();

            expect(result.healthy).toBe(false);
            expect(result.message).toContain('Health check failed');
            expect(result.message).toContain('Connection refused');
        });

        it('should not throw on health check failure', async () => {
            mockedApiClient.get.mockRejectedValueOnce(new Error('Timeout'));

            const result = await semanticSearchService.healthCheck();

            expect(result.healthy).toBe(false);
        });
    });

    describe('SemanticSearchError', () => {
        it('should create error with all properties', () => {
            const originalError = new Error('Original error');
            const error = new SemanticSearchError(
                'Test error message',
                'TEST_CODE',
                500,
                originalError
            );

            expect(error.message).toBe('Test error message');
            expect(error.code).toBe('TEST_CODE');
            expect(error.statusCode).toBe(500);
            expect(error.originalError).toBe(originalError);
            expect(error.name).toBe('SemanticSearchError');
        });

        it('should be instanceof Error', () => {
            const error = new SemanticSearchError('Test', 'CODE');
            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(SemanticSearchError);
        });
    });

    describe('Retry Logic', () => {
        it('should retry failed requests based on config', async () => {
            semanticSearchService.configure({ maxRetries: 2, retryDelayMs: 10 });

            mockedApiClient.post.mockRejectedValueOnce(new Error('First failure'));
            mockedApiClient.post.mockRejectedValueOnce(new Error('Second failure'));
            mockedApiClient.post.mockResolvedValueOnce({
                data: { results: [], query_time_ms: 10, total_results: 0 },
                status: 200,
                statusText: 'OK',
            });

            const result = await semanticSearchService.searchContent({
                collection_name: 'test',
                query_text: 'query',
            });

            expect(mockedApiClient.post).toHaveBeenCalledTimes(3);
            expect(result.results).toEqual([]);
        });

        it('should fail after exhausting retries', async () => {
            semanticSearchService.configure({ maxRetries: 1, retryDelayMs: 10 });

            mockedApiClient.post.mockRejectedValue(new Error('Persistent failure'));

            await expect(
                semanticSearchService.searchContent({
                    collection_name: 'test',
                    query_text: 'query',
                })
            ).rejects.toThrow('Persistent failure');

            expect(mockedApiClient.post).toHaveBeenCalledTimes(2); // Initial + 1 retry
        });
    });

    describe('Mock Data Removal Verification', () => {
        it('should NOT have getMockSuggestions method', () => {
            expect((semanticSearchService as any).getMockSuggestions).toBeUndefined();
        });

        it('should always call real API for getSuggestions', async () => {
            mockedApiClient.get.mockResolvedValueOnce({
                data: { suggestions: [], query: 'test', total_suggestions: 0 },
                status: 200,
                statusText: 'OK',
            });

            await semanticSearchService.getSuggestions('test');

            expect(mockedApiClient.get).toHaveBeenCalled();
        });
    });
});
