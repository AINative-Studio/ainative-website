/**
 * Load Testing Service - Backend integration for Load Testing Dashboard
 * Integrates with all backend load testing endpoints
 * Fixed in Bug #445: All endpoints now use /v1/public/ prefix
 * Fixed in Issue #564: Removed mock data fallbacks, added proper error handling
 */

import apiClient from './api-client';

// Error Types
export interface LoadTestingError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export class LoadTestingServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'LoadTestingServiceError';
  }
}

// Types
export interface LoadTestScenario {
  id: string;
  name: string;
  description: string;
  type: 'api' | 'websocket' | 'grpc' | 'mixed';
  config: {
    targetUrl: string;
    method: string;
    headers?: Record<string, string>;
    body?: string;
    duration: number;
    virtualUsers: number;
    rampUp?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LoadTest {
  id: string;
  scenarioId: string;
  scenarioName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startedAt?: string;
  completedAt?: string;
  createdBy: string;
  config: {
    duration: number;
    virtualUsers: number;
    rampUp?: number;
  };
}

export interface LoadTestResult {
  testId: string;
  status: 'completed' | 'failed';
  summary: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    avgResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
    p50ResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    requestsPerSecond: number;
    throughput: number;
  };
  errors?: Array<{
    code: string;
    message: string;
    count: number;
  }>;
}

export interface LoadTestMetrics {
  testId: string;
  dataPoints: Array<{
    timestamp: string;
    activeUsers: number;
    requestsPerSecond: number;
    avgResponseTime: number;
    errorRate: number;
    throughput: number;
  }>;
  latencyDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
}

export interface CreateTestRequest {
  scenarioId: string;
  config?: {
    duration?: number;
    virtualUsers?: number;
    rampUp?: number;
  };
  name?: string;
}

export interface RunTestRequest {
  testId: string;
  options?: {
    immediate?: boolean;
    scheduledAt?: string;
  };
}

// Load Testing Service
const loadTestingService = {
  /**
   * Get list of available test scenarios
   */
  async getScenarios(): Promise<LoadTestScenario[]> {
    const response = await apiClient.get<{ scenarios: LoadTestScenario[] }>('/v1/public/load-testing/scenarios');
    return response.data.scenarios || [];
  },

  /**
   * Create a new load test
   */
  async createTest(request: CreateTestRequest): Promise<LoadTest> {
    const response = await apiClient.post<LoadTest>('/v1/public/load-testing/create', request);
    return response.data;
  },

  /**
   * Get test details and results
   */
  async getTest(testId: string): Promise<LoadTest & { result?: LoadTestResult }> {
    const response = await apiClient.get<LoadTest & { result?: LoadTestResult }>(`/v1/public/load-testing/${testId}`);
    return response.data;
  },

  /**
   * Run a load test
   */
  async runTest(request: RunTestRequest): Promise<{ status: string; testId: string }> {
    const response = await apiClient.post<{ status: string; testId: string }>('/v1/public/load-testing/run', request);
    return response.data;
  },

  /**
   * Get performance metrics for a test
   */
  async getTestMetrics(testId: string): Promise<LoadTestMetrics> {
    const response = await apiClient.get<LoadTestMetrics>(`/v1/public/load-testing/${testId}/metrics`);
    return response.data;
  },

  /**
   * Cancel a running test
   */
  async cancelTest(testId: string): Promise<{ status: string }> {
    const response = await apiClient.post<{ status: string }>(`/v1/public/load-testing/${testId}/cancel`);
    return response.data;
  },

  /**
   * Get list of all tests (history) - maps to /results endpoint
   * Fixed in Bug #445: Changed from /history to /results
   */
  async getTestHistory(): Promise<LoadTest[]> {
    const response = await apiClient.get<{ tests: LoadTest[] }>('/v1/public/load-testing/results');
    return response.data.tests || [];
  },

  /**
   * Delete a test
   */
  async deleteTest(testId: string): Promise<void> {
    await apiClient.delete(`/v1/public/load-testing/${testId}`);
  },
};

export default loadTestingService;
