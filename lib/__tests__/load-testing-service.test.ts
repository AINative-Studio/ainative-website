import apiClient from '../api-client';
import loadTestingService from '../load-testing-service';

// Mock the apiClient
jest.mock('../api-client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('LoadTestingService', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getScenarios', () => {
    it('fetches all test scenarios', async () => {
      const mockScenarios = {
        scenarios: [
          {
            id: 'scenario-1',
            name: 'API Load Test',
            description: 'Tests API endpoints under load',
            type: 'api',
            config: {
              targetUrl: 'https://api.example.com',
              method: 'GET',
              duration: 60,
              virtualUsers: 100,
            },
            createdAt: '2025-12-21T10:00:00Z',
            updatedAt: '2025-12-21T10:00:00Z',
          },
        ],
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockScenarios,
        status: 200,
        statusText: 'OK',
      });

      const result = await loadTestingService.getScenarios();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/load-testing/scenarios');
      expect(result).toEqual(mockScenarios.scenarios);
    });

    it('returns empty array when no scenarios', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
      });

      const result = await loadTestingService.getScenarios();

      expect(result).toEqual([]);
    });

    it('handles errors when fetching scenarios', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(loadTestingService.getScenarios()).rejects.toThrow('Network error');
    });
  });

  describe('createTest', () => {
    it('creates a new load test', async () => {
      const createRequest = {
        scenarioId: 'scenario-1',
        config: {
          duration: 120,
          virtualUsers: 200,
        },
      };

      const mockTest = {
        id: 'test-1',
        scenarioId: 'scenario-1',
        scenarioName: 'API Load Test',
        status: 'pending',
        progress: 0,
        createdBy: 'user-1',
        config: {
          duration: 120,
          virtualUsers: 200,
        },
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockTest,
        status: 201,
        statusText: 'Created',
      });

      const result = await loadTestingService.createTest(createRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/public/load-testing/create', createRequest);
      expect(result).toEqual(mockTest);
    });

    it('handles errors when creating test', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Invalid scenario'));

      await expect(
        loadTestingService.createTest({ scenarioId: 'invalid' })
      ).rejects.toThrow('Invalid scenario');
    });
  });

  describe('getTest', () => {
    it('fetches test details', async () => {
      const mockTest = {
        id: 'test-1',
        scenarioId: 'scenario-1',
        scenarioName: 'API Load Test',
        status: 'completed',
        progress: 100,
        startedAt: '2025-12-21T10:00:00Z',
        completedAt: '2025-12-21T10:02:00Z',
        createdBy: 'user-1',
        config: {
          duration: 120,
          virtualUsers: 200,
        },
        result: {
          testId: 'test-1',
          status: 'completed',
          summary: {
            totalRequests: 10000,
            successfulRequests: 9850,
            failedRequests: 150,
            avgResponseTime: 125,
            minResponseTime: 50,
            maxResponseTime: 500,
            p50ResponseTime: 100,
            p95ResponseTime: 250,
            p99ResponseTime: 400,
            requestsPerSecond: 83.3,
            throughput: 10000000,
          },
        },
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockTest,
        status: 200,
        statusText: 'OK',
      });

      const result = await loadTestingService.getTest('test-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/load-testing/test-1');
      expect(result).toEqual(mockTest);
      expect(result.result?.summary.totalRequests).toBe(10000);
    });

    it('handles errors when fetching test', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Test not found'));

      await expect(loadTestingService.getTest('invalid-id')).rejects.toThrow('Test not found');
    });
  });

  describe('runTest', () => {
    it('runs a load test immediately', async () => {
      const runRequest = {
        testId: 'test-1',
        options: { immediate: true },
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: { status: 'running', testId: 'test-1' },
        status: 200,
        statusText: 'OK',
      });

      const result = await loadTestingService.runTest(runRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/public/load-testing/run', runRequest);
      expect(result.status).toBe('running');
    });

    it('schedules a load test', async () => {
      const runRequest = {
        testId: 'test-1',
        options: { scheduledAt: '2025-12-22T10:00:00Z' },
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: { status: 'scheduled', testId: 'test-1' },
        status: 200,
        statusText: 'OK',
      });

      const result = await loadTestingService.runTest(runRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/public/load-testing/run', runRequest);
      expect(result.status).toBe('scheduled');
    });

    it('handles errors when running test', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Test already running'));

      await expect(
        loadTestingService.runTest({ testId: 'test-1' })
      ).rejects.toThrow('Test already running');
    });
  });

  describe('getTestMetrics', () => {
    it('fetches test metrics', async () => {
      const mockMetrics = {
        testId: 'test-1',
        dataPoints: [
          {
            timestamp: '2025-12-21T10:00:00Z',
            activeUsers: 50,
            requestsPerSecond: 100,
            avgResponseTime: 120,
            errorRate: 0.5,
            throughput: 500000,
          },
          {
            timestamp: '2025-12-21T10:00:30Z',
            activeUsers: 100,
            requestsPerSecond: 150,
            avgResponseTime: 130,
            errorRate: 1.0,
            throughput: 750000,
          },
        ],
        latencyDistribution: [
          { range: '0-100ms', count: 5000, percentage: 50 },
          { range: '100-200ms', count: 3000, percentage: 30 },
          { range: '200-500ms', count: 2000, percentage: 20 },
        ],
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockMetrics,
        status: 200,
        statusText: 'OK',
      });

      const result = await loadTestingService.getTestMetrics('test-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/load-testing/test-1/metrics');
      expect(result).toEqual(mockMetrics);
      expect(result.dataPoints.length).toBe(2);
    });

    it('handles errors when fetching metrics', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Metrics not available'));

      await expect(loadTestingService.getTestMetrics('test-1')).rejects.toThrow('Metrics not available');
    });
  });

  describe('cancelTest', () => {
    it('cancels a running test', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        data: { status: 'cancelled' },
        status: 200,
        statusText: 'OK',
      });

      const result = await loadTestingService.cancelTest('test-1');

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/public/load-testing/test-1/cancel');
      expect(result.status).toBe('cancelled');
    });

    it('handles errors when cancelling test', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Test not running'));

      await expect(loadTestingService.cancelTest('test-1')).rejects.toThrow('Test not running');
    });
  });

  describe('getTestHistory', () => {
    it('fetches test history', async () => {
      const mockTests = {
        tests: [
          {
            id: 'test-1',
            scenarioId: 'scenario-1',
            scenarioName: 'API Load Test',
            status: 'completed',
            progress: 100,
            startedAt: '2025-12-21T10:00:00Z',
            completedAt: '2025-12-21T10:02:00Z',
            createdBy: 'user-1',
            config: { duration: 120, virtualUsers: 200 },
          },
          {
            id: 'test-2',
            scenarioId: 'scenario-2',
            scenarioName: 'WebSocket Test',
            status: 'failed',
            progress: 45,
            startedAt: '2025-12-20T14:00:00Z',
            createdBy: 'user-1',
            config: { duration: 60, virtualUsers: 50 },
          },
        ],
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockTests,
        status: 200,
        statusText: 'OK',
      });

      const result = await loadTestingService.getTestHistory();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/load-testing/results');
      expect(result).toEqual(mockTests.tests);
      expect(result.length).toBe(2);
    });

    it('returns empty array when no test history', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
      });

      const result = await loadTestingService.getTestHistory();

      expect(result).toEqual([]);
    });
  });

  describe('deleteTest', () => {
    it('deletes a test', async () => {
      mockApiClient.delete.mockResolvedValueOnce({
        data: undefined,
        status: 204,
        statusText: 'No Content',
      });

      await loadTestingService.deleteTest('test-1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/v1/public/load-testing/test-1');
    });

    it('handles errors when deleting test', async () => {
      mockApiClient.delete.mockRejectedValueOnce(new Error('Test not found'));

      await expect(loadTestingService.deleteTest('invalid-id')).rejects.toThrow('Test not found');
    });
  });
});
