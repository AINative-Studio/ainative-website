/**
 * useSearchSuggestions Hook
 * React Query hook for fetching search suggestions from ZeroDB with debouncing
 * Refs #434
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
 *       {error && <div>Search unavailable</div>}
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
import { semanticSearchService, SemanticSearchError } from '@/services/SemanticSearchService';
import type { SearchSuggestionsOptions, SearchSuggestionsResponse } from '@/types/search';

interface UseSearchSuggestionsParams {
    query: string;
    options?: SearchSuggestionsOptions;
    /** Enable or disable the query (default: true when query meets minimum length) */
    enabled?: boolean;
}

/**
 * Hook for fetching search suggestions from ZeroDB
 * @param query - Search query string
 * @param options - Optional configuration including limit and minQueryLength
 * @param enabled - Override for query enabled state
 * @returns React Query result with suggestions
 */
export function useSearchSuggestions({
    query,
    options = {},
    enabled,
}: UseSearchSuggestionsParams) {
    const { limit = 5, minQueryLength = 2 } = options;
    const queryEnabled = enabled ?? query.length >= minQueryLength;

    return useQuery<SearchSuggestionsResponse, SemanticSearchError>({
        queryKey: ['search', 'suggestions', query, limit],
        queryFn: async () => {
            return semanticSearchService.getSuggestions(query, { limit, minQueryLength });
        },
        enabled: queryEnabled,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: false, // Service already has built-in retry logic
    });
}
