/**
 * Unit tests for SemanticSearchService
 *
 * Tests the semantic search functionality including suggestions,
 * content search, related content, embeddings, and content indexing.
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import {
  semanticSearchService,
  SemanticSearchError,
  SemanticSearchErrorCodes,
} from '@/services/SemanticSearchService';

// Mock the api-client module
const mockGet = jest.fn();
const mockPost = jest.fn();

jest.mock('@/lib/api-client', () => ({
  __esModule: true,
  default: {
    get: mockGet,
    post: mockPost,
  },
}));

describe('SemanticSearchService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getSuggestions', () => {
    it('should return suggestions for valid query', async () => {
      const mockResponse = {
        data: {
          suggestions: [
            { text: 'quantum computing', relevance_score: 0.95, category: 'tutorial', result_count: 12 },
            { text: 'quantum algorithms', relevance_score: 0.88, category: 'blog_post', result_count: 8 },
          ],
          query: 'quantum',
          total_suggestions: 2,
        },
        status: 200,
        statusText: 'OK',
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await semanticSearchService.getSuggestions('quantum');

      expect(mockGet).toHaveBeenCalledWith(
        '/v1/public/zerodb/search/suggestions?q=quantum&limit=5'
      );
      expect(result.suggestions).toHaveLength(2);
      expect(result.suggestions[0].text).toBe('quantum computing');
      expect(result.query).toBe('quantum');
    });

    it('should return empty suggestions for query shorter than minQueryLength', async () => {
      const result = await semanticSearchService.getSuggestions('q');

      expect(mockGet).not.toHaveBeenCalled();
      expect(result.suggestions).toHaveLength(0);
      expect(result.query).toBe('q');
      expect(result.total_suggestions).toBe(0);
    });

    it('should return empty suggestions for empty query', async () => {
      const result = await semanticSearchService.getSuggestions('');

      expect(mockGet).not.toHaveBeenCalled();
      expect(result.suggestions).toHaveLength(0);
      expect(result.total_suggestions).toBe(0);
    });

    it('should return empty suggestions for whitespace-only query', async () => {
      const result = await semanticSearchService.getSuggestions('   ');

      expect(mockGet).not.toHaveBeenCalled();
      expect(result.suggestions).toHaveLength(0);
    });

    it('should respect custom limit option', async () => {
      const mockResponse = {
        data: {
          suggestions: [
            { text: 'test result', relevance_score: 0.9, category: 'tutorial', result_count: 5 },
          ],
          query: 'test',
          total_suggestions: 1,
        },
        status: 200,
        statusText: 'OK',
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      await semanticSearchService.getSuggestions('test', { limit: 10 });

      expect(mockGet).toHaveBeenCalledWith(
        '/v1/public/zerodb/search/suggestions?q=test&limit=10'
      );
    });

    it('should respect custom minQueryLength option', async () => {
      const result = await semanticSearchService.getSuggestions('ab', { minQueryLength: 3 });

      expect(mockGet).not.toHaveBeenCalled();
      expect(result.suggestions).toHaveLength(0);
    });

    it('should handle API errors gracefully', async () => {
      mockGet.mockRejectedValueOnce(new Error('Network error'));

      const result = await semanticSearchService.getSuggestions('quantum');

      expect(result.suggestions).toHaveLength(0);
      expect(result.query).toBe('quantum');
      expect(result.total_suggestions).toBe(0);
    });

    it('should normalize response data with missing fields', async () => {
      const mockResponse = {
        data: {
          suggestions: [
            { text: 'partial data' }, // Missing relevance_score, category, result_count
          ],
          query: 'test',
        },
        status: 200,
        statusText: 'OK',
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await semanticSearchService.getSuggestions('test');

      expect(result.suggestions[0].relevance_score).toBe(0);
      expect(result.suggestions[0].category).toBe('general');
      expect(result.suggestions[0].result_count).toBe(0);
    });

    it('should trim query before sending', async () => {
      const mockResponse = {
        data: {
          suggestions: [],
          query: 'test',
          total_suggestions: 0,
        },
        status: 200,
        statusText: 'OK',
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      await semanticSearchService.getSuggestions('  test  ');

      expect(mockGet).toHaveBeenCalledWith(
        '/v1/public/zerodb/search/suggestions?q=test&limit=5'
      );
    });
  });

  describe('searchContent', () => {
    it('should search content with valid parameters', async () => {
      const mockResponse = {
        data: {
          results: [
            { id: 'doc-1', score: 0.95, metadata: { title: 'Test Document' } },
            { id: 'doc-2', score: 0.88, metadata: { title: 'Another Document' } },
          ],
          query_time_ms: 15,
          total_results: 2,
        },
        status: 200,
        statusText: 'OK',
      };

      mockPost.mockResolvedValueOnce(mockResponse);

      const result = await semanticSearchService.searchContent({
        collection_name: 'blog_posts',
        query_text: 'machine learning',
      });

      expect(mockPost).toHaveBeenCalledWith(
        '/v1/public/zerodb/vectors/search/text',
        {
          collection_name: 'blog_posts',
          query_text: 'machine learning',
          top_k: 10,
          filter: undefined,
          include_metadata: true,
        }
      );
      expect(result.results).toHaveLength(2);
      expect(result.query_time_ms).toBe(15);
    });

    it('should throw error for missing collection name', async () => {
      await expect(
        semanticSearchService.searchContent({
          collection_name: '',
          query_text: 'test',
        })
      ).rejects.toThrow(SemanticSearchError);

      await expect(
        semanticSearchService.searchContent({
          collection_name: '',
          query_text: 'test',
        })
      ).rejects.toMatchObject({
        code: SemanticSearchErrorCodes.INVALID_QUERY,
      });
    });

    it('should throw error for missing query text', async () => {
      await expect(
        semanticSearchService.searchContent({
          collection_name: 'blog_posts',
          query_text: '',
        })
      ).rejects.toThrow(SemanticSearchError);
    });

    it('should clamp top_k between 1 and 100', async () => {
      const mockResponse = {
        data: { results: [], query_time_ms: 5, total_results: 0 },
        status: 200,
        statusText: 'OK',
      };

      mockPost.mockResolvedValue(mockResponse);

      // Test clamping to minimum
      await semanticSearchService.searchContent({
        collection_name: 'test',
        query_text: 'query',
        top_k: -5,
      });

      expect(mockPost).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ top_k: 1 })
      );

      // Test clamping to maximum
      await semanticSearchService.searchContent({
        collection_name: 'test',
        query_text: 'query',
        top_k: 500,
      });

      expect(mockPost).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ top_k: 100 })
      );
    });

    it('should include filter when provided', async () => {
      const mockResponse = {
        data: { results: [], query_time_ms: 5, total_results: 0 },
        status: 200,
        statusText: 'OK',
      };

      mockPost.mockResolvedValueOnce(mockResponse);

      const filter = { category: 'ai', status: 'published' };

      await semanticSearchService.searchContent({
        collection_name: 'blog_posts',
        query_text: 'test',
        filter,
      });

      expect(mockPost).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ filter })
      );
    });

    it('should handle API errors with proper error code', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { detail: 'Collection not found' },
        },
      };

      mockPost.mockRejectedValueOnce(mockError);

      await expect(
        semanticSearchService.searchContent({
          collection_name: 'nonexistent',
          query_text: 'test',
        })
      ).rejects.toMatchObject({
        code: SemanticSearchErrorCodes.NOT_FOUND,
      });
    });
  });

  describe('getRelatedContent', () => {
    it('should get related content with valid parameters', async () => {
      const mockResponse = {
        data: {
          results: [
            { id: 'related-1', score: 0.92, metadata: { title: 'Related Post' } },
          ],
          query_time_ms: 12,
          total_results: 1,
        },
        status: 200,
        statusText: 'OK',
      };

      mockPost.mockResolvedValueOnce(mockResponse);

      const result = await semanticSearchService.getRelatedContent(
        'blog_posts',
        'post-123',
        5
      );

      expect(mockPost).toHaveBeenCalledWith(
        '/v1/public/zerodb/vectors/search/related',
        {
          collection_name: 'blog_posts',
          content_id: 'post-123',
          top_k: 5,
          filter: undefined,
          include_metadata: true,
        }
      );
      expect(result.results).toHaveLength(1);
    });

    it('should throw error for missing collection name', async () => {
      await expect(
        semanticSearchService.getRelatedContent('', 'post-123')
      ).rejects.toThrow(SemanticSearchError);
    });

    it('should throw error for missing content ID', async () => {
      await expect(
        semanticSearchService.getRelatedContent('blog_posts', '')
      ).rejects.toThrow(SemanticSearchError);
    });

    it('should use default topK of 10', async () => {
      const mockResponse = {
        data: { results: [], query_time_ms: 5, total_results: 0 },
        status: 200,
        statusText: 'OK',
      };

      mockPost.mockResolvedValueOnce(mockResponse);

      await semanticSearchService.getRelatedContent('blog_posts', 'post-123');

      expect(mockPost).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ top_k: 10 })
      );
    });

    it('should include filter when provided', async () => {
      const mockResponse = {
        data: { results: [], query_time_ms: 5, total_results: 0 },
        status: 200,
        statusText: 'OK',
      };

      mockPost.mockResolvedValueOnce(mockResponse);

      const filter = { status: 'published' };

      await semanticSearchService.getRelatedContent('blog_posts', 'post-123', 5, filter);

      expect(mockPost).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ filter })
      );
    });
  });

  describe('generateEmbeddings', () => {
    it('should generate embeddings for valid texts', async () => {
      const mockResponse = {
        data: {
          embeddings: [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]],
          processing_time_ms: 50,
        },
        status: 200,
        statusText: 'OK',
      };

      mockPost.mockResolvedValueOnce(mockResponse);

      const result = await semanticSearchService.generateEmbeddings(
        'all-MiniLM-L6-v2',
        ['Hello world', 'Test text']
      );

      expect(mockPost).toHaveBeenCalledWith(
        '/v1/public/zerodb/zeroml/models/all-MiniLM-L6-v2/embed',
        { texts: ['Hello world', 'Test text'] }
      );
      expect(result.embeddings).toHaveLength(2);
      expect(result.processing_time_ms).toBe(50);
    });

    it('should throw error for missing model ID', async () => {
      await expect(
        semanticSearchService.generateEmbeddings('', ['test'])
      ).rejects.toThrow(SemanticSearchError);
    });

    it('should throw error for empty texts array', async () => {
      await expect(
        semanticSearchService.generateEmbeddings('model-1', [])
      ).rejects.toThrow(SemanticSearchError);
    });

    it('should throw error for more than 100 texts', async () => {
      const texts = Array(101).fill('test text');

      await expect(
        semanticSearchService.generateEmbeddings('model-1', texts)
      ).rejects.toMatchObject({
        code: SemanticSearchErrorCodes.INVALID_QUERY,
        message: expect.stringContaining('Maximum 100 texts'),
      });
    });

    it('should filter out empty strings', async () => {
      const mockResponse = {
        data: {
          embeddings: [[0.1, 0.2]],
          processing_time_ms: 25,
        },
        status: 200,
        statusText: 'OK',
      };

      mockPost.mockResolvedValueOnce(mockResponse);

      await semanticSearchService.generateEmbeddings('model-1', ['valid', '', '  ', 'also valid']);

      expect(mockPost).toHaveBeenCalledWith(
        expect.any(String),
        { texts: ['valid', 'also valid'] }
      );
    });

    it('should throw error if all texts are empty', async () => {
      await expect(
        semanticSearchService.generateEmbeddings('model-1', ['', '  ', '\t'])
      ).rejects.toThrow(SemanticSearchError);
    });

    it('should encode model ID in URL', async () => {
      const mockResponse = {
        data: { embeddings: [[0.1]], processing_time_ms: 10 },
        status: 200,
        statusText: 'OK',
      };

      mockPost.mockResolvedValueOnce(mockResponse);

      await semanticSearchService.generateEmbeddings('model with spaces', ['test']);

      expect(mockPost).toHaveBeenCalledWith(
        '/v1/public/zerodb/zeroml/models/model%20with%20spaces/embed',
        expect.any(Object)
      );
    });
  });

  describe('indexContent', () => {
    it('should index content with valid parameters', async () => {
      const mockResponse = {
        data: {
          indexed_count: 2,
          operation_time_ms: 100,
        },
        status: 200,
        statusText: 'OK',
      };

      mockPost.mockResolvedValueOnce(mockResponse);

      const result = await semanticSearchService.indexContent({
        collection_name: 'blog_posts',
        items: [
          { id: 'post-1', content: 'Content 1', metadata: { category: 'ai' } },
          { id: 'post-2', content: 'Content 2' },
        ],
      });

      expect(mockPost).toHaveBeenCalledWith(
        '/v1/public/zerodb/vectors/index',
        {
          collection_name: 'blog_posts',
          items: [
            { id: 'post-1', content: 'Content 1', metadata: { category: 'ai' } },
            { id: 'post-2', content: 'Content 2', metadata: undefined },
          ],
        }
      );
      expect(result.indexed_count).toBe(2);
    });

    it('should throw error for missing collection name', async () => {
      await expect(
        semanticSearchService.indexContent({
          collection_name: '',
          items: [{ id: 'test', content: 'test' }],
        })
      ).rejects.toThrow(SemanticSearchError);
    });

    it('should throw error for empty items array', async () => {
      await expect(
        semanticSearchService.indexContent({
          collection_name: 'blog_posts',
          items: [],
        })
      ).rejects.toThrow(SemanticSearchError);
    });

    it('should filter out items with missing id or content', async () => {
      const mockResponse = {
        data: { indexed_count: 1, operation_time_ms: 50 },
        status: 200,
        statusText: 'OK',
      };

      mockPost.mockResolvedValueOnce(mockResponse);

      await semanticSearchService.indexContent({
        collection_name: 'blog_posts',
        items: [
          { id: 'valid', content: 'Valid content' },
          { id: '', content: 'Missing id' },
          { id: 'missing-content', content: '' },
        ],
      });

      expect(mockPost).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          items: [{ id: 'valid', content: 'Valid content', metadata: undefined }],
        })
      );
    });

    it('should throw error if all items are invalid', async () => {
      await expect(
        semanticSearchService.indexContent({
          collection_name: 'blog_posts',
          items: [
            { id: '', content: 'no id' },
            { id: 'no content', content: '' },
          ],
        })
      ).rejects.toThrow(SemanticSearchError);
    });
  });

  describe('healthCheck', () => {
    it('should return true when API is healthy', async () => {
      mockGet.mockResolvedValueOnce({
        data: { status: 'healthy' },
        status: 200,
        statusText: 'OK',
      });

      const result = await semanticSearchService.healthCheck();

      expect(mockGet).toHaveBeenCalledWith('/v1/public/zerodb/health');
      expect(result).toBe(true);
    });

    it('should return false when API is unhealthy', async () => {
      mockGet.mockRejectedValueOnce(new Error('Service unavailable'));

      const result = await semanticSearchService.healthCheck();

      expect(result).toBe(false);
    });
  });

  describe('SemanticSearchError', () => {
    it('should create error with all properties', () => {
      const originalError = new Error('Original');
      const error = new SemanticSearchError(
        'Test error',
        SemanticSearchErrorCodes.API_ERROR,
        500,
        originalError
      );

      expect(error.message).toBe('Test error');
      expect(error.code).toBe(SemanticSearchErrorCodes.API_ERROR);
      expect(error.statusCode).toBe(500);
      expect(error.originalError).toBe(originalError);
      expect(error.name).toBe('SemanticSearchError');
    });

    it('should work without optional properties', () => {
      const error = new SemanticSearchError(
        'Simple error',
        SemanticSearchErrorCodes.INVALID_QUERY
      );

      expect(error.message).toBe('Simple error');
      expect(error.code).toBe(SemanticSearchErrorCodes.INVALID_QUERY);
      expect(error.statusCode).toBeUndefined();
      expect(error.originalError).toBeUndefined();
    });
  });

  describe('Error code mapping', () => {
    it('should map 401 to UNAUTHORIZED', async () => {
      const mockError = {
        response: { status: 401, data: { detail: 'Unauthorized' } },
      };

      mockPost.mockRejectedValueOnce(mockError);

      await expect(
        semanticSearchService.searchContent({
          collection_name: 'test',
          query_text: 'query',
        })
      ).rejects.toMatchObject({
        code: SemanticSearchErrorCodes.UNAUTHORIZED,
      });
    });

    it('should map 429 to RATE_LIMITED', async () => {
      const mockError = {
        response: { status: 429, data: { detail: 'Rate limited' } },
      };

      mockPost.mockRejectedValueOnce(mockError);

      await expect(
        semanticSearchService.searchContent({
          collection_name: 'test',
          query_text: 'query',
        })
      ).rejects.toMatchObject({
        code: SemanticSearchErrorCodes.RATE_LIMITED,
      });
    });

    it('should map timeout errors correctly', async () => {
      mockPost.mockRejectedValueOnce(
        new Error('Request timeout after 30000ms')
      );

      await expect(
        semanticSearchService.searchContent({
          collection_name: 'test',
          query_text: 'query',
        })
      ).rejects.toMatchObject({
        code: SemanticSearchErrorCodes.TIMEOUT,
      });
    });

    it('should map network errors correctly', async () => {
      mockPost.mockRejectedValueOnce(
        new Error('Failed to fetch')
      );

      await expect(
        semanticSearchService.searchContent({
          collection_name: 'test',
          query_text: 'query',
        })
      ).rejects.toMatchObject({
        code: SemanticSearchErrorCodes.NETWORK_ERROR,
      });
    });
  });
});
