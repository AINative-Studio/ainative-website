/**
 * QNN Dashboard Hooks
 * React Query hooks for QNN dashboard aggregated data and quantum metrics
 *
 * @module useQNNDashboard
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { qnnApiClient } from '@/services/qnnApiClient';
import apiClient from '@/lib/api-client';
import {
  QNNDashboardData,
  QuantumHealth,
  QuantumDevice,
  QuantumJob,
  QuantumInfo,
  Model,
  TrainingJob,
  QuantumMetrics,
} from '@/types/qnn.types';

/**
 * Query key factory for QNN dashboard-related queries
 */
export const qnnDashboardQueryKeys = {
  dashboard: {
    all: ['qnn-dashboard'] as const,
    aggregated: () => ['qnn-dashboard', 'aggregated'] as const,
    quantumHealth: () => ['qnn-dashboard', 'quantum-health'] as const,
    quantumDevices: () => ['qnn-dashboard', 'quantum-devices'] as const,
    quantumJobs: () => ['qnn-dashboard', 'quantum-jobs'] as const,
    quantumInfo: () => ['qnn-dashboard', 'quantum-info'] as const,
  },
};

/**
 * Hook to fetch aggregated QNN dashboard data
 * Fetches models, training jobs, quantum metrics, and stats in a single call
 *
 * @param refreshInterval - Auto-refresh interval in milliseconds (default: 5000ms)
 * @returns Aggregated dashboard data query result
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useQNNDashboardData();
 * if (data) {
 *   console.log('Models:', data.models);
 *   console.log('Training Jobs:', data.trainingJobs);
 *   console.log('Stats:', data.stats);
 * }
 * ```
 */
export function useQNNDashboardData(
  refreshInterval: number = 5000
): UseQueryResult<QNNDashboardData, Error> {
  return useQuery({
    queryKey: qnnDashboardQueryKeys.dashboard.aggregated(),
    queryFn: async () => {
      try {
        // Call the main API dashboard endpoint
        const response = await apiClient.get<QNNDashboardData>('/v1/dashboard/qnn');
        return response.data;
      } catch (error) {
        console.error('Failed to fetch QNN dashboard data:', error);

        // Fallback: Fetch individual pieces if aggregated endpoint fails
        const [models, quantumMetrics] = await Promise.allSettled([
          qnnApiClient.listModels(),
          qnnApiClient.getQuantumMetrics(),
        ]);

        // Build fallback response
        const fallbackModels = models.status === 'fulfilled' ? models.value : [];
        const fallbackMetrics = quantumMetrics.status === 'fulfilled' && quantumMetrics.value.length > 0
          ? quantumMetrics.value[0]
          : null;

        return {
          models: fallbackModels,
          trainingJobs: [],
          quantumMetrics: fallbackMetrics,
          stats: {
            totalModels: fallbackModels.length,
            deployedModels: fallbackModels.filter(m => m.status === 'deployed').length,
            activeTraining: 0,
            queuedJobs: 0,
            averageAccuracy: fallbackModels.length > 0
              ? fallbackModels.reduce((sum, m) => sum + (m.metadata?.parameters || 0), 0) / fallbackModels.length
              : 0,
          },
          timestamp: new Date().toISOString(),
        };
      }
    },
    refetchInterval: refreshInterval,
    staleTime: refreshInterval / 2,
    retry: 2,
    retryDelay: 1000,
  });
}

/**
 * Hook to fetch quantum system health status
 *
 * @param refreshInterval - Auto-refresh interval in milliseconds (default: 10000ms)
 * @returns Quantum health query result
 *
 * @example
 * ```tsx
 * const { data } = useQuantumHealth();
 * if (data) {
 *   console.log('Status:', data.status);
 *   console.log('Devices:', data.devices);
 * }
 * ```
 */
export function useQuantumHealth(
  refreshInterval: number = 10000
): UseQueryResult<QuantumHealth, Error> {
  return useQuery({
    queryKey: qnnDashboardQueryKeys.dashboard.quantumHealth(),
    queryFn: async () => {
      const response = await apiClient.get<QuantumHealth>('/v1/public/quantum/health');
      return response.data;
    },
    refetchInterval: refreshInterval,
    staleTime: refreshInterval / 2,
    retry: 2,
  });
}

/**
 * Hook to fetch available quantum devices
 *
 * @param refreshInterval - Auto-refresh interval in milliseconds (default: 30000ms)
 * @returns Quantum devices query result
 *
 * @example
 * ```tsx
 * const { data } = useQuantumDevices();
 * if (data) {
 *   data.forEach(device => {
 *     console.log('Device:', device.name, 'Status:', device.status);
 *   });
 * }
 * ```
 */
export function useQuantumDevices(
  refreshInterval: number = 30000
): UseQueryResult<QuantumDevice[], Error> {
  return useQuery({
    queryKey: qnnDashboardQueryKeys.dashboard.quantumDevices(),
    queryFn: async () => {
      const response = await apiClient.get<QuantumDevice[]>('/v1/public/quantum/devices');
      return response.data;
    },
    refetchInterval: refreshInterval,
    staleTime: refreshInterval / 2,
    retry: 2,
  });
}

/**
 * Hook to fetch quantum jobs
 *
 * @param refreshInterval - Auto-refresh interval in milliseconds (default: 5000ms)
 * @returns Quantum jobs query result
 *
 * @example
 * ```tsx
 * const { data } = useQuantumJobs();
 * if (data) {
 *   const runningJobs = data.filter(job => job.status === 'running');
 *   console.log('Running jobs:', runningJobs.length);
 * }
 * ```
 */
export function useQuantumJobs(
  refreshInterval: number = 5000
): UseQueryResult<QuantumJob[], Error> {
  return useQuery({
    queryKey: qnnDashboardQueryKeys.dashboard.quantumJobs(),
    queryFn: async () => {
      const response = await apiClient.get<QuantumJob[]>('/v1/public/quantum/jobs');
      return response.data;
    },
    refetchInterval: refreshInterval,
    staleTime: refreshInterval / 2,
    retry: 2,
  });
}

/**
 * Hook to fetch quantum system information
 *
 * @returns Quantum info query result
 *
 * @example
 * ```tsx
 * const { data } = useQuantumInfo();
 * if (data) {
 *   console.log('Version:', data.version);
 *   console.log('Max Qubits:', data.maxQubits);
 * }
 * ```
 */
export function useQuantumInfo(): UseQueryResult<QuantumInfo, Error> {
  return useQuery({
    queryKey: qnnDashboardQueryKeys.dashboard.quantumInfo(),
    queryFn: async () => {
      const response = await apiClient.get<QuantumInfo>('/v1/public/quantum/info');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - rarely changes
    retry: 2,
  });
}

/**
 * Combined hook for all QNN dashboard data with optimized fetching
 * Uses parallel requests for better performance
 *
 * @param options - Configuration options
 * @returns Combined dashboard query results
 *
 * @example
 * ```tsx
 * const dashboard = useQNNDashboardComplete({
 *   refreshInterval: 5000,
 *   enableQuantumMetrics: true,
 * });
 *
 * if (dashboard.data.isLoading) return <Spinner />;
 * if (dashboard.data.error) return <Error />;
 *
 * return (
 *   <div>
 *     <h1>Models: {dashboard.data.data?.models.length}</h1>
 *     <h2>Health: {dashboard.quantumHealth.data?.status}</h2>
 *   </div>
 * );
 * ```
 */
export function useQNNDashboardComplete(options?: {
  refreshInterval?: number;
  enableQuantumMetrics?: boolean;
}) {
  const refreshInterval = options?.refreshInterval ?? 5000;
  const enableQuantumMetrics = options?.enableQuantumMetrics ?? true;

  const data = useQNNDashboardData(refreshInterval);
  const quantumHealth = useQuantumHealth(refreshInterval * 2);
  const quantumDevices = useQuantumDevices(refreshInterval * 6);
  const quantumJobs = useQuantumJobs(refreshInterval);
  const quantumInfo = useQuantumInfo();

  return {
    data,
    quantumHealth,
    quantumDevices,
    quantumJobs,
    quantumInfo,
    isLoading:
      data.isLoading ||
      quantumHealth.isLoading ||
      quantumDevices.isLoading ||
      quantumJobs.isLoading ||
      quantumInfo.isLoading,
    isError:
      data.isError ||
      quantumHealth.isError ||
      quantumDevices.isError ||
      quantumJobs.isError ||
      quantumInfo.isError,
    refetchAll: () => {
      data.refetch();
      quantumHealth.refetch();
      quantumDevices.refetch();
      quantumJobs.refetch();
      quantumInfo.refetch();
    },
  };
}

export default {
  useQNNDashboardData,
  useQuantumHealth,
  useQuantumDevices,
  useQuantumJobs,
  useQuantumInfo,
  useQNNDashboardComplete,
};
