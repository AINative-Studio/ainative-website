/**
 * QNN API Client Service
 *
 * Handles all communication with the Quantum Neural Network (QNN) backend API.
 * Implements comprehensive error handling, retry logic, and authentication.
 *
 * Features:
 * - Automatic JWT token injection from AINative auth
 * - Exponential backoff retry strategy
 * - Request/response interceptors
 * - Timeout handling
 * - Type-safe API methods
 * - Comprehensive error handling with custom error classes
 *
 * @module QNNApiClient
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { appConfig } from '@/lib/config/app';

// API Error response data structure
interface ApiErrorResponseData {
  error?: {
    message?: string;
    details?: Record<string, unknown>;
  };
  message?: string;
  details?: Record<string, unknown>;
}

// Training status response structure
interface TrainingStatusResponse {
  status?: TrainingStatusType;
}

// Signature response structures
interface SignatureResponse {
  signature_id: string;
  signature_hash: string;
  model_id: string;
  created_at: string;
}

interface VerifySignatureResponse {
  valid: boolean;
  model_id: string;
  signature_hash?: string;
  verified_at: string;
}

interface ApplySignatureResponse {
  success: boolean;
  model_id: string;
  signature_id: string;
  applied_at: string;
}
import {
  Repository,
  RepositorySearchParams,
  RepositoryAnalysis,
  Model,
  CreateModelRequest,
  UpdateModelRequest,
  ModelMetadata,
  TrainingJob,
  StartTrainingRequest,
  TrainingStatus as TrainingStatusType,
  TrainingLogs,
  TrainingHistory,
  BenchmarkMetrics,
  BenchmarkRequest,
  BenchmarkResult,
  ModelEvaluation,
  EvaluationMetrics,
  EvaluationRequest,
  QuantumMetrics,
  PerformanceMetrics,
  CostTracking,
  ApiResponse,
  PaginatedResponse,
  ApiError,
} from '@/types/qnn.types';

// ============================================================================
// Custom Error Classes
// ============================================================================

/**
 * Base QNN Error class
 */
export class QNNError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: string;

  constructor(
    message: string,
    code: string = 'QNN_ERROR',
    statusCode?: number,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'QNNError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, QNNError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

/**
 * Authentication error - 401 responses
 */
export class QNNAuthenticationError extends QNNError {
  constructor(message: string = 'Authentication failed', details?: Record<string, unknown>) {
    super(message, 'QNN_AUTH_ERROR', 401, details);
    this.name = 'QNNAuthenticationError';
  }
}

/**
 * Authorization error - 403 responses
 */
export class QNNAuthorizationError extends QNNError {
  constructor(message: string = 'Authorization failed', details?: Record<string, unknown>) {
    super(message, 'QNN_AUTHORIZATION_ERROR', 403, details);
    this.name = 'QNNAuthorizationError';
  }
}

/**
 * Not found error - 404 responses
 */
export class QNNNotFoundError extends QNNError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id '${id}' not found` : `${resource} not found`;
    super(message, 'QNN_NOT_FOUND', 404);
    this.name = 'QNNNotFoundError';
  }
}

/**
 * Validation error - 400 responses
 */
export class QNNValidationError extends QNNError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'QNN_VALIDATION_ERROR', 400, details);
    this.name = 'QNNValidationError';
  }
}

/**
 * Network error - connection issues
 */
export class QNNNetworkError extends QNNError {
  constructor(message: string = 'Network request failed', details?: Record<string, unknown>) {
    super(message, 'QNN_NETWORK_ERROR', undefined, details);
    this.name = 'QNNNetworkError';
  }
}

/**
 * Timeout error - 408 responses or client timeout
 */
export class QNNTimeoutError extends QNNError {
  constructor(message: string = 'Request timeout', details?: Record<string, unknown>) {
    super(message, 'QNN_TIMEOUT_ERROR', 408, details);
    this.name = 'QNNTimeoutError';
  }
}

/**
 * Rate limit error - 429 responses
 */
export class QNNRateLimitError extends QNNError {
  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 'QNN_RATE_LIMIT', 429, { retryAfter });
    this.name = 'QNNRateLimitError';
  }
}

/**
 * Server error - 5xx responses
 */
export class QNNServerError extends QNNError {
  constructor(message: string = 'Internal server error', statusCode: number = 500) {
    super(message, 'QNN_SERVER_ERROR', statusCode);
    this.name = 'QNNServerError';
  }
}

// ============================================================================
// Retry Configuration
// ============================================================================

interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryableStatuses: number[];
  shouldRetry: (error: AxiosError) => boolean;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000, // Start with 1 second
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  shouldRetry: (error: AxiosError) => {
    // Retry on network errors
    if (!error.response) return true;

    // Retry on specific status codes
    const status = error.response.status;
    return DEFAULT_RETRY_CONFIG.retryableStatuses.includes(status);
  },
};

// ============================================================================
// QNN API Client Class
// ============================================================================

/**
 * QNN API Client
 *
 * Main service class for interacting with the QNN backend API.
 * Handles authentication, retries, error handling, and provides
 * type-safe methods for all API endpoints.
 */
export class QNNApiClient {
  private readonly client: AxiosInstance;
  private readonly baseURL: string;
  private readonly timeout: number;
  private readonly retryConfig: RetryConfig;

  constructor(
    baseURL?: string,
    timeout: number = 30000,
    retryConfig: Partial<RetryConfig> = {}
  ) {
    // Use provided baseURL or fall back to config or default
    this.baseURL = baseURL || appConfig.qnn.apiUrl || 'https://qnn-api.ainative.studio';
    this.timeout = timeout;
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };

    // Create axios instance
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Setup interceptors
    this.setupRequestInterceptor();
    this.setupResponseInterceptor();

    console.log(`🔬 QNN API Client initialized with baseURL: ${this.baseURL}`);
  }

  // ==========================================================================
  // Private Helper Methods
  // ==========================================================================

  /**
   * Get JWT token from localStorage (shared with AINative auth)
   */
  private getAuthToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Check if user is authenticated
   */
  private isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  /**
   * Setup request interceptor for authentication and logging
   */
  private setupRequestInterceptor(): void {
    this.client.interceptors.request.use(
      (config) => {
        // Add authentication token to all requests
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Log requests in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔬 QNN API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
      },
      (error) => {
        console.error('🔬 QNN Request interceptor error:', error);
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Setup response interceptor for error handling and retries
   */
  private setupResponseInterceptor(): void {
    this.client.interceptors.response.use(
      (response) => {
        // Log successful responses in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔬 QNN API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
        }
        return response;
      },
      async (error: AxiosError) => {
        return this.handleRetry(error);
      }
    );
  }

  /**
   * Handle request retries with exponential backoff
   */
  private async handleRetry(error: AxiosError): Promise<AxiosResponse> {
    const config = error.config as AxiosRequestConfig & { _retryCount?: number };

    // Initialize retry count
    if (!config._retryCount) {
      config._retryCount = 0;
    }

    // Check if we should retry
    const shouldRetry =
      config._retryCount < this.retryConfig.maxRetries &&
      this.retryConfig.shouldRetry(error);

    if (!shouldRetry) {
      return Promise.reject(this.handleError(error));
    }

    // Increment retry count
    config._retryCount++;

    // Calculate delay with exponential backoff
    const delay = this.retryConfig.retryDelay * Math.pow(2, config._retryCount - 1);

    console.log(
      `🔬 Retrying request (${config._retryCount}/${this.retryConfig.maxRetries}) after ${delay}ms...`
    );

    // Wait before retrying
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Retry the request
    return this.client.request(config);
  }

  /**
   * Handle and transform errors into custom error classes
   */
  private handleError(error: unknown): QNNError {
    // Network errors (no response)
    if (axios.isAxiosError(error) && !error.response) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return new QNNTimeoutError('Request timeout - QNN API did not respond in time');
      }
      return new QNNNetworkError('Network error - unable to reach QNN API', {
        originalError: error.message,
      });
    }

    // HTTP errors (with response)
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      const data = error.response.data as ApiErrorResponseData;
      const message = data?.error?.message || data?.message || error.message;
      const details = data?.error?.details || data?.details;

      switch (status) {
        case 400:
          return new QNNValidationError(message, details);
        case 401:
          return new QNNAuthenticationError(message, details);
        case 403:
          return new QNNAuthorizationError(message, details);
        case 404:
          return new QNNNotFoundError(message);
        case 408:
          return new QNNTimeoutError(message);
        case 429:
          const retryAfter = error.response.headers['retry-after'];
          return new QNNRateLimitError(message, retryAfter ? parseInt(retryAfter) : undefined);
        case 500:
        case 502:
        case 503:
        case 504:
          return new QNNServerError(message, status);
        default:
          return new QNNError(message, 'QNN_ERROR', status, details);
      }
    }

    // Unknown errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new QNNError(
      errorMessage,
      'QNN_UNKNOWN_ERROR',
      undefined,
      { originalError: String(error) }
    );
  }

  /**
   * Extract data from API response
   */
  private extractData<T>(response: AxiosResponse<T>): T {
    // QNN API returns data directly, not wrapped in {data: ...}
    return response.data;
  }

  // ==========================================================================
  // Repository Management Methods
  // ==========================================================================

  /**
   * List all repositories
   *
   * @param params - Optional query parameters
   * @returns Promise resolving to paginated repository response
   */
  async listRepositories(params?: RepositorySearchParams): Promise<PaginatedResponse<Repository>> {
    try {
      const response = await this.client.get<PaginatedResponse<Repository>>('/v1/repositories', { params });
      return this.extractData(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Search repositories with filters
   *
   * @param params - Search parameters (query, language, stars, etc.)
   * @returns Promise resolving to paginated repository results
   */
  async searchRepositories(params: RepositorySearchParams): Promise<PaginatedResponse<Repository>> {
    try {
      const response = await this.client.post<PaginatedResponse<Repository>>('/v1/repositories/search', params);
      return this.extractData(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get repository details by ID
   *
   * @param id - Repository ID
   * @returns Promise resolving to repository details
   */
  async getRepository(id: string): Promise<Repository> {
    try {
      const response = await this.client.get<ApiResponse<Repository>>(`/v1/repositories/${id}`);
      const apiResponse = this.extractData(response);
      return apiResponse.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get repository analysis by ID
   *
   * @param id - Repository ID
   * @returns Promise resolving to repository analysis
   */
  async getRepositoryAnalysis(id: string): Promise<RepositoryAnalysis> {
    try {
      const response = await this.client.get<ApiResponse<RepositoryAnalysis>>(
        `/v1/repositories/${id}/analysis`
      );
      const apiResponse = this.extractData(response);
      return apiResponse.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Analyze a repository (trigger new analysis)
   *
   * @param id - Repository ID
   * @returns Promise resolving to API response with analysis results
   */
  async analyzeRepository(id: string): Promise<ApiResponse<RepositoryAnalysis>> {
    try {
      const response = await this.client.post<ApiResponse<RepositoryAnalysis>>(
        `/v1/repositories/${id}/analyze`
      );
      return this.extractData(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==========================================================================
  // Model Management Methods
  // ==========================================================================

  /**
   * List all models
   *
   * @param filters - Optional filters (status, architecture, etc.)
   * @returns Promise resolving to array of models
   */
  async listModels(filters?: Record<string, unknown>): Promise<Model[]> {
    try {
      const response = await this.client.get<ApiResponse<Model[]>>('/v1/models', {
        params: filters,
      });
      const apiResponse = this.extractData(response);
      return apiResponse.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new model
   *
   * @param data - Model creation data
   * @returns Promise resolving to created model
   */
  async createModel(data: CreateModelRequest): Promise<Model> {
    try {
      const response = await this.client.post<ApiResponse<Model>>('/v1/models', data);
      const apiResponse = this.extractData(response);
      return apiResponse.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get model details by ID
   *
   * @param id - Model ID
   * @returns Promise resolving to model details
   */
  async getModel(id: string): Promise<Model> {
    try {
      const response = await this.client.get<ApiResponse<Model>>(`/v1/models/${id}`);
      const apiResponse = this.extractData(response);
      return apiResponse.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update model
   *
   * @param id - Model ID
   * @param data - Update data
   * @returns Promise resolving to updated model
   */
  async updateModel(id: string, data: UpdateModelRequest): Promise<Model> {
    try {
      const response = await this.client.put<ApiResponse<Model>>(`/v1/models/${id}`, data);
      const apiResponse = this.extractData(response);
      return apiResponse.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete model by ID
   *
   * @param id - Model ID
   * @returns Promise resolving when deletion is complete
   */
  async deleteModel(id: string): Promise<void> {
    try {
      await this.client.delete(`/v1/models/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get model metadata and statistics
   *
   * @param id - Model ID
   * @returns Promise resolving to model metadata
   */
  async getModelMetadata(id: string): Promise<ModelMetadata> {
    try {
      const response = await this.client.get<ApiResponse<ModelMetadata>>(
        `/v1/models/${id}/metadata`
      );
      const apiResponse = this.extractData(response);
      return apiResponse.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==========================================================================
  // Training Methods
  // ==========================================================================

  /**
   * Start a training job
   *
   * @param config - Training configuration
   * @returns Promise resolving to training job details
   */
  async startTraining(config: StartTrainingRequest): Promise<TrainingJob> {
    try {
      const response = await this.client.post<ApiResponse<TrainingJob>>(
        '/v1/training/start',
        config
      );
      const apiResponse = this.extractData(response);
      return apiResponse.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get training job status
   *
   * @param id - Training job ID
   * @returns Promise resolving to training status
   */
  async getTrainingStatus(id: string): Promise<TrainingStatusType> {
    try {
      const response = await this.client.get<TrainingStatusResponse>(`/v1/training/${id}/status`);
      const data = this.extractData(response);
      return data.status || (data as unknown as TrainingStatusType);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get training job details
   *
   * @param id - Training job ID
   * @returns Promise resolving to training job
   */
  async getTrainingJob(id: string): Promise<TrainingJob> {
    try {
      const response = await this.client.get<ApiResponse<TrainingJob>>(`/v1/training/${id}`);
      const apiResponse = this.extractData(response);
      return apiResponse.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get training logs
   *
   * @param id - Training job ID
   * @param offset - Log offset (for pagination)
   * @param limit - Number of log lines to fetch
   * @returns Promise resolving to training logs
   */
  async getTrainingLogs(id: string, offset: number = 0, limit: number = 100): Promise<TrainingLogs> {
    try {
      const response = await this.client.get<ApiResponse<TrainingLogs>>(
        `/v1/training/${id}/logs`,
        {
          params: { offset, limit },
        }
      );
      const apiResponse = this.extractData(response);
      return apiResponse.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Stop a running training job
   *
   * @param id - Training job ID
   * @returns Promise resolving when job is stopped
   */
  async stopTraining(id: string): Promise<void> {
    try {
      await this.client.post(`/v1/training/${id}/stop`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get training history
   *
   * @param modelId - Optional model ID to filter by
   * @param page - Page number
   * @param pageSize - Items per page
   * @returns Promise resolving to paginated training history
   */
  async getTrainingHistory(
    modelId?: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<TrainingJob>> {
    try {
      const response = await this.client.get<ApiResponse<PaginatedResponse<TrainingJob>>>(
        '/v1/training/history',
        {
          params: { modelId, page, pageSize },
        }
      );
      const apiResponse = this.extractData(response);
      return apiResponse.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==========================================================================
  // Benchmarking Methods
  // ==========================================================================

  /**
   * Get benchmark metrics for a model
   *
   * @param modelId - Optional model ID to filter by
   * @returns Promise resolving to array of benchmark metrics
   */
  async getBenchmarkMetrics(modelId?: string): Promise<BenchmarkMetrics[]> {
    try {
      const response = await this.client.get<ApiResponse<BenchmarkMetrics[]>>(
        '/v1/benchmarking/metrics',
        {
          params: { modelId },
        }
      );
      const apiResponse = this.extractData(response);
      return apiResponse.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Run a benchmark
   *
   * @param config - Benchmark configuration
   * @returns Promise resolving to benchmark result
   */
  async runBenchmark(config: BenchmarkRequest): Promise<BenchmarkResult> {
    try {
      const response = await this.client.post<ApiResponse<BenchmarkResult>>(
        '/v1/benchmarking/run',
        config
      );
      const apiResponse = this.extractData(response);
      return apiResponse.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get benchmark results
   *
   * @param benchmarkId - Benchmark ID
   * @returns Promise resolving to benchmark result
   */
  async getBenchmarkResult(benchmarkId: string): Promise<BenchmarkResult> {
    try {
      const response = await this.client.get<ApiResponse<BenchmarkResult>>(
        `/v1/benchmarking/results/${benchmarkId}`
      );
      const apiResponse = this.extractData(response);
      return apiResponse.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==========================================================================
  // Evaluation Methods
  // ==========================================================================

  /**
   * Get model evaluation results
   *
   * @param modelId - Model ID to get evaluation for
   * @returns Promise resolving to model evaluation
   */
  async getModelEvaluation(modelId: string): Promise<ModelEvaluation> {
    try {
      const response = await this.client.get<ApiResponse<ModelEvaluation>>(
        `/v1/models/${modelId}/evaluation`
      );
      const apiResponse = this.extractData(response);
      return apiResponse.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get evaluation metrics for a model (lightweight)
   *
   * @param modelId - Model ID
   * @returns Promise resolving to evaluation metrics
   */
  async getEvaluationMetrics(modelId: string): Promise<EvaluationMetrics> {
    try {
      const response = await this.client.get<ApiResponse<EvaluationMetrics>>(
        `/v1/models/${modelId}/evaluation/metrics`
      );
      const apiResponse = this.extractData(response);
      return apiResponse.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Run evaluation on a model
   *
   * @param request - Evaluation request configuration
   * @returns Promise resolving to evaluation result
   */
  async evaluateModel(request: EvaluationRequest): Promise<ApiResponse<ModelEvaluation>> {
    try {
      const response = await this.client.post<ApiResponse<ModelEvaluation>>(
        '/v1/evaluation/run',
        request
      );
      return this.extractData(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Compare evaluations across multiple models
   *
   * @param modelIds - Array of model IDs to compare
   * @returns Promise resolving to array of model evaluations
   */
  async compareEvaluations(modelIds: string[]): Promise<ModelEvaluation[]> {
    try {
      const response = await this.client.post<ApiResponse<ModelEvaluation[]>>(
        '/v1/evaluation/compare',
        { modelIds }
      );
      const apiResponse = this.extractData(response);
      return apiResponse.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Export evaluation report
   *
   * @param modelId - Model ID
   * @param format - Export format (pdf, json, csv)
   * @returns Promise resolving to file blob
   */
  async exportEvaluationReport(
    modelId: string,
    format: 'pdf' | 'json' | 'csv'
  ): Promise<Blob> {
    try {
      const response = await this.client.get<Blob>(
        `/v1/models/${modelId}/evaluation/export`,
        {
          params: { format },
          responseType: 'blob',
        }
      );
      return this.extractData(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==========================================================================
  // Monitoring Methods
  // ==========================================================================

  /**
   * Get quantum metrics
   *
   * @param modelId - Optional model ID to filter by
   * @param startTime - Optional start time for time range
   * @param endTime - Optional end time for time range
   * @returns Promise resolving to quantum metrics
   */
  async getQuantumMetrics(
    modelId?: string,
    startTime?: string,
    endTime?: string
  ): Promise<QuantumMetrics[]> {
    try {
      const response = await this.client.get<ApiResponse<QuantumMetrics[]>>(
        '/v1/monitoring/quantum',
        {
          params: { modelId, startTime, endTime },
        }
      );
      const apiResponse = this.extractData(response);
      return apiResponse.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get performance metrics
   *
   * @param modelId - Optional model ID to filter by
   * @param startTime - Optional start time for time range
   * @param endTime - Optional end time for time range
   * @returns Promise resolving to performance metrics
   */
  async getPerformanceMetrics(
    modelId?: string,
    startTime?: string,
    endTime?: string
  ): Promise<PerformanceMetrics[]> {
    try {
      const response = await this.client.get<ApiResponse<PerformanceMetrics[]>>(
        '/v1/monitoring/performance',
        {
          params: { modelId, startTime, endTime },
        }
      );
      const apiResponse = this.extractData(response);
      return apiResponse.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get cost tracking data
   *
   * @param modelId - Optional model ID to filter by
   * @param period - Time period (hourly, daily, weekly, monthly)
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Promise resolving to cost tracking data
   */
  async getCostTracking(
    modelId?: string,
    period: 'hourly' | 'daily' | 'weekly' | 'monthly' = 'daily',
    startDate?: string,
    endDate?: string
  ): Promise<CostTracking> {
    try {
      const response = await this.client.get<ApiResponse<CostTracking>>(
        '/v1/monitoring/costs',
        {
          params: { modelId, period, startDate, endDate },
        }
      );
      const apiResponse = this.extractData(response);
      return apiResponse.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==========================================================================
  // Code Analysis Methods
  // ==========================================================================

  /**
   * Analyze code quality using ML model
   *
   * @param code - Source code to analyze
   * @param language - Programming language
   * @param options - Optional analysis options
   * @returns Promise resolving to code analysis result
   */
  async analyzeCode(
    code: string,
    language: string,
    options?: { include_suggestions?: boolean; include_normalized_features?: boolean; detailed_metrics?: boolean }
  ): Promise<{
    quality_score: number;
    features: {
      file_size_bytes: number;
      line_count: number;
      comment_count: number;
      function_count: number;
      class_count: number;
      avg_function_length: number;
      cyclomatic_complexity?: number;
      comment_ratio?: number;
    };
    normalized_features?: number[];
    suggestions?: string[];
    language: string;
    timestamp: string;
    model_version?: string;
    analysis_id?: string;
  }> {
    try {
      const response = await this.client.post<ApiResponse<{
        quality_score: number;
        features: {
          file_size_bytes: number;
          line_count: number;
          comment_count: number;
          function_count: number;
          class_count: number;
          avg_function_length: number;
          cyclomatic_complexity?: number;
          comment_ratio?: number;
        };
        normalized_features?: number[];
        suggestions?: string[];
        language: string;
        timestamp: string;
        model_version?: string;
        analysis_id?: string;
      }>>(
        '/v1/code/analyze',
        {
          code,
          language,
          options: {
            include_suggestions: true,
            include_normalized_features: true,
            ...options,
          },
        }
      );
      const apiResponse = this.extractData(response);
      return apiResponse.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Extract code features using ML model
   *
   * @param code - Source code to analyze
   * @param language - Programming language
   * @returns Promise resolving to code metrics
   */
  async extractCodeFeatures(
    code: string,
    language: string
  ): Promise<{
    file_size_bytes: number;
    line_count: number;
    comment_count: number;
    function_count: number;
    class_count: number;
    avg_function_length: number;
    cyclomatic_complexity?: number;
    comment_ratio?: number;
  }> {
    try {
      const response = await this.client.post<ApiResponse<{
        file_size_bytes: number;
        line_count: number;
        comment_count: number;
        function_count: number;
        class_count: number;
        avg_function_length: number;
        cyclomatic_complexity?: number;
        comment_ratio?: number;
      }>>(
        '/v1/code/features',
        { code, language }
      );
      const apiResponse = this.extractData(response);
      return apiResponse.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get quality score for code
   *
   * @param code - Source code to evaluate
   * @param language - Programming language
   * @returns Promise resolving to quality score (0-1)
   */
  async getCodeQualityScore(
    code: string,
    language: string
  ): Promise<number> {
    try {
      const response = await this.client.post<ApiResponse<{ quality_score: number }>>(
        '/v1/code/quality',
        { code, language }
      );
      const apiResponse = this.extractData(response);
      return apiResponse.data.quality_score;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==========================================================================
  // Signature Management Methods
  // ==========================================================================

  /**
   * Sign a model with a quantum signature
   *
   * @param modelId - Model ID to sign
   * @param key - Optional signing key
   * @returns Promise resolving to signature response
   */
  async signModel(modelId: string, key?: string): Promise<SignatureResponse> {
    try {
      const response = await this.client.post<SignatureResponse>('/v1/signing/sign', {
        model_id: modelId,
        key,
      });
      return this.extractData(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify a model's quantum signature
   *
   * @param modelId - Model ID to verify
   * @param signature - Signature hash to verify (optional, uses model's current signature if not provided)
   * @returns Promise resolving to verification response
   */
  async verifySignature(modelId: string, signature?: string): Promise<VerifySignatureResponse> {
    try {
      const response = await this.client.post<VerifySignatureResponse>('/v1/signing/verify', {
        model_id: modelId,
        signature,
      });
      return this.extractData(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Apply an existing signature to a model
   *
   * @param modelId - Model ID to apply signature to
   * @param signatureId - Signature ID or signature hash to apply
   * @returns Promise resolving to apply signature response
   */
  async applySignature(modelId: string, signatureId: string): Promise<ApplySignatureResponse> {
    try {
      const response = await this.client.post<ApplySignatureResponse>('/v1/signing/apply', {
        model_id: modelId,
        signature_id: signatureId,
      });
      return this.extractData(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  /**
   * Health check endpoint
   *
   * @returns Promise resolving to health status
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get API version
   *
   * @returns Promise resolving to API version info
   */
  async getVersion(): Promise<{ version: string; buildDate: string }> {
    try {
      const response = await this.client.get('/version');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

/**
 * Singleton instance of QNN API Client
 * Use this instance throughout the application for consistency
 */
export const qnnApiClient = new QNNApiClient();

// Export types for convenience
export type {
  Repository,
  RepositorySearchParams,
  RepositoryAnalysis,
  Model,
  CreateModelRequest,
  UpdateModelRequest,
  TrainingJob,
  StartTrainingRequest,
  TrainingLogs,
  BenchmarkMetrics,
  BenchmarkRequest,
  BenchmarkResult,
  QuantumMetrics,
  PerformanceMetrics,
  CostTracking,
};
