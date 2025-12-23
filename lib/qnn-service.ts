/**
 * QNN (Quantum Neural Network) Service
 *
 * Provides API client for interacting with the QNN backend service.
 * Handles repository management, model training, evaluation, quantum signatures,
 * benchmarking, code quality assessment, and quantum monitoring.
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface Repository {
  id: string;
  name: string;
  owner: string;
  url: string;
  description?: string;
  language?: string;
  stars?: number;
  lastUpdated?: string;
  isConnected?: boolean;
}

export interface QNNModel {
  id: string;
  name: string;
  description?: string;
  repositoryId: string;
  architecture: {
    layers: number;
    qubits: number;
    depth: number;
  };
  hyperparameters: {
    learningRate: number;
    batchSize: number;
    epochs: number;
    optimizer: string;
  };
  status: 'draft' | 'training' | 'trained' | 'deployed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface TrainingJob {
  id: string;
  modelId: string;
  modelName: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  currentEpoch: number;
  totalEpochs: number;
  startedAt: Date;
  completedAt?: Date;
  metrics: {
    loss: number;
    accuracy: number;
    valLoss?: number;
    valAccuracy?: number;
  };
  logs?: string[];
}

export interface EvaluationMetrics {
  modelId: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  loss: number;
  confusionMatrix?: number[][];
  timestamp: string;
}

export interface QuantumSignature {
  id: string;
  modelId: string;
  signature: string;
  algorithm: 'qiskit' | 'cirq' | 'pennylane';
  quantumState: {
    qubits: number;
    entanglement: number;
    coherence: number;
  };
  timestamp: string;
  verified: boolean;
}

export interface BenchmarkResult {
  id: string;
  modelId: string;
  quantumMetrics: {
    qubits: number;
    depth: number;
    gates: number;
    executionTime: number;
    accuracy: number;
  };
  classicalMetrics: {
    parameters: number;
    executionTime: number;
    accuracy: number;
  };
  improvement: {
    speed: number;
    accuracy: number;
  };
  timestamp: string;
}

export interface CodeQualityResult {
  repositoryId: string;
  overallScore: number;
  metrics: {
    complexity: number;
    maintainability: number;
    testCoverage: number;
    documentation: number;
  };
  issues: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    type: string;
    message: string;
    file?: string;
    line?: number;
  }>;
  timestamp: string;
}

export interface QuantumMetrics {
  deviceId: string;
  qubits: number;
  coherenceTime: number;
  gateError: number;
  readoutError: number;
  temperature: number;
  uptime: number;
  timestamp: string;
}

export interface DeviceStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  qubits: number;
  availability: number;
  queue: number;
}

export interface QuantumAnomaly {
  id: string;
  deviceId: string;
  type: 'coherence-drop' | 'gate-error' | 'readout-error' | 'temperature-spike';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

// ============================================================================
// API Configuration
// ============================================================================

const QNN_API_BASE_URL = 'https://qnn-api.ainative.studio';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

// ============================================================================
// HTTP Client Helper
// ============================================================================

async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  // Build URL with query parameters
  const url = new URL(`${QNN_API_BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  // Add authentication headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Get auth token from session storage or environment
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem('qnn_auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url.toString(), {
    ...fetchOptions,
    headers: {
      ...headers,
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    const errorMessage = error.error || error.message || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(errorMessage);
  }

  return response.json();
}

// ============================================================================
// QNN Service API
// ============================================================================

export const qnnService = {
  // --------------------------------------------------------------------------
  // Repository Operations
  // --------------------------------------------------------------------------

  /**
   * Search for repositories by query string or filters
   */
  async searchRepositories(
    queryOrFilters: string | Record<string, unknown>
  ): Promise<{ repositories: Repository[]; total: number }> {
    if (typeof queryOrFilters === 'string') {
      // Simple string query
      return fetchWithAuth<{ repositories: Repository[]; total: number }>(
        '/api/repositories/search',
        {
          params: { q: queryOrFilters },
        }
      );
    } else {
      // Advanced filters with POST
      return fetchWithAuth<{ repositories: Repository[]; total: number }>(
        '/api/v1/repositories/search',
        {
          method: 'POST',
          body: JSON.stringify(queryOrFilters),
        }
      );
    }
  },

  /**
   * List all connected repositories
   */
  async listRepositories(): Promise<Repository[]> {
    return fetchWithAuth<Repository[]>('/api/repositories');
  },

  /**
   * Get repository details by ID
   */
  async getRepository(id: string): Promise<Repository> {
    return fetchWithAuth<Repository>(`/api/repositories/${id}`);
  },

  /**
   * Connect a new repository
   */
  async connectRepository(url: string): Promise<Repository> {
    return fetchWithAuth<Repository>('/api/repositories', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  },

  // --------------------------------------------------------------------------
  // Model Management
  // --------------------------------------------------------------------------

  /**
   * Create a new QNN model
   */
  async createModel(data: Omit<QNNModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<QNNModel> {
    return fetchWithAuth<QNNModel>('/api/models', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * List all models
   */
  async listModels(repositoryId?: string): Promise<QNNModel[]> {
    const params = repositoryId ? { repositoryId } : undefined;
    return fetchWithAuth<QNNModel[]>('/api/models', { params });
  },

  /**
   * Get model details by ID
   */
  async getModel(id: string): Promise<QNNModel> {
    return fetchWithAuth<QNNModel>(`/api/models/${id}`);
  },

  /**
   * Update a model
   */
  async updateModel(id: string, data: Partial<QNNModel>): Promise<QNNModel> {
    return fetchWithAuth<QNNModel>(`/api/models/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a model
   */
  async deleteModel(id: string): Promise<void> {
    await fetchWithAuth<void>(`/api/models/${id}`, {
      method: 'DELETE',
    });
  },

  // --------------------------------------------------------------------------
  // Training Operations
  // --------------------------------------------------------------------------

  /**
   * Start training a model
   */
  async startTraining(modelId: string, config?: Record<string, unknown>): Promise<TrainingJob> {
    return fetchWithAuth<TrainingJob>('/api/training/start', {
      method: 'POST',
      body: JSON.stringify({ modelId, config }),
    });
  },

  /**
   * Get training job status
   */
  async getTrainingStatus(jobId: string): Promise<TrainingJob> {
    return fetchWithAuth<TrainingJob>(`/api/training/${jobId}`);
  },

  /**
   * Get training history for a model
   */
  async getTrainingHistory(modelId: string): Promise<TrainingJob[]> {
    return fetchWithAuth<TrainingJob[]>('/api/training/history', {
      params: { modelId },
    });
  },

  /**
   * Cancel a training job
   */
  async cancelTraining(jobId: string): Promise<void> {
    await fetchWithAuth<void>(`/api/training/${jobId}/cancel`, {
      method: 'POST',
    });
  },

  // --------------------------------------------------------------------------
  // Evaluation & Metrics
  // --------------------------------------------------------------------------

  /**
   * Start model evaluation
   */
  async startEvaluation(modelId: string, testData?: unknown): Promise<{ jobId: string }> {
    return fetchWithAuth<{ jobId: string }>('/api/evaluation/start', {
      method: 'POST',
      body: JSON.stringify({ modelId, testData }),
    });
  },

  /**
   * Get evaluation results
   */
  async getEvaluationResults(modelId: string): Promise<EvaluationMetrics> {
    return fetchWithAuth<EvaluationMetrics>(`/api/evaluation/results/${modelId}`);
  },

  // --------------------------------------------------------------------------
  // Quantum Signatures
  // --------------------------------------------------------------------------

  /**
   * Generate quantum signature for a model
   */
  async signModel(modelId: string, algorithm: QuantumSignature['algorithm']): Promise<QuantumSignature> {
    return fetchWithAuth<QuantumSignature>('/api/signatures/sign', {
      method: 'POST',
      body: JSON.stringify({ modelId, algorithm }),
    });
  },

  /**
   * Verify quantum signature
   */
  async verifySignature(signatureId: string): Promise<{ verified: boolean; details: QuantumSignature }> {
    return fetchWithAuth<{ verified: boolean; details: QuantumSignature }>(
      `/api/signatures/verify/${signatureId}`
    );
  },

  /**
   * Apply quantum signature to model
   */
  async applySignature(modelId: string, signatureId: string): Promise<{ status: string; is_verified: boolean }> {
    return fetchWithAuth<{ status: string; is_verified: boolean }>('/api/signatures/apply', {
      method: 'POST',
      body: JSON.stringify({ modelId, signatureId }),
    });
  },

  // --------------------------------------------------------------------------
  // Benchmarking
  // --------------------------------------------------------------------------

  /**
   * Run quantum vs classical benchmark
   */
  async runBenchmark(modelId: string, options?: Record<string, unknown>): Promise<BenchmarkResult> {
    return fetchWithAuth<BenchmarkResult>('/api/benchmark/run', {
      method: 'POST',
      body: JSON.stringify({ modelId, options }),
    });
  },

  /**
   * Get benchmark results
   */
  async getBenchmarkResults(modelId: string): Promise<BenchmarkResult[]> {
    return fetchWithAuth<BenchmarkResult[]>('/api/benchmark/results', {
      params: { modelId },
    });
  },

  // --------------------------------------------------------------------------
  // Code Quality Assessment
  // --------------------------------------------------------------------------

  /**
   * Analyze code quality for a repository
   */
  async analyzeCodeQuality(repositoryId: string): Promise<CodeQualityResult> {
    return fetchWithAuth<CodeQualityResult>('/api/quality/analyze', {
      method: 'POST',
      body: JSON.stringify({ repositoryId }),
    });
  },

  // --------------------------------------------------------------------------
  // Quantum Monitoring
  // --------------------------------------------------------------------------

  /**
   * Get real-time quantum metrics
   */
  async getQuantumMetrics(deviceId: string): Promise<QuantumMetrics> {
    return fetchWithAuth<QuantumMetrics>(`/api/monitoring/metrics/${deviceId}`);
  },

  /**
   * Get quantum device status
   */
  async getDeviceStatus(): Promise<DeviceStatus[]> {
    return fetchWithAuth<DeviceStatus[]>('/api/monitoring/devices');
  },

  /**
   * Get quantum anomalies
   */
  async getAnomalies(deviceId?: string): Promise<QuantumAnomaly[]> {
    const params = deviceId ? { deviceId } : undefined;
    return fetchWithAuth<QuantumAnomaly[]>('/api/monitoring/anomalies', { params });
  },
};
