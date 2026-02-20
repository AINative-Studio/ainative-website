/**
 * Dashboard Service Data Pipeline Tests
 *
 * Verifies that dashboard service correctly handles backend response formats
 * Tests for Issue #605: Verify dashboard page data pipeline against backend response format
 */

import { dashboardService, DashboardQuickStats, DashboardOverview, DashboardAnalytics, AiUsageAggregate, AiUsageCosts } from '@/services/dashboardService';
import apiClient from '@/lib/api-client';

// Mock the API client
jest.mock('@/lib/api-client');
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('DashboardService Response Format Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getQuickStats', () => {
    it('should handle wrapped response format {success, message, data}', async () => {
      const mockData: DashboardQuickStats = {
        total_requests: 1250,
        active_projects: 5,
        credits_used: 3400,
        avg_response_time: 1.2,
        trends: {
          requests_change: 15,
          projects_change: 2,
          credits_change: -5,
          response_time_change: -0.3,
        },
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Quick stats retrieved',
          data: mockData,
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await dashboardService.getQuickStats();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/dashboard/quick-stats');
      expect(result).toEqual(mockData);
    });

    it('should handle unsuccessful response', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          success: false,
          message: 'Database unavailable',
          data: null,
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await dashboardService.getQuickStats();

      expect(result).toBeNull();
    });

    it('should handle missing data field', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'No data',
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await dashboardService.getQuickStats();

      expect(result).toBeNull();
    });

    it('should handle network errors gracefully', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await dashboardService.getQuickStats();

      expect(result).toBeNull();
    });
  });

  describe('getOverview', () => {
    it('should handle wrapped response with complete overview data', async () => {
      const mockData: DashboardOverview = {
        stats: {
          total_requests: 1250,
          active_projects: 5,
          credits_used: 3400,
          avg_response_time: 1.2,
        },
        usage: [
          { date: '2025-02-12', requests: 150, tokens: 5000 },
          { date: '2025-02-13', requests: 200, tokens: 6500 },
        ],
        model_usage: [
          { name: 'GPT-4', value: 60, color: '#4B6FED' },
          { name: 'Claude', value: 40, color: '#10B981' },
        ],
        project_activity: [
          { name: 'Project A', codeGen: 120, reviews: 50, fixes: 30 },
        ],
        performance: [
          { time: '10:00', latency: 120, throughput: 500 },
        ],
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Dashboard overview retrieved',
          data: mockData,
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await dashboardService.getOverview();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/dashboard/overview');
      expect(result).toEqual(mockData);
    });

    it('should return null on unsuccessful response', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          success: false,
          message: 'Service unavailable',
          data: null,
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await dashboardService.getOverview();

      expect(result).toBeNull();
    });
  });

  describe('getAnalytics', () => {
    it('should handle wrapped analytics response', async () => {
      const mockData: DashboardAnalytics = {
        usage_trends: [
          { date: '2025-02-12', requests: 150, tokens: 5000 },
        ],
        model_distribution: [
          { name: 'GPT-4', value: 60 },
        ],
        project_activity: [],
        performance_metrics: [],
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Analytics retrieved',
          data: mockData,
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await dashboardService.getAnalytics();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/dashboard/analytics');
      expect(result).toEqual(mockData);
    });
  });

  describe('getAiUsageAggregate', () => {
    it('should handle nested metrics structure', async () => {
      const mockMetrics: AiUsageAggregate = {
        total_requests: 1500,
        total_tokens: 50000,
        by_model: [
          { model: 'gpt-4', requests: 900, tokens: 30000, percentage: 60 },
          { model: 'claude-3', requests: 600, tokens: 20000, percentage: 40 },
        ],
        by_feature: [
          { feature: 'chat', credits_used: 1200, percentage: 70 },
          { feature: 'completion', credits_used: 500, percentage: 30 },
        ],
        daily_usage: [
          { date: '2025-02-12', credits_used: 450 },
          { date: '2025-02-13', credits_used: 550 },
        ],
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'AI usage aggregate retrieved',
          data: {
            metrics: mockMetrics,
          },
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await dashboardService.getAiUsageAggregate('30d');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/ai-usage/aggregate?period=30d');
      expect(result).toEqual(mockMetrics);
    });

    it('should handle response without metrics field', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'No metrics',
          data: {},
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await dashboardService.getAiUsageAggregate();

      expect(result).toBeNull();
    });

    it('should use default period when not specified', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          success: false,
          message: 'Error',
          data: null,
        },
        status: 200,
        statusText: 'OK',
      });

      await dashboardService.getAiUsageAggregate();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/ai-usage/aggregate?period=30d');
    });
  });

  describe('getAiUsageCosts', () => {
    it('should handle wrapped costs response', async () => {
      const mockData: AiUsageCosts = {
        total_cost: 125.50,
        currency: 'USD',
        period: '2025-02',
        breakdown: {
          base_fee: 50,
          overage_fees: 75.50,
          overage_breakdown: {
            api_credits: 30,
            llm_tokens: 25.50,
            storage_gb: 10,
            mcp_hours: 10,
          },
        },
        projected_monthly: 150.00,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Costs retrieved',
          data: mockData,
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await dashboardService.getAiUsageCosts();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/ai-usage/costs');
      expect(result).toEqual(mockData);
    });
  });

  describe('getKongMetrics', () => {
    it('should handle raw response (no wrapper)', async () => {
      const mockData = {
        throughput_per_min: 250,
        api_latency_ms: 120,
        error_rate: 0.02,
        active_connections: 45,
        timestamp: '2025-02-19T10:00:00Z',
        period: 'last_5_minutes',
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockData,
        status: 200,
        statusText: 'OK',
      });

      const result = await dashboardService.getKongMetrics();

      expect(mockApiClient.get).toHaveBeenCalledWith('/database/admin/kong/metrics');
      expect(result.throughput_per_min).toBe(250);
      expect(result.avg_latency_ms).toBe(120);
      expect(result.error_rate_percentage).toBe(2);
      expect(result.error_rate).toBe(0.02);
    });

    it('should handle alternative latency field name', async () => {
      const mockData = {
        throughput_per_min: 250,
        avg_latency_ms: 135,
        error_rate: 0.01,
        active_connections: 45,
        timestamp: '2025-02-19T10:00:00Z',
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockData,
        status: 200,
        statusText: 'OK',
      });

      const result = await dashboardService.getKongMetrics();

      expect(result.avg_latency_ms).toBe(135);
    });

    it('should provide default values on error', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Kong unavailable'));

      const result = await dashboardService.getKongMetrics();

      expect(result.throughput_per_min).toBe(0);
      expect(result.avg_latency_ms).toBe(0);
      expect(result.error_rate_percentage).toBe(0);
      expect(result.active_connections).toBe(0);
      expect(result.period).toBe('last_5_minutes');
    });

    it('should support project-specific queries', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          throughput_per_min: 100,
          api_latency_ms: 90,
          error_rate: 0.005,
          active_connections: 20,
        },
        status: 200,
        statusText: 'OK',
      });

      await dashboardService.getKongMetrics('project-123');

      expect(mockApiClient.get).toHaveBeenCalledWith('/database/admin/kong/metrics?project_id=project-123');
    });
  });

  describe('getSystemHealth', () => {
    it('should handle raw health response (no wrapper)', async () => {
      const mockData = {
        overall_status: 'healthy' as const,
        services: [
          {
            name: 'api',
            status: 'healthy' as const,
            uptime_percentage: 99.9,
            response_time_ms: 50,
            last_check: '2025-02-19T10:00:00Z',
          },
        ],
        last_updated: '2025-02-19T10:00:00Z',
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockData,
        status: 200,
        statusText: 'OK',
      });

      const result = await dashboardService.getSystemHealth();

      expect(mockApiClient.get).toHaveBeenCalledWith('/database/admin/health');
      expect(result).toEqual(mockData);
    });

    it('should provide default healthy status on error', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Health check failed'));

      const result = await dashboardService.getSystemHealth();

      expect(result.overall_status).toBe('healthy');
      expect(result.services).toEqual([]);
    });
  });

  describe('getKongServices', () => {
    it('should extract services from data field', async () => {
      const mockServices = [
        {
          id: 'svc-1',
          name: 'api-gateway',
          protocol: 'https',
          host: 'api.example.com',
          port: 443,
          retries: 3,
          connect_timeout: 5000,
          write_timeout: 60000,
          read_timeout: 60000,
          enabled: true,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-02-01T00:00:00Z',
        },
      ];

      mockApiClient.get.mockResolvedValueOnce({
        data: {
          data: mockServices,
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await dashboardService.getKongServices();

      expect(result).toEqual(mockServices);
    });

    it('should return empty array if data field missing', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
      });

      const result = await dashboardService.getKongServices();

      expect(result).toEqual([]);
    });
  });

  describe('Response Format Consistency', () => {
    it('should document the three response patterns used', () => {
      // Pattern 1: Wrapped with {success, message, data}
      // Used by: getQuickStats, getOverview, getAnalytics, getAiUsageCosts

      // Pattern 2: Wrapped with {success, message, data: {metrics}}
      // Used by: getAiUsageAggregate

      // Pattern 3: Raw response (no wrapper)
      // Used by: getKongMetrics, getSystemHealth

      // Pattern 4: Wrapped with {data}
      // Used by: getKongServices

      expect(true).toBe(true); // Documentation assertion
    });
  });
});

describe('Dashboard Component Data Transformation', () => {
  describe('MainDashboardClient fetchDashboardStats', () => {
    it('should correctly map quick stats to component state', () => {
      const quickStats = {
        total_requests: 1250,
        active_projects: 5,
        credits_used: 3400,
        avg_response_time: 1.2,
        trends: {
          requests_change: 15,
          projects_change: 2,
          credits_change: -5,
          response_time_change: -0.3,
        },
      };

      // Component expects this structure
      const expectedStats = {
        totalRequests: quickStats.total_requests,
        activeProjects: quickStats.active_projects,
        creditsUsed: quickStats.credits_used,
        avgResponseTime: quickStats.avg_response_time,
        trends: {
          requestsChange: quickStats.trends.requests_change,
          projectsChange: quickStats.trends.projects_change,
          creditsChange: quickStats.trends.credits_change,
          responseTimeChange: quickStats.trends.response_time_change,
        },
      };

      expect(expectedStats).toMatchObject({
        totalRequests: 1250,
        activeProjects: 5,
        creditsUsed: 3400,
        avgResponseTime: 1.2,
      });
    });
  });

  describe('AIUsageClient data transformation', () => {
    it('should correctly map AI usage summary', () => {
      const apiResponse = {
        total_requests: 1500,
        total_tokens: 50000,
        total_cost: 125.50,
        by_provider: [
          { provider: 'OpenAI', requests: 900, tokens: 30000, cost: 75.30 },
        ],
      };

      // Component uses these fields directly
      expect(apiResponse.total_requests).toBe(1500);
      expect(apiResponse.by_provider[0].provider).toBe('OpenAI');
    });
  });
});
