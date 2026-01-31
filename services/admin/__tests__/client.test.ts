/**
 * Admin API Client Tests
 * Tests for the base admin API client
 */

import { adminApi } from '@/services/admin/client';
import apiClient from '@/lib/api-client';

// Mock the base API client
jest.mock('@/lib/api-client');

describe('AdminApiClient', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET requests', () => {
    it('should prefix path with /admin', async () => {
      const mockResponse = {
        data: { success: true, message: 'OK', data: { test: 'data' } },
        status: 200,
        statusText: 'OK',
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      await adminApi.get('users');

      expect(mockApiClient.get).toHaveBeenCalledWith('/admin/users', undefined);
    });

    it('should handle paths with leading slash', async () => {
      const mockResponse = {
        data: { success: true, message: 'OK', data: {} },
        status: 200,
        statusText: 'OK',
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      await adminApi.get('/users');

      expect(mockApiClient.get).toHaveBeenCalledWith('/admin/users', undefined);
    });

    it('should return response data', async () => {
      const mockData = { success: true, message: 'OK', data: { test: 'value' } };
      mockApiClient.get.mockResolvedValue({
        data: mockData,
        status: 200,
        statusText: 'OK',
      });

      const result = await adminApi.get('users');

      expect(result).toEqual(mockData);
    });
  });

  describe('POST requests', () => {
    it('should prefix path with /admin', async () => {
      const mockResponse = {
        data: { success: true, message: 'Created', data: { id: '123' } },
        status: 201,
        statusText: 'Created',
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const postData = { name: 'Test User' };
      await adminApi.post('users', postData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/admin/users', postData, undefined);
    });

    it('should handle empty data', async () => {
      const mockResponse = {
        data: { success: true, message: 'OK', data: {} },
        status: 200,
        statusText: 'OK',
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      await adminApi.post('users/123/activate');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/admin/users/123/activate',
        undefined,
        undefined
      );
    });
  });

  describe('PUT requests', () => {
    it('should prefix path with /admin', async () => {
      const mockResponse = {
        data: { success: true, message: 'Updated', data: { id: '123' } },
        status: 200,
        statusText: 'OK',
      };
      mockApiClient.put.mockResolvedValue(mockResponse);

      const updateData = { name: 'Updated User' };
      await adminApi.put('users/123', updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith('/admin/users/123', updateData, undefined);
    });
  });

  describe('PATCH requests', () => {
    it('should prefix path with /admin', async () => {
      const mockResponse = {
        data: { success: true, message: 'Patched', data: {} },
        status: 200,
        statusText: 'OK',
      };
      mockApiClient.patch.mockResolvedValue(mockResponse);

      const patchData = { status: 'active' };
      await adminApi.patch('users/123', patchData);

      expect(mockApiClient.patch).toHaveBeenCalledWith('/admin/users/123', patchData, undefined);
    });
  });

  describe('DELETE requests', () => {
    it('should prefix path with /admin', async () => {
      const mockResponse = {
        data: { success: true, message: 'Deleted', data: null },
        status: 200,
        statusText: 'OK',
      };
      mockApiClient.delete.mockResolvedValue(mockResponse);

      await adminApi.delete('users/123');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/admin/users/123', undefined);
    });
  });

  describe('buildQueryString', () => {
    it('should build query string from object', () => {
      const params = { page: 1, limit: 10, search: 'test' };
      const queryString = adminApi.buildQueryString(params);

      expect(queryString).toBe('?page=1&limit=10&search=test');
    });

    it('should filter out undefined values', () => {
      const params = { page: 1, limit: undefined, search: 'test' };
      const queryString = adminApi.buildQueryString(params);

      expect(queryString).toBe('?page=1&search=test');
    });

    it('should filter out null values', () => {
      const params = { page: 1, limit: null, search: 'test' };
      const queryString = adminApi.buildQueryString(params);

      expect(queryString).toBe('?page=1&search=test');
    });

    it('should filter out empty strings', () => {
      const params = { page: 1, limit: 10, search: '' };
      const queryString = adminApi.buildQueryString(params);

      expect(queryString).toBe('?page=1&limit=10');
    });

    it('should return empty string for empty params', () => {
      const queryString = adminApi.buildQueryString({});

      expect(queryString).toBe('');
    });

    it('should URL encode values', () => {
      const params = { search: 'test user', email: 'user@example.com' };
      const queryString = adminApi.buildQueryString(params);

      expect(queryString).toContain('test%20user');
      expect(queryString).toContain('user%40example.com');
    });
  });

  describe('error handling', () => {
    it('should propagate errors from base client', async () => {
      const error = new Error('Network error');
      mockApiClient.get.mockRejectedValue(error);

      await expect(adminApi.get('users')).rejects.toThrow('Network error');
    });

    it('should handle 401 unauthorized', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Unauthorized'));

      await expect(adminApi.get('users')).rejects.toThrow('Unauthorized');
    });

    it('should handle 403 forbidden', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Forbidden'));

      await expect(adminApi.get('users')).rejects.toThrow('Forbidden');
    });
  });
});
