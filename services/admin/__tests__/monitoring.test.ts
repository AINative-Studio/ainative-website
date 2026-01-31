/**
 * Admin Monitoring Service Tests
 * Tests for system monitoring and observability
 */

import { adminMonitoringService } from '@/services/admin/monitoring';
import { adminApi } from '@/services/admin/client';

jest.mock('@/services/admin/client');

describe('AdminMonitoringService', () => {
  const mockAdminApi = adminApi as jest.Mocked<typeof adminApi>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboard', () => {
    it('should fetch monitoring dashboard metrics', async () => {
      const mockDashboard = {
        uptime_percentage: 99.95,
        total_requests: 1000000,
        avg_response_time_ms: 150,
        error_rate: 0.05,
        active_users: 250,
        system_health: 'healthy' as const,
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockDashboard,
      });

      const result = await adminMonitoringService.getDashboard();

      expect(mockAdminApi.get).toHaveBeenCalledWith('monitoring/dashboard');
      expect(result).toEqual(mockDashboard);
    });
  });

  describe('getHealth', () => {
    it('should fetch system health check', async () => {
      const mockHealth = {
        status: 'healthy' as const,
        timestamp: '2024-01-15T10:30:00Z',
        services: {
          database: { status: 'healthy', latency_ms: 5 },
          cache: { status: 'healthy', latency_ms: 2 },
          queue: { status: 'healthy', latency_ms: 3 },
          storage: { status: 'healthy', latency_ms: 10 },
        },
        version: '1.0.0',
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockHealth,
      });

      const result = await adminMonitoringService.getHealth();

      expect(mockAdminApi.get).toHaveBeenCalledWith('monitoring/health');
      expect(result).toEqual(mockHealth);
    });

    it('should handle degraded health status', async () => {
      const mockHealth = {
        status: 'degraded' as const,
        timestamp: '2024-01-15T10:30:00Z',
        services: {
          database: { status: 'healthy', latency_ms: 5 },
          cache: { status: 'degraded', latency_ms: 50 },
          queue: { status: 'healthy', latency_ms: 3 },
          storage: { status: 'healthy', latency_ms: 10 },
        },
        version: '1.0.0',
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockHealth,
      });

      const result = await adminMonitoringService.getHealth();

      expect(result.status).toBe('degraded');
      expect(result.services.cache.status).toBe('degraded');
    });
  });

  describe('getMetrics', () => {
    it('should fetch current system metrics', async () => {
      const mockMetrics = {
        cpu_usage: 45.2,
        memory_usage: 62.8,
        disk_usage: 38.5,
        network_in_mbps: 120.5,
        network_out_mbps: 85.3,
        active_connections: 1500,
        queue_depth: 25,
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockMetrics,
      });

      const result = await adminMonitoringService.getMetrics();

      expect(mockAdminApi.get).toHaveBeenCalledWith('monitoring/metrics');
      expect(result).toEqual(mockMetrics);
    });
  });

  describe('getHistoricalMetrics', () => {
    it('should fetch historical metrics with time range', async () => {
      const filters = {
        start_date: '2024-01-01',
        end_date: '2024-01-15',
        interval: 'day' as const,
      };

      const mockHistorical = {
        time_series: [
          {
            timestamp: '2024-01-01T00:00:00Z',
            cpu_usage: 40,
            memory_usage: 60,
            requests: 50000,
            errors: 25,
          },
          {
            timestamp: '2024-01-02T00:00:00Z',
            cpu_usage: 42,
            memory_usage: 61,
            requests: 52000,
            errors: 20,
          },
        ],
      };

      mockAdminApi.buildQueryString.mockReturnValue(
        '?start_date=2024-01-01&end_date=2024-01-15&interval=day'
      );
      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockHistorical,
      });

      const result = await adminMonitoringService.getHistoricalMetrics(filters);

      expect(result.time_series).toHaveLength(2);
    });
  });

  describe('getAuditLogs', () => {
    it('should fetch audit logs', async () => {
      const mockLogs = {
        items: [
          {
            id: 'log1',
            user_id: 'user123',
            action: 'USER_CREATED',
            resource_type: 'user',
            resource_id: 'user456',
            timestamp: '2024-01-15T10:00:00Z',
            ip_address: '192.168.1.1',
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
        data: mockLogs,
      });

      const result = await adminMonitoringService.getAuditLogs();

      expect(mockAdminApi.get).toHaveBeenCalledWith('audit/logs');
      expect(result).toEqual(mockLogs);
    });

    it('should filter audit logs', async () => {
      mockAdminApi.buildQueryString.mockReturnValue(
        '?user_id=user123&action=USER_CREATED&start_date=2024-01-01'
      );
      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: { items: [], total: 0, page: 1, limit: 10, hasMore: false },
      });

      await adminMonitoringService.getAuditLogs({
        user_id: 'user123',
        action: 'USER_CREATED',
        start_date: '2024-01-01',
      });

      expect(mockAdminApi.get).toHaveBeenCalledWith(
        'audit/logs?user_id=user123&action=USER_CREATED&start_date=2024-01-01'
      );
    });
  });

  describe('getErrorLogs', () => {
    it('should fetch error logs', async () => {
      const mockErrors = {
        items: [
          {
            id: 'err1',
            timestamp: '2024-01-15T10:00:00Z',
            level: 'error' as const,
            message: 'Database connection failed',
            stack_trace: 'Error: ...',
            user_id: 'user123',
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
        data: mockErrors,
      });

      const result = await adminMonitoringService.getErrorLogs();

      expect(mockAdminApi.get).toHaveBeenCalledWith('system/logs/errors');
      expect(result).toEqual(mockErrors);
    });
  });

  describe('getAlerts', () => {
    it('should fetch monitoring alerts', async () => {
      const mockAlerts = {
        alerts: [
          {
            id: 'alert1',
            title: 'High CPU Usage',
            description: 'CPU usage exceeded 80%',
            severity: 'high' as const,
            status: 'active' as const,
            created_at: '2024-01-15T10:00:00Z',
          },
        ],
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockAlerts,
      });

      const result = await adminMonitoringService.getAlerts();

      expect(mockAdminApi.get).toHaveBeenCalledWith('monitoring-alerts');
      expect(result).toHaveLength(1);
    });

    it('should filter alerts by status', async () => {
      mockAdminApi.buildQueryString.mockReturnValue('?status=active&severity=critical');
      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: { alerts: [] },
      });

      await adminMonitoringService.getAlerts({ status: 'active', severity: 'critical' });

      expect(mockAdminApi.get).toHaveBeenCalledWith('monitoring-alerts?status=active&severity=critical');
    });
  });

  describe('acknowledgeAlert', () => {
    it('should acknowledge an alert', async () => {
      mockAdminApi.post.mockResolvedValue({
        success: true,
        message: 'Alert acknowledged',
        data: null,
      });

      const result = await adminMonitoringService.acknowledgeAlert('alert123');

      expect(mockAdminApi.post).toHaveBeenCalledWith('monitoring-alerts/alert123/acknowledge');
      expect(result.success).toBe(true);
    });
  });

  describe('resolveAlert', () => {
    it('should resolve an alert with resolution note', async () => {
      mockAdminApi.post.mockResolvedValue({
        success: true,
        message: 'Alert resolved',
        data: null,
      });

      const result = await adminMonitoringService.resolveAlert(
        'alert123',
        'Scaled up servers'
      );

      expect(mockAdminApi.post).toHaveBeenCalledWith('monitoring-alerts/alert123/resolve', {
        resolution: 'Scaled up servers',
      });
      expect(result.success).toBe(true);
    });
  });
});
