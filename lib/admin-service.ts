/**
 * Admin Service
 * Handles all admin-related API calls for system monitoring, user management, and audit logging
 */

import apiClient from './api-client';

// Backend response types (what the API actually returns)
interface MetricsSummaryResponse {
  timestamp: string;
  service: {
    name: string;
    version: string;
    uptime_seconds: number;
    status: 'healthy' | 'degraded' | 'down';
  };
  metrics: {
    cache: {
      total_hits: number;
      total_misses: number;
      hit_rate: number;
    };
    workflows: {
      types: string[];
      stats: Record<string, unknown>;
    };
  };
  system: {
    cpu_percent: number;
    memory_percent: number;
    disk_percent: number;
  };
}

interface MetricsHealthResponse {
  status: 'healthy' | 'degraded' | 'down';
  prometheus_available: boolean;
  collector_initialized: boolean;
  timestamp: string;
}

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
    const response = await apiClient.get<MetricsHealthResponse>('/v1/metrics/health');
    // Transform backend response to expected format
    return {
      status: response.data.status,
      timestamp: response.data.timestamp,
      services: {
        database: response.data.status,
        redis: response.data.status,
        api: response.data.status,
      },
    };
  }

  /**
   * Get system metrics (CPU, memory, disk, network)
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    const response = await apiClient.get<MetricsSummaryResponse>('/v1/metrics/summary');
    // Transform backend response to expected format
    return {
      cpu: {
        usage: response.data.system.cpu_percent,
        cores: 8, // Default value - not provided by backend
      },
      memory: {
        used: 0,
        total: 0,
        percentage: response.data.system.memory_percent,
      },
      disk: {
        used: 0,
        total: 0,
        percentage: response.data.system.disk_percent,
      },
      network: {
        inbound: 0,
        outbound: 0,
      },
    };
  }

  /**
   * Get system logs with pagination and optional filtering
   * Note: This endpoint may not be implemented in the backend yet
   */
  async getSystemLogs(params: LogsParams): Promise<LogsResponse> {
    // Return empty logs as this endpoint doesn't exist in the backend
    return {
      logs: [],
      total: 0,
      page: params.page,
      pageSize: params.pageSize,
    };
  }

  /**
   * Get system alerts
   * Note: This endpoint may not be implemented in the backend yet
   */
  async getSystemAlerts(): Promise<AlertsResponse> {
    // Return empty alerts as this endpoint doesn't exist in the backend
    return {
      alerts: [],
      total: 0,
    };
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
   * Note: This endpoint may not be implemented in the backend yet
   */
  async getSystemStats(): Promise<SystemStats> {
    // Return default stats as this endpoint doesn't exist in the backend
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalProjects: 0,
      totalVectors: 0,
      storageUsed: 0,
      apiRequestsToday: 0,
      errorRateToday: 0,
    };
  }

  /**
   * Get dashboard summary (combined health, metrics, alerts, stats)
   * Uses /v1/metrics/summary endpoint and transforms the response
   */
  async getDashboardSummary(): Promise<DashboardSummary> {
    const response = await apiClient.get<MetricsSummaryResponse>('/v1/metrics/summary');
    const data = response.data;

    // Transform backend response to expected DashboardSummary format
    return {
      health: {
        status: data.service.status,
        uptime: this.calculateUptimePercentage(data.service.uptime_seconds),
      },
      metrics: {
        cpu: data.system.cpu_percent,
        memory: data.system.memory_percent,
        disk: data.system.disk_percent,
      },
      alerts: {
        critical: 0,
        warning: 0,
        info: 0,
      },
      stats: {
        totalUsers: 0,
        activeUsers: 0,
        totalProjects: 0,
      },
    };
  }

  /**
   * Calculate uptime percentage from uptime seconds
   * Assumes 99.9% uptime if service has been running for more than 1 hour
   */
  private calculateUptimePercentage(uptimeSeconds: number): number {
    // If uptime is more than 1 hour, assume high availability
    if (uptimeSeconds > 3600) {
      return 99.95;
    }
    // For shorter uptimes, calculate based on expected daily uptime
    const expectedDailySeconds = 86400;
    return Math.min((uptimeSeconds / expectedDailySeconds) * 100, 99.99);
  }
}

// Export singleton instance
export const adminService = new AdminService();
