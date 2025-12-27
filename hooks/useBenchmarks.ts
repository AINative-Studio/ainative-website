/**
 * useBenchmarks Hook
 *
 * React Query hooks for managing QNN benchmarking operations.
 * Handles benchmark execution and results fetching.
 */

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BenchmarkMetrics,
  BenchmarkRequest,
  BenchmarkResult,
  ApiResponse,
} from '@/types/qnn.types';

// Query keys for React Query cache management
export const benchmarkKeys = {
  all: ['benchmarks'] as const,
  lists: () => [...benchmarkKeys.all, 'list'] as const,
  list: () => [...benchmarkKeys.lists()] as const,
  details: () => [...benchmarkKeys.all, 'detail'] as const,
  detail: (id: string) => [...benchmarkKeys.details(), id] as const,
  byModel: (modelId: string) => [...benchmarkKeys.all, 'model', modelId] as const,
  results: (modelId: string) => [...benchmarkKeys.byModel(modelId), 'results'] as const,
};

/**
 * Hook to fetch all benchmark results
 *
 * @returns React Query result with benchmark results list
 *
 * @example
 * ```tsx
 * const { data: benchmarks, isLoading } = useBenchmarks();
 * ```
 */
export function useBenchmarks() {
  return useQuery({
    queryKey: benchmarkKeys.list(),
    queryFn: async (): Promise<BenchmarkResult[]> => {
      // TODO: Replace with actual API client from Agent 1
      // const apiClient = new QNNApiClient();
      // return apiClient.listBenchmarks();

      console.warn('useBenchmarks: Using placeholder data. Waiting for Agent 1 API client.');
      await new Promise(resolve => setTimeout(resolve, 500));

      return [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000,
  });
}

/**
 * Hook to fetch benchmarks for a specific model
 *
 * @param modelId - Model ID
 * @param enabled - Whether to fetch automatically
 * @returns React Query result with model's benchmarks
 *
 * @example
 * ```tsx
 * const { data: modelBenchmarks } = useBenchmarksByModel('model-456');
 * ```
 */
export function useBenchmarksByModel(modelId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: benchmarkKeys.byModel(modelId),
    queryFn: async (): Promise<BenchmarkResult[]> => {
      // TODO: Replace with actual API client from Agent 1
      // const apiClient = new QNNApiClient();
      // return apiClient.getBenchmarksByModel(modelId);

      console.warn('useBenchmarksByModel: Using placeholder. Waiting for Agent 1 API client.');
      await new Promise(resolve => setTimeout(resolve, 400));

      return [];
    },
    staleTime: 5 * 60 * 1000,
    enabled: enabled && !!modelId,
  });
}

/**
 * Hook to fetch a specific benchmark result
 *
 * @param id - Benchmark ID
 * @param enabled - Whether to fetch automatically
 * @returns React Query result with benchmark details
 *
 * @example
 * ```tsx
 * const { data: benchmark } = useBenchmark('benchmark-123');
 * ```
 */
export function useBenchmark(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: benchmarkKeys.detail(id),
    queryFn: async (): Promise<BenchmarkResult> => {
      // TODO: Replace with actual API client from Agent 1
      // const apiClient = new QNNApiClient();
      // return apiClient.getBenchmark(id);

      console.warn('useBenchmark: Using placeholder. Waiting for Agent 1 API client.');
      await new Promise(resolve => setTimeout(resolve, 300));

      throw new Error('Benchmark not found (placeholder implementation)');
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (benchmarks don't change often)
    enabled: enabled && !!id,
  });
}

/**
 * Hook to fetch benchmark metrics for a model
 *
 * @param modelId - Model ID
 * @param enabled - Whether to fetch automatically
 * @returns React Query result with benchmark metrics
 *
 * @example
 * ```tsx
 * const { data: metrics } = useBenchmarkMetrics('model-456');
 * ```
 */
export function useBenchmarkMetrics(modelId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: benchmarkKeys.results(modelId),
    queryFn: async (): Promise<BenchmarkMetrics | null> => {
      // TODO: Replace with actual API client from Agent 1
      // const apiClient = new QNNApiClient();
      // return apiClient.getBenchmarkMetrics(modelId);

      console.warn('useBenchmarkMetrics: Using placeholder. Waiting for Agent 1 API client.');
      await new Promise(resolve => setTimeout(resolve, 400));

      return null;
    },
    staleTime: 10 * 60 * 1000,
    enabled: enabled && !!modelId,
  });
}

/**
 * Hook to run a benchmark
 *
 * @returns Mutation object with runBenchmark function
 *
 * @example
 * ```tsx
 * const { mutate: runBenchmark, isPending } = useRunBenchmark();
 *
 * runBenchmark({
 *   modelId: 'model-456',
 *   dataset: 'mnist',
 *   batchSize: 64,
 *   iterations: 100,
 * }, {
 *   onSuccess: (result) => {
 *     console.log('Benchmark started:', result.id);
 *   },
 * });
 * ```
 */
export function useRunBenchmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: BenchmarkRequest): Promise<ApiResponse<BenchmarkResult>> => {
      // TODO: Replace with actual API client from Agent 1
      // const apiClient = new QNNApiClient();
      // return apiClient.runBenchmark(request);

      console.warn('useRunBenchmark: Using placeholder. Waiting for Agent 1 API client.');
      await new Promise(resolve => setTimeout(resolve, 1000));

      throw new Error('Run benchmark not implemented (placeholder)');
    },
    onMutate: async (request) => {
      // Create optimistic benchmark result
      const tempId = `temp-benchmark-${Date.now()}`;
      const optimisticResult: BenchmarkResult = {
        id: tempId,
        modelId: request.modelId,
        status: 'running',
        createdAt: new Date().toISOString(),
      };

      // Add to cache optimistically
      queryClient.setQueryData(benchmarkKeys.byModel(request.modelId), (old: any) => {
        if (!old) return [optimisticResult];
        return [optimisticResult, ...old];
      });

      return { optimisticResult };
    },
    onSuccess: (response, variables) => {
      const result = response.data;

      // Invalidate benchmark queries
      queryClient.invalidateQueries({ queryKey: benchmarkKeys.byModel(variables.modelId) });
      queryClient.invalidateQueries({ queryKey: benchmarkKeys.list() });

      // If benchmark completes quickly, also invalidate metrics
      if (result.status === 'completed') {
        queryClient.invalidateQueries({ queryKey: benchmarkKeys.results(variables.modelId) });
      }
    },
    onError: (err, variables) => {
      // Remove optimistic update on error
      queryClient.invalidateQueries({ queryKey: benchmarkKeys.byModel(variables.modelId) });
    },
  });
}

/**
 * Hook to poll benchmark status until completion
 *
 * Automatically polls every 3 seconds while benchmark is running.
 *
 * @param id - Benchmark ID
 * @param enabled - Whether to fetch automatically
 * @returns React Query result with benchmark status
 *
 * @example
 * ```tsx
 * const { data: benchmark } = useBenchmarkStatus('benchmark-123');
 * // Polls until status is 'completed' or 'failed'
 * ```
 */
export function useBenchmarkStatus(id: string, enabled: boolean = true) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: benchmarkKeys.detail(id),
    queryFn: async (): Promise<BenchmarkResult> => {
      // TODO: Replace with actual API client from Agent 1
      // const apiClient = new QNNApiClient();
      // return apiClient.getBenchmarkStatus(id);

      console.warn('useBenchmarkStatus: Using placeholder. Waiting for Agent 1 API client.');
      await new Promise(resolve => setTimeout(resolve, 300));

      throw new Error('Benchmark not found (placeholder implementation)');
    },
    staleTime: 0, // Always fetch fresh data
    refetchInterval: (query) => {
      const data = query.state.data as BenchmarkResult | undefined;
      // Poll every 3 seconds if benchmark is running
      return data?.status === 'running' ? 3000 : false;
    },
    refetchIntervalInBackground: false,
    enabled: enabled && !!id,
  });

  // When benchmark completes, invalidate metrics
  useEffect(() => {
    if (query.data?.status === 'completed' && query.data?.metrics) {
      queryClient.invalidateQueries({
        queryKey: benchmarkKeys.results(query.data.modelId),
      });
    }
  }, [query.data, queryClient]);

  return query;
}

/**
 * Hook to compare multiple model benchmarks
 *
 * Fetches benchmarks for multiple models for comparison.
 *
 * @param modelIds - Array of model IDs to compare
 * @returns React Query result with comparison data
 *
 * @example
 * ```tsx
 * const { data: comparison } = useCompareBenchmarks(['model-1', 'model-2']);
 * ```
 */
export function useCompareBenchmarks(modelIds: string[]) {
  return useQuery({
    queryKey: [...benchmarkKeys.all, 'compare', ...modelIds.sort()],
    queryFn: async (): Promise<Record<string, BenchmarkMetrics | null>> => {
      // TODO: Replace with actual API client from Agent 1
      // const apiClient = new QNNApiClient();
      // const results = await Promise.all(
      //   modelIds.map(id => apiClient.getBenchmarkMetrics(id))
      // );
      // return Object.fromEntries(
      //   modelIds.map((id, index) => [id, results[index]])
      // );

      console.warn('useCompareBenchmarks: Using placeholder. Waiting for Agent 1 API client.');
      await new Promise(resolve => setTimeout(resolve, 600));

      return Object.fromEntries(modelIds.map(id => [id, null]));
    },
    staleTime: 10 * 60 * 1000,
    enabled: modelIds.length > 0,
  });
}

/**
 * Utility hook to prefetch benchmark results
 *
 * @example
 * ```tsx
 * const prefetchBenchmark = usePrefetchBenchmark();
 *
 * <div onMouseEnter={() => prefetchBenchmark('benchmark-123')}>
 *   Hover to prefetch
 * </div>
 * ```
 */
export function usePrefetchBenchmark() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: benchmarkKeys.detail(id),
      queryFn: async (): Promise<BenchmarkResult> => {
        // TODO: Replace with actual API client
        console.warn('Prefetch: Waiting for Agent 1 API client.');
        throw new Error('Prefetch not implemented');
      },
      staleTime: 10 * 60 * 1000,
    });
  };
}
