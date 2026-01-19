/**
 * Benchmark Service
 *
 * High-level service for benchmark operations with business logic.
 * Wraps QNNApiClient for better separation of concerns and easier testing.
 *
 * @module benchmarkService
 */

import { qnnApiClient } from './QNNApiClient';
import {
  BenchmarkMetrics,
  BenchmarkRequest,
  BenchmarkResult,
} from '@/types/qnn.types';

/**
 * Benchmark Service class
 */
export class BenchmarkService {
  private apiClient = qnnApiClient;

  constructor() {
    // Use singleton instance
  }

  /**
   * Fetch all benchmark metrics
   *
   * @param modelId - Optional model ID to filter by
   * @returns Promise resolving to array of benchmark metrics
   */
  async getBenchmarks(modelId?: string): Promise<BenchmarkMetrics[]> {
    return this.apiClient.getBenchmarkMetrics(modelId);
  }

  /**
   * Fetch benchmarks for a specific model
   *
   * @param modelId - Model ID
   * @returns Promise resolving to array of benchmark metrics
   */
  async getBenchmarksByModel(modelId: string): Promise<BenchmarkMetrics[]> {
    if (!modelId) {
      throw new Error('Model ID is required');
    }
    return this.apiClient.getBenchmarkMetrics(modelId);
  }

  /**
   * Fetch a specific benchmark result
   *
   * @param benchmarkId - Benchmark ID
   * @returns Promise resolving to benchmark result
   */
  async getBenchmarkResult(benchmarkId: string): Promise<BenchmarkResult> {
    if (!benchmarkId) {
      throw new Error('Benchmark ID is required');
    }
    return this.apiClient.getBenchmarkResult(benchmarkId);
  }

  /**
   * Run a new benchmark
   *
   * @param request - Benchmark configuration
   * @returns Promise resolving to benchmark result
   */
  async runBenchmark(request: BenchmarkRequest): Promise<BenchmarkResult> {
    // Validate request
    if (!request.modelId) {
      throw new Error('Model ID is required');
    }
    if (!request.dataset) {
      throw new Error('Dataset is required');
    }

    // Set defaults
    const benchmarkRequest: BenchmarkRequest = {
      ...request,
      batchSize: request.batchSize || 32,
      iterations: request.iterations || 100,
    };

    return this.apiClient.runBenchmark(benchmarkRequest);
  }

  /**
   * Compare benchmarks across multiple models
   *
   * @param modelIds - Array of model IDs
   * @returns Promise resolving to map of model ID to benchmark metrics
   */
  async compareBenchmarks(
    modelIds: string[]
  ): Promise<Record<string, BenchmarkMetrics[]>> {
    if (!modelIds || modelIds.length === 0) {
      throw new Error('At least one model ID is required');
    }

    // Fetch benchmarks for all models in parallel
    const results = await Promise.allSettled(
      modelIds.map((id) => this.apiClient.getBenchmarkMetrics(id))
    );

    // Create a map of modelId to benchmark metrics
    const benchmarkMap: Record<string, BenchmarkMetrics[]> = {};
    modelIds.forEach((id, index) => {
      const result = results[index];
      benchmarkMap[id] =
        result.status === 'fulfilled' ? result.value : [];
    });

    return benchmarkMap;
  }

  /**
   * Get the latest benchmark for a model
   *
   * @param modelId - Model ID
   * @returns Promise resolving to latest benchmark metrics or null
   */
  async getLatestBenchmark(
    modelId: string
  ): Promise<BenchmarkMetrics | null> {
    const benchmarks = await this.getBenchmarksByModel(modelId);
    if (benchmarks.length === 0) {
      return null;
    }

    // Sort by timestamp descending and return the first one
    return (
      benchmarks.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0] || null
    );
  }

  /**
   * Calculate average metrics across all benchmarks for a model
   *
   * @param modelId - Model ID
   * @returns Promise resolving to average metrics
   */
  async getAverageBenchmarkMetrics(modelId: string): Promise<{
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    inferenceTime: number;
    throughput: number;
    memoryUsage: number;
  } | null> {
    const benchmarks = await this.getBenchmarksByModel(modelId);
    if (benchmarks.length === 0) {
      return null;
    }

    const sum = benchmarks.reduce(
      (acc, benchmark) => ({
        accuracy: acc.accuracy + benchmark.metrics.accuracy,
        precision: acc.precision + benchmark.metrics.precision,
        recall: acc.recall + benchmark.metrics.recall,
        f1Score: acc.f1Score + benchmark.metrics.f1Score,
        inferenceTime: acc.inferenceTime + benchmark.metrics.inferenceTime,
        throughput: acc.throughput + benchmark.metrics.throughput,
        memoryUsage: acc.memoryUsage + benchmark.metrics.memoryUsage,
      }),
      {
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0,
        inferenceTime: 0,
        throughput: 0,
        memoryUsage: 0,
      }
    );

    const count = benchmarks.length;
    return {
      accuracy: sum.accuracy / count,
      precision: sum.precision / count,
      recall: sum.recall / count,
      f1Score: sum.f1Score / count,
      inferenceTime: sum.inferenceTime / count,
      throughput: sum.throughput / count,
      memoryUsage: sum.memoryUsage / count,
    };
  }

  /**
   * Filter benchmarks by dataset
   *
   * @param modelId - Model ID
   * @param dataset - Dataset name
   * @returns Promise resolving to filtered benchmarks
   */
  async getBenchmarksByDataset(
    modelId: string,
    dataset: string
  ): Promise<BenchmarkMetrics[]> {
    const benchmarks = await this.getBenchmarksByModel(modelId);
    return benchmarks.filter((b) => b.dataset === dataset);
  }

  /**
   * Check if a benchmark is still running
   *
   * @param benchmarkId - Benchmark ID
   * @returns Promise resolving to boolean
   */
  async isBenchmarkRunning(benchmarkId: string): Promise<boolean> {
    const result = await this.getBenchmarkResult(benchmarkId);
    return result.status === 'running';
  }

  /**
   * Wait for benchmark completion with polling
   *
   * @param benchmarkId - Benchmark ID
   * @param interval - Polling interval in ms (default: 3000)
   * @param maxAttempts - Maximum polling attempts (default: 100)
   * @returns Promise resolving to completed benchmark result
   */
  async waitForBenchmarkCompletion(
    benchmarkId: string,
    interval: number = 3000,
    maxAttempts: number = 100
  ): Promise<BenchmarkResult> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      const result = await this.getBenchmarkResult(benchmarkId);

      if (result.status === 'completed') {
        return result;
      }

      if (result.status === 'failed') {
        throw new Error(result.error || 'Benchmark failed');
      }

      attempts++;
      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    throw new Error('Benchmark polling timeout');
  }
}

// Export singleton instance
const benchmarkService = new BenchmarkService();
export default benchmarkService;
