/**
 * useEvaluation Hook
 *
 * React Query hooks for managing model evaluation and metrics.
 * Handles fetching evaluation results, confusion matrices, ROC curves, and performance metrics.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ModelEvaluation,
  EvaluationRequest,
  EvaluationMetrics,
  ApiResponse,
} from '@/types/qnn.types';
import { qnnApiClient } from '@/services/QNNApiClient';

// Query keys for React Query cache management
export const evaluationKeys = {
  all: ['evaluations'] as const,
  lists: () => [...evaluationKeys.all, 'list'] as const,
  list: (modelId?: string) => [...evaluationKeys.lists(), modelId] as const,
  details: () => [...evaluationKeys.all, 'detail'] as const,
  detail: (modelId: string) => [...evaluationKeys.details(), modelId] as const,
  metrics: (modelId: string) => [...evaluationKeys.all, 'metrics', modelId] as const,
};

/**
 * Hook to fetch evaluation results for a specific model
 *
 * @param modelId - Model ID to get evaluation for
 * @param enabled - Whether to fetch automatically
 * @returns React Query result with evaluation data
 *
 * @example
 * ```tsx
 * const { data: evaluation } = useModelEvaluation('model-123');
 * ```
 */
export function useModelEvaluation(modelId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: evaluationKeys.detail(modelId),
    queryFn: async (): Promise<ModelEvaluation> => {
      return qnnApiClient.getModelEvaluation(modelId);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000,
    enabled: enabled && !!modelId,
  });
}

/**
 * Hook to fetch evaluation metrics only (lightweight)
 *
 * @param modelId - Model ID
 * @param enabled - Whether to fetch automatically
 * @returns React Query result with metrics
 *
 * @example
 * ```tsx
 * const { data: metrics } = useEvaluationMetrics('model-123');
 * ```
 */
export function useEvaluationMetrics(modelId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: evaluationKeys.metrics(modelId),
    queryFn: async (): Promise<EvaluationMetrics> => {
      return qnnApiClient.getEvaluationMetrics(modelId);
    },
    staleTime: 5 * 60 * 1000,
    enabled: enabled && !!modelId,
  });
}

/**
 * Hook to run evaluation on a model
 *
 * @returns Mutation object with evaluate function
 *
 * @example
 * ```tsx
 * const { mutate: evaluateModel, isPending } = useRunEvaluation();
 *
 * evaluateModel({
 *   modelId: 'model-123',
 *   datasetPath: '/data/test.csv',
 *   batchSize: 32,
 * }, {
 *   onSuccess: (result) => console.log('Evaluation complete:', result),
 * });
 * ```
 */
export function useRunEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: EvaluationRequest): Promise<ApiResponse<ModelEvaluation>> => {
      return qnnApiClient.evaluateModel(request);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch evaluation data
      queryClient.invalidateQueries({
        queryKey: evaluationKeys.detail(variables.modelId),
      });
      queryClient.invalidateQueries({
        queryKey: evaluationKeys.metrics(variables.modelId),
      });
    },
  });
}

/**
 * Hook to compare evaluations across multiple models
 *
 * @param modelIds - Array of model IDs to compare
 * @returns React Query result with comparison data
 *
 * @example
 * ```tsx
 * const { data: comparison } = useCompareEvaluations(['model-1', 'model-2']);
 * ```
 */
export function useCompareEvaluations(modelIds: string[]) {
  return useQuery({
    queryKey: [...evaluationKeys.all, 'compare', ...modelIds.sort()],
    queryFn: async (): Promise<ModelEvaluation[]> => {
      return qnnApiClient.compareEvaluations(modelIds);
    },
    staleTime: 5 * 60 * 1000,
    enabled: modelIds.length > 0,
  });
}

/**
 * Hook to export evaluation report
 *
 * @returns Mutation object with export function
 *
 * @example
 * ```tsx
 * const { mutate: exportReport } = useExportEvaluationReport();
 *
 * exportReport({
 *   modelId: 'model-123',
 *   format: 'pdf',
 * });
 * ```
 */
export function useExportEvaluationReport() {
  return useMutation({
    mutationFn: async ({
      modelId,
      format,
    }: {
      modelId: string;
      format: 'pdf' | 'json' | 'csv';
    }): Promise<Blob> => {
      return qnnApiClient.exportEvaluationReport(modelId, format);
    },
  });
}

/**
 * Utility hook to prefetch evaluation data
 *
 * @example
 * ```tsx
 * const prefetchEvaluation = usePrefetchEvaluation();
 *
 * <div onMouseEnter={() => prefetchEvaluation('model-123')}>
 *   Hover to prefetch
 * </div>
 * ```
 */
export function usePrefetchEvaluation() {
  const queryClient = useQueryClient();

  return (modelId: string) => {
    queryClient.prefetchQuery({
      queryKey: evaluationKeys.detail(modelId),
      queryFn: async (): Promise<ModelEvaluation> => {
        return qnnApiClient.getModelEvaluation(modelId);
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}
