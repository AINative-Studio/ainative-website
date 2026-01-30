/**
 * Tests for useBenchmarks hook
 *
 * Comprehensive test suite for benchmark hooks with React Query integration.
 */

import { renderHook } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useBenchmarks,
  useBenchmarksByModel,
  useBenchmark,
  useBenchmarkMetrics,
  useRunBenchmark,
  useBenchmarkStatus,
  useCompareBenchmarks,
  usePrefetchBenchmark,
} from '@/hooks/useBenchmarks';
import {
  BenchmarkMetrics,
  BenchmarkRequest,
  BenchmarkResult,
} from '@/types/qnn.types';

// Mock QNNApiClient module
jest.mock('@/services/QNNApiClient', () => ({
  qnnApiClient: {
    getBenchmarkMetrics: jest.fn(),
    getBenchmarkResult: jest.fn(),
    runBenchmark: jest.fn(),
  },
}));

const mockBenchmarkMetrics: BenchmarkMetrics[] = [
  {
    modelId: 'model-1',
    benchmarkId: 'bench-1',
    dataset: 'mnist',
    metrics: {
      accuracy: 0.95,
      precision: 0.94,
      recall: 0.96,
      f1Score: 0.95,
      inferenceTime: 150,
      throughput: 1000,
      memoryUsage: 2048,
    },
    quantumMetrics: {
      circuitDepth: 10,
      gateCount: 50,
      fidelity: 0.98,
      coherenceTime: 100,
      quantumAdvantage: 1.5,
    },
    timestamp: '2025-01-19T12:00:00Z',
  },
];

const mockBenchmarkResult: BenchmarkResult = {
  id: 'bench-1',
  modelId: 'model-1',
  status: 'completed',
  metrics: mockBenchmarkMetrics[0],
  createdAt: '2025-01-19T12:00:00Z',
  completedAt: '2025-01-19T12:05:00Z',
};

// Create wrapper for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useBenchmarks', () => {
  let qnnApiClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    qnnApiClient = require('@/services/QNNApiClient').qnnApiClient;
  });

  describe('useBenchmarks', () => {
    it('should fetch all benchmarks', async () => {
      qnnApiClient.getBenchmarkMetrics.mockResolvedValue(mockBenchmarkMetrics);

      const { result } = renderHook(() => useBenchmarks(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(qnnApiClient.getBenchmarkMetrics).toHaveBeenCalledWith(undefined);
      expect(result.current.data).toEqual(mockBenchmarkMetrics);
    });

    it('should fetch benchmarks filtered by model ID', async () => {
      qnnApiClient.getBenchmarkMetrics.mockResolvedValue(mockBenchmarkMetrics);

      const { result } = renderHook(() => useBenchmarks('model-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(qnnApiClient.getBenchmarkMetrics).toHaveBeenCalledWith('model-1');
      expect(result.current.data).toEqual(mockBenchmarkMetrics);
    });

    it('should handle fetch errors', async () => {
      const mockError = new Error('API Error');
      qnnApiClient.getBenchmarkMetrics.mockRejectedValue(mockError);

      const { result } = renderHook(() => useBenchmarks(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useBenchmarksByModel', () => {
    it('should fetch benchmarks for a specific model', async () => {
      qnnApiClient.getBenchmarkMetrics.mockResolvedValue(mockBenchmarkMetrics);

      const { result } = renderHook(() => useBenchmarksByModel('model-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(qnnApiClient.getBenchmarkMetrics).toHaveBeenCalledWith('model-1');
      expect(result.current.data).toEqual(mockBenchmarkMetrics);
    });

    it('should not fetch when enabled is false', async () => {
      qnnApiClient.getBenchmarkMetrics.mockResolvedValue(mockBenchmarkMetrics);

      const { result } = renderHook(() => useBenchmarksByModel('model-1', false), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));

      expect(qnnApiClient.getBenchmarkMetrics).not.toHaveBeenCalled();
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useBenchmark', () => {
    it('should fetch a specific benchmark result', async () => {
      qnnApiClient.getBenchmarkResult.mockResolvedValue(mockBenchmarkResult);

      const { result } = renderHook(() => useBenchmark('bench-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(qnnApiClient.getBenchmarkResult).toHaveBeenCalledWith('bench-1');
      expect(result.current.data).toEqual(mockBenchmarkResult);
    });
  });

  describe('useBenchmarkMetrics', () => {
    it('should fetch benchmark metrics for a model', async () => {
      qnnApiClient.getBenchmarkMetrics.mockResolvedValue(mockBenchmarkMetrics);

      const { result } = renderHook(() => useBenchmarkMetrics('model-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(qnnApiClient.getBenchmarkMetrics).toHaveBeenCalledWith('model-1');
      expect(result.current.data).toEqual(mockBenchmarkMetrics);
    });
  });

  describe('useRunBenchmark', () => {
    it('should run a benchmark successfully', async () => {
      qnnApiClient.runBenchmark.mockResolvedValue(mockBenchmarkResult);

      const { result } = renderHook(() => useRunBenchmark(), {
        wrapper: createWrapper(),
      });

      const request: BenchmarkRequest = {
        modelId: 'model-1',
        dataset: 'mnist',
        batchSize: 64,
        iterations: 100,
      };

      result.current.mutate(request);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(qnnApiClient.runBenchmark).toHaveBeenCalledWith(request);
      expect(result.current.data).toEqual(mockBenchmarkResult);
    });

    it('should handle run benchmark errors', async () => {
      const mockError = new Error('Benchmark failed');
      qnnApiClient.runBenchmark.mockRejectedValue(mockError);

      const { result } = renderHook(() => useRunBenchmark(), {
        wrapper: createWrapper(),
      });

      const request: BenchmarkRequest = {
        modelId: 'model-1',
        dataset: 'mnist',
      };

      result.current.mutate(request);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useBenchmarkStatus', () => {
    it('should poll benchmark status until completion', async () => {
      const runningResult = { ...mockBenchmarkResult, status: 'running' as const };
      const completedResult = { ...mockBenchmarkResult, status: 'completed' as const };

      qnnApiClient.getBenchmarkResult
        .mockResolvedValueOnce(runningResult)
        .mockResolvedValueOnce(completedResult);

      const { result } = renderHook(() => useBenchmarkStatus('bench-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(qnnApiClient.getBenchmarkResult).toHaveBeenCalledWith('bench-1');
    });
  });

  describe('useCompareBenchmarks', () => {
    it('should compare benchmarks for multiple models', async () => {
      qnnApiClient.getBenchmarkMetrics.mockResolvedValue(mockBenchmarkMetrics);

      const { result } = renderHook(() => useCompareBenchmarks(['model-1', 'model-2']), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(qnnApiClient.getBenchmarkMetrics).toHaveBeenCalledTimes(2);
      expect(result.current.data).toEqual({
        'model-1': mockBenchmarkMetrics,
        'model-2': mockBenchmarkMetrics,
      });
    });

    it('should handle partial failures in comparison', async () => {
      qnnApiClient.getBenchmarkMetrics
        .mockResolvedValueOnce(mockBenchmarkMetrics)
        .mockRejectedValueOnce(new Error('Model 2 failed'));

      const { result } = renderHook(() => useCompareBenchmarks(['model-1', 'model-2']), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual({
        'model-1': mockBenchmarkMetrics,
        'model-2': [],
      });
    });
  });

  describe('usePrefetchBenchmark', () => {
    it('should prefetch a benchmark result', async () => {
      qnnApiClient.getBenchmarkResult.mockResolvedValue(mockBenchmarkResult);

      const { result } = renderHook(() => usePrefetchBenchmark(), {
        wrapper: createWrapper(),
      });

      result.current('bench-1');

      await waitFor(() => expect(qnnApiClient.getBenchmarkResult).toHaveBeenCalledWith('bench-1'));
    });
  });
});
