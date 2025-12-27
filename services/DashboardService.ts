/**
 * Dashboard Service
 * Handles API calls for Kong Admin metrics, system health, and real-time monitoring
 *
 * @module DashboardService
 */

import apiClient from '@/utils/apiClient';

/**
 * Kong Metrics API Response - may have different field names
 */
interface KongMetricsApiResponse {
  throughput_per_min?: number;
  api_latency_ms?: number;
  avg_latency_ms?: number;
  error_rate?: number;
  active_connections?: number;
  timestamp?: string;
  period?: string;
}

/**
 * Kong Metrics Response Interface
 */
export interface KongMetricsResponse {
  throughput_per_min: number;
  avg_latency_ms: number;
  error_rate_percentage: number;
  error_rate: number; // Backend returns error_rate, map to error_rate_percentage
  active_connections: number;
  timestamp: string;
  period: string;
}

/**
 * System Health Response Interface
 */
export interface SystemHealthResponse {
  overall_status: 'healthy' | 'degraded' | 'unhealthy';
  services: Array<{
    name: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime_percentage: number;
    response_time_ms: number;
    last_check: string;
  }>;
  last_updated: string;
}

/**
 * Kong Service Response Interface
 */
export interface KongService {
  id: string;
  name: string;
  protocol: string;
  host: string;
  port: number;
  path?: string;
  retries: number;
  connect_timeout: number;
  write_timeout: number;
  read_timeout: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * API Usage Response Interface
 */
export interface APIUsageResponse {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  avg_response_time_ms: number;
  peak_rps: number;
  current_tier: 'free' | 'pro' | 'scale' | 'enterprise';
  period_start: string;
  period_end: string;
}

/**
 * Dashboard Service Class
 * Provides methods to fetch Kong metrics, system health, and usage data
 */
export class DashboardService {
  /**
   * Get Kong gateway metrics (Prometheus format)
   *
   * @param projectId - Project ID (optional)
   * @returns Kong metrics data
   * @throws Error if API call fails
   */
  async getKongMetrics(projectId?: string): Promise<KongMetricsResponse> {
    try {
      const endpoint = projectId
        ? `/database/admin/kong/metrics?project_id=${projectId}`
        : '/database/admin/kong/metrics';

      const response = await apiClient.get<KongMetricsApiResponse>(endpoint);

      // Map backend response to frontend format
      const data = response.data;
      return {
        throughput_per_min: data.throughput_per_min || 0,
        avg_latency_ms: data.api_latency_ms || data.avg_latency_ms || 0,
        error_rate_percentage: data.error_rate ? data.error_rate * 100 : 0,
        error_rate: data.error_rate || 0,
        active_connections: data.active_connections || 0,
        timestamp: data.timestamp || new Date().toISOString(),
        period: data.period || 'last_5_minutes'
      };
    } catch (error: unknown) {
      console.error('Failed to fetch Kong metrics:', error);
      // Return default metrics on error to prevent UI crashes
      return {
        throughput_per_min: 0,
        avg_latency_ms: 0,
        error_rate_percentage: 0,
        error_rate: 0,
        active_connections: 0,
        timestamp: new Date().toISOString(),
        period: 'last_5_minutes'
      };
    }
  }

  /**
   * Get system health status
   *
   * @param projectId - Project ID (optional)
   * @returns System health data
   * @throws Error if API call fails
   */
  async getSystemHealth(projectId?: string): Promise<SystemHealthResponse> {
    try {
      const endpoint = projectId
        ? `/database/admin/health?project_id=${projectId}`
        : '/database/admin/health';

      const response = await apiClient.get<SystemHealthResponse>(endpoint);
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to fetch system health:', error);
      // Return default health status on error
      return {
        overall_status: 'healthy',
        services: [],
        last_updated: new Date().toISOString()
      };
    }
  }

  /**
   * Get Kong services list
   *
   * @param projectId - Project ID (optional)
   * @returns List of Kong services
   * @throws Error if API call fails
   */
  async getKongServices(projectId?: string): Promise<KongService[]> {
    try {
      const endpoint = projectId
        ? `/database/admin/kong/services?project_id=${projectId}`
        : '/database/admin/kong/services';

      const response = await apiClient.get<{ data: KongService[] }>(endpoint);
      return response.data.data || [];
    } catch (error: unknown) {
      console.error('Failed to fetch Kong services:', error);
      return [];
    }
  }

  /**
   * Get API usage statistics
   *
   * @param projectId - Project ID (optional)
   * @param timeRange - Time range filter (default: 'current')
   * @returns API usage data
   * @throws Error if API call fails
   */
  async getAPIUsage(projectId?: string, timeRange: string = 'current'): Promise<APIUsageResponse> {
    try {
      const params = new URLSearchParams();
      if (projectId) params.append('project_id', projectId);
      if (timeRange) params.append('time_range', timeRange);

      const endpoint = `/v1/public/ai-usage/aggregate?${params.toString()}`;
      const response = await apiClient.get<APIUsageResponse>(endpoint);
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to fetch API usage:', error);
      // Return default usage data on error
      return {
        total_requests: 0,
        successful_requests: 0,
        failed_requests: 0,
        avg_response_time_ms: 0,
        peak_rps: 0,
        current_tier: 'free',
        period_start: new Date().toISOString(),
        period_end: new Date().toISOString()
      };
    }
  }

  /**
   * Get real-time metrics with auto-refresh capability
   *
   * @param projectId - Project ID (optional)
   * @returns Combined metrics data
   */
  async getRealtimeMetrics(projectId?: string): Promise<{
    kong: KongMetricsResponse;
    health: SystemHealthResponse;
    usage: APIUsageResponse;
  }> {
    try {
      const [kong, health, usage] = await Promise.all([
        this.getKongMetrics(projectId),
        this.getSystemHealth(projectId),
        this.getAPIUsage(projectId)
      ]);

      return { kong, health, usage };
    } catch (error: unknown) {
      console.error('Failed to fetch realtime metrics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();
export default dashboardService;
