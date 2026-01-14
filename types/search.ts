/**
 * Search-related TypeScript types
 */

export interface SearchSuggestion {
  text: string;
  relevance_score: number;
  category: string;
  result_count: number;
}

export interface SearchSuggestionsResponse {
  suggestions: SearchSuggestion[];
  query: string;
  total_suggestions: number;
}

export interface SearchSuggestionsOptions {
  limit?: number;
  minQueryLength?: number;
  debounceMs?: number;
}
