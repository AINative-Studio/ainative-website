/**
 * Dashboard Service Endpoint Path Tests
 * Issue #619: Verify Kong metrics and health endpoint paths
 *
 * Tests that dashboardService uses correct API endpoint paths
 * matching the backend specification after Issue #730 path consolidation.
 */

import apiClient from '@/lib/api-client';
import { dashboardService } from '@/services/dashboardService';

// Mock the API client
jest.mock('@/lib/api-client');
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('DashboardService - Endpoint Paths (Issue #619)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Kong Metrics Endpoint', () => {
    it('should use correct Kong billing metrics path without project ID', async () => {
      const mockResponse = {
        data: {
          throughput_per_min: 100,
          avg_latency_ms: 50,
          error_rate: 0.01,
          active_connections: 10,
          timestamp: '2026-02-19T20:00:00Z',
          period: 'last_5_minutes'
        }
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      await dashboardService.getKongMetrics();

      expect(mockApiClient.get).toHaveBeenCalledWith('/admin/billing/kong/metrics');
      expect(mockApiClient.get).not.toHaveBeenCalledWith('/database/admin/kong/metrics');
    });

    it('should use correct Kong billing metrics path with project ID', async () => {
      const mockResponse = {
        data: {
          throughput_per_min: 100,
          avg_latency_ms: 50,
          error_rate: 0.01,
          active_connections: 10,
          timestamp: '2026-02-19T20:00:00Z',
          period: 'last_5_minutes'
        }
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const projectId = 'test-project-123';
      await dashboardService.getKongMetrics(projectId);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        `/admin/billing/kong/metrics?project_id=${projectId}`
      );
      expect(mockApiClient.get).not.toHaveBeenCalledWith(
        expect.stringContaining('/database/admin/kong/metrics')
      );
    });

    it('should handle missing optional fields in Kong metrics response', async () => {
      const mockResponse = {
        data: {
          throughput_per_min: 100
          // Missing other fields
        }
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await dashboardService.getKongMetrics();

      expect(result).toEqual({
        throughput_per_min: 100,
        avg_latency_ms: 0,
        error_rate_percentage: 0,
        error_rate: 0,
        active_connections: 0,
        timestamp: expect.any(String),
        period: 'last_5_minutes'
      });
    });

    it('should return default values when Kong metrics API fails', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'));

      const result = await dashboardService.getKongMetrics();

      expect(result).toEqual({
        throughput_per_min: 0,
        avg_latency_ms: 0,
        error_rate_percentage: 0,
        error_rate: 0,
        active_connections: 0,
        timestamp: expect.any(String),
        period: 'last_5_minutes'
      });
    });
  });

  describe('System Health Endpoint', () => {
    it('should use correct admin database health path without project ID', async () => {
      const mockResponse = {
        data: {
          overall_status: 'healthy' as const,
          services: [
            {
              name: 'database',
              status: 'healthy' as const,
              uptime_percentage: 99.9,
              response_time_ms: 10,
              last_check: '2026-02-19T20:00:00Z'
            }
          ],
          last_updated: '2026-02-19T20:00:00Z'
        }
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      await dashboardService.getSystemHealth();

      expect(mockApiClient.get).toHaveBeenCalledWith('/admin/database/health');
      expect(mockApiClient.get).not.toHaveBeenCalledWith('/database/admin/health');
    });

    it('should use correct admin database health path with project ID', async () => {
      const mockResponse = {
        data: {
          overall_status: 'healthy' as const,
          services: [],
          last_updated: '2026-02-19T20:00:00Z'
        }
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const projectId = 'test-project-456';
      await dashboardService.getSystemHealth(projectId);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        `/admin/database/health?project_id=${projectId}`
      );
      expect(mockApiClient.get).not.toHaveBeenCalledWith(
        expect.stringContaining('/database/admin/health')
      );
    });

    it('should return default healthy status when health API fails', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'));

      const result = await dashboardService.getSystemHealth();

      expect(result).toEqual({
        overall_status: 'healthy',
        services: [],
        last_updated: expect.any(String)
      });
    });

    it('should handle degraded system status', async () => {
      const mockResponse = {
        data: {
          overall_status: 'degraded' as const,
          services: [
            {
              name: 'database',
              status: 'healthy' as const,
              uptime_percentage: 99.9,
              response_time_ms: 10,
              last_check: '2026-02-19T20:00:00Z'
            },
            {
              name: 'cache',
              status: 'degraded' as const,
              uptime_percentage: 95.0,
              response_time_ms: 150,
              last_check: '2026-02-19T20:00:00Z'
            }
          ],
          last_updated: '2026-02-19T20:00:00Z'
        }
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await dashboardService.getSystemHealth();

      expect(result.overall_status).toBe('degraded');
      expect(result.services).toHaveLength(2);
    });
  });

  describe('Deprecated Endpoint Prevention', () => {
    it('should NOT use deprecated /database/admin/kong/metrics path', async () => {
      const mockResponse = { data: {} };
      mockApiClient.get.mockResolvedValue(mockResponse);

      await dashboardService.getKongMetrics();

      const callArgs = mockApiClient.get.mock.calls[0];
      expect(callArgs[0]).not.toContain('/database/admin/kong');
    });

    it('should NOT use deprecated /database/admin/health path', async () => {
      const mockResponse = { data: {} };
      mockApiClient.get.mockResolvedValue(mockResponse);

      await dashboardService.getSystemHealth();

      const callArgs = mockApiClient.get.mock.calls[0];
      expect(callArgs[0]).not.toContain('/database/admin/health');
    });

    it('should NOT use deprecated /v1/database/admin paths', async () => {
      const mockResponse = { data: {} };
      mockApiClient.get.mockResolvedValue(mockResponse);

      await dashboardService.getKongMetrics();
      await dashboardService.getSystemHealth();

      const allCalls = mockApiClient.get.mock.calls;
      allCalls.forEach(call => {
        expect(call[0]).not.toContain('/v1/database/admin');
      });
    });
  });

  describe('Kong Services Endpoint (Deprecated)', () => {
    it('should warn when calling getKongServices', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const mockResponse = { data: { data: [] } };
      mockApiClient.get.mockResolvedValue(mockResponse);

      await dashboardService.getKongServices();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('not available in the backend API')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should use updated path for Kong services if called', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const mockResponse = { data: { data: [] } };
      mockApiClient.get.mockResolvedValue(mockResponse);

      await dashboardService.getKongServices();

      expect(mockApiClient.get).toHaveBeenCalledWith('/admin/kong/services');
      expect(mockApiClient.get).not.toHaveBeenCalledWith('/database/admin/kong/services');

      consoleWarnSpy.mockRestore();
    });
  });

  describe('API Path Consistency', () => {
    it('should use /admin prefix for admin endpoints', async () => {
      const mockResponse = { data: {} };
      mockApiClient.get.mockResolvedValue(mockResponse);

      await dashboardService.getKongMetrics();
      await dashboardService.getSystemHealth();

      const allCalls = mockApiClient.get.mock.calls;
      allCalls.forEach(call => {
        expect(call[0]).toMatch(/^\/admin\//);
      });
    });

    it('should maintain query parameters correctly', async () => {
      const mockResponse = { data: {} };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const projectId = 'test-project-789';
      await dashboardService.getKongMetrics(projectId);
      await dashboardService.getSystemHealth(projectId);

      const allCalls = mockApiClient.get.mock.calls;
      allCalls.forEach(call => {
        expect(call[0]).toContain(`project_id=${projectId}`);
      });
    });
  });

  describe('Error Handling', () => {
    it('should log errors when Kong metrics API fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockApiClient.get.mockRejectedValue(new Error('API Error'));

      await dashboardService.getKongMetrics();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to fetch Kong metrics'),
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should log errors when system health API fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockApiClient.get.mockRejectedValue(new Error('API Error'));

      await dashboardService.getSystemHealth();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to fetch system health'),
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should not throw errors on API failure', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network failure'));

      await expect(dashboardService.getKongMetrics()).resolves.not.toThrow();
      await expect(dashboardService.getSystemHealth()).resolves.not.toThrow();
    });
  });
});
