/**
 * useBenchmarks Hook
 *
 * React Query hooks for managing QNN benchmarking operations.
 * Handles benchmark execution and results fetching.
 */

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qnnApiClient } from '@/services/QNNApiClient';
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
 * @param modelId - Optional model ID to filter benchmarks
 * @returns React Query result with benchmark results list
 *
 * @example
 * ```tsx
 * const { data: benchmarks, isLoading } = useBenchmarks();
 * // Or filter by model
 * const { data: modelBenchmarks } = useBenchmarks('model-456');
 * ```
 */
export function useBenchmarks(modelId?: string) {
  return useQuery({
    queryKey: modelId ? benchmarkKeys.byModel(modelId) : benchmarkKeys.list(),
    queryFn: async (): Promise<BenchmarkMetrics[]> => {
      return qnnApiClient.getBenchmarkMetrics(modelId);
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
    queryFn: async (): Promise<BenchmarkMetrics[]> => {
      return qnnApiClient.getBenchmarkMetrics(modelId);
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
      return qnnApiClient.getBenchmarkResult(id);
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
    queryFn: async (): Promise<BenchmarkMetrics[]> => {
      return qnnApiClient.getBenchmarkMetrics(modelId);
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
    mutationFn: async (request: BenchmarkRequest): Promise<BenchmarkResult> => {
      return qnnApiClient.runBenchmark(request);
    },
    onMutate: async (request) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: benchmarkKeys.byModel(request.modelId) });

      // Snapshot the previous value
      const previousBenchmarks = queryClient.getQueryData(benchmarkKeys.byModel(request.modelId));

      // Create optimistic benchmark result
      const tempId = `temp-benchmark-${Date.now()}`;
      const optimisticResult: BenchmarkResult = {
        id: tempId,
        modelId: request.modelId,
        status: 'running',
        createdAt: new Date().toISOString(),
      };

      // Optimistically update cache
      queryClient.setQueryData(benchmarkKeys.byModel(request.modelId), (old: any) => {
        if (!old) return [optimisticResult];
        return [optimisticResult, ...old];
      });

      return { previousBenchmarks, optimisticResult };
    },
    onSuccess: (result, variables) => {
      // Invalidate and refetch benchmark queries
      queryClient.invalidateQueries({ queryKey: benchmarkKeys.byModel(variables.modelId) });
      queryClient.invalidateQueries({ queryKey: benchmarkKeys.list() });

      // If benchmark completes quickly, also invalidate metrics
      if (result.status === 'completed') {
        queryClient.invalidateQueries({ queryKey: benchmarkKeys.results(variables.modelId) });
      }
    },
    onError: (err, variables, context) => {
      // Rollback to previous value on error
      if (context?.previousBenchmarks) {
        queryClient.setQueryData(benchmarkKeys.byModel(variables.modelId), context.previousBenchmarks);
      }
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
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
      return qnnApiClient.getBenchmarkResult(id);
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
    queryFn: async (): Promise<Record<string, BenchmarkMetrics[]>> => {
      // Fetch benchmarks for all models in parallel
      const results = await Promise.all(
        modelIds.map(id => qnnApiClient.getBenchmarkMetrics(id).catch(() => []))
      );

      // Create a map of modelId to benchmark metrics
      return Object.fromEntries(
        modelIds.map((id, index) => [id, results[index]])
      );
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
        return qnnApiClient.getBenchmarkResult(id);
      },
      staleTime: 10 * 60 * 1000,
    });
  };
}
