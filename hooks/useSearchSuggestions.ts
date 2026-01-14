/**
 * useSearchSuggestions Hook
 * React Query hook for fetching search suggestions with debouncing
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
 *   const { data, isLoading, error } = useSearchSuggestions({
 *     query: debouncedQuery,
 *     options: { limit: 5, minQueryLength: 2 },
 *     useMockData: false, // Set to true for development
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

import { useQuery } from '@tanstack/react-query';
import { semanticSearchService } from '@/services/SemanticSearchService';
import type { SearchSuggestionsOptions } from '@/types/search';

interface UseSearchSuggestionsParams {
  query: string;
  options?: SearchSuggestionsOptions;
  useMockData?: boolean; // Flag to use mock data during development
}

/**
 * Hook for fetching search suggestions
 * @param query - Search query string
 * @param options - Optional configuration
 * @param useMockData - Whether to use mock data (for development)
 * @returns React Query result with suggestions
 */
export function useSearchSuggestions({
  query,
  options = {},
  useMockData = false,
}: UseSearchSuggestionsParams) {
  const { limit = 5, minQueryLength = 2 } = options;

  return useQuery({
    queryKey: ['search', 'suggestions', query, limit],
    queryFn: async () => {
      if (useMockData) {
        return semanticSearchService.getMockSuggestions(query, limit);
      }
      return semanticSearchService.getSuggestions(query, { limit, minQueryLength });
    },
    enabled: query.length >= minQueryLength,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 1, // Only retry once on failure
    retryDelay: 1000, // Wait 1 second before retry
  });
}
