/**
 * Admin ZeroDB Service Tests
 */

import { adminZeroDBService } from '@/services/admin/zerodb';
import { adminApi } from '@/services/admin/client';

jest.mock('@/services/admin/client');

describe('AdminZeroDBService', () => {
  const mockAdminApi = adminApi as jest.Mocked<typeof adminApi>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStats', () => {
    it('should fetch ZeroDB statistics', async () => {
      const mockStats = {
        total_projects: 50,
        total_vectors: 1000000,
        total_storage_mb: 5000,
        total_queries_today: 10000,
        avg_query_latency_ms: 15,
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockStats,
      });

      const result = await adminZeroDBService.getStats();
      expect(result.total_projects).toBe(50);
    });
  });

  describe('listProjects', () => {
    it('should list ZeroDB projects', async () => {
      const mockProjects = {
        items: [
          {
            id: 'proj1',
            name: 'Test Project',
            created_at: '2024-01-01T00:00:00Z',
            vector_count: 10000,
            storage_mb: 100,
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
        data: mockProjects,
      });

      const result = await adminZeroDBService.listProjects();
      expect(result.items).toHaveLength(1);
    });
  });

  describe('getUsageAnalytics', () => {
    it('should fetch usage analytics', async () => {
      const mockAnalytics = {
        time_series: [],
        top_projects: [],
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockAnalytics,
      });

      const result = await adminZeroDBService.getUsageAnalytics();
      expect(result).toEqual(mockAnalytics);
    });
  });

  describe('getProject', () => {
    it('should fetch a specific project', async () => {
      const mockProject = {
        id: 'proj1',
        name: 'Test Project',
        created_at: '2024-01-01T00:00:00Z',
        vector_count: 10000,
        storage_mb: 100,
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockProject,
      });

      const result = await adminZeroDBService.getProject('proj1');
      expect(result.id).toBe('proj1');
    });
  });

  describe('getCollections', () => {
    it('should fetch project collections', async () => {
      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: { collections: [] },
      });

      const result = await adminZeroDBService.getCollections('proj1');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getUserUsage', () => {
    it('should fetch user ZeroDB usage', async () => {
      const mockUsage = {
        total_projects: 5,
        total_vectors: 50000,
        total_storage_mb: 500,
        total_queries: 10000,
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockUsage,
      });

      const result = await adminZeroDBService.getUserUsage('user123');
      expect(result.total_projects).toBe(5);
    });
  });
});
