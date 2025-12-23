import apiClient from '../api-client';
import sandboxService from '../sandbox-service';

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

// Mock console.error to avoid noise in tests
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('SandboxService', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listEnvironments', () => {
    it('fetches available sandbox environments', async () => {
      const mockEnvironments = [
        {
          id: 'python-3.11',
          name: 'Python 3.11',
          language: 'python',
          version: '3.11',
          description: 'Python 3.11 with common packages',
          available: true,
          timeout: 30,
          memoryLimit: 256,
        },
        {
          id: 'node-20',
          name: 'Node.js 20',
          language: 'javascript',
          version: '20',
          description: 'Node.js 20 LTS',
          available: true,
          timeout: 30,
          memoryLimit: 256,
        },
      ];

      mockApiClient.get.mockResolvedValueOnce({
        data: mockEnvironments,
        status: 200,
        statusText: 'OK',
      });

      const result = await sandboxService.listEnvironments();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/sandbox/environments');
      expect(result).toEqual(mockEnvironments);
    });

    it('handles errors when fetching environments', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Service unavailable'));

      await expect(sandboxService.listEnvironments()).rejects.toThrow('Service unavailable');
    });
  });

  describe('createSandbox', () => {
    it('creates a new sandbox', async () => {
      const createRequest = {
        environmentId: 'python-3.11',
        name: 'My Python Sandbox',
        description: 'Testing Python code',
        tags: ['testing', 'python'],
        ttl: 3600,
      };

      const mockSandbox = {
        id: 'sandbox-1',
        environmentId: 'python-3.11',
        status: 'creating',
        createdAt: '2025-12-21T10:00:00Z',
        updatedAt: '2025-12-21T10:00:00Z',
        createdBy: 'user-1',
        expiresAt: '2025-12-21T11:00:00Z',
        metadata: {
          name: 'My Python Sandbox',
          description: 'Testing Python code',
          tags: ['testing', 'python'],
        },
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockSandbox,
        status: 201,
        statusText: 'Created',
      });

      const result = await sandboxService.createSandbox(createRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/sandbox/create', createRequest);
      expect(result).toEqual(mockSandbox);
    });

    it('handles errors when creating sandbox', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Invalid environment'));

      await expect(
        sandboxService.createSandbox({ environmentId: 'invalid' })
      ).rejects.toThrow('Invalid environment');
    });
  });

  describe('getSandbox', () => {
    it('fetches sandbox details', async () => {
      const mockSandbox = {
        id: 'sandbox-1',
        environmentId: 'python-3.11',
        status: 'ready',
        createdAt: '2025-12-21T10:00:00Z',
        updatedAt: '2025-12-21T10:01:00Z',
        createdBy: 'user-1',
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockSandbox,
        status: 200,
        statusText: 'OK',
      });

      const result = await sandboxService.getSandbox('sandbox-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/sandbox/sandbox-1');
      expect(result).toEqual(mockSandbox);
    });

    it('handles errors when fetching sandbox', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Sandbox not found'));

      await expect(sandboxService.getSandbox('invalid-id')).rejects.toThrow('Sandbox not found');
    });
  });

  describe('deleteSandbox', () => {
    it('deletes a sandbox', async () => {
      mockApiClient.delete.mockResolvedValueOnce({
        data: undefined,
        status: 204,
        statusText: 'No Content',
      });

      await sandboxService.deleteSandbox('sandbox-1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/v1/sandbox/sandbox-1');
    });

    it('handles errors when deleting sandbox', async () => {
      mockApiClient.delete.mockRejectedValueOnce(new Error('Sandbox not found'));

      await expect(sandboxService.deleteSandbox('invalid-id')).rejects.toThrow('Sandbox not found');
    });
  });

  describe('execute', () => {
    it('executes code in sandbox', async () => {
      const executionRequest = {
        code: 'print("Hello, World!")',
        input: '',
        timeout: 10,
        environment: {
          variables: { DEBUG: 'true' },
        },
      };

      const mockResult = {
        executionId: 'exec-1',
        status: 'completed',
        output: 'Hello, World!\n',
        exitCode: 0,
        executionTime: 150,
        memoryUsed: 25,
        timestamp: '2025-12-21T10:05:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResult,
        status: 200,
        statusText: 'OK',
      });

      const result = await sandboxService.execute('sandbox-1', executionRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/sandbox/sandbox-1/execute', executionRequest);
      expect(result).toEqual(mockResult);
    });

    it('handles execution with error output', async () => {
      const executionRequest = {
        code: 'raise Exception("Test error")',
      };

      const mockResult = {
        executionId: 'exec-2',
        status: 'failed',
        output: '',
        error: 'Exception: Test error',
        exitCode: 1,
        executionTime: 100,
        timestamp: '2025-12-21T10:06:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResult,
        status: 200,
        statusText: 'OK',
      });

      const result = await sandboxService.execute('sandbox-1', executionRequest);

      expect(result.status).toBe('failed');
      expect(result.error).toBeDefined();
    });

    it('handles execution timeout', async () => {
      const executionRequest = {
        code: 'while True: pass',
        timeout: 5,
      };

      const mockResult = {
        executionId: 'exec-3',
        status: 'timeout',
        output: '',
        error: 'Execution timed out after 5 seconds',
        executionTime: 5000,
        timestamp: '2025-12-21T10:07:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResult,
        status: 200,
        statusText: 'OK',
      });

      const result = await sandboxService.execute('sandbox-1', executionRequest);

      expect(result.status).toBe('timeout');
    });

    it('handles errors when executing code', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Sandbox not ready'));

      await expect(
        sandboxService.execute('sandbox-1', { code: 'print("test")' })
      ).rejects.toThrow('Sandbox not ready');
    });
  });

  describe('getExecutionHistory', () => {
    it('fetches execution history', async () => {
      const mockHistory = [
        {
          executionId: 'exec-1',
          status: 'completed',
          output: 'Hello, World!\n',
          exitCode: 0,
          executionTime: 150,
          timestamp: '2025-12-21T10:05:00Z',
        },
        {
          executionId: 'exec-2',
          status: 'failed',
          error: 'SyntaxError',
          exitCode: 1,
          executionTime: 50,
          timestamp: '2025-12-21T10:03:00Z',
        },
      ];

      mockApiClient.get.mockResolvedValueOnce({
        data: mockHistory,
        status: 200,
        statusText: 'OK',
      });

      const result = await sandboxService.getExecutionHistory('sandbox-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/sandbox/sandbox-1/history?limit=20');
      expect(result).toEqual(mockHistory);
    });

    it('fetches execution history with custom limit', async () => {
      const mockHistory: any[] = [];

      mockApiClient.get.mockResolvedValueOnce({
        data: mockHistory,
        status: 200,
        statusText: 'OK',
      });

      const result = await sandboxService.getExecutionHistory('sandbox-1', 50);

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/sandbox/sandbox-1/history?limit=50');
      expect(result).toEqual(mockHistory);
    });

    it('handles errors when fetching history', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Sandbox not found'));

      await expect(sandboxService.getExecutionHistory('invalid-id')).rejects.toThrow('Sandbox not found');
    });
  });
});
