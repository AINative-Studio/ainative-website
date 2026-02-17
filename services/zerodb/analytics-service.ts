import apiClient, { shouldLogError } from '../../utils/apiClient';

// Type for Axios-like error response
interface AxiosErrorLike {
  response?: {
    data?: {
      detail?: string;
    };
  };
  message?: string;
}

// Helper function to extract error message from unknown error
function getErrorMessage(error: unknown): string {
  const axiosError = error as AxiosErrorLike;
  return axiosError.response?.data?.detail || axiosError.message || 'Unknown error';
}

// Response wrapper type for usage analytics
interface UsageAnalyticsResponse {
  usage?: UsageMetrics[];
}

// Cost breakdown response type
interface CostBreakdown {
  total_cost: number;
  cost_by_service: Record<string, number>;
  cost_by_day: Array<{ date: string; cost: number }>;
  cost_predictions: Array<{ date: string; predicted_cost: number }>;
}

// Performance metrics response type
interface PerformanceMetrics {
  average_response_time_ms: number;
  p95_response_time_ms: number;
  p99_response_time_ms: number;
  throughput_rps: number;
  error_rate: number;
  uptime_percentage: number;
  response_time_history: Array<{ timestamp: string; response_time_ms: number }>;
}

// Error analytics response type
interface ErrorAnalytics {
  total_errors: number;
  error_rate: number;
  errors_by_type: Record<string, number>;
  errors_by_service: Record<string, number>;
  error_trend: Array<{ timestamp: string; error_count: number }>;
  top_errors: Array<{ error_type: string; count: number; last_seen: string }>;
}

// User analytics response type
interface UserAnalytics {
  total_users: number;
  active_users: number;
  new_users: number;
  user_growth: Array<{ date: string; total_users: number; new_users: number }>;
  usage_by_user_type: Record<string, number>;
  top_users: Array<{ user_id: string; api_calls: number; data_processed_mb: number }>;
}

// Alert response type
interface Alert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  status: 'active' | 'resolved';
  created_at: string;
  resolved_at?: string;
  service_name?: string;
}

export interface UsageMetrics {
  period: string;
  api_calls: number;
  data_processed_mb: number;
  storage_used_mb: number;
  compute_hours: number;
  bandwidth_mb: number;
  error_count: number;
  success_rate: number;
}

export interface ServiceHealth {
  service_name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime_percentage: number;
  response_time_ms: number;
  last_check: string;
  issues?: string[];
}

export interface BillingUsage {
  period: string;
  total_cost: number;
  cost_by_service: Record<string, number>;
  usage_by_service: Record<string, unknown>;
  projected_monthly_cost: number;
  credits_used: number;
  credits_remaining: number;
}

export interface SystemMetrics {
  timestamp: string;
  cpu_usage_percent: number;
  memory_usage_mb: number;
  disk_usage_mb: number;
  network_in_mb: number;
  network_out_mb: number;
  active_connections: number;
  queue_size: number;
}

export class AnalyticsService {
  private static readonly BASE_PATH = '/v1/public/zerodb';
  private static readonly MONITORING_PATH = '/v1/public/monitoring';
  private static readonly BILLING_PATH = '/v1/public/billing';
  private static readonly METRICS_PATH = '/v1/public/monitoring/metrics';

  // Usage Analytics
  static async getUsageAnalytics(timeRange?: string, groupBy?: string): Promise<UsageMetrics[]> {
    try {
      const params: Record<string, string> = {};
      if (timeRange) params.time_range = timeRange;
      if (groupBy) params.group_by = groupBy;

      const response = await apiClient.get(`${AnalyticsService.BASE_PATH}/usage`, { params } as Record<string, unknown>);
      const data = response.data as UsageAnalyticsResponse;
      return data?.usage || (response.data as UsageMetrics[]) || [];
    } catch (error: unknown) {
      if (shouldLogError(error)) { console.warn('Failed to fetch usage analytics:', getErrorMessage(error)); }
      return [];
    }
  }

  static async getServiceUsage(serviceName: string, timeRange?: string): Promise<UsageMetrics[]> {
    try {
      const params = timeRange ? { time_range: timeRange } : {};
      const response = await apiClient.get(`${AnalyticsService.BASE_PATH}/usage/${serviceName}`, { params } as Record<string, unknown>);
      return response.data as UsageMetrics[];
    } catch (error: unknown) {
      throw new Error(`Failed to fetch service usage: ${getErrorMessage(error)}`);
    }
  }

  // Health Monitoring
  static async getSystemHealth(): Promise<ServiceHealth[]> {
    try {
      const response = await apiClient.get(`${AnalyticsService.MONITORING_PATH}/health`);
      const data = response.data as { services?: ServiceHealth[] };
      return data?.services || (response.data as ServiceHealth[]) || [];
    } catch (error: unknown) {
      if (shouldLogError(error)) { console.warn('Failed to fetch system health:', getErrorMessage(error)); }
      return [];
    }
  }

  static async getServiceHealth(serviceName: string): Promise<ServiceHealth> {
    try {
      const response = await apiClient.get(`${AnalyticsService.MONITORING_PATH}/health/${serviceName}`);
      return response.data as ServiceHealth;
    } catch (error: unknown) {
      throw new Error(`Failed to fetch service health: ${getErrorMessage(error)}`);
    }
  }

  static async performHealthCheck(): Promise<{ status: string; timestamp: string; services: ServiceHealth[] }> {
    try {
      const response = await apiClient.post(`${AnalyticsService.MONITORING_PATH}/health-check`);
      return response.data as { status: string; timestamp: string; services: ServiceHealth[] };
    } catch (error: unknown) {
      throw new Error(`Health check failed: ${getErrorMessage(error)}`);
    }
  }

  // Billing & Usage
  static async getBillingUsage(period?: string): Promise<BillingUsage | null> {
    try {
      const params = period ? { period } : {};
      const response = await apiClient.get(`${AnalyticsService.BILLING_PATH}/usage`, { params } as Record<string, unknown>);
      return response.data as BillingUsage;
    } catch (error: unknown) {
      if (shouldLogError(error)) { console.warn('Failed to fetch billing usage:', getErrorMessage(error)); }
      return null;
    }
  }

  static async getCostBreakdown(timeRange?: string): Promise<CostBreakdown> {
    try {
      const params = timeRange ? { time_range: timeRange } : {};
      const response = await apiClient.get(`${AnalyticsService.BILLING_PATH}/cost-breakdown`, { params } as Record<string, unknown>);
      return response.data as CostBreakdown;
    } catch (error: unknown) {
      throw new Error(`Failed to fetch cost breakdown: ${getErrorMessage(error)}`);
    }
  }

  // System Metrics
  static async getSystemMetrics(timeRange?: string, interval?: string): Promise<SystemMetrics[]> {
    try {
      const params: Record<string, string> = {};
      if (timeRange) params.time_range = timeRange;
      if (interval) params.interval = interval;

      const response = await apiClient.get(`${AnalyticsService.METRICS_PATH}`, { params } as Record<string, unknown>);
      return response.data as SystemMetrics[];
    } catch (error: unknown) {
      throw new Error(`Failed to fetch system metrics: ${getErrorMessage(error)}`);
    }
  }

  static async getCurrentMetrics(): Promise<SystemMetrics | null> {
    try {
      const response = await apiClient.get(`${AnalyticsService.METRICS_PATH}/current`);
      return response.data as SystemMetrics;
    } catch (error: unknown) {
      if (shouldLogError(error)) { console.warn('Failed to fetch current metrics:', getErrorMessage(error)); }
      return null;
    }
  }

  // Performance Analytics
  static async getPerformanceMetrics(serviceName?: string, timeRange?: string): Promise<PerformanceMetrics | null> {
    try {
      const params: Record<string, string> = {};
      if (serviceName) params.service_name = serviceName;
      if (timeRange) params.time_range = timeRange;

      const response = await apiClient.get(`${AnalyticsService.BASE_PATH}/analytics/performance`, { params } as Record<string, unknown>);
      return response.data as PerformanceMetrics;
    } catch (error: unknown) {
      if (shouldLogError(error)) { console.warn('Failed to fetch performance metrics:', getErrorMessage(error)); }
      return null;
    }
  }

  // Error Analytics
  static async getErrorAnalytics(timeRange?: string): Promise<ErrorAnalytics | null> {
    try {
      const params = timeRange ? { time_range: timeRange } : {};
      const response = await apiClient.get(`${AnalyticsService.BASE_PATH}/analytics/errors`, { params } as Record<string, unknown>);
      return response.data as ErrorAnalytics;
    } catch (error: unknown) {
      if (shouldLogError(error)) { console.warn('Failed to fetch error analytics:', getErrorMessage(error)); }
      return null;
    }
  }

  // User Analytics
  static async getUserAnalytics(timeRange?: string): Promise<UserAnalytics> {
    try {
      const params = timeRange ? { time_range: timeRange } : {};
      const response = await apiClient.get(`${AnalyticsService.BASE_PATH}/analytics/users`, { params } as Record<string, unknown>);
      return response.data as UserAnalytics;
    } catch (error: unknown) {
      throw new Error(`Failed to fetch user analytics: ${getErrorMessage(error)}`);
    }
  }

  // Real-time Monitoring
  static async subscribeToMetrics(
    callback: (metrics: SystemMetrics | null) => void,
    interval: number = 5000
  ): Promise<{ unsubscribe: () => void }> {
    let isSubscribed = true;

    const fetchMetrics = async () => {
      if (!isSubscribed) return;

      try {
        const metrics = await this.getCurrentMetrics();
        callback(metrics);
      } catch (error) {
        console.error('Error fetching real-time metrics:', error);
      }

      if (isSubscribed) {
        setTimeout(fetchMetrics, interval);
      }
    };

    fetchMetrics();

    return {
      unsubscribe: () => {
        isSubscribed = false;
      }
    };
  }

  // Alerts & Notifications
  static async getAlerts(status?: 'active' | 'resolved'): Promise<Alert[]> {
    try {
      const params = status ? { status } : {};
      const response = await apiClient.get(`${AnalyticsService.MONITORING_PATH}/alerts`, { params } as Record<string, unknown>);
      const data = response.data as { alerts?: Alert[] };
      return data?.alerts || (response.data as Alert[]) || [];
    } catch (error: unknown) {
      if (shouldLogError(error)) { console.warn('Failed to fetch alerts:', getErrorMessage(error)); }
      return [];
    }
  }

  static async acknowledgeAlert(alertId: string): Promise<void> {
    try {
      await apiClient.post(`${AnalyticsService.MONITORING_PATH}/alerts/${alertId}/acknowledge`);
    } catch (error: unknown) {
      throw new Error(`Failed to acknowledge alert: ${getErrorMessage(error)}`);
    }
  }

  static async resolveAlert(alertId: string, resolution?: string): Promise<void> {
    try {
      await apiClient.post(`${AnalyticsService.MONITORING_PATH}/alerts/${alertId}/resolve`, { resolution });
    } catch (error: unknown) {
      throw new Error(`Failed to resolve alert: ${getErrorMessage(error)}`);
    }
  }
}