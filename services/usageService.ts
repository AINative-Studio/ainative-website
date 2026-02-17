/**
 * Usage Service
 * Handles usage metrics, limits, and real-time usage tracking
 * Ported from Vite SPA to Next.js patterns
 */

import apiClient from '@/lib/api-client';

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Usage metrics for a specific period
 */
export interface UsageMetrics {
  period: {
    start: string;
    end: string;
  };
  total_credits_used: number;
  credits_remaining: number;
  daily_usage: Array<{
    date: string;
    credits_used: number;
    endpoint: string;
  }>;
  by_feature: Array<{
    feature: string;
    credits_used: number;
    percentage: number;
  }>;
}

/**
 * Usage limits and feature allocations
 */
export interface UsageLimits {
  monthly_credits: number;
  credits_used: number;
  credits_remaining: number;
  reset_date: string;
  features: Array<{
    name: string;
    limit: number;
    used: number;
    remaining: number;
  }>;
}

/**
 * Real-time usage data
 */
export interface RealtimeUsage {
  current_usage: number;
  limit: number;
}

/**
 * Usage period options
 */
export type UsagePeriod = '7d' | '30d' | '90d';

/**
 * Usage Service Class
 * Manages all usage-related API operations
 */
export class UsageService {
  private readonly basePath = '/v1/public';

  /**
   * Get usage metrics for a specified period
   * @param period - Time period for metrics (7d, 30d, or 90d)
   * @returns Usage metrics or null if request fails
   */
  async getUsageMetrics(period: UsagePeriod = '30d'): Promise<UsageMetrics | null> {
    try {
      const response = await apiClient.get<
        | ApiResponse<{ metrics: UsageMetrics }>
        | { total_tokens: number; total_requests: number; period: string; usage: Record<string, { used: number; limit: number; percentage: number; unit: string }>; period_info?: { start: string; end: string } }
      >(`${this.basePath}/ai-usage/aggregate?period=${period}`);

      const data = response.data;

      // Handle wrapped format: {success, data: {metrics: UsageMetrics}}
      if ('success' in data && 'data' in data) {
        const wrapped = data as ApiResponse<{ metrics: UsageMetrics }>;
        if (wrapped.success && wrapped.data?.metrics) return wrapped.data.metrics;
      }

      // Handle flat format: {total_tokens, total_requests, usage, period_info, ...}
      if ('total_requests' in data) {
        const flat = data as { total_tokens: number; total_requests: number; period: string; usage: Record<string, { used: number; limit: number; percentage: number; unit: string }>; period_info?: { start: string; end: string } };
        const byFeature = Object.entries(flat.usage || {}).map(([feature, info]) => ({
          feature,
          credits_used: info.used || 0,
          percentage: info.percentage || 0,
        }));
        const totalUsed = byFeature.reduce((sum, f) => sum + f.credits_used, 0);

        return {
          period: {
            start: flat.period_info?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end: flat.period_info?.end || new Date().toISOString(),
          },
          total_credits_used: totalUsed,
          credits_remaining: 0,
          daily_usage: [],
          by_feature: byFeature,
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching usage metrics:', error);
      return null;
    }
  }

  /**
   * Get usage limits for the current billing period
   * @returns Usage limits or null if request fails
   */
  async getUsageLimits(): Promise<UsageLimits | null> {
    try {
      const response = await apiClient.get<ApiResponse<{ limits: UsageLimits }> | UsageLimits>(
        `${this.basePath}/settings/usage-limits`
      );

      const data = response.data;

      // Handle wrapped format
      if ('success' in data && 'data' in data) {
        const wrapped = data as ApiResponse<{ limits: UsageLimits }>;
        if (wrapped.success && wrapped.data?.limits) return wrapped.data.limits;
      }

      // Handle flat format
      if ('monthly_credits' in data) {
        return data as UsageLimits;
      }

      return null;
    } catch (error) {
      console.error('Error fetching usage limits:', error);
      return null;
    }
  }

  /**
   * Get real-time usage data
   * @returns Current usage and limit or null if request fails
   */
  async getRealtimeUsage(): Promise<RealtimeUsage | null> {
    try {
      const response = await apiClient.get<ApiResponse<RealtimeUsage> | { success: boolean; data: { summary: { total_credits_used: number } } }>(
        `${this.basePath}/credits/usage/current`
      );

      const data = response.data;

      // Handle wrapped format with RealtimeUsage
      if ('success' in data && data.success && 'data' in data) {
        const inner = (data as { data: Record<string, unknown> }).data;
        if ('current_usage' in inner && 'limit' in inner) {
          return inner as unknown as RealtimeUsage;
        }
        // Handle {success, data: {summary: {total_credits_used}}} format
        if ('summary' in inner) {
          const summary = inner.summary as { total_credits_used: number };
          return {
            current_usage: summary.total_credits_used || 0,
            limit: 0,
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error fetching real-time usage:', error);
      return null;
    }
  }

  /**
   * Calculate usage percentage
   * @param used - Credits used
   * @param limit - Credit limit
   * @returns Usage percentage (0-100)
   */
  calculateUsagePercentage(used: number, limit: number): number {
    if (limit <= 0) return 0;
    return Math.min(Math.round((used / limit) * 100), 100);
  }

  /**
   * Get usage status based on percentage
   * @param percentage - Usage percentage
   * @returns Status string for UI display
   */
  getUsageStatus(percentage: number): 'healthy' | 'warning' | 'critical' {
    if (percentage >= 90) return 'critical';
    if (percentage >= 75) return 'warning';
    return 'healthy';
  }

  /**
   * Get usage status color class for UI
   * @param percentage - Usage percentage
   * @returns Tailwind CSS classes for status color
   */
  getUsageStatusColorClass(percentage: number): string {
    const status = this.getUsageStatus(percentage);
    const colorMap: Record<'healthy' | 'warning' | 'critical', string> = {
      healthy: 'text-green-600 bg-green-50',
      warning: 'text-yellow-600 bg-yellow-50',
      critical: 'text-red-600 bg-red-50'
    };
    return colorMap[status];
  }

  /**
   * Get progress bar color class based on usage
   * @param percentage - Usage percentage
   * @returns Tailwind CSS classes for progress bar
   */
  getProgressBarColorClass(percentage: number): string {
    const status = this.getUsageStatus(percentage);
    const colorMap: Record<'healthy' | 'warning' | 'critical', string> = {
      healthy: 'bg-green-500',
      warning: 'bg-yellow-500',
      critical: 'bg-red-500'
    };
    return colorMap[status];
  }

  /**
   * Format credits for display
   * @param credits - Number of credits
   * @returns Formatted string (e.g., "1,234" or "1.2K")
   */
  formatCredits(credits: number): string {
    if (credits >= 1000000) {
      return `${(credits / 1000000).toFixed(1)}M`;
    }
    if (credits >= 10000) {
      return `${(credits / 1000).toFixed(1)}K`;
    }
    return credits.toLocaleString();
  }

  /**
   * Get days until reset
   * @param resetDate - ISO date string for reset
   * @returns Number of days until reset
   */
  getDaysUntilReset(resetDate: string): number {
    const reset = new Date(resetDate);
    const now = new Date();
    const diffTime = reset.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }
}

// Export singleton instance
export const usageService = new UsageService();
