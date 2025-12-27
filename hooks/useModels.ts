/**
 * useModels Hook
 *
 * React Query hooks for managing QNN models.
 * Handles CRUD operations with optimistic updates.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Model,
  CreateModelRequest,
  UpdateModelRequest,
  ModelFilters,
  ApiResponse,
  PaginatedResponse,
} from '@/types/qnn.types';

// Query keys for React Query cache management
export const modelKeys = {
  all: ['models'] as const,
  lists: () => [...modelKeys.all, 'list'] as const,
  list: (filters?: ModelFilters) => [...modelKeys.lists(), filters] as const,
  details: () => [...modelKeys.all, 'detail'] as const,
  detail: (id: string) => [...modelKeys.details(), id] as const,
  byRepository: (repositoryId: string) => [...modelKeys.all, 'repository', repositoryId] as const,
};

/**
 * Hook to fetch all models
 *
 * @param filters - Optional filters (status, architecture, etc.)
 * @returns React Query result with models list
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useModels({ status: ['ready', 'trained'] });
 * ```
 */
export function useModels(filters?: ModelFilters) {
  return useQuery({
    queryKey: modelKeys.list(filters),
    queryFn: async (): Promise<PaginatedResponse<Model>> => {
      // TODO: Replace with actual API client from Agent 1
      // const apiClient = new QNNApiClient();
      // return apiClient.listModels(filters);

      console.warn('useModels: Using placeholder data. Waiting for Agent 1 API client.');
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        items: [],
        total: 0,
        page: 1,
        perPage: 20,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      };
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to fetch models for a specific repository
 *
 * @param repositoryId - Repository ID to filter by
 * @param enabled - Whether to fetch automatically
 * @returns React Query result with filtered models
 *
 * @example
 * ```tsx
 * const { data: models } = useModelsByRepository('repo-123');
 * ```
 */
export function useModelsByRepository(repositoryId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: modelKeys.byRepository(repositoryId),
    queryFn: async (): Promise<Model[]> => {
      // TODO: Replace with actual API client from Agent 1
      // const apiClient = new QNNApiClient();
      // return apiClient.listModelsByRepository(repositoryId);

      console.warn('useModelsByRepository: Using placeholder. Waiting for Agent 1 API client.');
      await new Promise(resolve => setTimeout(resolve, 400));

      return [];
    },
    staleTime: 3 * 60 * 1000,
    enabled: enabled && !!repositoryId,
  });
}

/**
 * Hook to fetch a single model by ID
 *
 * @param id - Model ID
 * @param enabled - Whether to fetch automatically
 * @returns React Query result with model details
 *
 * @example
 * ```tsx
 * const { data: model } = useModel('model-456');
 * ```
 */
export function useModel(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: modelKeys.detail(id),
    queryFn: async (): Promise<Model> => {
      // TODO: Replace with actual API client from Agent 1
      // const apiClient = new QNNApiClient();
      // return apiClient.getModel(id);

      console.warn('useModel: Using placeholder. Waiting for Agent 1 API client.');
      await new Promise(resolve => setTimeout(resolve, 300));

      throw new Error('Model not found (placeholder implementation)');
    },
    staleTime: 5 * 60 * 1000,
    enabled: enabled && !!id,
  });
}

/**
 * Hook to create a new model
 *
 * @returns Mutation object with create function
 *
 * @example
 * ```tsx
 * const { mutate: createModel, isPending } = useCreateModel();
 *
 * createModel({
 *   name: 'My QNN Model',
 *   repositoryId: 'repo-123',
 *   architecture: 'quantum-cnn',
 * }, {
 *   onSuccess: (model) => console.log('Created:', model.id),
 * });
 * ```
 */
export function useCreateModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateModelRequest): Promise<ApiResponse<Model>> => {
      // TODO: Replace with actual API client from Agent 1
      // const apiClient = new QNNApiClient();
      // return apiClient.createModel(data);

      console.warn('useCreateModel: Using placeholder. Waiting for Agent 1 API client.');
      await new Promise(resolve => setTimeout(resolve, 800));

      throw new Error('Create not implemented (placeholder)');
    },
    onMutate: async (newModel) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: modelKeys.lists() });

      // Snapshot the previous value
      const previousModels = queryClient.getQueryData(modelKeys.lists());

      // Optimistically update to the new value
      // (We'll add the model to the cache with a temporary ID)
      const tempId = `temp-${Date.now()}`;
      const optimisticModel: Model = {
        id: tempId,
        name: newModel.name,
        description: newModel.description || null,
        repositoryId: newModel.repositoryId,
        architecture: newModel.architecture,
        status: 'draft',
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          parameters: 0,
          quantumLayers: 0,
          classicalLayers: 0,
          inputShape: [],
          outputShape: [],
          framework: 'pennylane',
          ...newModel.metadata,
        },
      };

      queryClient.setQueryData(modelKeys.list(), (old: any) => {
        if (!old) return { items: [optimisticModel], total: 1 };
        return {
          ...old,
          items: [optimisticModel, ...old.items],
          total: old.total + 1,
        };
      });

      // Return context for rollback
      return { previousModels };
    },
    onError: (err, newModel, context) => {
      // Rollback on error
      if (context?.previousModels) {
        queryClient.setQueryData(modelKeys.lists(), context.previousModels);
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate all model queries to refetch with real data
      queryClient.invalidateQueries({ queryKey: modelKeys.all });

      // Also invalidate repository models
      if (variables.repositoryId) {
        queryClient.invalidateQueries({
          queryKey: modelKeys.byRepository(variables.repositoryId),
        });
      }
    },
  });
}

/**
 * Hook to update a model
 *
 * @returns Mutation object with update function
 *
 * @example
 * ```tsx
 * const { mutate: updateModel } = useUpdateModel();
 *
 * updateModel({
 *   id: 'model-456',
 *   data: { status: 'ready', description: 'Updated description' },
 * });
 * ```
 */
export function useUpdateModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateModelRequest;
    }): Promise<ApiResponse<Model>> => {
      // TODO: Replace with actual API client from Agent 1
      // const apiClient = new QNNApiClient();
      // return apiClient.updateModel(id, data);

      console.warn('useUpdateModel: Using placeholder. Waiting for Agent 1 API client.');
      await new Promise(resolve => setTimeout(resolve, 600));

      throw new Error('Update not implemented (placeholder)');
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: modelKeys.detail(id) });

      // Snapshot previous value
      const previousModel = queryClient.getQueryData(modelKeys.detail(id));

      // Optimistically update
      queryClient.setQueryData(modelKeys.detail(id), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          ...data,
          updatedAt: new Date().toISOString(),
        };
      });

      return { previousModel };
    },
    onError: (err, { id }, context) => {
      // Rollback
      if (context?.previousModel) {
        queryClient.setQueryData(modelKeys.detail(id), context.previousModel);
      }
    },
    onSuccess: (data, { id }) => {
      // Refetch model detail
      queryClient.invalidateQueries({ queryKey: modelKeys.detail(id) });
      // Also invalidate lists
      queryClient.invalidateQueries({ queryKey: modelKeys.lists() });
    },
  });
}

/**
 * Hook to delete a model
 *
 * @returns Mutation object with delete function
 *
 * @example
 * ```tsx
 * const { mutate: deleteModel, isPending } = useDeleteModel();
 *
 * deleteModel('model-456', {
 *   onSuccess: () => console.log('Deleted!'),
 * });
 * ```
 */
export function useDeleteModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<ApiResponse<void>> => {
      // TODO: Replace with actual API client from Agent 1
      // const apiClient = new QNNApiClient();
      // return apiClient.deleteModel(id);

      console.warn('useDeleteModel: Using placeholder. Waiting for Agent 1 API client.');
      await new Promise(resolve => setTimeout(resolve, 500));

      throw new Error('Delete not implemented (placeholder)');
    },
    onMutate: async (id) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: modelKeys.all });

      // Snapshot
      const previousModels = queryClient.getQueryData(modelKeys.lists());

      // Optimistically remove from list
      queryClient.setQueriesData({ queryKey: modelKeys.lists() }, (old: any) => {
        if (!old?.items) return old;
        return {
          ...old,
          items: old.items.filter((model: Model) => model.id !== id),
          total: old.total - 1,
        };
      });

      return { previousModels };
    },
    onError: (err, id, context) => {
      // Rollback
      if (context?.previousModels) {
        queryClient.setQueryData(modelKeys.lists(), context.previousModels);
      }
    },
    onSuccess: () => {
      // Invalidate all model queries
      queryClient.invalidateQueries({ queryKey: modelKeys.all });
    },
  });
}

/**
 * Utility hook to prefetch a model
 *
 * @example
 * ```tsx
 * const prefetchModel = usePrefetchModel();
 *
 * <div onMouseEnter={() => prefetchModel('model-456')}>
 *   Hover to prefetch
 * </div>
 * ```
 */
export function usePrefetchModel() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: modelKeys.detail(id),
      queryFn: async (): Promise<Model> => {
        // TODO: Replace with actual API client
        console.warn('Prefetch: Waiting for Agent 1 API client.');
        throw new Error('Prefetch not implemented');
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}
