/**
 * useSearchSuggestions Hook
 * React Query hook for fetching search suggestions from ZeroDB with debouncing support
 *
 * This hook provides a convenient way to fetch semantically similar search suggestions
 * using the ZeroDB vector search API. It includes built-in caching, error handling,
 * and loading state management.
 *
 * @example
 * ```tsx
 * import { useState } from 'react';
 * import { useDebounce } from '@/hooks/useDebounce';
 * import { useSearchSuggestions } from '@/hooks/useSearchSuggestions';
 *
 * function SearchBar() {
 *   const [query, setQuery] = useState('');
 *   const debouncedQuery = useDebounce(query, 300);
 *
 *   const { data, isLoading, isError, error } = useSearchSuggestions({
 *     query: debouncedQuery,
 *     options: { limit: 5, minQueryLength: 2 },
 *   });
 *
 *   return (
 *     <div>
 *       <input
 *         type="text"
 *         value={query}
 *         onChange={(e) => setQuery(e.target.value)}
 *         placeholder="Search..."
 *       />
 *       {isLoading && <div>Loading...</div>}
 *       {isError && <div>Failed to load suggestions</div>}
 *       {data && data.suggestions.length > 0 && (
 *         <ul>
 *           {data.suggestions.map((suggestion, idx) => (
 *             <li key={idx}>{suggestion.text}</li>
 *           ))}
 *         </ul>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { semanticSearchService } from '@/services/SemanticSearchService';
import type { SearchSuggestionsOptions, SearchSuggestionsResponse } from '@/types/search';

export interface UseSearchSuggestionsParams {
  /** The search query string */
  query: string;
  /** Optional configuration for the search */
  options?: SearchSuggestionsOptions;
  /** Whether to enable the query (useful for conditional fetching) */
  enabled?: boolean;
}

export interface UseSearchSuggestionsResult extends UseQueryResult<SearchSuggestionsResponse, Error> {
  /** Convenience accessor for suggestions array */
  suggestions: SearchSuggestionsResponse['suggestions'];
  /** Whether there are any suggestions */
  hasSuggestions: boolean;
}

/**
 * Hook for fetching semantic search suggestions from ZeroDB
 *
 * @param params - Hook parameters including query and options
 * @returns React Query result with suggestions and convenience accessors
 */
export function useSearchSuggestions({
  query,
  options = {},
  enabled = true,
}: UseSearchSuggestionsParams): UseSearchSuggestionsResult {
  const { limit = 5, minQueryLength = 2 } = options;
  const trimmedQuery = query?.trim() || '';
  const isQueryValid = trimmedQuery.length >= minQueryLength;

  const queryResult = useQuery({
    queryKey: ['search', 'suggestions', trimmedQuery, limit],
    queryFn: async () => {
      return semanticSearchService.getSuggestions(trimmedQuery, { limit, minQueryLength });
    },
    enabled: enabled && isQueryValid,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 1, // Only retry once on failure
    retryDelay: 1000, // Wait 1 second before retry
    refetchOnWindowFocus: false, // Don't refetch on window focus for search suggestions
  });

  // Add convenience accessors
  const suggestions = queryResult.data?.suggestions || [];
  const hasSuggestions = suggestions.length > 0;

  return {
    ...queryResult,
    suggestions,
    hasSuggestions,
  };
}
