/**
 * useRepositories Hook
 *
 * React Query hook for managing GitHub repositories in the QNN dashboard.
 * Handles fetching, searching, and analyzing repositories.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Repository,
  RepositorySearchParams,
  RepositoryAnalysis,
  PaginatedResponse,
  ApiResponse,
} from '@/types/qnn.types';
import { qnnApiClient } from '@/services/QNNApiClient';

// Query keys for React Query cache management
export const repositoryKeys = {
  all: ['repositories'] as const,
  lists: () => [...repositoryKeys.all, 'list'] as const,
  list: (params?: RepositorySearchParams) => [...repositoryKeys.lists(), params] as const,
  details: () => [...repositoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...repositoryKeys.details(), id] as const,
  analysis: (id: string) => [...repositoryKeys.detail(id), 'analysis'] as const,
};

/**
 * Hook to fetch list of repositories
 *
 * @param searchParams - Optional search and filter parameters
 * @returns React Query result with repositories list
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useRepositories({ query: 'quantum' });
 * ```
 */
export function useRepositories(searchParams?: RepositorySearchParams) {
  return useQuery({
    queryKey: repositoryKeys.list(searchParams),
    queryFn: async (): Promise<PaginatedResponse<Repository>> => {
      return qnnApiClient.listRepositories(searchParams);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    enabled: true, // Always enabled, can be overridden
  });
}

/**
 * Hook to fetch a single repository by ID
 *
 * @param id - Repository ID
 * @param enabled - Whether to fetch automatically (default: true)
 * @returns React Query result with repository details
 *
 * @example
 * ```tsx
 * const { data: repository } = useRepository('repo-123');
 * ```
 */
export function useRepository(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: repositoryKeys.detail(id),
    queryFn: async (): Promise<Repository> => {
      return qnnApiClient.getRepository(id);
    },
    staleTime: 5 * 60 * 1000,
    enabled: enabled && !!id,
  });
}

/**
 * Hook to fetch repository analysis
 *
 * @param id - Repository ID
 * @param enabled - Whether to fetch automatically (default: true)
 * @returns React Query result with analysis data
 *
 * @example
 * ```tsx
 * const { data: analysis, refetch } = useRepositoryAnalysis('repo-123');
 * // Trigger re-analysis
 * refetch();
 * ```
 */
export function useRepositoryAnalysis(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: repositoryKeys.analysis(id),
    queryFn: async (): Promise<RepositoryAnalysis> => {
      return qnnApiClient.getRepositoryAnalysis(id);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (analysis doesn't change often)
    enabled: enabled && !!id,
  });
}

/**
 * Hook to analyze a repository (mutation)
 *
 * @returns Mutation object with analyze function
 *
 * @example
 * ```tsx
 * const { mutate: analyze, isPending } = useAnalyzeRepository();
 *
 * analyze('repo-123', {
 *   onSuccess: () => console.log('Analysis started!'),
 * });
 * ```
 */
export function useAnalyzeRepository() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (repositoryId: string): Promise<ApiResponse<RepositoryAnalysis>> => {
      return qnnApiClient.analyzeRepository(repositoryId);
    },
    onSuccess: (data, repositoryId) => {
      // Invalidate and refetch analysis
      queryClient.invalidateQueries({
        queryKey: repositoryKeys.analysis(repositoryId),
      });

      // Also update the repository detail (analysis status might change)
      queryClient.invalidateQueries({
        queryKey: repositoryKeys.detail(repositoryId),
      });
    },
  });
}

/**
 * Hook to search repositories with debouncing
 *
 * @param query - Search query string
 * @param options - Additional search options
 * @returns React Query result with search results
 *
 * @example
 * ```tsx
 * const [searchQuery, setSearchQuery] = useState('');
 * const { data } = useSearchRepositories(searchQuery, { language: 'Python' });
 * ```
 */
export function useSearchRepositories(
  query: string,
  options?: Omit<RepositorySearchParams, 'query'>
) {
  const searchParams: RepositorySearchParams = {
    query,
    ...options,
  };

  return useQuery({
    queryKey: repositoryKeys.list(searchParams),
    queryFn: async (): Promise<PaginatedResponse<Repository>> => {
      return qnnApiClient.searchRepositories(searchParams);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    enabled: query.length >= 2, // Only search if query has at least 2 characters
  });
}

/**
 * Utility hook to prefetch a repository
 * Useful for optimistic loading on hover
 *
 * @example
 * ```tsx
 * const prefetchRepo = usePrefetchRepository();
 *
 * <div onMouseEnter={() => prefetchRepo('repo-123')}>
 *   Hover me
 * </div>
 * ```
 */
export function usePrefetchRepository() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: repositoryKeys.detail(id),
      queryFn: async (): Promise<Repository> => {
        return qnnApiClient.getRepository(id);
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}
