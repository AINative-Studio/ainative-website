/**
 * Dashboard Service
 * Handles API calls for dashboard overview, quick stats, analytics,
 * Kong Admin metrics, system health, and real-time monitoring
 */

import apiClient from '@/lib/api-client';

/**
 * Standard API response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Dashboard quick stats from /v1/dashboard/quick-stats
 */
export interface DashboardQuickStats {
  total_requests: number;
  active_projects: number;
  credits_used: number;
  avg_response_time: number;
  trends?: {
    requests_change?: number;
    projects_change?: number;
    credits_change?: number;
    response_time_change?: number;
  };
}

/**
 * Dashboard overview from /v1/dashboard/overview
 */
export interface DashboardOverview {
  stats: DashboardQuickStats;
  usage: {
    date: string;
    requests: number;
    tokens: number;
  }[];
  model_usage: {
    name: string;
    value: number;
    color?: string;
  }[];
  project_activity: {
    name: string;
    codeGen: number;
    reviews: number;
    fixes: number;
  }[];
  performance: {
    time: string;
    latency: number;
    throughput: number;
  }[];
}

/**
 * Dashboard analytics from /v1/dashboard/analytics
 */
export interface DashboardAnalytics {
  usage_trends: {
    date: string;
    requests: number;
    tokens: number;
  }[];
  model_distribution: {
    name: string;
    value: number;
    color?: string;
  }[];
  project_activity: {
    name: string;
    codeGen: number;
    reviews: number;
    fixes: number;
  }[];
  performance_metrics: {
    time: string;
    latency: number;
    throughput: number;
  }[];
}

/**
 * AI usage aggregate from /v1/public/ai-usage/aggregate
 */
export interface AiUsageAggregate {
  total_requests: number;
  total_tokens: number;
  by_model: {
    model: string;
    requests: number;
    tokens: number;
    percentage: number;
  }[];
  by_feature: {
    feature: string;
    credits_used: number;
    percentage: number;
  }[];
  daily_usage: {
    date: string;
    credits_used: number;
    endpoint?: string;
  }[];
}

/**
 * AI usage costs from /v1/public/ai-usage/costs
 */
export interface AiUsageCosts {
  total_cost: number;
  currency: string;
  period: string;
  breakdown: {
    base_fee: number;
    overage_fees: number;
    overage_breakdown?: {
      api_credits: number;
      llm_tokens: number;
      storage_gb: number;
      mcp_hours: number;
    };
  };
  projected_monthly: number;
}

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
  error_rate: number;
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
 * Provides methods to fetch dashboard data, Kong metrics, system health, and usage data
 */
export class DashboardService {
  private readonly dashboardPath = '/v1/dashboard';
  private readonly publicPath = '/v1/public';

  /**
   * Get dashboard quick stats
   */
  async getQuickStats(): Promise<DashboardQuickStats | null> {
    try {
      const response = await apiClient.get<ApiResponse<DashboardQuickStats>>(
        `${this.dashboardPath}/quick-stats`
      );

      if (!response.data.success || !response.data.data) {
        console.warn('Quick stats returned unsuccessful:', response.data.message);
        return null;
      }

      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch quick stats:', error);
      return null;
    }
  }

  /**
   * Get dashboard overview (aggregated dashboard data)
   */
  async getOverview(): Promise<DashboardOverview | null> {
    try {
      const response = await apiClient.get<ApiResponse<DashboardOverview>>(
        `${this.dashboardPath}/overview`
      );

      if (!response.data.success || !response.data.data) {
        console.warn('Dashboard overview returned unsuccessful:', response.data.message);
        return null;
      }

      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch dashboard overview:', error);
      return null;
    }
  }

  /**
   * Get dashboard analytics
   */
  async getAnalytics(): Promise<DashboardAnalytics | null> {
    try {
      const response = await apiClient.get<ApiResponse<DashboardAnalytics>>(
        `${this.dashboardPath}/analytics`
      );

      if (!response.data.success || !response.data.data) {
        console.warn('Dashboard analytics returned unsuccessful:', response.data.message);
        return null;
      }

      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch dashboard analytics:', error);
      return null;
    }
  }

  /**
   * Get AI usage aggregate
   * @param period - Time period (7d, 30d, 90d)
   */
  async getAiUsageAggregate(period: string = '30d'): Promise<AiUsageAggregate | null> {
    try {
      const response = await apiClient.get<ApiResponse<{ metrics: AiUsageAggregate }>>(
        `${this.publicPath}/ai-usage/aggregate?period=${period}`
      );

      if (!response.data.success) {
        console.warn('AI usage aggregate returned unsuccessful:', response.data.message);
        return null;
      }

      return response.data.data?.metrics || null;
    } catch (error) {
      console.error('Failed to fetch AI usage aggregate:', error);
      return null;
    }
  }

  /**
   * Get AI usage costs
   */
  async getAiUsageCosts(): Promise<AiUsageCosts | null> {
    try {
      const response = await apiClient.get<ApiResponse<AiUsageCosts>>(
        `${this.publicPath}/ai-usage/costs`
      );

      if (!response.data.success || !response.data.data) {
        console.warn('AI usage costs returned unsuccessful:', response.data.message);
        return null;
      }

      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch AI usage costs:', error);
      return null;
    }
  }

  /**
   * Get Kong gateway metrics (Prometheus format)
   * Uses /admin/billing/kong/metrics endpoint (requires admin auth)
   */
  async getKongMetrics(projectId?: string): Promise<KongMetricsResponse> {
    try {
      const endpoint = projectId
        ? `/admin/billing/kong/metrics?project_id=${projectId}`
        : '/admin/billing/kong/metrics';

      const response = await apiClient.get<KongMetricsApiResponse>(endpoint);

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
    } catch (error) {
      console.error('Failed to fetch Kong metrics:', error);
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
   * Uses /admin/database/health endpoint (requires admin auth)
   */
  async getSystemHealth(projectId?: string): Promise<SystemHealthResponse> {
    try {
      const endpoint = projectId
        ? `/admin/database/health?project_id=${projectId}`
        : '/admin/database/health';

      const response = await apiClient.get<SystemHealthResponse>(endpoint);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch system health:', error);
      return {
        overall_status: 'healthy',
        services: [],
        last_updated: new Date().toISOString()
      };
    }
  }

  /**
   * Get Kong services list
   * NOTE: This endpoint does not exist in the backend OpenAPI spec.
   * Consider removing if not used, or implement as a Kong Admin API proxy.
   * @deprecated This endpoint path is not available in the backend
   */
  async getKongServices(projectId?: string): Promise<KongService[]> {
    console.warn('getKongServices: This endpoint is not available in the backend API');
    try {
      const endpoint = projectId
        ? `/admin/kong/services?project_id=${projectId}`
        : '/admin/kong/services';

      const response = await apiClient.get<{ data: KongService[] }>(endpoint);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch Kong services:', error);
      return [];
    }
  }

  /**
   * Get API usage statistics
   */
  async getAPIUsage(projectId?: string, timeRange: string = 'current'): Promise<APIUsageResponse> {
    try {
      const params = new URLSearchParams();
      if (projectId) params.append('project_id', projectId);
      if (timeRange) params.append('time_range', timeRange);

      const endpoint = `${this.publicPath}/ai-usage/aggregate?${params.toString()}`;
      const response = await apiClient.get<APIUsageResponse>(endpoint);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch API usage:', error);
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
    } catch (error) {
      console.error('Failed to fetch realtime metrics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();
export default dashboardService;
