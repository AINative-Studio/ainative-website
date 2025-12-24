/**
 * QNN Service Tests
 * TDD tests for Quantum Neural Network service
 */

import apiClient from '../api-client';
import qnnService, {
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
} from '../qnn-service';

// Mock the apiClient
jest.mock('../api-client', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('QNN Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('healthCheck', () => {
    it('should return health status', async () => {
      mockApiClient.get.mockResolvedValue({
        data: { status: 'healthy', timestamp: '2025-12-23T00:00:00Z' },
        status: 200,
        statusText: 'OK',
      });

      const result = await healthCheck();

      expect(mockApiClient.get).toHaveBeenCalledWith('/health');
      expect(result.status).toBe('healthy');
    });
  });

  describe('getVersion', () => {
    it('should return API version info', async () => {
      mockApiClient.get.mockResolvedValue({
        data: { version: '1.0.0', buildDate: '2025-12-23' },
        status: 200,
        statusText: 'OK',
      });

      const result = await getVersion();

      expect(mockApiClient.get).toHaveBeenCalledWith('/version');
      expect(result.version).toBe('1.0.0');
    });
  });

  describe('Repository Methods', () => {
    it('should list repositories', async () => {
      mockApiClient.get.mockResolvedValue({
        data: { items: [{ id: 'repo-1', name: 'test-repo' }], total: 1 },
        status: 200,
        statusText: 'OK',
      });

      const result = await listRepositories();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/repositories');
      expect(result.items).toHaveLength(1);
    });

    it('should list repositories with params', async () => {
      mockApiClient.get.mockResolvedValue({
        data: { items: [], total: 0 },
        status: 200,
        statusText: 'OK',
      });

      await listRepositories({ language: 'python', page: 1 });

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/repositories?language=python&page=1');
    });

    it('should search repositories', async () => {
      mockApiClient.post.mockResolvedValue({
        data: { items: [{ id: 'repo-1', name: 'ai-project' }], total: 1 },
        status: 200,
        statusText: 'OK',
      });

      const result = await searchRepositories({ query: 'ai', language: 'python' });

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/repositories/search', {
        query: 'ai',
        language: 'python',
      });
      expect(result.items).toHaveLength(1);
    });

    it('should get a specific repository', async () => {
      mockApiClient.get.mockResolvedValue({
        data: { id: 'repo-1', name: 'test-repo', fullName: 'user/test-repo' },
        status: 200,
        statusText: 'OK',
      });

      const result = await getRepository('repo-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/repositories/repo-1');
      expect(result.id).toBe('repo-1');
    });

    it('should analyze a repository', async () => {
      mockApiClient.post.mockResolvedValue({
        data: { repositoryId: 'repo-1', totalFiles: 100, totalLines: 5000 },
        status: 200,
        statusText: 'OK',
      });

      const result = await analyzeRepository('repo-1');

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/repositories/repo-1/analyze', undefined);
      expect(result.totalFiles).toBe(100);
    });
  });

  describe('Model Methods', () => {
    it('should list models', async () => {
      mockApiClient.get.mockResolvedValue({
        data: [{ id: 'model-1', name: 'Test Model', status: 'ready' }],
        status: 200,
        statusText: 'OK',
      });

      const result = await listModels();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/models');
      expect(result).toHaveLength(1);
    });

    it('should list models with filters', async () => {
      mockApiClient.get.mockResolvedValue({
        data: [],
        status: 200,
        statusText: 'OK',
      });

      await listModels({ status: 'trained', architecture: 'quantum-cnn' });

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/models?status=trained&architecture=quantum-cnn');
    });

    it('should create a model', async () => {
      mockApiClient.post.mockResolvedValue({
        data: { id: 'model-1', name: 'New Model', status: 'draft' },
        status: 200,
        statusText: 'OK',
      });

      const result = await createModel({
        name: 'New Model',
        repositoryId: 'repo-1',
        architecture: 'quantum-cnn',
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/models', {
        name: 'New Model',
        repositoryId: 'repo-1',
        architecture: 'quantum-cnn',
      });
      expect(result.id).toBe('model-1');
    });

    it('should get a specific model', async () => {
      mockApiClient.get.mockResolvedValue({
        data: { id: 'model-1', name: 'Test Model' },
        status: 200,
        statusText: 'OK',
      });

      const result = await getModel('model-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/models/model-1');
      expect(result.name).toBe('Test Model');
    });

    it('should update a model', async () => {
      mockApiClient.put.mockResolvedValue({
        data: { id: 'model-1', name: 'Updated Model' },
        status: 200,
        statusText: 'OK',
      });

      const result = await updateModel('model-1', { name: 'Updated Model' });

      expect(mockApiClient.put).toHaveBeenCalledWith('/v1/models/model-1', { name: 'Updated Model' });
      expect(result.name).toBe('Updated Model');
    });

    it('should delete a model', async () => {
      mockApiClient.delete.mockResolvedValue({
        data: { success: true },
        status: 200,
        statusText: 'OK',
      });

      await deleteModel('model-1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/v1/models/model-1');
    });
  });

  describe('Training Methods', () => {
    const mockTrainingConfig = {
      modelId: 'model-1',
      config: {
        epochs: 100,
        batchSize: 32,
        learningRate: 0.001,
        optimizer: 'adam' as const,
        lossFunction: 'cross_entropy' as const,
        validationSplit: 0.2,
        quantumCircuitDepth: 4,
        quantumEntanglement: 'linear' as const,
        hardwareBackend: 'simulator' as const,
      },
    };

    it('should start training', async () => {
      mockApiClient.post.mockResolvedValue({
        data: { id: 'training-1', modelId: 'model-1', status: 'queued' },
        status: 200,
        statusText: 'OK',
      });

      const result = await startTraining(mockTrainingConfig);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/training/start', mockTrainingConfig);
      expect(result.status).toBe('queued');
    });

    it('should get training status', async () => {
      mockApiClient.get.mockResolvedValue({
        data: { status: 'training' },
        status: 200,
        statusText: 'OK',
      });

      const result = await getTrainingStatus('training-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/training/training-1/status');
      expect(result).toBe('training');
    });

    it('should get training job details', async () => {
      mockApiClient.get.mockResolvedValue({
        data: { id: 'training-1', modelId: 'model-1', status: 'completed' },
        status: 200,
        statusText: 'OK',
      });

      const result = await getTrainingJob('training-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/training/training-1');
      expect(result.status).toBe('completed');
    });

    it('should get training logs', async () => {
      mockApiClient.get.mockResolvedValue({
        data: { trainingId: 'training-1', logs: [{ level: 'info', message: 'Epoch 1' }], totalLines: 1 },
        status: 200,
        statusText: 'OK',
      });

      const result = await getTrainingLogs('training-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/training/training-1/logs?offset=0&limit=100');
      expect(result.logs).toHaveLength(1);
    });

    it('should get training logs with pagination', async () => {
      mockApiClient.get.mockResolvedValue({
        data: { trainingId: 'training-1', logs: [], totalLines: 0, hasMore: false },
        status: 200,
        statusText: 'OK',
      });

      await getTrainingLogs('training-1', 50, 25);

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/training/training-1/logs?offset=50&limit=25');
    });

    it('should stop training', async () => {
      mockApiClient.post.mockResolvedValue({
        data: { success: true },
        status: 200,
        statusText: 'OK',
      });

      await stopTraining('training-1');

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/training/training-1/stop', undefined);
    });

    it('should get training history', async () => {
      mockApiClient.get.mockResolvedValue({
        data: { items: [], total: 0, page: 1, perPage: 20, totalPages: 0 },
        status: 200,
        statusText: 'OK',
      });

      const result = await getTrainingHistory();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/training/history?page=1&pageSize=20');
      expect(result.items).toHaveLength(0);
    });

    it('should get training history with model filter', async () => {
      mockApiClient.get.mockResolvedValue({
        data: { items: [], total: 0, page: 1, perPage: 10, totalPages: 0 },
        status: 200,
        statusText: 'OK',
      });

      await getTrainingHistory('model-1', 2, 10);

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/training/history?modelId=model-1&page=2&pageSize=10');
    });
  });

  describe('Benchmarking Methods', () => {
    it('should get benchmark metrics', async () => {
      mockApiClient.get.mockResolvedValue({
        data: [{ modelId: 'model-1', benchmarkId: 'bench-1' }],
        status: 200,
        statusText: 'OK',
      });

      const result = await getBenchmarkMetrics();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/benchmarking/metrics');
      expect(result).toHaveLength(1);
    });

    it('should get benchmark metrics for specific model', async () => {
      mockApiClient.get.mockResolvedValue({
        data: [],
        status: 200,
        statusText: 'OK',
      });

      await getBenchmarkMetrics('model-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/benchmarking/metrics?modelId=model-1');
    });

    it('should run benchmark', async () => {
      mockApiClient.post.mockResolvedValue({
        data: { id: 'bench-1', modelId: 'model-1', status: 'running' },
        status: 200,
        statusText: 'OK',
      });

      const result = await runBenchmark({ modelId: 'model-1', dataset: 'mnist' });

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/benchmarking/run', {
        modelId: 'model-1',
        dataset: 'mnist',
      });
      expect(result.status).toBe('running');
    });

    it('should get benchmark result', async () => {
      mockApiClient.get.mockResolvedValue({
        data: { id: 'bench-1', modelId: 'model-1', status: 'completed' },
        status: 200,
        statusText: 'OK',
      });

      const result = await getBenchmarkResult('bench-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/benchmarking/results/bench-1');
      expect(result.status).toBe('completed');
    });
  });

  describe('Monitoring Methods', () => {
    it('should get quantum metrics', async () => {
      mockApiClient.get.mockResolvedValue({
        data: [{ modelId: 'model-1', timestamp: '2025-12-23T00:00:00Z' }],
        status: 200,
        statusText: 'OK',
      });

      const result = await getQuantumMetrics();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/monitoring/quantum');
      expect(result).toHaveLength(1);
    });

    it('should get quantum metrics with filters', async () => {
      mockApiClient.get.mockResolvedValue({
        data: [],
        status: 200,
        statusText: 'OK',
      });

      await getQuantumMetrics('model-1', '2025-12-01', '2025-12-31');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/monitoring/quantum?modelId=model-1&startTime=2025-12-01&endTime=2025-12-31');
    });

    it('should get performance metrics', async () => {
      mockApiClient.get.mockResolvedValue({
        data: [{ modelId: 'model-1', timestamp: '2025-12-23T00:00:00Z' }],
        status: 200,
        statusText: 'OK',
      });

      const result = await getPerformanceMetrics();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/monitoring/performance');
      expect(result).toHaveLength(1);
    });

    it('should get cost tracking', async () => {
      mockApiClient.get.mockResolvedValue({
        data: { modelId: 'model-1', period: 'daily', breakdown: { total: 100 } },
        status: 200,
        statusText: 'OK',
      });

      const result = await getCostTracking();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/monitoring/costs?period=daily');
      expect(result.breakdown.total).toBe(100);
    });

    it('should get cost tracking with all options', async () => {
      mockApiClient.get.mockResolvedValue({
        data: { modelId: 'model-1', period: 'weekly', breakdown: { total: 500 } },
        status: 200,
        statusText: 'OK',
      });

      await getCostTracking('model-1', 'weekly', '2025-12-01', '2025-12-31');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/monitoring/costs?modelId=model-1&period=weekly&startDate=2025-12-01&endDate=2025-12-31');
    });
  });

  describe('Signature Methods', () => {
    it('should sign a model', async () => {
      mockApiClient.post.mockResolvedValue({
        data: { model_id: 'model-1', signature: 'sig-123', signed_at: '2025-12-23T00:00:00Z' },
        status: 200,
        statusText: 'OK',
      });

      const result = await signModel('model-1');

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/signing/sign', {
        model_id: 'model-1',
        key: undefined,
      });
      expect(result.signature).toBe('sig-123');
    });

    it('should sign a model with custom key', async () => {
      mockApiClient.post.mockResolvedValue({
        data: { model_id: 'model-1', signature: 'sig-456' },
        status: 200,
        statusText: 'OK',
      });

      await signModel('model-1', 'custom-key');

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/signing/sign', {
        model_id: 'model-1',
        key: 'custom-key',
      });
    });

    it('should verify a signature', async () => {
      mockApiClient.post.mockResolvedValue({
        data: { model_id: 'model-1', is_valid: true, is_expired: false },
        status: 200,
        statusText: 'OK',
      });

      const result = await verifySignature('model-1');

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/signing/verify', {
        model_id: 'model-1',
        signature: undefined,
      });
      expect(result.is_valid).toBe(true);
    });

    it('should verify a specific signature', async () => {
      mockApiClient.post.mockResolvedValue({
        data: { model_id: 'model-1', is_valid: false },
        status: 200,
        statusText: 'OK',
      });

      await verifySignature('model-1', 'sig-123');

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/signing/verify', {
        model_id: 'model-1',
        signature: 'sig-123',
      });
    });
  });

  describe('Default Export', () => {
    it('should export all methods', () => {
      expect(qnnService.healthCheck).toBe(healthCheck);
      expect(qnnService.getVersion).toBe(getVersion);
      expect(qnnService.listRepositories).toBe(listRepositories);
      expect(qnnService.searchRepositories).toBe(searchRepositories);
      expect(qnnService.getRepository).toBe(getRepository);
      expect(qnnService.analyzeRepository).toBe(analyzeRepository);
      expect(qnnService.listModels).toBe(listModels);
      expect(qnnService.createModel).toBe(createModel);
      expect(qnnService.getModel).toBe(getModel);
      expect(qnnService.updateModel).toBe(updateModel);
      expect(qnnService.deleteModel).toBe(deleteModel);
      expect(qnnService.startTraining).toBe(startTraining);
      expect(qnnService.getTrainingStatus).toBe(getTrainingStatus);
      expect(qnnService.getTrainingJob).toBe(getTrainingJob);
      expect(qnnService.getTrainingLogs).toBe(getTrainingLogs);
      expect(qnnService.stopTraining).toBe(stopTraining);
      expect(qnnService.getTrainingHistory).toBe(getTrainingHistory);
      expect(qnnService.getBenchmarkMetrics).toBe(getBenchmarkMetrics);
      expect(qnnService.runBenchmark).toBe(runBenchmark);
      expect(qnnService.getBenchmarkResult).toBe(getBenchmarkResult);
      expect(qnnService.getQuantumMetrics).toBe(getQuantumMetrics);
      expect(qnnService.getPerformanceMetrics).toBe(getPerformanceMetrics);
      expect(qnnService.getCostTracking).toBe(getCostTracking);
      expect(qnnService.signModel).toBe(signModel);
      expect(qnnService.verifySignature).toBe(verifySignature);
    });
  });
});
