/**
 * useQNN Hook
 *
 * Main convenience hook that combines all QNN functionality.
 * Provides a unified interface for accessing QNN state and operations.
 */

import { useQNNContext } from '@/contexts/QNNContext';
import {
  useRepositories,
  useRepository,
  useRepositoryAnalysis,
  useAnalyzeRepository,
  useSearchRepositories,
  usePrefetchRepository,
} from './useRepositories';
import {
  useModels,
  useModelsByRepository,
  useModel,
  useCreateModel,
  useUpdateModel,
  useDeleteModel,
  usePrefetchModel,
} from './useModels';
import {
  useTrainingHistory,
  useTrainingByModel,
  useTrainingStatus,
  useTrainingLogs,
  useStartTraining,
  useStopTraining,
  useActiveTraining,
  useIsTraining,
} from './useTraining';
import {
  useBenchmarks,
  useBenchmarksByModel,
  useBenchmark,
  useBenchmarkMetrics,
  useRunBenchmark,
  useBenchmarkStatus,
  useCompareBenchmarks,
  usePrefetchBenchmark,
} from './useBenchmarks';
import {
  useModelEvaluation,
  useEvaluationMetrics,
  useRunEvaluation,
  useCompareEvaluations,
  useExportEvaluationReport,
  usePrefetchEvaluation,
} from './useEvaluation';
import {
  Repository,
  Model,
  TrainingJob,
  RepositorySearchParams,
  CreateModelRequest,
  UpdateModelRequest,
  StartTrainingRequest,
  BenchmarkRequest,
  ModelFilters,
  EvaluationRequest,
} from '@/types/qnn.types';

/**
 * Main QNN Hook Interface
 *
 * Combines all QNN functionality into a single, easy-to-use hook.
 * This is the primary hook you should use in your components.
 *
 * @example
 * ```tsx
 * function QNNDashboard() {
 *   const qnn = useQNN();
 *
 *   const { data: repositories } = qnn.repositories.list();
 *   const { mutate: createModel } = qnn.models.create();
 *   const { data: activeTraining } = qnn.training.active();
 *
 *   return (
 *     <div>
 *       <RepositorySelector
 *         repositories={repositories}
 *         selected={qnn.state.selectedRepository}
 *         onSelect={qnn.state.setSelectedRepository}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export function useQNN() {
  // Get global QNN context state
  const context = useQNNContext();

  return {
    // ==================== Global State ====================
    state: {
      selectedRepository: context.selectedRepository,
      setSelectedRepository: context.setSelectedRepository,
      selectedRepositories: context.selectedRepositories,
      setSelectedRepositories: context.setSelectedRepositories,
      toggleRepositorySelection: context.toggleRepositorySelection,
      clearRepositorySelection: context.clearRepositorySelection,
      isRepositorySelected: context.isRepositorySelected,
      savedRepositories: context.savedRepositories,
      setSavedRepositories: context.setSavedRepositories,
      selectedModel: context.selectedModel,
      setSelectedModel: context.setSelectedModel,
      activeTraining: context.activeTraining,
      setActiveTraining: context.setActiveTraining,
      isPollingEnabled: context.isPollingEnabled,
      setIsPollingEnabled: context.setIsPollingEnabled,
      viewMode: context.viewMode,
      setViewMode: context.setViewMode,
    },

    // ==================== Repositories ====================
    repositories: {
      /**
       * List all repositories
       * @param params - Optional search/filter parameters
       */
      list: (params?: RepositorySearchParams) => useRepositories(params),

      /**
       * Get a specific repository by ID
       * @param id - Repository ID
       * @param enabled - Whether to auto-fetch
       */
      get: (id: string, enabled?: boolean) => useRepository(id, enabled),

      /**
       * Get repository analysis
       * @param id - Repository ID
       * @param enabled - Whether to auto-fetch
       */
      analysis: (id: string, enabled?: boolean) => useRepositoryAnalysis(id, enabled),

      /**
       * Trigger repository analysis (mutation)
       */
      analyze: () => useAnalyzeRepository(),

      /**
       * Search repositories
       * @param query - Search query
       * @param options - Additional search options
       */
      search: (query: string, options?: Omit<RepositorySearchParams, 'query'>) =>
        useSearchRepositories(query, options),

      /**
       * Prefetch a repository for optimistic loading
       */
      prefetch: () => usePrefetchRepository(),
    },

    // ==================== Models ====================
    models: {
      /**
       * List all models
       * @param filters - Optional filters
       */
      list: (filters?: ModelFilters) => useModels(filters),

      /**
       * Get models for a specific repository
       * @param repositoryId - Repository ID
       * @param enabled - Whether to auto-fetch
       */
      byRepository: (repositoryId: string, enabled?: boolean) =>
        useModelsByRepository(repositoryId, enabled),

      /**
       * Get a specific model by ID
       * @param id - Model ID
       * @param enabled - Whether to auto-fetch
       */
      get: (id: string, enabled?: boolean) => useModel(id, enabled),

      /**
       * Create a new model (mutation)
       */
      create: () => useCreateModel(),

      /**
       * Update an existing model (mutation)
       */
      update: () => useUpdateModel(),

      /**
       * Delete a model (mutation)
       */
      delete: () => useDeleteModel(),

      /**
       * Prefetch a model for optimistic loading
       */
      prefetch: () => usePrefetchModel(),
    },

    // ==================== Training ====================
    training: {
      /**
       * Get training history (all jobs)
       */
      history: () => useTrainingHistory(),

      /**
       * Get training jobs for a specific model
       * @param modelId - Model ID
       * @param enabled - Whether to auto-fetch
       */
      byModel: (modelId: string, enabled?: boolean) => useTrainingByModel(modelId, enabled),

      /**
       * Get training status with real-time polling
       * @param id - Training job ID
       * @param enabled - Whether to auto-fetch
       */
      status: (id: string, enabled?: boolean) => useTrainingStatus(id, enabled),

      /**
       * Get training logs with real-time updates
       * @param id - Training job ID
       * @param enabled - Whether to auto-fetch
       */
      logs: (id: string, enabled?: boolean) => useTrainingLogs(id, enabled),

      /**
       * Start a new training job (mutation)
       */
      start: () => useStartTraining(),

      /**
       * Stop a training job (mutation)
       */
      stop: () => useStopTraining(),

      /**
       * Get the currently active training from context
       */
      active: () => useActiveTraining(),

      /**
       * Check if any training is currently running
       */
      isActive: () => useIsTraining(),
    },

    // ==================== Benchmarks ====================
    benchmarks: {
      /**
       * List all benchmark results
       */
      list: () => useBenchmarks(),

      /**
       * Get benchmarks for a specific model
       * @param modelId - Model ID
       * @param enabled - Whether to auto-fetch
       */
      byModel: (modelId: string, enabled?: boolean) => useBenchmarksByModel(modelId, enabled),

      /**
       * Get a specific benchmark result
       * @param id - Benchmark ID
       * @param enabled - Whether to auto-fetch
       */
      get: (id: string, enabled?: boolean) => useBenchmark(id, enabled),

      /**
       * Get benchmark metrics for a model
       * @param modelId - Model ID
       * @param enabled - Whether to auto-fetch
       */
      metrics: (modelId: string, enabled?: boolean) => useBenchmarkMetrics(modelId, enabled),

      /**
       * Run a benchmark (mutation)
       */
      run: () => useRunBenchmark(),

      /**
       * Poll benchmark status until completion
       * @param id - Benchmark ID
       * @param enabled - Whether to auto-fetch
       */
      status: (id: string, enabled?: boolean) => useBenchmarkStatus(id, enabled),

      /**
       * Compare benchmarks across multiple models
       * @param modelIds - Array of model IDs to compare
       */
      compare: (modelIds: string[]) => useCompareBenchmarks(modelIds),

      /**
       * Prefetch a benchmark for optimistic loading
       */
      prefetch: () => usePrefetchBenchmark(),
    },

    // ==================== Evaluation ====================
    evaluation: {
      /**
       * Get evaluation results for a specific model
       * @param modelId - Model ID
       * @param enabled - Whether to auto-fetch
       */
      get: (modelId: string, enabled?: boolean) => useModelEvaluation(modelId, enabled),

      /**
       * Get evaluation metrics only (lightweight)
       * @param modelId - Model ID
       * @param enabled - Whether to auto-fetch
       */
      metrics: (modelId: string, enabled?: boolean) => useEvaluationMetrics(modelId, enabled),

      /**
       * Run evaluation on a model (mutation)
       */
      run: () => useRunEvaluation(),

      /**
       * Compare evaluations across multiple models
       * @param modelIds - Array of model IDs to compare
       */
      compare: (modelIds: string[]) => useCompareEvaluations(modelIds),

      /**
       * Export evaluation report (mutation)
       */
      export: () => useExportEvaluationReport(),

      /**
       * Prefetch evaluation data for optimistic loading
       */
      prefetch: () => usePrefetchEvaluation(),
    },
  };
}

/**
 * Type-safe wrapper for common QNN operations
 *
 * Provides strongly-typed helper functions for the most common operations.
 */
export const qnnOperations = {
  /**
   * Create a model for the selected repository
   */
  createModelForSelectedRepo: (
    selectedRepository: Repository | null,
    modelData: Omit<CreateModelRequest, 'repositoryId'>
  ): CreateModelRequest | null => {
    if (!selectedRepository) return null;

    return {
      ...modelData,
      repositoryId: selectedRepository.id,
    };
  },

  /**
   * Start training for the selected model
   */
  startTrainingForSelectedModel: (
    selectedModel: Model | null,
    config: StartTrainingRequest['config']
  ): StartTrainingRequest | null => {
    if (!selectedModel) return null;

    return {
      modelId: selectedModel.id,
      config,
    };
  },

  /**
   * Run benchmark for the selected model
   */
  runBenchmarkForSelectedModel: (
    selectedModel: Model | null,
    dataset: string,
    options?: Partial<BenchmarkRequest>
  ): BenchmarkRequest | null => {
    if (!selectedModel) return null;

    return {
      modelId: selectedModel.id,
      dataset,
      ...options,
    };
  },
};

/**
 * Export all individual hooks for direct usage
 */
export * from './useRepositories';
export * from './useModels';
export * from './useTraining';
export * from './useBenchmarks';
export * from './useEvaluation';
export { useQNNContext, useIsTrainingActive, useClearQNNState } from '@/contexts/QNNContext';
