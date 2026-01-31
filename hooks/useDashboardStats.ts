/**
 * Dashboard Stats Hooks
 * React Query hooks for Kong metrics, system health, and API usage
 *
 * @module useDashboardStats
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { dashboardService, KongMetricsResponse, SystemHealthResponse, APIUsageResponse } from '@/services/dashboardService';

/**
 * Query key factory for dashboard-related queries
 */
export const queryKeys = {
  dashboard: {
    all: ['dashboard'] as const,
    kongMetrics: (projectId: string) => ['dashboard', 'kong-metrics', projectId] as const,
    systemHealth: (projectId: string) => ['dashboard', 'system-health', projectId] as const,
    apiUsage: (projectId: string) => ['dashboard', 'api-usage', projectId] as const,
    realtimeMetrics: (projectId: string) => ['dashboard', 'realtime', projectId] as const,
  },
};

/**
 * Hook to fetch Kong gateway metrics
 *
 * @param projectId - Project ID (optional)
 * @param refreshInterval - Auto-refresh interval in milliseconds (default: 5000ms)
 * @returns Kong metrics query result
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useKongMetrics(projectId, 5000);
 * if (data) {
 *   console.log('Throughput:', data.throughput_per_min);
 *   console.log('Latency:', data.avg_latency_ms);
 * }
 * ```
 */
export function useKongMetrics(
  projectId?: string,
  refreshInterval: number = 5000
): UseQueryResult<KongMetricsResponse, Error> {
  return useQuery({
    queryKey: queryKeys.dashboard.kongMetrics(projectId || ''),
    queryFn: async () => {
      const data = await dashboardService.getKongMetrics(projectId);
      return data;
    },
    enabled: true, // Always enabled, will use default data on error
    refetchInterval: refreshInterval,
    staleTime: refreshInterval / 2,
    retry: 1,
    retryDelay: 1000,
  });
}

/**
 * Hook to fetch system health status
 *
 * @param projectId - Project ID (optional)
 * @param refreshInterval - Auto-refresh interval in milliseconds (default: 30000ms)
 * @returns System health query result
 *
 * @example
 * ```tsx
 * const { data } = useSystemHealth(projectId);
 * if (data) {
 *   console.log('Overall status:', data.overall_status);
 *   console.log('Services:', data.services);
 * }
 * ```
 */
export function useSystemHealth(
  projectId?: string,
  refreshInterval: number = 30000
): UseQueryResult<SystemHealthResponse, Error> {
  return useQuery({
    queryKey: queryKeys.dashboard.systemHealth(projectId || ''),
    queryFn: async () => {
      const data = await dashboardService.getSystemHealth(projectId);
      return data;
    },
    enabled: true, // Always enabled, will use default data on error
    refetchInterval: refreshInterval,
    staleTime: refreshInterval / 2,
    retry: 1,
  });
}

/**
 * Hook to fetch API usage statistics
 *
 * @param projectId - Project ID (optional)
 * @param refreshInterval - Auto-refresh interval in milliseconds (default: 60000ms)
 * @returns API usage query result
 *
 * @example
 * ```tsx
 * const { data } = useAPIUsage(projectId);
 * if (data) {
 *   console.log('Total requests:', data.total_requests);
 *   console.log('Current tier:', data.current_tier);
 * }
 * ```
 */
export function useAPIUsage(
  projectId?: string,
  refreshInterval: number = 60000
): UseQueryResult<APIUsageResponse, Error> {
  return useQuery({
    queryKey: queryKeys.dashboard.apiUsage(projectId || ''),
    queryFn: async () => {
      const data = await dashboardService.getAPIUsage(projectId);
      return data;
    },
    enabled: true, // Always enabled, will use default data on error
    refetchInterval: refreshInterval,
    staleTime: refreshInterval / 2,
    retry: 1,
  });
}

/**
 * Hook to fetch real-time metrics (Kong + Health + Usage)
 * Combines all metrics into a single query for efficiency
 *
 * @param projectId - Project ID (optional)
 * @param refreshInterval - Auto-refresh interval in milliseconds (default: 5000ms)
 * @returns Combined metrics query result
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useRealtimeMetrics(projectId, 5000);
 * if (data) {
 *   console.log('Kong metrics:', data.kong);
 *   console.log('Health status:', data.health);
 *   console.log('API usage:', data.usage);
 * }
 * ```
 */
export function useRealtimeMetrics(
  projectId?: string,
  refreshInterval: number = 5000
): UseQueryResult<{
  kong: KongMetricsResponse;
  health: SystemHealthResponse;
  usage: APIUsageResponse;
}, Error> {
  return useQuery({
    queryKey: queryKeys.dashboard.realtimeMetrics(projectId || ''),
    queryFn: async () => {
      const data = await dashboardService.getRealtimeMetrics(projectId);
      return data;
    },
    enabled: true,
    refetchInterval: refreshInterval,
    staleTime: refreshInterval / 2,
    retry: 1,
  });
}

/**
 * Get status color based on metric value and thresholds
 *
 * @param value - Current value
 * @param warningThreshold - Warning threshold
 * @param errorThreshold - Error threshold
 * @returns Status color class
 */
export function getMetricStatusColor(
  value: number,
  warningThreshold: number,
  errorThreshold: number
): 'green' | 'yellow' | 'red' {
  if (value >= errorThreshold) return 'red';
  if (value >= warningThreshold) return 'yellow';
  return 'green';
}

/**
 * Format metric value with appropriate units
 *
 * @param value - Numeric value
 * @param unit - Unit type
 * @returns Formatted string
 */
export function formatMetricValue(
  value: number,
  unit: 'ms' | 'req/min' | '%' | 'count'
): string {
  switch (unit) {
    case 'ms':
      return `${value.toFixed(1)}ms`;
    case 'req/min':
      return `${value.toFixed(0)} req/min`;
    case '%':
      return `${value.toFixed(1)}%`;
    case 'count':
      return value.toLocaleString();
    default:
      return value.toString();
  }
}

export default {
  useKongMetrics,
  useSystemHealth,
  useAPIUsage,
  useRealtimeMetrics,
  getMetricStatusColor,
  formatMetricValue,
};
