/**
 * Semantic Search Service Tests
 */

import apiClient from '@/lib/api-client';

jest.mock('@/lib/api-client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

import { semanticSearchService } from '../semanticSearchService';

describe('SemanticSearchService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSuggestions()', () => {
    it('should fetch search suggestions successfully', async () => {
      const mockResponse = {
        suggestions: [{ text: 'test', relevance_score: 0.9, category: 'tutorial', result_count: 5 }],
        query: 'test',
        total_suggestions: 1,
      };

      mockedApiClient.get.mockResolvedValue({ data: mockResponse, status: 200, statusText: 'OK' });

      const result = await semanticSearchService.getSuggestions('test', { limit: 5 });

      expect(mockedApiClient.get).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('should return empty for short query', async () => {
      const result = await semanticSearchService.getSuggestions('a', { minQueryLength: 2 });
      expect(result.suggestions).toEqual([]);
    });
  });

  describe('searchContent()', () => {
    it('should search content successfully', async () => {
      const mockResponse = { results: [], query_time_ms: 10, total_results: 0 };
      mockedApiClient.post.mockResolvedValue({ data: mockResponse, status: 200, statusText: 'OK' });

      const result = await semanticSearchService.searchContent({
        collection_name: 'docs',
        query_text: 'test',
      });

      expect(result).toEqual(mockResponse);
    });
  });
});
