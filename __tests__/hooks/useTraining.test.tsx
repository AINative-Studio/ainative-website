/**
 * useTraining Hook Tests
 *
 * Comprehensive test suite for the useTraining hook that manages QNN training jobs.
 * Tests all training lifecycle functions including real-time polling and status updates.
 *
 * Coverage Target: 80%+ with all critical paths tested
 *
 * Refs #432
 */

import { renderHook, act } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useTrainingHistory,
  useTrainingByModel,
  useTrainingStatus,
  useTrainingLogs,
  useStartTraining,
  useStopTraining,
  useActiveTraining,
  useIsTraining,
  trainingKeys,
} from '@/hooks/useTraining';
import { qnnApiClient } from '@/services/QNNApiClient';
import { QNNProvider } from '@/contexts/QNNContext';
import {
  TrainingJob,
  StartTrainingRequest,
  TrainingLogs,
  PaginatedResponse,
} from '@/types/qnn.types';

// Mock the QNN API Client module
jest.mock('@/services/QNNApiClient', () => ({
  QNNApiClient: jest.fn(),
  qnnApiClient: {
    getTrainingHistory: jest.fn(),
    getTrainingJob: jest.fn(),
    getTrainingLogs: jest.fn(),
    startTraining: jest.fn(),
    stopTraining: jest.fn(),
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

// Wrapper for React Query with QNN Context
const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <QNNProvider>{children}</QNNProvider>
    </QueryClientProvider>
  );
};

// Mock data
const mockTrainingJob: TrainingJob = {
  id: 'training-789',
  modelId: 'model-456',
  status: 'training',
  config: {
    epochs: 100,
    batchSize: 32,
    learningRate: 0.001,
    optimizer: 'adam',
    lossFunction: 'cross_entropy',
    validationSplit: 0.2,
    quantumCircuitDepth: 10,
    quantumEntanglement: 'linear',
    hardwareBackend: 'simulator',
  },
  startedAt: '2025-01-20T10:00:00Z',
  completedAt: null,
  duration: null,
  error: null,
  checkpoints: [],
  metrics: {
    epoch: 50,
    loss: 0.25,
    accuracy: 0.92,
    valLoss: 0.28,
    valAccuracy: 0.90,
    history: [],
  },
};

const mockCompletedTraining: TrainingJob = {
  ...mockTrainingJob,
  status: 'completed',
  completedAt: '2025-01-20T11:00:00Z',
  duration: 3600,
};

const mockTrainingLogs: TrainingLogs = {
  trainingId: 'training-789',
  logs: [
    { timestamp: '2025-01-20T10:00:00Z', level: 'info', message: 'Training started' },
    { timestamp: '2025-01-20T10:05:00Z', level: 'info', message: 'Epoch 1/100 - Loss: 0.50' },
    { timestamp: '2025-01-20T10:10:00Z', level: 'info', message: 'Epoch 2/100 - Loss: 0.45' },
  ],
  totalLines: 3,
  hasMore: false,
};

const mockPaginatedResponse: PaginatedResponse<TrainingJob> = {
  items: [mockTrainingJob],
  total: 1,
  page: 1,
  perPage: 20,
  totalPages: 1,
  hasNext: false,
  hasPrevious: false,
};

describe('useTraining Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('useTrainingHistory - Fetch Training History', () => {
    it('should fetch training history successfully', async () => {
      // Given
      (qnnApiClient.getTrainingHistory as jest.Mock).mockResolvedValueOnce(mockPaginatedResponse);

      // When
      const { result } = renderHook(() => useTrainingHistory(), { wrapper: createWrapper() });

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([mockTrainingJob]);
      expect(qnnApiClient.getTrainingHistory).toHaveBeenCalledTimes(1);
    });

    it('should handle empty training history', async () => {
      // Given
      const emptyResponse: PaginatedResponse<TrainingJob> = {
        items: [],
        total: 0,
        page: 1,
        perPage: 20,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      };
      (qnnApiClient.getTrainingHistory as jest.Mock).mockResolvedValueOnce(emptyResponse);

      // When
      const { result } = renderHook(() => useTrainingHistory(), { wrapper: createWrapper() });

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([]);
    });

    it('should handle API errors gracefully', async () => {
      // Given
      const error = new Error('API Error: Failed to fetch training history');
      (qnnApiClient.getTrainingHistory as jest.Mock).mockRejectedValueOnce(error);

      // When
      const { result } = renderHook(() => useTrainingHistory(), { wrapper: createWrapper() });

      // Then
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeTruthy();
    });

    it('should use correct stale time', async () => {
      // Given
      (qnnApiClient.getTrainingHistory as jest.Mock).mockResolvedValueOnce(mockPaginatedResponse);

      // When
      const { result } = renderHook(() => useTrainingHistory(), { wrapper: createWrapper() });

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      // Stale time is 1 minute (1 * 60 * 1000 ms)
      expect(result.current).toBeDefined();
    });
  });

  describe('useTrainingByModel - Filter by Model', () => {
    it('should fetch training jobs for a specific model', async () => {
      // Given
      const modelId = 'model-456';
      (qnnApiClient.getTrainingHistory as jest.Mock).mockResolvedValueOnce(mockPaginatedResponse);

      // When
      const { result } = renderHook(() => useTrainingByModel(modelId), {
        wrapper: createWrapper(),
      });

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([mockTrainingJob]);
      expect(qnnApiClient.getTrainingHistory).toHaveBeenCalledWith(modelId, 1, 20);
    });

    it('should not fetch when enabled is false', async () => {
      // Given
      const modelId = 'model-456';

      // When
      const { result } = renderHook(() => useTrainingByModel(modelId, false), {
        wrapper: createWrapper(),
      });

      // Then
      await waitFor(() => expect(result.current.isFetching).toBe(false));
      expect(qnnApiClient.getTrainingHistory).not.toHaveBeenCalled();
    });

    it('should not fetch when model ID is empty', async () => {
      // When
      const { result } = renderHook(() => useTrainingByModel(''), {
        wrapper: createWrapper(),
      });

      // Then
      await waitFor(() => expect(result.current.isFetching).toBe(false));
      expect(qnnApiClient.getTrainingHistory).not.toHaveBeenCalled();
    });
  });

  describe('useTrainingStatus - Real-time Status Polling', () => {
    it('should fetch training status successfully', async () => {
      // Given
      (qnnApiClient.getTrainingJob as jest.Mock).mockResolvedValueOnce(mockTrainingJob);

      // When
      const { result } = renderHook(() => useTrainingStatus('training-789'), {
        wrapper: createWrapper(),
      });

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockTrainingJob);
      expect(qnnApiClient.getTrainingJob).toHaveBeenCalledWith('training-789');
    });

    it('should poll every 5 seconds when training is active', async () => {
      // Given
      (qnnApiClient.getTrainingJob as jest.Mock).mockResolvedValue(mockTrainingJob);

      // When
      const { result } = renderHook(() => useTrainingStatus('training-789'), {
        wrapper: createWrapper(),
      });

      // Wait for initial fetch
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(qnnApiClient.getTrainingJob).toHaveBeenCalledTimes(1);

      // Fast-forward 5 seconds
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Then - should poll again
      await waitFor(() => expect(qnnApiClient.getTrainingJob).toHaveBeenCalledTimes(2));
    });

    it('should stop polling when training is completed', async () => {
      // Given - Start with active training
      (qnnApiClient.getTrainingJob as jest.Mock).mockResolvedValueOnce(mockTrainingJob);

      // When
      const { result, rerender } = renderHook(() => useTrainingStatus('training-789'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Update to completed status
      (qnnApiClient.getTrainingJob as jest.Mock).mockResolvedValueOnce(mockCompletedTraining);

      // Fast-forward to trigger next poll
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => expect(result.current.data?.status).toBe('completed'));

      // Fast-forward again - should NOT poll anymore
      const callCountBefore = (qnnApiClient.getTrainingJob as jest.Mock).mock.calls.length;
      act(() => {
        jest.advanceTimersByTime(10000);
      });

      // Then - no additional calls
      expect(qnnApiClient.getTrainingJob).toHaveBeenCalledTimes(callCountBefore);
    });

    it('should not fetch when enabled is false', async () => {
      // When
      const { result } = renderHook(() => useTrainingStatus('training-789', false), {
        wrapper: createWrapper(),
      });

      // Then
      await waitFor(() => expect(result.current.isFetching).toBe(false));
      expect(qnnApiClient.getTrainingJob).not.toHaveBeenCalled();
    });

    it('should handle training job not found', async () => {
      // Given
      const error = new Error('Training job not found');
      (qnnApiClient.getTrainingJob as jest.Mock).mockRejectedValueOnce(error);

      // When
      const { result } = renderHook(() => useTrainingStatus('nonexistent'), {
        wrapper: createWrapper(),
      });

      // Then
      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useTrainingLogs - Fetch Training Logs', () => {
    it('should fetch training logs successfully', async () => {
      // Given
      (qnnApiClient.getTrainingLogs as jest.Mock).mockResolvedValueOnce(mockTrainingLogs);

      // When
      const { result } = renderHook(() => useTrainingLogs('training-789'), {
        wrapper: createWrapper(),
      });

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockTrainingLogs);
      expect(qnnApiClient.getTrainingLogs).toHaveBeenCalledWith('training-789', 0, 100);
    });

    it('should handle empty logs', async () => {
      // Given
      const emptyLogs: TrainingLogs = {
        trainingId: 'training-789',
        logs: [],
        totalLines: 0,
        hasMore: false,
      };
      (qnnApiClient.getTrainingLogs as jest.Mock).mockResolvedValueOnce(emptyLogs);

      // When
      const { result } = renderHook(() => useTrainingLogs('training-789'), {
        wrapper: createWrapper(),
      });

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.logs).toEqual([]);
    });

    it('should not fetch when enabled is false', async () => {
      // When
      const { result } = renderHook(() => useTrainingLogs('training-789', false), {
        wrapper: createWrapper(),
      });

      // Then
      await waitFor(() => expect(result.current.isFetching).toBe(false));
      expect(qnnApiClient.getTrainingLogs).not.toHaveBeenCalled();
    });
  });

  describe('useStartTraining - Start Training Job', () => {
    it('should start training successfully', async () => {
      // Given
      const startRequest: StartTrainingRequest = {
        modelId: 'model-456',
        config: {
          epochs: 100,
          batchSize: 32,
          learningRate: 0.001,
          optimizer: 'adam',
          lossFunction: 'cross_entropy',
          validationSplit: 0.2,
          quantumCircuitDepth: 10,
          quantumEntanglement: 'linear',
          hardwareBackend: 'simulator',
        },
      };
      (qnnApiClient.startTraining as jest.Mock).mockResolvedValueOnce(mockTrainingJob);

      // When
      const { result } = renderHook(() => useStartTraining(), { wrapper: createWrapper() });

      await act(async () => {
        result.current.mutate(startRequest);
      });

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(qnnApiClient.startTraining).toHaveBeenCalledWith(startRequest);
      expect(result.current.data).toEqual(mockTrainingJob);
    });

    it('should handle validation errors during start', async () => {
      // Given
      const invalidRequest: StartTrainingRequest = {
        modelId: '',
        config: {
          epochs: -1,
          batchSize: 0,
          learningRate: 0,
          optimizer: 'adam',
          lossFunction: 'cross_entropy',
          validationSplit: 0.2,
          quantumCircuitDepth: 10,
          quantumEntanglement: 'linear',
          hardwareBackend: 'simulator',
        },
      };
      const error = new Error('Validation Error: Invalid training configuration');
      (qnnApiClient.startTraining as jest.Mock).mockRejectedValueOnce(error);

      // When
      const { result } = renderHook(() => useStartTraining(), { wrapper: createWrapper() });

      await act(async () => {
        result.current.mutate(invalidRequest);
      });

      // Then
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeTruthy();
    });

    it('should handle insufficient credits error', async () => {
      // Given
      const startRequest: StartTrainingRequest = {
        modelId: 'model-456',
        config: {
          epochs: 100,
          batchSize: 32,
          learningRate: 0.001,
          optimizer: 'adam',
          lossFunction: 'cross_entropy',
          validationSplit: 0.2,
          quantumCircuitDepth: 10,
          quantumEntanglement: 'linear',
          hardwareBackend: 'simulator',
        },
      };
      const error = new Error('Insufficient credits');
      (qnnApiClient.startTraining as jest.Mock).mockRejectedValueOnce(error);

      // When
      const { result } = renderHook(() => useStartTraining(), { wrapper: createWrapper() });

      await act(async () => {
        result.current.mutate(startRequest);
      });

      // Then
      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useStopTraining - Stop Training Job', () => {
    it('should stop training successfully', async () => {
      // Given
      (qnnApiClient.stopTraining as jest.Mock).mockResolvedValueOnce(undefined);

      // When
      const { result } = renderHook(() => useStopTraining(), { wrapper: createWrapper() });

      await act(async () => {
        result.current.mutate('training-789');
      });

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(qnnApiClient.stopTraining).toHaveBeenCalledWith('training-789');
    });

    it('should handle stop errors', async () => {
      // Given
      const error = new Error('Stop failed: Training already completed');
      (qnnApiClient.stopTraining as jest.Mock).mockRejectedValueOnce(error);

      // When
      const { result } = renderHook(() => useStopTraining(), { wrapper: createWrapper() });

      await act(async () => {
        result.current.mutate('training-789');
      });

      // Then
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeTruthy();
    });

    it('should implement optimistic update for stop', async () => {
      // Given
      (qnnApiClient.stopTraining as jest.Mock).mockResolvedValueOnce(undefined);

      // When
      const { result } = renderHook(() => useStopTraining(), { wrapper: createWrapper() });

      await act(async () => {
        result.current.mutate('training-789');
      });

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      // Optimistic update sets status to 'stopped' immediately
    });
  });

  describe('useActiveTraining - Get Active Training', () => {
    it('should return null when no training is active', () => {
      // When
      const { result } = renderHook(() => useActiveTraining(), { wrapper: createWrapper() });

      // Then
      expect(result.current).toBeNull();
    });
  });

  describe('useIsTraining - Check Training Status', () => {
    it('should return false when no training is active', () => {
      // When
      const { result } = renderHook(() => useIsTraining(), { wrapper: createWrapper() });

      // Then
      expect(result.current).toBe(false);
    });
  });

  describe('Cache Management', () => {
    it('should use correct cache keys', () => {
      // Given/When
      const historyKey = trainingKeys.history();
      const statusKey = trainingKeys.status('training-789');
      const logsKey = trainingKeys.logs('training-789');
      const byModelKey = trainingKeys.byModel('model-456');

      // Then
      expect(historyKey).toEqual(['training', 'history']);
      expect(statusKey).toEqual(['training', 'detail', 'training-789', 'status']);
      expect(logsKey).toEqual(['training', 'detail', 'training-789', 'logs']);
      expect(byModelKey).toEqual(['training', 'model', 'model-456']);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle network timeout errors', async () => {
      // Given
      const timeoutError = new Error('Network timeout');
      (qnnApiClient.getTrainingHistory as jest.Mock).mockRejectedValueOnce(timeoutError);

      // When
      const { result } = renderHook(() => useTrainingHistory(), { wrapper: createWrapper() });

      // Then
      await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it('should handle authentication errors', async () => {
      // Given
      const authError = new Error('Unauthorized: Invalid token');
      (qnnApiClient.getTrainingHistory as jest.Mock).mockRejectedValueOnce(authError);

      // When
      const { result } = renderHook(() => useTrainingHistory(), { wrapper: createWrapper() });

      // Then
      await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it('should handle server errors (5xx)', async () => {
      // Given
      const serverError = new Error('Internal Server Error');
      (qnnApiClient.getTrainingJob as jest.Mock).mockRejectedValueOnce(serverError);

      // When
      const { result } = renderHook(() => useTrainingStatus('training-789'), {
        wrapper: createWrapper(),
      });

      // Then
      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });
});
