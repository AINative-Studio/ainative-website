/**
 * Tests for useSearchSuggestions hook
 *
 * Comprehensive test suite for the semantic search suggestions hook
 * with React Query integration.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useSearchSuggestions } from '@/hooks/useSearchSuggestions';
import type { SearchSuggestionsResponse } from '@/types/search';

// Mock SemanticSearchService module
const mockGetSuggestions = jest.fn();

jest.mock('@/services/SemanticSearchService', () => ({
  semanticSearchService: {
    getSuggestions: mockGetSuggestions,
  },
}));

// Mock data
const mockSuggestionsResponse: SearchSuggestionsResponse = {
  suggestions: [
    { text: 'quantum computing', relevance_score: 0.95, category: 'tutorial', result_count: 12 },
    { text: 'quantum algorithms', relevance_score: 0.88, category: 'blog_post', result_count: 8 },
    { text: 'quantum machine learning', relevance_score: 0.82, category: 'showcase', result_count: 5 },
  ],
  query: 'quantum',
  total_suggestions: 3,
};

const emptySuggestionsResponse: SearchSuggestionsResponse = {
  suggestions: [],
  query: '',
  total_suggestions: 0,
};

// Create wrapper for React Query
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  Wrapper.displayName = 'TestQueryClientWrapper';
  return Wrapper;
}

describe('useSearchSuggestions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should fetch suggestions for valid query', async () => {
      mockGetSuggestions.mockResolvedValue(mockSuggestionsResponse);

      const { result } = renderHook(
        () => useSearchSuggestions({ query: 'quantum' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockGetSuggestions).toHaveBeenCalledWith('quantum', {
        limit: 5,
        minQueryLength: 2,
      });
      expect(result.current.data).toEqual(mockSuggestionsResponse);
      expect(result.current.suggestions).toHaveLength(3);
      expect(result.current.hasSuggestions).toBe(true);
    });

    it('should not fetch for query shorter than minQueryLength', async () => {
      mockGetSuggestions.mockResolvedValue(mockSuggestionsResponse);

      const { result } = renderHook(
        () => useSearchSuggestions({ query: 'q' }),
        { wrapper: createWrapper() }
      );

      // Wait a tick for query to settle
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockGetSuggestions).not.toHaveBeenCalled();
      expect(result.current.data).toBeUndefined();
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should not fetch for empty query', async () => {
      mockGetSuggestions.mockResolvedValue(emptySuggestionsResponse);

      const { result } = renderHook(
        () => useSearchSuggestions({ query: '' }),
        { wrapper: createWrapper() }
      );

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockGetSuggestions).not.toHaveBeenCalled();
      expect(result.current.suggestions).toHaveLength(0);
      expect(result.current.hasSuggestions).toBe(false);
    });

    it('should trim whitespace from query', async () => {
      mockGetSuggestions.mockResolvedValue(mockSuggestionsResponse);

      const { result } = renderHook(
        () => useSearchSuggestions({ query: '  quantum  ' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockGetSuggestions).toHaveBeenCalledWith('quantum', expect.any(Object));
    });
  });

  describe('Options', () => {
    it('should respect custom limit option', async () => {
      mockGetSuggestions.mockResolvedValue(mockSuggestionsResponse);

      const { result } = renderHook(
        () => useSearchSuggestions({
          query: 'quantum',
          options: { limit: 10 },
        }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockGetSuggestions).toHaveBeenCalledWith('quantum', {
        limit: 10,
        minQueryLength: 2,
      });
    });

    it('should respect custom minQueryLength option', async () => {
      mockGetSuggestions.mockResolvedValue(mockSuggestionsResponse);

      // Query length is 3, but minQueryLength is 4, so should not fetch
      const { result } = renderHook(
        () => useSearchSuggestions({
          query: 'abc',
          options: { minQueryLength: 4 },
        }),
        { wrapper: createWrapper() }
      );

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockGetSuggestions).not.toHaveBeenCalled();
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should allow minimum 2 character query with minQueryLength 2', async () => {
      mockGetSuggestions.mockResolvedValue(mockSuggestionsResponse);

      const { result } = renderHook(
        () => useSearchSuggestions({
          query: 'ai',
          options: { minQueryLength: 2 },
        }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockGetSuggestions).toHaveBeenCalled();
    });
  });

  describe('Enabled option', () => {
    it('should not fetch when enabled is false', async () => {
      mockGetSuggestions.mockResolvedValue(mockSuggestionsResponse);

      const { result } = renderHook(
        () => useSearchSuggestions({
          query: 'quantum',
          enabled: false,
        }),
        { wrapper: createWrapper() }
      );

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockGetSuggestions).not.toHaveBeenCalled();
      expect(result.current.data).toBeUndefined();
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should fetch when enabled changes from false to true', async () => {
      mockGetSuggestions.mockResolvedValue(mockSuggestionsResponse);

      const { result, rerender } = renderHook(
        ({ enabled }) => useSearchSuggestions({
          query: 'quantum',
          enabled,
        }),
        {
          wrapper: createWrapper(),
          initialProps: { enabled: false },
        }
      );

      await new Promise(resolve => setTimeout(resolve, 10));
      expect(mockGetSuggestions).not.toHaveBeenCalled();

      // Enable the query
      rerender({ enabled: true });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockGetSuggestions).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle API errors', async () => {
      const mockError = new Error('API Error: Unable to fetch suggestions');
      mockGetSuggestions.mockRejectedValue(mockError);

      const { result } = renderHook(
        () => useSearchSuggestions({ query: 'quantum' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(mockError);
      expect(result.current.suggestions).toHaveLength(0);
      expect(result.current.hasSuggestions).toBe(false);
    });

    it('should retry once on failure', async () => {
      const mockError = new Error('Network error');
      mockGetSuggestions
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockSuggestionsResponse);

      const { result } = renderHook(
        () => useSearchSuggestions({ query: 'quantum' }),
        { wrapper: createWrapper() }
      );

      // Wait for retry
      await waitFor(() => expect(result.current.isSuccess).toBe(true), {
        timeout: 5000,
      });

      expect(mockGetSuggestions).toHaveBeenCalledTimes(2);
      expect(result.current.data).toEqual(mockSuggestionsResponse);
    });
  });

  describe('Caching', () => {
    it('should cache results and not refetch on rerender', async () => {
      mockGetSuggestions.mockResolvedValue(mockSuggestionsResponse);

      const { result, rerender } = renderHook(
        () => useSearchSuggestions({ query: 'quantum' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Rerender should not trigger new API call due to caching
      rerender();

      expect(mockGetSuggestions).toHaveBeenCalledTimes(1);
    });

    it('should use different cache keys for different queries', async () => {
      mockGetSuggestions.mockResolvedValue(mockSuggestionsResponse);

      const { result: result1 } = renderHook(
        () => useSearchSuggestions({ query: 'quantum' }),
        { wrapper: createWrapper() }
      );

      const { result: result2 } = renderHook(
        () => useSearchSuggestions({ query: 'machine learning' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result1.current.isSuccess).toBe(true));
      await waitFor(() => expect(result2.current.isSuccess).toBe(true));

      expect(mockGetSuggestions).toHaveBeenCalledTimes(2);
    });

    it('should use different cache keys for different limits', async () => {
      mockGetSuggestions.mockResolvedValue(mockSuggestionsResponse);

      const { result: result1 } = renderHook(
        () => useSearchSuggestions({ query: 'quantum', options: { limit: 5 } }),
        { wrapper: createWrapper() }
      );

      const { result: result2 } = renderHook(
        () => useSearchSuggestions({ query: 'quantum', options: { limit: 10 } }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result1.current.isSuccess).toBe(true));
      await waitFor(() => expect(result2.current.isSuccess).toBe(true));

      expect(mockGetSuggestions).toHaveBeenCalledTimes(2);
    });
  });

  describe('Convenience accessors', () => {
    it('should provide suggestions array accessor', async () => {
      mockGetSuggestions.mockResolvedValue(mockSuggestionsResponse);

      const { result } = renderHook(
        () => useSearchSuggestions({ query: 'quantum' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.suggestions).toEqual(mockSuggestionsResponse.suggestions);
      expect(result.current.suggestions[0].text).toBe('quantum computing');
    });

    it('should provide hasSuggestions boolean accessor', async () => {
      mockGetSuggestions.mockResolvedValue(mockSuggestionsResponse);

      const { result } = renderHook(
        () => useSearchSuggestions({ query: 'quantum' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.hasSuggestions).toBe(true);
    });

    it('should return empty suggestions before data loads', () => {
      mockGetSuggestions.mockResolvedValue(mockSuggestionsResponse);

      const { result } = renderHook(
        () => useSearchSuggestions({ query: 'quantum' }),
        { wrapper: createWrapper() }
      );

      // Before data loads
      expect(result.current.suggestions).toEqual([]);
      expect(result.current.hasSuggestions).toBe(false);
    });

    it('should return empty suggestions when query returns none', async () => {
      mockGetSuggestions.mockResolvedValue(emptySuggestionsResponse);

      const { result } = renderHook(
        () => useSearchSuggestions({ query: 'nonexistent' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.suggestions).toEqual([]);
      expect(result.current.hasSuggestions).toBe(false);
    });
  });

  describe('Loading states', () => {
    it('should show loading state while fetching', async () => {
      let resolvePromise: (value: SearchSuggestionsResponse) => void;
      const promise = new Promise<SearchSuggestionsResponse>((resolve) => {
        resolvePromise = resolve;
      });

      mockGetSuggestions.mockReturnValue(promise);

      const { result } = renderHook(
        () => useSearchSuggestions({ query: 'quantum' }),
        { wrapper: createWrapper() }
      );

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isFetching).toBe(true);

      // Resolve the promise
      resolvePromise!(mockSuggestionsResponse);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isFetching).toBe(false);
    });

    it('should show pending state for short queries', () => {
      const { result } = renderHook(
        () => useSearchSuggestions({ query: 'q' }),
        { wrapper: createWrapper() }
      );

      expect(result.current.isPending).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });
  });
});
