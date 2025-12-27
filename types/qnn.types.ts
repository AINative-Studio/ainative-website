/**
 * QNN (Quantum Neural Network) Type Definitions
 *
 * This file contains all TypeScript interfaces and types for the QNN dashboard integration.
 * These types align with the QNN backend API (FastAPI) responses and requests.
 */

// ==================== Repository Types ====================

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
    files: Array<{
      path: string;
      complexity: number;
    }>;
  };
  dependencies: string[];
  structure: {
    directories: number;
    files: number;
    depth: number;
  };
  analyzedAt: string;
}

// ==================== Model Types ====================

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

// ==================== Training Types ====================

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

export interface TrainingHistory {
  epoch: number;
  loss: number;
  accuracy: number;
  valLoss?: number;
  valAccuracy?: number;
  learningRate: number;
  timestamp: string;
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

export interface StartTrainingRequest {
  modelId: string;
  config: TrainingConfig;
  datasetPath?: string;
  resumeFromCheckpoint?: string;
}

export interface TrainingLogs {
  trainingId: string;
  logs: LogEntry[];
  totalLines: number;
  hasMore: boolean;
}

export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  metadata?: Record<string, unknown>;
}

// ==================== Benchmarking Types ====================

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

// ==================== Evaluation Types ====================

export interface ModelEvaluation {
  modelId: string;
  evaluatedAt: string;
  sampleSize: number;
  metrics: EvaluationMetrics;
  confusionMatrix: number[][];
  classNames?: string[];
  rocCurve?: ROCPoint[];
  precisionRecallCurve?: PrecisionRecallPoint[];
}

export interface EvaluationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc?: number;
  specificity?: number;
  npv?: number;
  mcc?: number;
  accuracyChange?: number;
}

export interface ROCPoint {
  threshold: number;
  truePositiveRate: number;
  falsePositiveRate: number;
}

export interface PrecisionRecallPoint {
  threshold: number;
  precision: number;
  recall: number;
}

export interface EvaluationRequest {
  modelId: string;
  datasetPath: string;
  batchSize?: number;
  metrics?: string[];
}

// ==================== Monitoring Types ====================

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

// ==================== API Response Types ====================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
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

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

// ==================== UI State Types ====================

export interface QNNContextState {
  selectedRepository: Repository | null;
  setSelectedRepository: (repo: Repository | null) => void;
  selectedRepositories: Repository[];
  setSelectedRepositories: (repos: Repository[]) => void;
  toggleRepositorySelection: (repo: Repository) => void;
  clearRepositorySelection: () => void;
  isRepositorySelected: (repoId: string) => boolean;
  savedRepositories: Repository[];
  setSavedRepositories: (repos: Repository[]) => void;
  selectedModel: Model | null;
  setSelectedModel: (model: Model | null) => void;
  activeTraining: TrainingJob | null;
  setActiveTraining: (training: TrainingJob | null) => void;
  isPollingEnabled: boolean;
  setIsPollingEnabled: (enabled: boolean) => void;
  viewMode: 'list' | 'grid' | 'table';
  setViewMode: (mode: 'list' | 'grid' | 'table') => void;
}

export interface LoadingState {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export interface MutationState<T> extends LoadingState {
  data: T | null;
  mutate: (variables: unknown) => Promise<void>;
  reset: () => void;
}

// ==================== Filter and Sort Types ====================

export interface ModelFilters {
  status?: ModelStatus[];
  architecture?: ModelArchitecture[];
  repositoryId?: string;
  searchQuery?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface SortOptions {
  field: 'name' | 'createdAt' | 'updatedAt' | 'status';
  order: 'asc' | 'desc';
}

// ==================== Chart Data Types ====================

export interface ChartDataPoint {
  x: number | string;
  y: number;
  label?: string;
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
  metadata?: Record<string, unknown>;
}

export interface TrainingChartData {
  epoch: number;
  loss: number;
  accuracy: number;
  valLoss?: number;
  valAccuracy?: number;
}

// ==================== Signature Management Types ====================

/**
 * Signature response from signing a model
 */
export interface SignatureResponse {
  model_id: string;
  signature: string;
  signature_id: string;
  signed_at: string;
  expires_at: string;
}

/**
 * Request to sign a model
 */
export interface SigningRequest {
  model_id: string;
  key?: string;
}

/**
 * Verification response for signature validation
 */
export interface VerificationResponse {
  model_id: string;
  is_valid: boolean;
  is_expired: boolean;
  signature_id: string;
  signed_at: string;
  expires_at: string;
  verification_time?: string;
}

/**
 * Request to verify a signature
 */
export interface VerificationRequest {
  model_id: string;
  signature?: string;
}

/**
 * Response from applying a signature
 */
export interface ApplySignatureResponse {
  model_id: string;
  signature_id: string;
  applied_at: string;
  status: string;
  is_verified: boolean;
}

/**
 * Request to apply a signature
 */
export interface ApplySignatureRequest {
  model_id: string;
  signature_id: string;
}
