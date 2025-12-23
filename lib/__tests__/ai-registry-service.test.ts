import apiClient from '../api-client';
import { aiRegistryService } from '../ai-registry-service';

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

describe('AIRegistryService', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listModels', () => {
    it('fetches all registered AI models', async () => {
      const mockModels = {
        models: [
          {
            id: 1,
            name: 'GPT-4',
            provider: 'openai',
            model_identifier: 'gpt-4-turbo-preview',
            capabilities: ['text-generation', 'reasoning'],
            is_default: true,
            max_tokens: 128000,
            created_at: '2025-01-01T00:00:00Z',
          },
          {
            id: 2,
            name: 'Claude 3.5 Sonnet',
            provider: 'anthropic',
            model_identifier: 'claude-3-5-sonnet-20241022',
            capabilities: ['text-generation', 'reasoning', 'vision'],
            is_default: false,
            max_tokens: 200000,
            created_at: '2025-01-15T00:00:00Z',
          },
        ],
        total: 2,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockModels,
        status: 200,
        statusText: 'OK',
      });

      const result = await aiRegistryService.listModels();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/ai-registry/models');
      expect(result).toEqual(mockModels);
    });

    it('handles errors when listing models', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Unauthorized'));

      await expect(aiRegistryService.listModels()).rejects.toThrow('Unauthorized');
    });
  });

  describe('registerModel', () => {
    it('registers a new AI model with correct endpoint and data', async () => {
      const modelData = {
        name: 'Llama 3.1',
        provider: 'meta',
        model_identifier: 'llama-3.1-70b',
        capabilities: ['text-generation'],
        max_tokens: 128000,
        api_key: 'test-key-123',
      };

      const mockResponse = {
        id: 3,
        ...modelData,
        is_default: false,
        created_at: '2025-12-21T10:00:00Z',
        updated_at: '2025-12-21T10:00:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        status: 201,
        statusText: 'Created',
      });

      const result = await aiRegistryService.registerModel(modelData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/ai-registry/models', modelData);
      expect(result).toEqual(mockResponse);
    });

    it('registers a model without optional api_key', async () => {
      const modelData = {
        name: 'Custom Model',
        provider: 'custom',
        model_identifier: 'custom-model-v1',
        capabilities: ['text-generation'],
        max_tokens: 50000,
      };

      const mockResponse = {
        id: 4,
        ...modelData,
        is_default: false,
        created_at: '2025-12-21T10:00:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        status: 201,
        statusText: 'Created',
      });

      const result = await aiRegistryService.registerModel(modelData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/ai-registry/models', modelData);
      expect(result).toEqual(mockResponse);
    });

    it('handles errors when registering model', async () => {
      const modelData = {
        name: 'Test Model',
        provider: 'test',
        model_identifier: 'test-v1',
        capabilities: ['text-generation'],
        max_tokens: 10000,
      };

      mockApiClient.post.mockRejectedValueOnce(new Error('Model already exists'));

      await expect(aiRegistryService.registerModel(modelData)).rejects.toThrow('Model already exists');
    });
  });

  describe('getModelDetails', () => {
    it('fetches model details by id', async () => {
      const modelId = 1;
      const mockModel = {
        id: modelId,
        name: 'GPT-4',
        provider: 'openai',
        model_identifier: 'gpt-4-turbo-preview',
        capabilities: ['text-generation', 'reasoning'],
        is_default: true,
        max_tokens: 128000,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-12-21T10:00:00Z',
        usage_count: 1500,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockModel,
        status: 200,
        statusText: 'OK',
      });

      const result = await aiRegistryService.getModelDetails(modelId);

      expect(mockApiClient.get).toHaveBeenCalledWith(`/v1/ai-registry/models/${modelId}`);
      expect(result).toEqual(mockModel);
    });

    it('handles errors when fetching model details', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Model not found'));

      await expect(aiRegistryService.getModelDetails(999)).rejects.toThrow('Model not found');
    });
  });

  describe('switchDefaultModel', () => {
    it('switches the default model successfully', async () => {
      const modelId = 2;

      const mockResponse = {
        message: 'Default model switched successfully',
        previous_default_id: 1,
        new_default_id: 2,
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
      });

      const result = await aiRegistryService.switchDefaultModel(modelId);

      expect(mockApiClient.post).toHaveBeenCalledWith(`/v1/ai-registry/models/${modelId}/switch`, {});
      expect(result).toEqual(mockResponse);
    });

    it('handles errors when switching default model', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Model not found'));

      await expect(aiRegistryService.switchDefaultModel(999)).rejects.toThrow('Model not found');
    });
  });

  describe('getUsageSummary', () => {
    it('fetches usage summary with default parameters', async () => {
      const mockSummary = {
        total_requests: 5000,
        total_tokens: 1500000,
        total_cost: 45.50,
        period: {
          start_date: '2025-12-01T00:00:00Z',
          end_date: '2025-12-21T23:59:59Z',
        },
        by_provider: [
          { provider: 'openai', requests: 3000, tokens: 900000, cost: 27.00 },
          { provider: 'anthropic', requests: 2000, tokens: 600000, cost: 18.50 },
        ],
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockSummary,
        status: 200,
        statusText: 'OK',
      });

      const result = await aiRegistryService.getUsageSummary();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/ai-usage/summary');
      expect(result).toEqual(mockSummary);
    });

    it('fetches usage summary with date range', async () => {
      const params = {
        start_date: '2025-12-01',
        end_date: '2025-12-21',
      };

      const mockSummary = {
        total_requests: 2000,
        total_tokens: 600000,
        total_cost: 18.00,
        period: {
          start_date: '2025-12-01T00:00:00Z',
          end_date: '2025-12-21T23:59:59Z',
        },
        by_provider: [
          { provider: 'openai', requests: 1200, tokens: 360000, cost: 10.80 },
          { provider: 'anthropic', requests: 800, tokens: 240000, cost: 7.20 },
        ],
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockSummary,
        status: 200,
        statusText: 'OK',
      });

      const result = await aiRegistryService.getUsageSummary(params);

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/ai-usage/summary?start_date=2025-12-01&end_date=2025-12-21');
      expect(result).toEqual(mockSummary);
    });

    it('handles errors when fetching usage summary', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Invalid date range'));

      await expect(aiRegistryService.getUsageSummary()).rejects.toThrow('Invalid date range');
    });
  });

  describe('getUsageByModel', () => {
    it('fetches usage breakdown by model', async () => {
      const mockUsageByModel = {
        usage: [
          {
            model_id: 1,
            model_name: 'GPT-4',
            provider: 'openai',
            requests: 3000,
            tokens: 900000,
            cost: 27.00,
            avg_tokens_per_request: 300,
          },
          {
            model_id: 2,
            model_name: 'Claude 3.5 Sonnet',
            provider: 'anthropic',
            requests: 2000,
            tokens: 600000,
            cost: 18.50,
            avg_tokens_per_request: 300,
          },
        ],
        total: 2,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockUsageByModel,
        status: 200,
        statusText: 'OK',
      });

      const result = await aiRegistryService.getUsageByModel();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/ai-usage/models');
      expect(result).toEqual(mockUsageByModel);
    });

    it('fetches usage by model with date range', async () => {
      const params = {
        start_date: '2025-12-01',
        end_date: '2025-12-21',
      };

      const mockUsageByModel = {
        usage: [
          {
            model_id: 1,
            model_name: 'GPT-4',
            provider: 'openai',
            requests: 1500,
            tokens: 450000,
            cost: 13.50,
            avg_tokens_per_request: 300,
          },
        ],
        total: 1,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockUsageByModel,
        status: 200,
        statusText: 'OK',
      });

      const result = await aiRegistryService.getUsageByModel(params);

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/ai-usage/models?start_date=2025-12-01&end_date=2025-12-21');
      expect(result).toEqual(mockUsageByModel);
    });

    it('handles errors when fetching usage by model', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Forbidden'));

      await expect(aiRegistryService.getUsageByModel()).rejects.toThrow('Forbidden');
    });
  });

  describe('getDailyUsage', () => {
    it('fetches daily usage trends', async () => {
      const mockDailyUsage = {
        daily_usage: [
          {
            date: '2025-12-19',
            requests: 500,
            tokens: 150000,
            cost: 4.50,
          },
          {
            date: '2025-12-20',
            requests: 600,
            tokens: 180000,
            cost: 5.40,
          },
          {
            date: '2025-12-21',
            requests: 700,
            tokens: 210000,
            cost: 6.30,
          },
        ],
        period: {
          start_date: '2025-12-19T00:00:00Z',
          end_date: '2025-12-21T23:59:59Z',
        },
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockDailyUsage,
        status: 200,
        statusText: 'OK',
      });

      const result = await aiRegistryService.getDailyUsage();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/ai-usage/daily');
      expect(result).toEqual(mockDailyUsage);
    });

    it('fetches daily usage with date range', async () => {
      const params = {
        start_date: '2025-12-01',
        end_date: '2025-12-21',
      };

      const mockDailyUsage = {
        daily_usage: [
          {
            date: '2025-12-01',
            requests: 400,
            tokens: 120000,
            cost: 3.60,
          },
          {
            date: '2025-12-02',
            requests: 450,
            tokens: 135000,
            cost: 4.05,
          },
        ],
        period: {
          start_date: '2025-12-01T00:00:00Z',
          end_date: '2025-12-21T23:59:59Z',
        },
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockDailyUsage,
        status: 200,
        statusText: 'OK',
      });

      const result = await aiRegistryService.getDailyUsage(params);

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/ai-usage/daily?start_date=2025-12-01&end_date=2025-12-21');
      expect(result).toEqual(mockDailyUsage);
    });

    it('handles errors when fetching daily usage', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Invalid date range'));

      await expect(aiRegistryService.getDailyUsage()).rejects.toThrow('Invalid date range');
    });
  });

  describe('exportUsageData', () => {
    it('exports usage data with default format', async () => {
      const mockExport = {
        export_id: 'export-12345',
        download_url: 'https://api.ainative.studio/exports/export-12345.csv',
        format: 'csv',
        created_at: '2025-12-21T10:00:00Z',
        expires_at: '2025-12-22T10:00:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockExport,
        status: 200,
        statusText: 'OK',
      });

      const result = await aiRegistryService.exportUsageData({});

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/ai-usage/export', {});
      expect(result).toEqual(mockExport);
    });

    it('exports usage data with custom parameters', async () => {
      const exportParams = {
        start_date: '2025-12-01',
        end_date: '2025-12-21',
        format: 'json',
        include_models: true,
      };

      const mockExport = {
        export_id: 'export-67890',
        download_url: 'https://api.ainative.studio/exports/export-67890.json',
        format: 'json',
        created_at: '2025-12-21T10:00:00Z',
        expires_at: '2025-12-22T10:00:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockExport,
        status: 200,
        statusText: 'OK',
      });

      const result = await aiRegistryService.exportUsageData(exportParams);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/ai-usage/export', exportParams);
      expect(result).toEqual(mockExport);
    });

    it('handles errors when exporting usage data', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Export failed'));

      await expect(aiRegistryService.exportUsageData({})).rejects.toThrow('Export failed');
    });
  });

  describe('loadContext', () => {
    it('loads context from vector database successfully', async () => {
      const contextQuery = {
        query: 'machine learning best practices',
        max_results: 5,
      };

      const mockContext = {
        contexts: [
          {
            id: 'ctx-1',
            content: 'Machine learning requires proper data preprocessing...',
            relevance_score: 0.95,
            source: 'internal-docs',
          },
          {
            id: 'ctx-2',
            content: 'Model validation is crucial for production deployment...',
            relevance_score: 0.88,
            source: 'best-practices',
          },
        ],
        query: 'machine learning best practices',
        total_results: 2,
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockContext,
        status: 200,
        statusText: 'OK',
      });

      const result = await aiRegistryService.loadContext(contextQuery);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/ai-context/load', contextQuery);
      expect(result).toEqual(mockContext);
    });

    it('loads context with filters', async () => {
      const contextQuery = {
        query: 'deployment strategies',
        max_results: 3,
        filters: {
          source: 'production-docs',
          date_from: '2025-01-01',
        },
      };

      const mockContext = {
        contexts: [
          {
            id: 'ctx-3',
            content: 'Blue-green deployment reduces downtime...',
            relevance_score: 0.92,
            source: 'production-docs',
          },
        ],
        query: 'deployment strategies',
        total_results: 1,
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockContext,
        status: 200,
        statusText: 'OK',
      });

      const result = await aiRegistryService.loadContext(contextQuery);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/ai-context/load', contextQuery);
      expect(result).toEqual(mockContext);
    });

    it('handles errors when loading context', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Context database unavailable'));

      await expect(aiRegistryService.loadContext({ query: 'test', max_results: 5 }))
        .rejects.toThrow('Context database unavailable');
    });
  });

  describe('multiModelInference', () => {
    it('performs multi-model inference successfully', async () => {
      const inferenceRequest = {
        prompt: 'Explain quantum computing in simple terms',
        model_ids: [1, 2],
        strategy: 'parallel',
      };

      const mockInferenceResponse = {
        request_id: 'inf-12345',
        results: [
          {
            model_id: 1,
            model_name: 'GPT-4',
            response: 'Quantum computing uses quantum bits...',
            tokens_used: 150,
            latency_ms: 800,
          },
          {
            model_id: 2,
            model_name: 'Claude 3.5 Sonnet',
            response: 'Quantum computers leverage quantum mechanics...',
            tokens_used: 145,
            latency_ms: 750,
          },
        ],
        strategy_used: 'parallel',
        total_latency_ms: 850,
        total_tokens: 295,
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockInferenceResponse,
        status: 200,
        statusText: 'OK',
      });

      const result = await aiRegistryService.multiModelInference(inferenceRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/ai-orchestration/multi-model', inferenceRequest);
      expect(result).toEqual(mockInferenceResponse);
    });

    it('performs multi-model inference with consensus strategy', async () => {
      const inferenceRequest = {
        prompt: 'Is this text spam?',
        model_ids: [1, 2, 3],
        strategy: 'consensus',
        consensus_threshold: 0.66,
      };

      const mockInferenceResponse = {
        request_id: 'inf-67890',
        results: [
          {
            model_id: 1,
            model_name: 'GPT-4',
            response: 'Yes, this appears to be spam.',
            tokens_used: 25,
            latency_ms: 300,
          },
          {
            model_id: 2,
            model_name: 'Claude 3.5 Sonnet',
            response: 'Yes, likely spam.',
            tokens_used: 20,
            latency_ms: 280,
          },
          {
            model_id: 3,
            model_name: 'Llama 3.1',
            response: 'Yes, spam detected.',
            tokens_used: 18,
            latency_ms: 250,
          },
        ],
        consensus_result: 'Yes, this is spam.',
        consensus_confidence: 1.0,
        strategy_used: 'consensus',
        total_latency_ms: 320,
        total_tokens: 63,
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockInferenceResponse,
        status: 200,
        statusText: 'OK',
      });

      const result = await aiRegistryService.multiModelInference(inferenceRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/ai-orchestration/multi-model', inferenceRequest);
      expect(result).toEqual(mockInferenceResponse);
    });

    it('handles errors during multi-model inference', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('One or more models unavailable'));

      await expect(aiRegistryService.multiModelInference({
        prompt: 'test',
        model_ids: [1, 2],
        strategy: 'parallel',
      })).rejects.toThrow('One or more models unavailable');
    });
  });
});
