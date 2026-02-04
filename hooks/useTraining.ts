/**
 * useTraining Hook
 *
 * React Query hooks for managing QNN training jobs.
 * Includes real-time polling for active training status.
 */

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useQNNContext } from '@/contexts/QNNContext';
import { QNNApiClient } from '@/services/qnnApiClient';
import {
  TrainingJob,
  StartTrainingRequest,
  TrainingLogs,
  TrainingStatus,
} from '@/types/qnn.types';

// Query keys for React Query cache management
export const trainingKeys = {
  all: ['training'] as const,
  lists: () => [...trainingKeys.all, 'list'] as const,
  list: () => [...trainingKeys.lists()] as const,
  details: () => [...trainingKeys.all, 'detail'] as const,
  detail: (id: string) => [...trainingKeys.details(), id] as const,
  status: (id: string) => [...trainingKeys.detail(id), 'status'] as const,
  logs: (id: string) => [...trainingKeys.detail(id), 'logs'] as const,
  history: () => [...trainingKeys.all, 'history'] as const,
  byModel: (modelId: string) => [...trainingKeys.all, 'model', modelId] as const,
};

/**
 * Helper to determine if training status is active
 */
const isActiveStatus = (status: TrainingStatus): boolean => {
  return ['queued', 'initializing', 'training', 'validating'].includes(status);
};

/**
 * Hook to fetch training history
 *
 * @returns React Query result with training history
 *
 * @example
 * ```tsx
 * const { data: history } = useTrainingHistory();
 * ```
 */
export function useTrainingHistory() {
  return useQuery({
    queryKey: trainingKeys.history(),
    queryFn: async (): Promise<TrainingJob[]> => {
      const apiClient = new QNNApiClient();
      const response = await apiClient.getTrainingHistory();
      return response.items;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to fetch training jobs for a specific model
 *
 * @param modelId - Model ID
 * @param enabled - Whether to fetch automatically
 * @returns React Query result with model's training jobs
 *
 * @example
 * ```tsx
 * const { data: trainings } = useTrainingByModel('model-456');
 * ```
 */
export function useTrainingByModel(modelId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: trainingKeys.byModel(modelId),
    queryFn: async (): Promise<TrainingJob[]> => {
      const apiClient = new QNNApiClient();
      const response = await apiClient.getTrainingHistory(modelId);
      return response.items;
    },
    staleTime: 2 * 60 * 1000,
    enabled: enabled && !!modelId,
  });
}

/**
 * Hook to fetch training status with real-time polling
 *
 * Automatically polls every 5 seconds when training is active.
 * Stops polling when training completes, fails, or is stopped.
 *
 * @param id - Training job ID
 * @param enabled - Whether to fetch automatically
 * @returns React Query result with training status
 *
 * @example
 * ```tsx
 * const { data: training, isLoading } = useTrainingStatus('training-789');
 * // Automatically polls every 5 seconds if training is active
 * ```
 */
export function useTrainingStatus(id: string, enabled: boolean = true) {
  const { setActiveTraining } = useQNNContext();

  const query = useQuery({
    queryKey: trainingKeys.status(id),
    queryFn: async (): Promise<TrainingJob> => {
      const apiClient = new QNNApiClient();
      return await apiClient.getTrainingJob(id);
    },
    staleTime: 0, // Always fetch fresh data
    refetchInterval: (query) => {
      const data = query.state.data as TrainingJob | undefined;
      // Poll every 5 seconds if training is active
      return data && isActiveStatus(data.status) ? 5000 : false;
    },
    refetchIntervalInBackground: false, // Don't poll when tab is not visible
    enabled: enabled && !!id,
  });

  // Update context when training status changes
  useEffect(() => {
    if (query.data) {
      if (isActiveStatus(query.data.status)) {
        setActiveTraining(query.data);
      } else if (query.data.status === 'completed' || query.data.status === 'failed' || query.data.status === 'stopped') {
        // Training finished - clear active training after a brief delay
        setTimeout(() => setActiveTraining(null), 2000);
      }
    }
  }, [query.data, setActiveTraining]);

  return query;
}

/**
 * Hook to fetch training logs with real-time updates
 *
 * Polls every 3 seconds when training is active.
 *
 * @param id - Training job ID
 * @param enabled - Whether to fetch automatically
 * @returns React Query result with training logs
 *
 * @example
 * ```tsx
 * const { data: logs} = useTrainingLogs('training-789');
 * ```
 */
export function useTrainingLogs(id: string, enabled: boolean = true) {
  const { activeTraining } = useQNNContext();

  return useQuery({
    queryKey: trainingKeys.logs(id),
    queryFn: async (): Promise<TrainingLogs> => {
      const apiClient = new QNNApiClient();
      return await apiClient.getTrainingLogs(id);
    },
    staleTime: 0,
    refetchInterval: () => {
      // Poll every 3 seconds if this training is active
      const isActive = activeTraining?.id === id && isActiveStatus(activeTraining.status as TrainingStatus);
      return isActive ? 3000 : false;
    },
    refetchIntervalInBackground: false,
    enabled: enabled && !!id,
  });
}

/**
 * Hook to start a training job
 *
 * @returns Mutation object with start function
 *
 * @example
 * ```tsx
 * const { mutate: startTraining, isPending } = useStartTraining();
 *
 * startTraining({
 *   modelId: 'model-456',
 *   config: {
 *     epochs: 100,
 *     batchSize: 32,
 *     learningRate: 0.001,
 *     optimizer: 'adam',
 *     // ... other config
 *   },
 * }, {
 *   onSuccess: (training) => {
 *     console.log('Training started:', training.id);
 *   },
 * });
 * ```
 */
export function useStartTraining() {
  const queryClient = useQueryClient();
  const { setActiveTraining } = useQNNContext();

  return useMutation({
    mutationFn: async (request: StartTrainingRequest): Promise<TrainingJob> => {
      const apiClient = new QNNApiClient();
      return await apiClient.startTraining(request);
    },
    onSuccess: (training, variables) => {
      // Set as active training
      setActiveTraining(training);

      // Invalidate training queries
      queryClient.invalidateQueries({ queryKey: trainingKeys.history() });
      queryClient.invalidateQueries({ queryKey: trainingKeys.byModel(variables.modelId) });

      // Start polling the training status
      queryClient.invalidateQueries({ queryKey: trainingKeys.status(training.id) });
    },
  });
}

/**
 * Hook to stop a training job
 *
 * @returns Mutation object with stop function
 *
 * @example
 * ```tsx
 * const { mutate: stopTraining } = useStopTraining();
 *
 * stopTraining('training-789', {
 *   onSuccess: () => console.log('Training stopped'),
 * });
 * ```
 */
export function useStopTraining() {
  const queryClient = useQueryClient();
  const { setActiveTraining } = useQNNContext();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const apiClient = new QNNApiClient();
      await apiClient.stopTraining(id);
    },
    onMutate: async (id) => {
      // Optimistically update status to 'stopped'
      await queryClient.cancelQueries({ queryKey: trainingKeys.status(id) });

      const previous = queryClient.getQueryData(trainingKeys.status(id));

      queryClient.setQueryData(trainingKeys.status(id), (old: TrainingJob | undefined) => {
        if (!old) return old;
        return { ...old, status: 'stopped' as TrainingStatus };
      });

      return { previous };
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(trainingKeys.status(id), context.previous);
      }
    },
    onSuccess: (_, id) => {
      // Clear active training
      setActiveTraining(null);

      // Refetch status
      queryClient.invalidateQueries({ queryKey: trainingKeys.status(id) });
      queryClient.invalidateQueries({ queryKey: trainingKeys.history() });
    },
  });
}

/**
 * Hook to get the latest active training
 *
 * Useful for showing a global training progress indicator.
 *
 * @returns The currently active training job from context
 *
 * @example
 * ```tsx
 * const activeTraining = useActiveTraining();
 *
 * if (activeTraining) {
 *   return <TrainingProgressBar training={activeTraining} />;
 * }
 * ```
 */
export function useActiveTraining(): TrainingJob | null {
  const { activeTraining } = useQNNContext();
  return activeTraining;
}

/**
 * Hook to check if any training is currently active
 *
 * @returns Boolean indicating if training is in progress
 *
 * @example
 * ```tsx
 * const isTraining = useIsTraining();
 *
 * return (
 *   <Button disabled={isTraining}>
 *     {isTraining ? 'Training in progress...' : 'Start Training'}
 *   </Button>
 * );
 * ```
 */
export function useIsTraining(): boolean {
  const { activeTraining } = useQNNContext();
  return activeTraining !== null && isActiveStatus(activeTraining.status);
}
