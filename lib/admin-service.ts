/**
 * Admin Service
 * Handles all admin-related API calls for system monitoring, user management, and audit logging
 */

import apiClient from './api-client';

// Type definitions
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  services: {
    database: string;
    redis: string;
    api: string;
  };
}

export interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    inbound: number;
    outbound: number;
  };
}

export interface SystemLog {
  id: number;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
}

export interface LogsResponse {
  logs: SystemLog[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SystemAlert {
  id: number;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface AlertsResponse {
  alerts: SystemAlert[];
  total: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  lastLogin?: string;
  updatedAt?: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuditLogData {
  userId: number;
  action: string;
  resource: string;
  resourceId: number;
  details?: Record<string, unknown>;
}

export interface AuditLog extends AuditLogData {
  id: number;
  timestamp: string;
}

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  totalVectors: number;
  storageUsed: number;
  apiRequestsToday: number;
  errorRateToday: number;
}

export interface DashboardSummary {
  health: {
    status: string;
    uptime: number;
  };
  metrics: {
    cpu: number;
    memory: number;
    disk: number;
  };
  alerts: {
    critical: number;
    warning: number;
    info: number;
  };
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalProjects: number;
  };
}

export interface LogsParams {
  page: number;
  pageSize: number;
  level?: string;
}

export interface UsersParams {
  page: number;
  pageSize: number;
  role?: string;
}

/**
 * Admin Service class
 */
class AdminService {
  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<SystemHealth> {
    const response = await apiClient.get<SystemHealth>('/database/admin/monitoring/health');
    return response.data;
  }

  /**
   * Get system metrics (CPU, memory, disk, network)
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    const response = await apiClient.get<SystemMetrics>('/database/admin/monitoring/metrics');
    return response.data;
  }

  /**
   * Get system logs with pagination and optional filtering
   */
  async getSystemLogs(params: LogsParams): Promise<LogsResponse> {
    const queryParams = new URLSearchParams({
      page: params.page.toString(),
      pageSize: params.pageSize.toString(),
      ...(params.level && { level: params.level }),
    });

    const response = await apiClient.get<LogsResponse>(
      `/database/admin/monitoring/logs?${queryParams.toString()}`
    );
    return response.data;
  }

  /**
   * Get system alerts
   */
  async getSystemAlerts(): Promise<AlertsResponse> {
    const response = await apiClient.get<AlertsResponse>('/database/admin/monitoring/alerts');
    return response.data;
  }

  /**
   * Get users list with pagination and optional role filter
   */
  async getUsers(params: UsersParams): Promise<UsersResponse> {
    const queryParams = new URLSearchParams({
      page: params.page.toString(),
      pageSize: params.pageSize.toString(),
      ...(params.role && { role: params.role }),
    });

    const response = await apiClient.get<UsersResponse>(
      `/database/admin/users?${queryParams.toString()}`
    );
    return response.data;
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: number, role: string): Promise<User> {
    const response = await apiClient.post<User>(`/database/admin/users/${userId}/role`, { role });
    return response.data;
  }

  /**
   * Create audit log entry
   */
  async createAuditLog(logData: AuditLogData): Promise<AuditLog> {
    const response = await apiClient.post<AuditLog>('/database/admin/security/audit-log', logData);
    return response.data;
  }

  /**
   * Get system statistics
   */
  async getSystemStats(): Promise<SystemStats> {
    const response = await apiClient.get<SystemStats>('/database/admin/stats/system');
    return response.data;
  }

  /**
   * Get dashboard summary (combined health, metrics, alerts, stats)
   */
  async getDashboardSummary(): Promise<DashboardSummary> {
    const response = await apiClient.get<DashboardSummary>('/database/admin/dashboard/summary');
    return response.data;
  }
}

// Export singleton instance
export const adminService = new AdminService();
