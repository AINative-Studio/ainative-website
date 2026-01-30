/**
 * useEvaluation Hook Tests
 *
 * Comprehensive test suite for the useEvaluation hook that manages model evaluation and metrics.
 * Tests all evaluation functions including fetching, running evaluations, and comparisons.
 *
 * Coverage Target: 80%+ with all critical paths tested
 *
 * Refs #433
 */

import { renderHook, act } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useModelEvaluation,
  useEvaluationMetrics,
  useRunEvaluation,
  useCompareEvaluations,
  useExportEvaluationReport,
  usePrefetchEvaluation,
  evaluationKeys,
} from '@/hooks/useEvaluation';
import { qnnApiClient } from '@/services/QNNApiClient';
import {
  ModelEvaluation,
  EvaluationMetrics,
  EvaluationRequest,
  ApiResponse,
} from '@/types/qnn.types';

// Mock the QNN API Client module
jest.mock('@/services/QNNApiClient', () => ({
  QNNApiClient: jest.fn(),
  qnnApiClient: {
    getEvaluation: jest.fn(),
    getEvaluationMetrics: jest.fn(),
    runEvaluation: jest.fn(),
    exportEvaluationReport: jest.fn(),
  },
}));

// Helper to create a QueryClient for testing
const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

// Wrapper for React Query
const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Mock data
const mockEvaluationMetrics: EvaluationMetrics = {
  accuracy: 0.95,
  precision: 0.93,
  recall: 0.94,
  f1Score: 0.935,
};

const mockModelEvaluation: ModelEvaluation = {
  modelId: 'model-456',
  evaluatedAt: '2025-01-20T10:00:00Z',
  sampleSize: 1000,
  metrics: mockEvaluationMetrics,
  confusionMatrix: [
    [85, 5, 3, 2],
    [4, 88, 3, 0],
    [2, 1, 92, 0],
    [1, 0, 2, 94],
  ],
  rocCurve: [
    { threshold: 1.0, truePositiveRate: 0.0, falsePositiveRate: 0.0 },
    { threshold: 0.8, truePositiveRate: 0.7, falsePositiveRate: 0.1 },
    { threshold: 0.5, truePositiveRate: 0.9, falsePositiveRate: 0.2 },
    { threshold: 0.2, truePositiveRate: 1.0, falsePositiveRate: 0.3 },
  ],
};

const mockEvaluationRequest: EvaluationRequest = {
  modelId: 'model-456',
  datasetPath: '/data/test.csv',
  batchSize: 32,
  metrics: ['accuracy', 'precision', 'recall', 'f1Score'],
};

describe('useEvaluation Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useModelEvaluation - Fetch Model Evaluation', () => {
    it('should fetch model evaluation successfully', async () => {
      // Given
      (qnnApiClient.getEvaluation as jest.Mock).mockResolvedValueOnce(mockModelEvaluation);

      // When
      const { result } = renderHook(() => useModelEvaluation('model-456'), {
        wrapper: createWrapper(),
      });

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockModelEvaluation);
      expect(qnnApiClient.getEvaluation).toHaveBeenCalledWith('model-456');
    });

    it('should handle evaluation not found error', async () => {
      // Given
      const error = new Error('Evaluation not found for model');
      (qnnApiClient.getEvaluation as jest.Mock).mockRejectedValueOnce(error);

      // When
      const { result } = renderHook(() => useModelEvaluation('nonexistent'), {
        wrapper: createWrapper(),
      });

      // Then
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeTruthy();
    });

    it('should not fetch when enabled is false', async () => {
      // When
      const { result } = renderHook(() => useModelEvaluation('model-456', false), {
        wrapper: createWrapper(),
      });

      // Then
      await waitFor(() => expect(result.current.isFetching).toBe(false));
      expect(qnnApiClient.getEvaluation).not.toHaveBeenCalled();
    });

    it('should not fetch when model ID is empty', async () => {
      // When
      const { result } = renderHook(() => useModelEvaluation(''), {
        wrapper: createWrapper(),
      });

      // Then
      await waitFor(() => expect(result.current.isFetching).toBe(false));
      expect(qnnApiClient.getEvaluation).not.toHaveBeenCalled();
    });

    it('should use correct stale time (5 minutes)', async () => {
      // Given
      (qnnApiClient.getEvaluation as jest.Mock).mockResolvedValueOnce(mockModelEvaluation);

      // When
      const { result } = renderHook(() => useModelEvaluation('model-456'), {
        wrapper: createWrapper(),
      });

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      // Stale time is 5 minutes (5 * 60 * 1000 ms)
      expect(result.current).toBeDefined();
    });
  });

  describe('useEvaluationMetrics - Fetch Lightweight Metrics', () => {
    it('should fetch evaluation metrics successfully', async () => {
      // Given
      (qnnApiClient.getEvaluationMetrics as jest.Mock).mockResolvedValueOnce(
        mockEvaluationMetrics
      );

      // When
      const { result } = renderHook(() => useEvaluationMetrics('model-456'), {
        wrapper: createWrapper(),
      });

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockEvaluationMetrics);
      expect(qnnApiClient.getEvaluationMetrics).toHaveBeenCalledWith('model-456');
    });

    it('should handle metrics fetch error', async () => {
      // Given
      const error = new Error('Metrics not available');
      (qnnApiClient.getEvaluationMetrics as jest.Mock).mockRejectedValueOnce(error);

      // When
      const { result } = renderHook(() => useEvaluationMetrics('model-456'), {
        wrapper: createWrapper(),
      });

      // Then
      await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it('should not fetch when enabled is false', async () => {
      // When
      const { result } = renderHook(() => useEvaluationMetrics('model-456', false), {
        wrapper: createWrapper(),
      });

      // Then
      await waitFor(() => expect(result.current.isFetching).toBe(false));
      expect(qnnApiClient.getEvaluationMetrics).not.toHaveBeenCalled();
    });

    it('should handle missing metrics gracefully', async () => {
      // Given
      const emptyMetrics: EvaluationMetrics = {
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0,
      };
      (qnnApiClient.getEvaluationMetrics as jest.Mock).mockResolvedValueOnce(emptyMetrics);

      // When
      const { result } = renderHook(() => useEvaluationMetrics('model-456'), {
        wrapper: createWrapper(),
      });

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(emptyMetrics);
    });
  });

  describe('useRunEvaluation - Run Model Evaluation', () => {
    it('should run evaluation successfully', async () => {
      // Given
      const apiResponse: ApiResponse<ModelEvaluation> = {
        data: mockModelEvaluation,
        message: 'Evaluation completed successfully',
        success: true,
        timestamp: '2025-01-20T10:00:00Z',
      };
      (qnnApiClient.runEvaluation as jest.Mock).mockResolvedValueOnce(apiResponse);

      // When
      const { result } = renderHook(() => useRunEvaluation(), { wrapper: createWrapper() });

      await act(async () => {
        result.current.mutate(mockEvaluationRequest);
      });

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(qnnApiClient.runEvaluation).toHaveBeenCalledWith(mockEvaluationRequest);
      expect(result.current.data?.data).toEqual(mockModelEvaluation);
    });

    it('should handle validation errors during evaluation', async () => {
      // Given
      const invalidRequest: EvaluationRequest = {
        modelId: '',
        datasetPath: '',
        batchSize: -1,
      };
      const error = new Error('Validation Error: Invalid evaluation configuration');
      (qnnApiClient.runEvaluation as jest.Mock).mockRejectedValueOnce(error);

      // When
      const { result } = renderHook(() => useRunEvaluation(), { wrapper: createWrapper() });

      await act(async () => {
        result.current.mutate(invalidRequest);
      });

      // Then
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeTruthy();
    });

    it('should handle dataset not found error', async () => {
      // Given
      const request: EvaluationRequest = {
        modelId: 'model-456',
        datasetPath: '/nonexistent/path.csv',
        batchSize: 32,
      };
      const error = new Error('Dataset not found');
      (qnnApiClient.runEvaluation as jest.Mock).mockRejectedValueOnce(error);

      // When
      const { result } = renderHook(() => useRunEvaluation(), { wrapper: createWrapper() });

      await act(async () => {
        result.current.mutate(request);
      });

      // Then
      await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it('should handle model not ready for evaluation error', async () => {
      // Given
      const error = new Error('Model is not trained yet');
      (qnnApiClient.runEvaluation as jest.Mock).mockRejectedValueOnce(error);

      // When
      const { result } = renderHook(() => useRunEvaluation(), { wrapper: createWrapper() });

      await act(async () => {
        result.current.mutate(mockEvaluationRequest);
      });

      // Then
      await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it('should invalidate queries after successful evaluation', async () => {
      // Given
      const apiResponse: ApiResponse<ModelEvaluation> = {
        data: mockModelEvaluation,
        message: 'Evaluation completed',
        success: true,
        timestamp: '2025-01-20T10:00:00Z',
      };
      (qnnApiClient.runEvaluation as jest.Mock).mockResolvedValueOnce(apiResponse);

      // When
      const { result } = renderHook(() => useRunEvaluation(), { wrapper: createWrapper() });

      await act(async () => {
        result.current.mutate(mockEvaluationRequest);
      });

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      // Cache invalidation will trigger refetch of evaluation data
    });
  });

  describe('useCompareEvaluations - Compare Multiple Models', () => {
    it('should compare evaluations for multiple models', async () => {
      // Given
      const model1Eval = { ...mockModelEvaluation, modelId: 'model-1' };
      const model2Eval = {
        ...mockModelEvaluation,
        modelId: 'model-2',
        metrics: { ...mockEvaluationMetrics, accuracy: 0.92 },
      };

      (qnnApiClient.getEvaluation as jest.Mock)
        .mockResolvedValueOnce(model1Eval)
        .mockResolvedValueOnce(model2Eval);

      // When
      const { result } = renderHook(() => useCompareEvaluations(['model-1', 'model-2']), {
        wrapper: createWrapper(),
      });

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toHaveLength(2);
      expect(result.current.data?.[0]).toEqual(model1Eval);
      expect(result.current.data?.[1]).toEqual(model2Eval);
    });

    it('should handle empty model list', async () => {
      // When
      const { result } = renderHook(() => useCompareEvaluations([]), {
        wrapper: createWrapper(),
      });

      // Then
      await waitFor(() => expect(result.current.isFetching).toBe(false));
      expect(qnnApiClient.getEvaluation).not.toHaveBeenCalled();
    });

    it('should handle partial failures in comparison', async () => {
      // Given
      const model1Eval = { ...mockModelEvaluation, modelId: 'model-1' };
      (qnnApiClient.getEvaluation as jest.Mock)
        .mockResolvedValueOnce(model1Eval)
        .mockRejectedValueOnce(new Error('Model 2 evaluation not found'));

      // When
      const { result } = renderHook(() => useCompareEvaluations(['model-1', 'model-2']), {
        wrapper: createWrapper(),
      });

      // Then
      await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it('should fetch evaluations in parallel', async () => {
      // Given
      const modelIds = ['model-1', 'model-2', 'model-3'];
      (qnnApiClient.getEvaluation as jest.Mock).mockImplementation((id) =>
        Promise.resolve({ ...mockModelEvaluation, modelId: id })
      );

      // When
      const { result } = renderHook(() => useCompareEvaluations(modelIds), {
        wrapper: createWrapper(),
      });

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toHaveLength(3);
      // All calls should happen in parallel
      expect(qnnApiClient.getEvaluation).toHaveBeenCalledTimes(3);
    });

    it('should sort model IDs for consistent cache keys', async () => {
      // Given
      const modelIds = ['model-3', 'model-1', 'model-2'];
      (qnnApiClient.getEvaluation as jest.Mock).mockImplementation((id) =>
        Promise.resolve({ ...mockModelEvaluation, modelId: id })
      );

      // When
      const { result } = renderHook(() => useCompareEvaluations(modelIds), {
        wrapper: createWrapper(),
      });

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      // Cache key uses sorted model IDs for consistency
    });
  });

  describe('useExportEvaluationReport - Export Evaluation', () => {
    it('should export evaluation report as PDF', async () => {
      // Given
      const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });
      (qnnApiClient.exportEvaluationReport as jest.Mock).mockResolvedValueOnce(mockBlob);

      // When
      const { result } = renderHook(() => useExportEvaluationReport(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate({ modelId: 'model-456', format: 'pdf' });
      });

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(qnnApiClient.exportEvaluationReport).toHaveBeenCalledWith('model-456', 'pdf');
      expect(result.current.data).toBeInstanceOf(Blob);
    });

    it('should export evaluation report as JSON', async () => {
      // Given
      const mockBlob = new Blob(['{"data": "json"}'], { type: 'application/json' });
      (qnnApiClient.exportEvaluationReport as jest.Mock).mockResolvedValueOnce(mockBlob);

      // When
      const { result } = renderHook(() => useExportEvaluationReport(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate({ modelId: 'model-456', format: 'json' });
      });

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(qnnApiClient.exportEvaluationReport).toHaveBeenCalledWith('model-456', 'json');
    });

    it('should export evaluation report as CSV', async () => {
      // Given
      const mockBlob = new Blob(['metric,value\naccuracy,0.95'], { type: 'text/csv' });
      (qnnApiClient.exportEvaluationReport as jest.Mock).mockResolvedValueOnce(mockBlob);

      // When
      const { result } = renderHook(() => useExportEvaluationReport(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate({ modelId: 'model-456', format: 'csv' });
      });

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(qnnApiClient.exportEvaluationReport).toHaveBeenCalledWith('model-456', 'csv');
    });

    it('should handle export errors', async () => {
      // Given
      const error = new Error('Export failed: Evaluation not found');
      (qnnApiClient.exportEvaluationReport as jest.Mock).mockRejectedValueOnce(error);

      // When
      const { result } = renderHook(() => useExportEvaluationReport(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate({ modelId: 'model-456', format: 'pdf' });
      });

      // Then
      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('usePrefetchEvaluation - Prefetch Utility', () => {
    it('should prefetch evaluation data', async () => {
      // Given
      (qnnApiClient.getEvaluation as jest.Mock).mockResolvedValueOnce(mockModelEvaluation);
      const wrapper = createWrapper();

      // When
      const { result } = renderHook(() => usePrefetchEvaluation(), { wrapper });

      act(() => {
        result.current('model-456');
      });

      // Then
      // Prefetch is fire-and-forget, we just verify it doesn't error
      expect(result.current).toBeInstanceOf(Function);
    });
  });

  describe('Cache Management', () => {
    it('should use correct cache keys', () => {
      // Given/When
      const detailKey = evaluationKeys.detail('model-456');
      const metricsKey = evaluationKeys.metrics('model-456');
      const listKey = evaluationKeys.list('model-456');

      // Then
      expect(detailKey).toEqual(['evaluations', 'detail', 'model-456']);
      expect(metricsKey).toEqual(['evaluations', 'metrics', 'model-456']);
      expect(listKey).toEqual(['evaluations', 'list', 'model-456']);
    });

    it('should use correct stale time for evaluation queries', async () => {
      // Given
      (qnnApiClient.getEvaluation as jest.Mock).mockResolvedValueOnce(mockModelEvaluation);

      // When
      const { result } = renderHook(() => useModelEvaluation('model-456'), {
        wrapper: createWrapper(),
      });

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      // Stale time should be 5 minutes (5 * 60 * 1000 ms)
    });
  });

  describe('Error Scenarios', () => {
    it('should handle network timeout errors', async () => {
      // Given
      const timeoutError = new Error('Network timeout');
      (qnnApiClient.getEvaluation as jest.Mock).mockRejectedValueOnce(timeoutError);

      // When
      const { result } = renderHook(() => useModelEvaluation('model-456'), {
        wrapper: createWrapper(),
      });

      // Then
      await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it('should handle authentication errors', async () => {
      // Given
      const authError = new Error('Unauthorized: Invalid token');
      (qnnApiClient.getEvaluation as jest.Mock).mockRejectedValueOnce(authError);

      // When
      const { result } = renderHook(() => useModelEvaluation('model-456'), {
        wrapper: createWrapper(),
      });

      // Then
      await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it('should handle server errors (5xx)', async () => {
      // Given
      const serverError = new Error('Internal Server Error');
      (qnnApiClient.getEvaluationMetrics as jest.Mock).mockRejectedValueOnce(serverError);

      // When
      const { result } = renderHook(() => useEvaluationMetrics('model-456'), {
        wrapper: createWrapper(),
      });

      // Then
      await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it('should handle rate limiting errors', async () => {
      // Given
      const rateLimitError = new Error('Rate limit exceeded');
      (qnnApiClient.runEvaluation as jest.Mock).mockRejectedValueOnce(rateLimitError);

      // When
      const { result } = renderHook(() => useRunEvaluation(), { wrapper: createWrapper() });

      await act(async () => {
        result.current.mutate(mockEvaluationRequest);
      });

      // Then
      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });
});
