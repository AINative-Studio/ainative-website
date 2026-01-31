/**
 * Admin Monitoring Service
 * Handles system monitoring, health checks, audit logs, and metrics
 */

import { adminApi } from './client';
import type {
  MonitoringDashboard,
  HealthCheckResponse,
  SystemMetrics,
  AuditLogEntry,
  AuditLogFilters,
  ErrorLogEntry,
  PaginatedResponse,
} from './types';

/**
 * Admin service for system monitoring and observability
 */
export class AdminMonitoringService {
  private readonly basePath = 'monitoring';

  /**
   * Get monitoring dashboard metrics
   */
  async getDashboard(): Promise<MonitoringDashboard> {
    try {
      const response = await adminApi.get<MonitoringDashboard>(`${this.basePath}/dashboard`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch monitoring dashboard');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching monitoring dashboard:', error);
      throw error;
    }
  }

  /**
   * Get system health check
   */
  async getHealth(): Promise<HealthCheckResponse> {
    try {
      const response = await adminApi.get<HealthCheckResponse>(`${this.basePath}/health`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch health status');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching health status:', error);
      throw error;
    }
  }

  /**
   * Get current system metrics
   */
  async getMetrics(): Promise<SystemMetrics> {
    try {
      const response = await adminApi.get<SystemMetrics>(`${this.basePath}/metrics`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch system metrics');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      throw error;
    }
  }

  /**
   * Get historical metrics for a time range
   */
  async getHistoricalMetrics(filters: {
    start_date: string;
    end_date: string;
    metric_type?: string;
    interval?: 'hour' | 'day' | 'week';
  }): Promise<{
    time_series: Array<{
      timestamp: string;
      cpu_usage?: number;
      memory_usage?: number;
      requests?: number;
      errors?: number;
    }>;
  }> {
    try {
      const queryString = adminApi.buildQueryString(filters);
      const response = await adminApi.get<{
        time_series: Array<{
          timestamp: string;
          cpu_usage?: number;
          memory_usage?: number;
          requests?: number;
          errors?: number;
        }>;
      }>(`${this.basePath}/metrics/historical${queryString}`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch historical metrics');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching historical metrics:', error);
      throw error;
    }
  }

  /**
   * Get audit logs with filtering
   */
  async getAuditLogs(filters?: AuditLogFilters): Promise<PaginatedResponse<AuditLogEntry>> {
    try {
      const queryString = filters ? adminApi.buildQueryString(filters) : '';
      const response = await adminApi.get<PaginatedResponse<AuditLogEntry>>(
        `audit/logs${queryString}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch audit logs');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  }

  /**
   * Get error logs
   */
  async getErrorLogs(filters?: {
    level?: string;
    limit?: number;
    offset?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<PaginatedResponse<ErrorLogEntry>> {
    try {
      const queryString = filters ? adminApi.buildQueryString(filters) : '';
      const response = await adminApi.get<PaginatedResponse<ErrorLogEntry>>(
        `system/logs/errors${queryString}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch error logs');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching error logs:', error);
      throw error;
    }
  }

  /**
   * Get monitoring alerts
   */
  async getAlerts(filters?: {
    status?: 'active' | 'resolved' | 'acknowledged';
    severity?: 'low' | 'medium' | 'high' | 'critical';
    limit?: number;
  }): Promise<
    Array<{
      id: string;
      title: string;
      description: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      status: 'active' | 'resolved' | 'acknowledged';
      created_at: string;
      resolved_at?: string;
    }>
  > {
    try {
      const queryString = filters ? adminApi.buildQueryString(filters) : '';
      const response = await adminApi.get<{
        alerts: Array<{
          id: string;
          title: string;
          description: string;
          severity: 'low' | 'medium' | 'high' | 'critical';
          status: 'active' | 'resolved' | 'acknowledged';
          created_at: string;
          resolved_at?: string;
        }>;
      }>(`monitoring-alerts${queryString}`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch alerts');
      }

      return response.data.alerts || [];
    } catch (error) {
      console.error('Error fetching monitoring alerts:', error);
      throw error;
    }
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await adminApi.post<void>(`monitoring-alerts/${alertId}/acknowledge`);

      return {
        success: response.success,
        message: response.message || 'Alert acknowledged successfully',
      };
    } catch (error) {
      console.error(`Error acknowledging alert ${alertId}:`, error);
      throw error;
    }
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(
    alertId: string,
    resolution?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await adminApi.post<void>(`monitoring-alerts/${alertId}/resolve`, {
        resolution,
      });

      return {
        success: response.success,
        message: response.message || 'Alert resolved successfully',
      };
    } catch (error) {
      console.error(`Error resolving alert ${alertId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const adminMonitoringService = new AdminMonitoringService();
