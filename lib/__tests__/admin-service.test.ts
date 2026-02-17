import apiClient from '../api-client';
import { adminService } from '../admin-service';

// Mock the apiClient
jest.mock('../api-client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('AdminService', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSystemHealth', () => {
    it('fetches system health data from correct endpoint', async () => {
      const mockHealthData = {
        status: 'healthy',
        timestamp: '2025-12-21T10:00:00Z',
        services: {
          database: 'up',
          redis: 'up',
          api: 'up',
        },
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockHealthData,
        status: 200,
        statusText: 'OK',
      });

      const result = await adminService.getSystemHealth();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/metrics/health');
      expect(result).toEqual(mockHealthData);
    });

    it('handles errors when fetching health data', async () => {
      const errorMessage = 'Network error';
      mockApiClient.get.mockRejectedValueOnce(new Error(errorMessage));

      await expect(adminService.getSystemHealth()).rejects.toThrow(errorMessage);
    });
  });

  describe('getSystemMetrics', () => {
    it('fetches system metrics from correct endpoint', async () => {
      const mockMetricsData = {
        cpu: { usage: 45.2, cores: 8 },
        memory: { used: 8192, total: 16384, percentage: 50 },
        disk: { used: 500, total: 1000, percentage: 50 },
        network: { inbound: 1024, outbound: 2048 },
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockMetricsData,
        status: 200,
        statusText: 'OK',
      });

      const result = await adminService.getSystemMetrics();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/metrics/summary');
      expect(result).toEqual(mockMetricsData);
    });

    it('handles errors when fetching metrics', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Service unavailable'));

      await expect(adminService.getSystemMetrics()).rejects.toThrow('Service unavailable');
    });
  });

  describe('getSystemLogs', () => {
    it('fetches system logs with pagination', async () => {
      const mockLogsData = {
        logs: [
          { id: 1, level: 'info', message: 'System started', timestamp: '2025-12-21T09:00:00Z' },
          { id: 2, level: 'warning', message: 'High memory usage', timestamp: '2025-12-21T09:30:00Z' },
        ],
        total: 100,
        page: 1,
        pageSize: 50,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockLogsData,
        status: 200,
        statusText: 'OK',
      });

      const result = await adminService.getSystemLogs({ page: 1, pageSize: 50 });

      expect(mockApiClient.get).toHaveBeenCalledWith('/database/admin/monitoring/logs?page=1&pageSize=50');
      expect(result).toEqual(mockLogsData);
    });

    it('fetches logs with level filter', async () => {
      const mockFilteredLogs = {
        logs: [
          { id: 1, level: 'error', message: 'Database connection failed', timestamp: '2025-12-21T10:00:00Z' },
        ],
        total: 10,
        page: 1,
        pageSize: 50,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockFilteredLogs,
        status: 200,
        statusText: 'OK',
      });

      const result = await adminService.getSystemLogs({ page: 1, pageSize: 50, level: 'error' });

      expect(mockApiClient.get).toHaveBeenCalledWith('/database/admin/monitoring/logs?page=1&pageSize=50&level=error');
      expect(result).toEqual(mockFilteredLogs);
    });
  });

  describe('getSystemAlerts', () => {
    it('fetches active system alerts', async () => {
      const mockAlertsData = {
        alerts: [
          {
            id: 1,
            severity: 'critical',
            title: 'High CPU Usage',
            message: 'CPU usage above 90%',
            timestamp: '2025-12-21T10:00:00Z',
            resolved: false,
          },
          {
            id: 2,
            severity: 'warning',
            title: 'Low Disk Space',
            message: 'Disk usage above 80%',
            timestamp: '2025-12-21T09:30:00Z',
            resolved: false,
          },
        ],
        total: 2,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockAlertsData,
        status: 200,
        statusText: 'OK',
      });

      const result = await adminService.getSystemAlerts();

      expect(mockApiClient.get).toHaveBeenCalledWith('/database/admin/monitoring/alerts');
      expect(result).toEqual(mockAlertsData);
    });
  });

  describe('getUsers', () => {
    it('fetches users list with pagination', async () => {
      const mockUsersData = {
        users: [
          {
            id: 1,
            email: 'user1@example.com',
            name: 'User One',
            role: 'user',
            createdAt: '2025-01-01T00:00:00Z',
            lastLogin: '2025-12-21T09:00:00Z',
          },
          {
            id: 2,
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'admin',
            createdAt: '2025-01-01T00:00:00Z',
            lastLogin: '2025-12-21T10:00:00Z',
          },
        ],
        total: 2,
        page: 1,
        pageSize: 50,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockUsersData,
        status: 200,
        statusText: 'OK',
      });

      const result = await adminService.getUsers({ page: 1, pageSize: 50 });

      expect(mockApiClient.get).toHaveBeenCalledWith('/database/admin/users?page=1&pageSize=50');
      expect(result).toEqual(mockUsersData);
    });

    it('fetches users with role filter', async () => {
      const mockAdminsData = {
        users: [
          {
            id: 2,
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'admin',
            createdAt: '2025-01-01T00:00:00Z',
            lastLogin: '2025-12-21T10:00:00Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 50,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockAdminsData,
        status: 200,
        statusText: 'OK',
      });

      const result = await adminService.getUsers({ page: 1, pageSize: 50, role: 'admin' });

      expect(mockApiClient.get).toHaveBeenCalledWith('/database/admin/users?page=1&pageSize=50&role=admin');
      expect(result).toEqual(mockAdminsData);
    });
  });

  describe('updateUserRole', () => {
    it('updates user role successfully', async () => {
      const userId = 123;
      const newRole = 'admin';
      const mockResponseData = {
        id: userId,
        email: 'user@example.com',
        name: 'User Name',
        role: newRole,
        updatedAt: '2025-12-21T10:00:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResponseData,
        status: 200,
        statusText: 'OK',
      });

      const result = await adminService.updateUserRole(userId, newRole);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        `/database/admin/users/${userId}/role`,
        { role: newRole }
      );
      expect(result).toEqual(mockResponseData);
    });

    it('handles errors when updating role', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Unauthorized'));

      await expect(adminService.updateUserRole(123, 'admin')).rejects.toThrow('Unauthorized');
    });
  });

  describe('createAuditLog', () => {
    it('creates audit log entry successfully', async () => {
      const logData = {
        userId: 123,
        action: 'UPDATE_USER_ROLE',
        resource: 'user',
        resourceId: 456,
        details: { oldRole: 'user', newRole: 'admin' },
      };

      const mockResponseData = {
        id: 789,
        ...logData,
        timestamp: '2025-12-21T10:00:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResponseData,
        status: 201,
        statusText: 'Created',
      });

      const result = await adminService.createAuditLog(logData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/database/admin/security/audit-log', logData);
      expect(result).toEqual(mockResponseData);
    });
  });

  describe('getSystemStats', () => {
    it('fetches system statistics', async () => {
      const mockStatsData = {
        totalUsers: 1500,
        activeUsers: 1200,
        totalProjects: 500,
        totalVectors: 1000000,
        storageUsed: 50000,
        apiRequestsToday: 50000,
        errorRateToday: 0.05,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockStatsData,
        status: 200,
        statusText: 'OK',
      });

      const result = await adminService.getSystemStats();

      expect(mockApiClient.get).toHaveBeenCalledWith('/database/admin/stats/system');
      expect(result).toEqual(mockStatsData);
    });
  });

  describe('getDashboardSummary', () => {
    it('fetches dashboard summary data', async () => {
      const mockSummaryData = {
        health: {
          status: 'healthy',
          uptime: 99.99,
        },
        metrics: {
          cpu: 45.2,
          memory: 50,
          disk: 60,
        },
        alerts: {
          critical: 0,
          warning: 2,
          info: 5,
        },
        stats: {
          totalUsers: 1500,
          activeUsers: 1200,
          totalProjects: 500,
        },
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockSummaryData,
        status: 200,
        statusText: 'OK',
      });

      const result = await adminService.getDashboardSummary();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/metrics/summary');
      expect(result).toEqual(mockSummaryData);
    });
  });
});
