/**
 * Admin API Keys Service Tests
 * Tests for API key management operations
 */

import { adminApiKeyService } from '@/services/admin/apiKeys';
import { adminApi } from '@/services/admin/client';
import type { AdminApiKey, CreateApiKeyRequest } from '@/services/admin/types';

jest.mock('@/services/admin/client');

describe('AdminApiKeyService', () => {
  const mockAdminApi = adminApi as jest.Mocked<typeof adminApi>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listApiKeys', () => {
    it('should fetch all API keys', async () => {
      const mockKeys = {
        items: [
          {
            id: '1',
            user_id: 'user1',
            name: 'Production Key',
            key_preview: 'sk_...xyz',
            created_at: '2024-01-01T00:00:00Z',
            status: 'active' as const,
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        hasMore: false,
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockKeys,
      });

      const result = await adminApiKeyService.listApiKeys();

      expect(mockAdminApi.get).toHaveBeenCalledWith('keys');
      expect(result).toEqual(mockKeys);
    });

    it('should filter by user_id', async () => {
      mockAdminApi.buildQueryString.mockReturnValue('?user_id=user123');
      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: { items: [], total: 0, page: 1, limit: 10, hasMore: false },
      });

      await adminApiKeyService.listApiKeys({ user_id: 'user123' });

      expect(mockAdminApi.get).toHaveBeenCalledWith('keys?user_id=user123');
    });

    it('should filter by status', async () => {
      mockAdminApi.buildQueryString.mockReturnValue('?status=active');
      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: { items: [], total: 0, page: 1, limit: 10, hasMore: false },
      });

      await adminApiKeyService.listApiKeys({ status: 'active' });

      expect(mockAdminApi.get).toHaveBeenCalledWith('keys?status=active');
    });
  });

  describe('getApiKey', () => {
    it('should fetch a single API key', async () => {
      const mockKey: AdminApiKey = {
        id: 'key123',
        user_id: 'user1',
        name: 'Test Key',
        key_preview: 'sk_...abc',
        created_at: '2024-01-01T00:00:00Z',
        status: 'active',
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockKey,
      });

      const result = await adminApiKeyService.getApiKey('key123');

      expect(mockAdminApi.get).toHaveBeenCalledWith('keys/key123');
      expect(result).toEqual(mockKey);
    });

    it('should throw error when key not found', async () => {
      mockAdminApi.get.mockResolvedValue({
        success: false,
        message: 'API key not found',
        data: null,
      });

      await expect(adminApiKeyService.getApiKey('invalid')).rejects.toThrow('API key not found');
    });
  });

  describe('createApiKey', () => {
    it('should create a new API key', async () => {
      const keyData: CreateApiKeyRequest = {
        name: 'New Production Key',
        scopes: ['read', 'write'],
        rate_limit: 1000,
      };

      mockAdminApi.post.mockResolvedValue({
        success: true,
        message: 'API key created',
        data: {
          id: 'newkey123',
          key: 'sk_live_abc123xyz789',
          name: keyData.name,
        },
      });

      const result = await adminApiKeyService.createApiKey('user123', keyData);

      expect(mockAdminApi.post).toHaveBeenCalledWith('keys', {
        user_id: 'user123',
        ...keyData,
      });
      expect(result.key).toBe('sk_live_abc123xyz789');
      expect(result.id).toBe('newkey123');
    });

    it('should throw error on failure', async () => {
      mockAdminApi.post.mockResolvedValue({
        success: false,
        message: 'Rate limit exceeded',
        data: null,
      });

      await expect(
        adminApiKeyService.createApiKey('user123', { name: 'Test' })
      ).rejects.toThrow('Rate limit exceeded');
    });
  });

  describe('revokeApiKey', () => {
    it('should revoke an API key', async () => {
      mockAdminApi.delete.mockResolvedValue({
        success: true,
        message: 'API key revoked',
        data: null,
      });

      const result = await adminApiKeyService.revokeApiKey('key123');

      expect(mockAdminApi.delete).toHaveBeenCalledWith('keys/key123');
      expect(result.success).toBe(true);
      expect(result.message).toBe('API key revoked');
    });
  });

  describe('getApiKeyUsage', () => {
    it('should fetch usage statistics', async () => {
      const mockUsage = {
        total_requests: 50000,
        requests_today: 1500,
        requests_this_week: 8000,
        requests_this_month: 25000,
        last_used: '2024-01-15T10:30:00Z',
        daily_usage: [
          { date: '2024-01-14', requests: 1200 },
          { date: '2024-01-15', requests: 1500 },
        ],
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockUsage,
      });

      const result = await adminApiKeyService.getApiKeyUsage('key123');

      expect(mockAdminApi.get).toHaveBeenCalledWith('keys/key123/usage');
      expect(result).toEqual(mockUsage);
    });
  });

  describe('getUsageStats', () => {
    it('should fetch aggregated usage stats', async () => {
      const mockStats = {
        total_requests: 100000,
        requests_today: 5000,
        active_keys: 15,
        top_keys: [
          { key_id: 'key1', key_name: 'Production', requests: 30000 },
          { key_id: 'key2', key_name: 'Staging', requests: 15000 },
        ],
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockStats,
      });

      const result = await adminApiKeyService.getUsageStats();

      expect(mockAdminApi.get).toHaveBeenCalledWith('keys/usage/stats');
      expect(result).toEqual(mockStats);
    });

    it('should filter stats by user', async () => {
      mockAdminApi.buildQueryString.mockReturnValue('?user_id=user123');
      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: { total_requests: 0, requests_today: 0, active_keys: 0, top_keys: [] },
      });

      await adminApiKeyService.getUsageStats({ user_id: 'user123' });

      expect(mockAdminApi.get).toHaveBeenCalledWith('keys/usage/stats?user_id=user123');
    });
  });

  describe('updateRateLimit', () => {
    it('should update API key rate limit', async () => {
      mockAdminApi.patch.mockResolvedValue({
        success: true,
        message: 'Rate limit updated',
        data: null,
      });

      const result = await adminApiKeyService.updateRateLimit('key123', 5000);

      expect(mockAdminApi.patch).toHaveBeenCalledWith('keys/key123/rate-limit', {
        rate_limit: 5000,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('activateApiKey', () => {
    it('should activate an API key', async () => {
      mockAdminApi.post.mockResolvedValue({
        success: true,
        message: 'API key activated',
        data: null,
      });

      const result = await adminApiKeyService.activateApiKey('key123');

      expect(mockAdminApi.post).toHaveBeenCalledWith('keys/key123/activate');
      expect(result.success).toBe(true);
    });
  });

  describe('deactivateApiKey', () => {
    it('should deactivate an API key', async () => {
      mockAdminApi.post.mockResolvedValue({
        success: true,
        message: 'API key deactivated',
        data: null,
      });

      const result = await adminApiKeyService.deactivateApiKey('key123');

      expect(mockAdminApi.post).toHaveBeenCalledWith('keys/key123/deactivate');
      expect(result.success).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      mockAdminApi.get.mockRejectedValue(new Error('Network timeout'));

      await expect(adminApiKeyService.listApiKeys()).rejects.toThrow('Network timeout');
    });

    it('should handle permission errors', async () => {
      mockAdminApi.delete.mockRejectedValue(new Error('Permission denied'));

      await expect(adminApiKeyService.revokeApiKey('key123')).rejects.toThrow('Permission denied');
    });
  });
});
