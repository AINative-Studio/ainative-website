/**
 * API Key Service Tests
 * Comprehensive tests for API key management operations
 */

import apiClient from '@/lib/api-client';

// Mock apiClient
jest.mock('@/lib/api-client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

import type { ApiKeyService as ApiKeyServiceType } from '../apiKeyService';

describe('ApiKeyService', () => {
  let apiKeyService: ApiKeyServiceType;

  const mockApiKey = {
    id: 'key-123',
    name: 'Test API Key',
    key: 'ak_test_xxxxx',
    created: '2025-01-01T00:00:00Z',
    lastUsed: '2025-01-15T12:00:00Z',
    status: 'active' as const,
  };

  const mockUsageStats = {
    total_requests: 1500,
    requests_today: 45,
    last_used: '2025-01-15T12:00:00Z',
    daily_usage: [
      { date: '2025-01-14', requests: 30 },
      { date: '2025-01-15', requests: 45 },
    ],
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const { ApiKeyService } = await import('../apiKeyService');
    apiKeyService = new ApiKeyService();
  });

  describe('listApiKeys()', () => {
    it('should fetch all API keys successfully', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { keys: [mockApiKey] },
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await apiKeyService.listApiKeys();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/v1/api-keys');
      expect(result).toEqual([mockApiKey]);
    });

    it('should throw error when API returns unsuccessful response', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: false,
          message: 'Unauthorized',
          data: null,
        },
        status: 200,
        statusText: 'OK',
      });

      await expect(apiKeyService.listApiKeys()).rejects.toThrow('Unauthorized');
    });

    it('should handle network errors', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Network Error'));

      await expect(apiKeyService.listApiKeys()).rejects.toThrow('Network Error');
    });

    it('should throw error when keys data is missing', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: '',
          data: {},
        },
        status: 200,
        statusText: 'OK',
      });

      await expect(apiKeyService.listApiKeys()).rejects.toThrow('Failed to fetch API keys');
    });
  });

  describe('createApiKey()', () => {
    it('should create a new API key successfully', async () => {
      const createResponse = { key: 'ak_new_xxxxx', id: 'key-new' };
      mockedApiClient.post.mockResolvedValue({
        data: {
          success: true,
          message: 'API key created',
          data: createResponse,
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await apiKeyService.createApiKey('My New Key');

      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/v1/api-keys', { name: 'My New Key' });
      expect(result).toEqual(createResponse);
    });

    it('should throw error when creation fails', async () => {
      mockedApiClient.post.mockResolvedValue({
        data: {
          success: false,
          message: 'Rate limit exceeded',
          data: null,
        },
        status: 200,
        statusText: 'OK',
      });

      await expect(apiKeyService.createApiKey('Test')).rejects.toThrow('Rate limit exceeded');
    });

    it('should handle server errors during creation', async () => {
      mockedApiClient.post.mockRejectedValue(new Error('Server Error'));

      await expect(apiKeyService.createApiKey('Test')).rejects.toThrow('Server Error');
    });
  });

  describe('regenerateApiKey()', () => {
    it('should regenerate an API key successfully', async () => {
      const regenerateResponse = { key: 'ak_regen_xxxxx' };
      mockedApiClient.post.mockResolvedValue({
        data: {
          success: true,
          message: 'API key regenerated',
          data: regenerateResponse,
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await apiKeyService.regenerateApiKey('key-123');

      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/v1/api-keys/key-123/regenerate');
      expect(result).toEqual(regenerateResponse);
    });

    it('should throw error when regeneration fails', async () => {
      mockedApiClient.post.mockResolvedValue({
        data: {
          success: false,
          message: 'Key not found',
          data: null,
        },
        status: 200,
        statusText: 'OK',
      });

      await expect(apiKeyService.regenerateApiKey('invalid-id')).rejects.toThrow('Key not found');
    });
  });

  describe('deleteApiKey()', () => {
    it('should delete an API key successfully', async () => {
      mockedApiClient.delete.mockResolvedValue({
        data: {
          success: true,
          message: 'API key deleted',
          data: { success: true },
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await apiKeyService.deleteApiKey('key-123');

      expect(mockedApiClient.delete).toHaveBeenCalledWith('/api/v1/api-keys/key-123');
      expect(result.success).toBe(true);
      expect(result.message).toBe('API key deleted');
    });

    it('should throw error when deletion fails', async () => {
      mockedApiClient.delete.mockResolvedValue({
        data: {
          success: false,
          message: 'Cannot delete active key',
          data: null,
        },
        status: 200,
        statusText: 'OK',
      });

      await expect(apiKeyService.deleteApiKey('key-123')).rejects.toThrow('Cannot delete active key');
    });
  });

  describe('updateApiKey()', () => {
    it('should update API key name successfully', async () => {
      const updatedKey = { ...mockApiKey, name: 'Updated Name' };
      mockedApiClient.put.mockResolvedValue({
        data: {
          success: true,
          message: 'API key updated',
          data: updatedKey,
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await apiKeyService.updateApiKey('key-123', { name: 'Updated Name' });

      expect(mockedApiClient.put).toHaveBeenCalledWith('/api/v1/api-keys/key-123', { name: 'Updated Name' });
      expect(result.name).toBe('Updated Name');
    });

    it('should update API key status successfully', async () => {
      const updatedKey = { ...mockApiKey, status: 'inactive' };
      mockedApiClient.put.mockResolvedValue({
        data: {
          success: true,
          message: 'API key updated',
          data: updatedKey,
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await apiKeyService.updateApiKey('key-123', { status: 'inactive' });

      expect(result.status).toBe('inactive');
    });

    it('should throw error when update fails', async () => {
      mockedApiClient.put.mockResolvedValue({
        data: {
          success: false,
          message: 'Validation failed',
          data: null,
        },
        status: 200,
        statusText: 'OK',
      });

      await expect(apiKeyService.updateApiKey('key-123', { name: '' })).rejects.toThrow('Validation failed');
    });
  });

  describe('getApiKeyUsage()', () => {
    it('should fetch API key usage statistics successfully', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: mockUsageStats,
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await apiKeyService.getApiKeyUsage('key-123');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/v1/api-keys/key-123/usage');
      expect(result).toEqual(mockUsageStats);
    });

    it('should throw error when usage fetch fails', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: false,
          message: 'Usage data unavailable',
          data: null,
        },
        status: 200,
        statusText: 'OK',
      });

      await expect(apiKeyService.getApiKeyUsage('key-123')).rejects.toThrow('Usage data unavailable');
    });
  });

  describe('getApiKey()', () => {
    it('should fetch a single API key by ID', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: mockApiKey,
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await apiKeyService.getApiKey('key-123');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/v1/api-keys/key-123');
      expect(result).toEqual(mockApiKey);
    });

    it('should throw error when key not found', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: false,
          message: 'API key not found',
          data: null,
        },
        status: 200,
        statusText: 'OK',
      });

      await expect(apiKeyService.getApiKey('invalid-id')).rejects.toThrow('API key not found');
    });
  });

  describe('Singleton Export', () => {
    it('should export a singleton instance', async () => {
      const { apiKeyService } = await import('../apiKeyService');
      expect(apiKeyService).toBeDefined();
      expect(typeof apiKeyService.listApiKeys).toBe('function');
    });
  });
});
