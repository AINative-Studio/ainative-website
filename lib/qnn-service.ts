/**
 * QNN Service
 * Handles Quantum Neural Network API communication
 * Ported from Vite SPA QNNApiClient to Next.js
 */

import apiClient from './api-client';

// Types
export interface Repository {
  id: string;
  name: string;
  fullName: string;
  description: string | null;
  owner: string;
  url: string;
  language: string | null;
  stars: number;
  forks: number;
  isPrivate: boolean;
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
  lastAnalyzed?: string;
  analysisStatus?: 'pending' | 'analyzing' | 'completed' | 'failed';
}

export interface RepositorySearchParams {
  query: string;
  language?: string;
  minStars?: number;
  maxStars?: number;
  sort?: 'stars' | 'forks' | 'updated';
  order?: 'asc' | 'desc';
  page?: number;
  perPage?: number;
}

export interface RepositoryAnalysis {
  repositoryId: string;
  totalFiles: number;
  totalLines: number;
  languages: Record<string, number>;
  complexity: {
    average: number;
    max: number;
    files: Array<{ path: string; complexity: number }>;
  };
  dependencies: string[];
  structure: {
    directories: number;
    files: number;
    depth: number;
  };
  analyzedAt: string;
}

export type ModelArchitecture =
  | 'quantum-cnn'
  | 'quantum-rnn'
  | 'quantum-transformer'
  | 'hybrid-quantum-classical'
  | 'variational-quantum-classifier';

export type ModelStatus =
  | 'draft'
  | 'ready'
  | 'training'
  | 'trained'
  | 'deployed'
  | 'archived'
  | 'failed';

export interface ModelMetadata {
  parameters: number;
  quantumLayers: number;
  classicalLayers: number;
  inputShape: number[];
  outputShape: number[];
  framework: 'pennylane' | 'qiskit' | 'cirq' | 'tensorflow-quantum';
  hardware?: string;
  tags?: string[];
}

export interface Model {
  id: string;
  name: string;
  description: string | null;
  repositoryId: string;
  architecture: ModelArchitecture;
  status: ModelStatus;
  version: string;
  createdAt: string;
  updatedAt: string;
  metadata: ModelMetadata;
  trainingJobs?: TrainingJob[];
}

export interface CreateModelRequest {
  name: string;
  description?: string;
  repositoryId: string;
  architecture: ModelArchitecture;
  metadata?: Partial<ModelMetadata>;
}

export interface UpdateModelRequest {
  name?: string;
  description?: string;
  architecture?: ModelArchitecture;
  status?: ModelStatus;
  metadata?: Partial<ModelMetadata>;
}

export type TrainingStatus =
  | 'queued'
  | 'initializing'
  | 'training'
  | 'validating'
  | 'completed'
  | 'failed'
  | 'stopped'
  | 'paused';

export interface TrainingConfig {
  epochs: number;
  batchSize: number;
  learningRate: number;
  optimizer: 'adam' | 'sgd' | 'rmsprop' | 'adamw';
  lossFunction: 'cross_entropy' | 'mse' | 'mae' | 'custom';
  validationSplit: number;
  earlyStoppingPatience?: number;
  quantumCircuitDepth: number;
  quantumEntanglement: 'linear' | 'circular' | 'full';
  hardwareBackend: 'simulator' | 'ibmq' | 'aws_braket' | 'google_quantum';
  seed?: number;
}

export interface TrainingHistory {
  epoch: number;
  loss: number;
  accuracy: number;
  valLoss?: number;
  valAccuracy?: number;
  learningRate: number;
  timestamp: string;
}

export interface TrainingMetrics {
  epoch: number;
  loss: number;
  accuracy: number;
  valLoss?: number;
  valAccuracy?: number;
  quantumFidelity?: number;
  circuitDepthUsed?: number;
  convergenceRate?: number;
  history: TrainingHistory[];
}

export interface TrainingCheckpoint {
  id: string;
  epoch: number;
  loss: number;
  accuracy: number;
  filepath: string;
  createdAt: string;
  isBest: boolean;
}

export interface TrainingJob {
  id: string;
  modelId: string;
  status: TrainingStatus;
  config: TrainingConfig;
  metrics: TrainingMetrics;
  startedAt: string;
  completedAt: string | null;
  duration: number | null;
  error: string | null;
  checkpoints: TrainingCheckpoint[];
}

export interface StartTrainingRequest {
  modelId: string;
  config: TrainingConfig;
  datasetPath?: string;
  resumeFromCheckpoint?: string;
}

export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  metadata?: Record<string, unknown>;
}

export interface TrainingLogs {
  trainingId: string;
  logs: LogEntry[];
  totalLines: number;
  hasMore: boolean;
}

export interface BenchmarkMetrics {
  modelId: string;
  benchmarkId: string;
  dataset: string;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    inferenceTime: number;
    throughput: number;
    memoryUsage: number;
  };
  quantumMetrics: {
    circuitDepth: number;
    gateCount: number;
    fidelity: number;
    coherenceTime: number;
    quantumAdvantage: number;
  };
  comparisonWithClassical?: {
    accuracyDiff: number;
    speedupFactor: number;
    memoryReduction: number;
  };
  timestamp: string;
}

export interface BenchmarkRequest {
  modelId: string;
  dataset: string;
  batchSize?: number;
  iterations?: number;
  hardwareBackend?: string;
}

export interface BenchmarkResult {
  id: string;
  modelId: string;
  status: 'running' | 'completed' | 'failed';
  metrics?: BenchmarkMetrics;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface QuantumMetrics {
  modelId: string;
  timestamp: string;
  quantumState: {
    entanglement: number;
    coherence: number;
    fidelity: number;
    purity: number;
  };
  circuitMetrics: {
    depth: number;
    width: number;
    gateCount: number;
    twoQubitGates: number;
  };
  resourceUsage: {
    qubitsUsed: number;
    qubitsAvailable: number;
    circuitExecutionTime: number;
    classicalComputeTime: number;
  };
}

export interface PerformanceMetrics {
  modelId: string;
  timestamp: string;
  inference: {
    latencyP50: number;
    latencyP95: number;
    latencyP99: number;
    throughput: number;
    errorRate: number;
  };
  resources: {
    cpuUsage: number;
    memoryUsage: number;
    gpuUsage?: number;
    quantumProcessorUsage?: number;
  };
  costs: {
    computeCost: number;
    quantumCost: number;
    storageCost: number;
    totalCost: number;
  };
}

export interface CostTracking {
  modelId: string;
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';
  breakdown: {
    quantumCircuitExecutions: number;
    classicalCompute: number;
    storage: number;
    dataTransfer: number;
    total: number;
  };
  forecast: {
    nextPeriod: number;
    trend: 'increasing' | 'stable' | 'decreasing';
  };
  startDate: string;
  endDate: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface SignatureResponse {
  model_id: string;
  signature: string;
  signature_id: string;
  signed_at: string;
  expires_at: string;
}

export interface VerificationResponse {
  model_id: string;
  is_valid: boolean;
  is_expired: boolean;
  signature_id: string;
  signed_at: string;
  expires_at: string;
  verification_time?: string;
}

// Helper to build query string from params
function buildQueryString(params?: Record<string, unknown>): string {
  if (!params) return '';
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null);
  if (entries.length === 0) return '';
  return '?' + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&');
}

// Helper to make QNN API calls
async function qnnGet<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
  const url = endpoint + buildQueryString(params);
  const response = await apiClient.get<T>(url);
  return response.data;
}

async function qnnPost<T>(endpoint: string, data?: unknown): Promise<T> {
  const response = await apiClient.post<T>(endpoint, data);
  return response.data;
}

async function qnnPut<T>(endpoint: string, data?: unknown): Promise<T> {
  const response = await apiClient.put<T>(endpoint, data);
  return response.data;
}

async function qnnDelete<T>(endpoint: string): Promise<T> {
  const response = await apiClient.delete<T>(endpoint);
  return response.data;
}

/**
 * Health check endpoint
 */
export async function healthCheck(): Promise<{ status: string; timestamp: string }> {
  return qnnGet('/health');
}

/**
 * Get API version info
 */
export async function getVersion(): Promise<{ version: string; buildDate: string }> {
  return qnnGet('/version');
}

// Repository Methods
/**
 * List all repositories
 */
export async function listRepositories(params?: Record<string, unknown>): Promise<{ items: Repository[]; total: number }> {
  return qnnGet('/v1/repositories', params);
}

/**
 * Search repositories with filters
 */
export async function searchRepositories(params: RepositorySearchParams): Promise<{ items: Repository[]; total: number }> {
  return qnnPost('/v1/repositories/search', params);
}

/**
 * Get repository details by ID
 */
export async function getRepository(id: string): Promise<Repository> {
  return qnnGet(`/v1/repositories/${id}`);
}

/**
 * Analyze a repository
 */
export async function analyzeRepository(id: string): Promise<RepositoryAnalysis> {
  return qnnPost(`/v1/repositories/${id}/analyze`);
}

// Model Methods
/**
 * List all models
 */
export async function listModels(filters?: Record<string, unknown>): Promise<Model[]> {
  return qnnGet('/v1/models', filters);
}

/**
 * Create a new model
 */
export async function createModel(data: CreateModelRequest): Promise<Model> {
  return qnnPost('/v1/models', data);
}

/**
 * Get model details by ID
 */
export async function getModel(id: string): Promise<Model> {
  return qnnGet(`/v1/models/${id}`);
}

/**
 * Update model
 */
export async function updateModel(id: string, data: UpdateModelRequest): Promise<Model> {
  return qnnPut(`/v1/models/${id}`, data);
}

/**
 * Delete model by ID
 */
export async function deleteModel(id: string): Promise<void> {
  await qnnDelete(`/v1/models/${id}`);
}

// Training Methods
/**
 * Start a training job
 */
export async function startTraining(config: StartTrainingRequest): Promise<TrainingJob> {
  return qnnPost('/v1/training/start', config);
}

/**
 * Get training job status
 */
export async function getTrainingStatus(id: string): Promise<TrainingStatus> {
  const response = await qnnGet<{ status: TrainingStatus } | TrainingStatus>(`/v1/training/${id}/status`);
  return typeof response === 'object' && 'status' in response ? response.status : response;
}

/**
 * Get training job details
 */
export async function getTrainingJob(id: string): Promise<TrainingJob> {
  return qnnGet(`/v1/training/${id}`);
}

/**
 * Get training logs
 */
export async function getTrainingLogs(id: string, offset: number = 0, limit: number = 100): Promise<TrainingLogs> {
  return qnnGet(`/v1/training/${id}/logs`, { offset, limit });
}

/**
 * Stop a running training job
 */
export async function stopTraining(id: string): Promise<void> {
  await qnnPost(`/v1/training/${id}/stop`);
}

/**
 * Get training history
 */
export async function getTrainingHistory(
  modelId?: string,
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<TrainingJob>> {
  return qnnGet('/v1/training/history', { modelId, page, pageSize });
}

// Benchmarking Methods
/**
 * Get benchmark metrics
 */
export async function getBenchmarkMetrics(modelId?: string): Promise<BenchmarkMetrics[]> {
  return qnnGet('/v1/benchmarking/metrics', { modelId });
}

/**
 * Run a benchmark
 */
export async function runBenchmark(config: BenchmarkRequest): Promise<BenchmarkResult> {
  return qnnPost('/v1/benchmarking/run', config);
}

/**
 * Get benchmark result
 */
export async function getBenchmarkResult(benchmarkId: string): Promise<BenchmarkResult> {
  return qnnGet(`/v1/benchmarking/results/${benchmarkId}`);
}

// Monitoring Methods
/**
 * Get quantum metrics
 */
export async function getQuantumMetrics(
  modelId?: string,
  startTime?: string,
  endTime?: string
): Promise<QuantumMetrics[]> {
  return qnnGet('/v1/monitoring/quantum', { modelId, startTime, endTime });
}

/**
 * Get performance metrics
 */
export async function getPerformanceMetrics(
  modelId?: string,
  startTime?: string,
  endTime?: string
): Promise<PerformanceMetrics[]> {
  return qnnGet('/v1/monitoring/performance', { modelId, startTime, endTime });
}

/**
 * Get cost tracking data
 */
export async function getCostTracking(
  modelId?: string,
  period: 'hourly' | 'daily' | 'weekly' | 'monthly' = 'daily',
  startDate?: string,
  endDate?: string
): Promise<CostTracking> {
  return qnnGet('/v1/monitoring/costs', { modelId, period, startDate, endDate });
}

// Signature Methods
/**
 * Sign a model with a quantum signature
 */
export async function signModel(modelId: string, key?: string): Promise<SignatureResponse> {
  return qnnPost('/v1/signing/sign', { model_id: modelId, key });
}

/**
 * Verify a model's quantum signature
 */
export async function verifySignature(modelId: string, signature?: string): Promise<VerificationResponse> {
  return qnnPost('/v1/signing/verify', { model_id: modelId, signature });
}

/**
 * Apply an existing signature to a model
 */
export async function applySignature(modelId: string, signatureId: string): Promise<{ status: string }> {
  return qnnPost('/v1/signing/apply', { model_id: modelId, signature_id: signatureId });
}

// Default export as object
const qnnService = {
  healthCheck,
  getVersion,
  listRepositories,
  searchRepositories,
  getRepository,
  analyzeRepository,
  listModels,
  createModel,
  getModel,
  updateModel,
  deleteModel,
  startTraining,
  getTrainingStatus,
  getTrainingJob,
  getTrainingLogs,
  stopTraining,
  getTrainingHistory,
  getBenchmarkMetrics,
  runBenchmark,
  getBenchmarkResult,
  getQuantumMetrics,
  getPerformanceMetrics,
  getCostTracking,
  signModel,
  verifySignature,
  applySignature,
};

export default qnnService;
