/**
 * Billing Hooks
 * React Query hooks for fetching credit usage and billing data
 *
 * @module useBilling
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';

/**
 * Credit Usage Breakdown Interface
 */
export interface CreditUsageBreakdown {
  vector_operations: number;
  memory_operations: number;
  storage_operations: number;
  database_operations: number;
  postgres_queries: number;
  streaming_operations?: number;
  ml_operations?: number;
}

/**
 * Credit Usage Response Interface
 */
export interface CreditUsageResponse {
  total_credits_used: number;
  total_credits_available: number;
  usage_percentage: number;
  breakdown: CreditUsageBreakdown;
  period_start: string;
  period_end: string;
  current_tier: 'free' | 'pro' | 'scale' | 'enterprise';
  next_reset_date: string;
}

/**
 * Billing Summary Interface
 */
export interface BillingSummaryResponse {
  current_period_cost: number;
  projected_monthly_cost: number;
  currency: string;
  cost_breakdown: {
    base_subscription: number;
    credit_overages: number;
    storage_fees: number;
    compute_fees: number;
    bandwidth_fees: number;
  };
  payment_method?: {
    type: 'card' | 'bank_account';
    last_four: string;
    expiry_month?: number;
    expiry_year?: number;
  };
  next_billing_date: string;
}

/**
 * Query key factory for billing-related queries
 */
export const billingQueryKeys = {
  all: ['billing'] as const,
  creditUsage: (projectId: string, timeRange?: string) =>
    ['billing', 'usage', projectId, timeRange] as const,
  summary: (projectId: string) => ['billing', 'summary', projectId] as const,
  history: (projectId: string) => ['billing', 'history', projectId] as const,
};

/**
 * Hook to fetch credit usage data for a project
 *
 * @param projectId - Project ID
 * @param timeRange - Time range filter (default: 'last_30_days')
 * @param options - React Query options
 * @returns Credit usage query result
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useCreditUsage(projectId);
 * if (data) {
 *   console.log('Total credits used:', data.total_credits_used);
 *   console.log('Vector ops:', data.breakdown.vector_operations);
 * }
 * ```
 */
export function useCreditUsage(
  projectId: string,
  timeRange: string = 'last_30_days',
  options?: {
    refetchInterval?: number;
    enabled?: boolean;
  }
): UseQueryResult<CreditUsageResponse, Error> {
  return useQuery({
    queryKey: billingQueryKeys.creditUsage(projectId, timeRange),
    queryFn: async () => {
      const response = await apiClient.get<CreditUsageResponse>(
        `/projects/${projectId}/billing/usage?time_range=${timeRange}`
      );
      return response.data;
    },
    enabled: !!projectId && (options?.enabled !== false),
    refetchInterval: options?.refetchInterval || 60000, // Default: 1 minute
    staleTime: 30000, // 30 seconds
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to fetch billing summary for a project
 *
 * @param projectId - Project ID
 * @param options - React Query options
 * @returns Billing summary query result
 *
 * @example
 * ```tsx
 * const { data } = useBillingSummary(projectId);
 * if (data) {
 *   console.log('Current cost:', data.current_period_cost);
 *   console.log('Projected monthly:', data.projected_monthly_cost);
 * }
 * ```
 */
export function useBillingSummary(
  projectId: string,
  options?: {
    refetchInterval?: number;
    enabled?: boolean;
  }
): UseQueryResult<BillingSummaryResponse, Error> {
  return useQuery({
    queryKey: billingQueryKeys.summary(projectId),
    queryFn: async () => {
      const response = await apiClient.get<BillingSummaryResponse>(
        `/projects/${projectId}/billing/summary`
      );
      return response.data;
    },
    enabled: !!projectId && (options?.enabled !== false),
    refetchInterval: options?.refetchInterval || 300000, // Default: 5 minutes
    staleTime: 60000, // 1 minute
    retry: 2,
  });
}

/**
 * Hook to fetch billing history for a project
 *
 * @param projectId - Project ID
 * @param options - React Query options
 * @returns Billing history query result
 */
export function useBillingHistory(
  projectId: string,
  options?: {
    enabled?: boolean;
    limit?: number;
  }
): UseQueryResult<any[], Error> {
  return useQuery<any[], Error>({
    queryKey: billingQueryKeys.history(projectId),
    queryFn: async (): Promise<any[]> => {
      const limit = options?.limit || 12; // Default: last 12 months
      const response = await apiClient.get(
        `/projects/${projectId}/billing/history?limit=${limit}`
      );
      return response.data as any[];
    },
    enabled: !!projectId && (options?.enabled !== false),
    staleTime: 300000, // 5 minutes
    retry: 1,
  });
}

/**
 * Calculate usage percentage with safety checks
 *
 * @param used - Used credits
 * @param total - Total credits available
 * @returns Percentage (0-100)
 */
export function calculateUsagePercentage(used: number, total: number): number {
  if (total === 0) return 0;
  if (used === 0) return 0;
  return Math.min((used / total) * 100, 100);
}

/**
 * Get tier limits based on subscription tier
 *
 * @param tier - Subscription tier
 * @returns Credit limits for the tier
 */
export function getTierLimits(tier: 'free' | 'pro' | 'scale' | 'enterprise'): {
  monthly_credits: number;
  api_requests: number;
  storage_gb: number;
  bandwidth_gb: number;
} {
  const limits = {
    free: {
      monthly_credits: 1000,
      api_requests: 10000,
      storage_gb: 1,
      bandwidth_gb: 10,
    },
    pro: {
      monthly_credits: 10000,
      api_requests: 100000,
      storage_gb: 10,
      bandwidth_gb: 100,
    },
    scale: {
      monthly_credits: 100000,
      api_requests: 1000000,
      storage_gb: 100,
      bandwidth_gb: 1000,
    },
    enterprise: {
      monthly_credits: Infinity,
      api_requests: Infinity,
      storage_gb: Infinity,
      bandwidth_gb: Infinity,
    },
  };

  return limits[tier];
}

export default {
  useCreditUsage,
  useBillingSummary,
  useBillingHistory,
  calculateUsagePercentage,
  getTierLimits,
};
