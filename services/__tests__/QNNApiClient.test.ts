import { render, screen } from "@testing-library/react";

import QNNApiClient, {
  QNNError,
  QNNAuthenticationError,
  QNNValidationError,
  QNNNetworkError,
  QNNTimeoutError,
  QNNRateLimitError,
} from '../qnnApiClient';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('QNNApiClient', () => {
  let client: QNNApiClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();

    // Setup axios create mock
    mockAxiosInstance = {
      get: jest.fn() as jest.Mock as jest.Mock,
      post: jest.fn() as jest.Mock as jest.Mock,
      put: jest.fn() as jest.Mock as jest.Mock,
      delete: jest.fn() as jest.Mock as jest.Mock,
      request: jest.fn() as jest.Mock as jest.Mock,
      interceptors: {
        request: {
          use: jest.fn() as jest.Mock as jest.Mock,
        },
        response: {
          use: jest.fn() as jest.Mock as jest.Mock,
        },
      },
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

    client = new QNNApiClient('https://qnn-api.test.com', 5000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://qnn-api.test.com',
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        })
      );
    });

    it('should setup request and response interceptors', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('Repository Management', () => {
    it('should list repositories successfully', async () => {
      const mockResponse = {
        data: {
          data: [{ id: '1', name: 'test-repo' }],
          total: 1,
          page: 1,
          pageSize: 20,
        },
      };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      const result = await client.listRepositories();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v1/repositories', { params: undefined });
      expect(result).toEqual(mockResponse.data);
    });

    it('should search repositories with params', async () => {
      const searchParams = { query: 'test', language: 'python' };
      const mockResponse = {
        data: {
          data: [{ id: '1', name: 'test-repo' }],
          total: 1,
          page: 1,
          pageSize: 20,
        },
      };
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      const result = await client.searchRepositories(searchParams);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/v1/repositories/search', searchParams);
      expect(result).toEqual(mockResponse.data);
    });

    it('should get repository by id', async () => {
      const mockResponse = {
        data: {
          data: { id: '1', name: 'test-repo', stars: 100 },
        },
      };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      const result = await client.getRepository('1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v1/repositories/1');
      expect(result).toEqual(mockResponse.data.data);
    });

    it('should get repository analysis', async () => {
      const mockResponse = {
        data: {
          data: { repositoryId: '1', complexity: 'medium', score: 85 },
        },
      };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      const result = await client.getRepositoryAnalysis('1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v1/repositories/1/analysis');
      expect(result).toEqual(mockResponse.data.data);
    });
  });

  describe('Model Management', () => {
    it('should list models', async () => {
      const mockResponse = {
        data: {
          data: [{ id: '1', name: 'test-model', status: 'active' }],
        },
      };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      const result = await client.listModels();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v1/models', { params: undefined });
      expect(result).toEqual(mockResponse.data.data);
    });

    it('should create a model', async () => {
      const createRequest = { name: 'new-model', architecture: 'transformer' };
      const mockResponse = {
        data: {
          data: { id: '1', name: 'new-model', status: 'created' },
        },
      };
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      const result = await client.createModel(createRequest as any);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/v1/models', createRequest);
      expect(result).toEqual(mockResponse.data.data);
    });

    it('should get model by id', async () => {
      const mockResponse = {
        data: {
          data: { id: '1', name: 'test-model' },
        },
      };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      const result = await client.getModel('1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v1/models/1');
      expect(result).toEqual(mockResponse.data.data);
    });

    it('should update model', async () => {
      const updateRequest = { name: 'updated-model' };
      const mockResponse = {
        data: {
          data: { id: '1', name: 'updated-model' },
        },
      };
      mockAxiosInstance.put.mockResolvedValueOnce(mockResponse);

      const result = await client.updateModel('1', updateRequest as any);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/api/v1/models/1', updateRequest);
      expect(result).toEqual(mockResponse.data.data);
    });

    it('should delete model', async () => {
      mockAxiosInstance.delete.mockResolvedValueOnce({ data: {} });

      await client.deleteModel('1');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/api/v1/models/1');
    });
  });

  describe('Training Methods', () => {
    it('should start training', async () => {
      const trainingConfig = { modelId: '1', epochs: 10 };
      const mockResponse = {
        data: {
          data: { id: 'job-1', status: 'running', modelId: '1' },
        },
      };
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      const result = await client.startTraining(trainingConfig as any);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/v1/training/start', trainingConfig);
      expect(result).toEqual(mockResponse.data.data);
    });

    it('should get training status', async () => {
      const mockResponse = {
        data: { status: 'running' },
      };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      const result = await client.getTrainingStatus('job-1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v1/training/job-1/status');
      expect(result).toEqual('running');
    });

    it('should get training logs', async () => {
      const mockResponse = {
        data: {
          data: { logs: ['log line 1', 'log line 2'], hasMore: false },
        },
      };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      const result = await client.getTrainingLogs('job-1', 0, 100);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v1/training/job-1/logs', {
        params: { offset: 0, limit: 100 },
      });
      expect(result).toEqual(mockResponse.data.data);
    });

    it('should stop training', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({ data: {} });

      await client.stopTraining('job-1');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/v1/training/job-1/stop');
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors (401)', async () => {
      const error = {
        response: {
          status: 401,
          data: { error: { message: 'Unauthorized' } },
        },
        isAxiosError: true,
      };
      mockAxiosInstance.get.mockRejectedValueOnce(error);

      await expect(client.listModels()).rejects.toThrow(QNNAuthenticationError);
    });

    it('should handle validation errors (400)', async () => {
      const error = {
        response: {
          status: 400,
          data: { error: { message: 'Invalid input' } },
        },
        isAxiosError: true,
      };
      mockAxiosInstance.post.mockRejectedValueOnce(error);

      await expect(client.createModel({} as any)).rejects.toThrow(QNNValidationError);
    });

    it('should handle rate limit errors (429)', async () => {
      const error = {
        response: {
          status: 429,
          data: { error: { message: 'Too many requests' } },
          headers: { 'retry-after': '60' },
        },
        isAxiosError: true,
      };
      mockAxiosInstance.get.mockRejectedValueOnce(error);

      await expect(client.listModels()).rejects.toThrow(QNNRateLimitError);
    });

    it('should handle network errors', async () => {
      const error = {
        message: 'Network Error',
        isAxiosError: true,
      };
      mockAxiosInstance.get.mockRejectedValueOnce(error);

      await expect(client.healthCheck()).rejects.toThrow(QNNNetworkError);
    });

    it('should handle timeout errors', async () => {
      const error = {
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded',
        isAxiosError: true,
      };
      mockAxiosInstance.get.mockRejectedValueOnce(error);

      await expect(client.healthCheck()).rejects.toThrow(QNNTimeoutError);
    });
  });

  describe('Utility Methods', () => {
    it('should perform health check', async () => {
      const mockResponse = {
        data: { status: 'healthy', timestamp: '2024-01-01T00:00:00Z' },
      };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      const result = await client.healthCheck();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/health');
      expect(result).toEqual(mockResponse.data);
    });

    it('should get API version', async () => {
      const mockResponse = {
        data: { version: '1.0.0', buildDate: '2024-01-01' },
      };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      const result = await client.getVersion();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/version');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Authentication', () => {
    it('should include auth token in requests when available', () => {
      localStorageMock.setItem('access_token', 'test-token-123');

      // Create new client to trigger interceptor setup
      const newClient = new QNNApiClient('https://qnn-api.test.com');

      // Verify request interceptor was registered
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();

      // Get the interceptor function
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[
        mockAxiosInstance.interceptors.request.use.mock.calls.length - 1
      ][0];

      // Test the interceptor
      const config: any = { headers: {} };
      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBe('Bearer test-token-123');
    });

    it('should not add auth header when token is not available', () => {
      localStorageMock.clear();

      // Create new client
      const newClient = new QNNApiClient('https://qnn-api.test.com');

      // Get the interceptor function
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[
        mockAxiosInstance.interceptors.request.use.mock.calls.length - 1
      ][0];

      // Test the interceptor
      const config: any = { headers: {} };
      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBeUndefined();
    });
  });
});
