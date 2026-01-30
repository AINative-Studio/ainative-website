/**
 * Load Testing Service - Backend integration for Load Testing Dashboard
 * Integrates with all backend load testing endpoints
 */

import apiClient from './api-client';

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

// Base path for load testing endpoints
const BASE_PATH = '/v1/public/load-testing';

// Load Testing Service
const loadTestingService = {
  /**
   * Get list of available test scenarios
   * Backend endpoint: GET /v1/public/load-testing/scenarios (confirmed working)
   */
  async getScenarios(): Promise<LoadTestScenario[]> {
    const response = await apiClient.get<{ scenarios: LoadTestScenario[] }>(`${BASE_PATH}/scenarios`);
    return response.data.scenarios || [];
  },

  /**
   * Create a new load test
   * TODO: Backend endpoint /v1/public/load-testing/create not yet implemented
   * This method will fail until the backend endpoint is available
   */
  async createTest(request: CreateTestRequest): Promise<LoadTest> {
    const response = await apiClient.post<LoadTest>(`${BASE_PATH}/create`, request);
    return response.data;
  },

  /**
   * Get test details and results
   * TODO: Backend endpoint /v1/public/load-testing/{testId} not yet implemented
   * This method will fail until the backend endpoint is available
   */
  async getTest(testId: string): Promise<LoadTest & { result?: LoadTestResult }> {
    const response = await apiClient.get<LoadTest & { result?: LoadTestResult }>(`${BASE_PATH}/${testId}`);
    return response.data;
  },

  /**
   * Run a load test
   * TODO: Backend endpoint /v1/public/load-testing/run not yet implemented
   * This method will fail until the backend endpoint is available
   */
  async runTest(request: RunTestRequest): Promise<{ status: string; testId: string }> {
    const response = await apiClient.post<{ status: string; testId: string }>(`${BASE_PATH}/run`, request);
    return response.data;
  },

  /**
   * Get performance metrics for a test
   * TODO: Backend endpoint /v1/public/load-testing/{testId}/metrics not yet implemented
   * This method will fail until the backend endpoint is available
   */
  async getTestMetrics(testId: string): Promise<LoadTestMetrics> {
    const response = await apiClient.get<LoadTestMetrics>(`${BASE_PATH}/${testId}/metrics`);
    return response.data;
  },

  /**
   * Cancel a running test
   * TODO: Backend endpoint /v1/public/load-testing/{testId}/cancel not yet implemented
   * This method will fail until the backend endpoint is available
   */
  async cancelTest(testId: string): Promise<{ status: string }> {
    const response = await apiClient.post<{ status: string }>(`${BASE_PATH}/${testId}/cancel`);
    return response.data;
  },

  /**
   * Get list of all tests (history/results)
   * Backend endpoint: GET /v1/public/load-testing/results (confirmed working)
   * Note: Maps to /results endpoint instead of /history
   */
  async getTestHistory(): Promise<LoadTest[]> {
    const response = await apiClient.get<{ tests: LoadTest[] }>(`${BASE_PATH}/results`);
    return response.data.tests || [];
  },

  /**
   * Delete a test
   * TODO: Backend endpoint /v1/public/load-testing/{testId} DELETE not yet implemented
   * This method will fail until the backend endpoint is available
   */
  async deleteTest(testId: string): Promise<void> {
    await apiClient.delete(`${BASE_PATH}/${testId}`);
  },
};

export default loadTestingService;
