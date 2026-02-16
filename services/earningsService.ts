/**
 * Earnings Service
 * Handles developer earnings, transactions, and payout information
 * Follows AINative service patterns
 *
 * Endpoint mapping (Fixes #585):
 *   - Wallet/overview: GET /v1/payments/wallets/me
 *   - Transactions:    GET /v1/payments/transactions
 *   - Export:          GET /v1/payments/transactions/export
 *   - Breakdown:       No backend endpoint (returns null)
 *   - Payout schedule: No backend endpoint (returns null)
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
 * Standard operation result
 */
export interface OperationResult {
  success: boolean;
  message: string;
}

// ============================================================================
// Earnings Interfaces
// ============================================================================

/**
 * Earnings overview summary
 */
export interface EarningsOverview {
  totalEarnings: number;
  thisMonth: number;
  lastMonth: number;
  pendingPayout: number;
  currency: string;
}

/**
 * Transaction source types
 */
export type TransactionSource = 'api' | 'marketplace' | 'referral';

/**
 * Transaction status types
 */
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'cancelled';

/**
 * Individual transaction record
 */
export interface Transaction {
  id: string;
  date: string;
  description: string;
  source: TransactionSource;
  amount: number;
  status: TransactionStatus;
  currency: string;
}

/**
 * Paginated transaction response
 */
export interface PaginatedTransactions {
  items: Transaction[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Transaction query parameters
 */
export interface TransactionQueryParams {
  page?: number;
  pageSize?: number;
  source?: TransactionSource;
  status?: TransactionStatus;
  startDate?: string;
  endDate?: string;
}

/**
 * Earnings breakdown by source
 */
export interface EarningsBreakdown {
  api: number;
  marketplace: number;
  referrals: number;
}

/**
 * Payout schedule information
 */
export interface PayoutSchedule {
  nextPayoutDate: string;
  minimumPayout: number;
  payoutThreshold: number;
  currency: string;
}

/**
 * Export format types
 */
export type ExportFormat = 'csv' | 'pdf' | 'json';

// ============================================================================
// Earnings Service Class
// ============================================================================

/**
 * Earnings Service Class
 * Manages developer earnings, transactions, and payout information
 */
export class EarningsService {
  private readonly walletPath = '/v1/payments/wallets/me';
  private readonly transactionsPath = '/v1/payments/transactions';

  /**
   * Get earnings overview summary
   * Maps to GET /v1/payments/wallets/me
   */
  async getEarningsOverview(): Promise<EarningsOverview | null> {
    try {
      const response = await apiClient.get<EarningsOverview | ApiResponse<EarningsOverview>>(
        this.walletPath
      );

      const data = response.data;

      // Handle both wrapped {success, data} and raw response formats
      if ('success' in data && 'data' in data) {
        return (data as ApiResponse<EarningsOverview>).data || null;
      }

      return data as EarningsOverview;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch earnings overview';
      console.error('Error fetching earnings overview:', errorMessage);
      return null;
    }
  }

  /**
   * Get paginated transactions
   * Maps to GET /v1/payments/transactions
   * @param params - Query parameters for filtering and pagination
   */
  async getTransactions(params: TransactionQueryParams = {}): Promise<PaginatedTransactions> {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append('page', params.page.toString());
      if (params.pageSize) queryParams.append('page_size', params.pageSize.toString());
      if (params.source) queryParams.append('source', params.source);
      if (params.status) queryParams.append('status', params.status);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const url = `${this.transactionsPath}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await apiClient.get<PaginatedTransactions | ApiResponse<PaginatedTransactions>>(url);

      const data = response.data;

      // Handle both wrapped {success, data} and raw response formats
      if ('success' in data && 'data' in data) {
        return (data as ApiResponse<PaginatedTransactions>).data || { items: [], total: 0, page: 1, pageSize: 50 };
      }

      // Raw response may use 'transactions' instead of 'items' and 'page_size' instead of 'pageSize'
      const raw = data as Record<string, unknown>;
      return {
        items: (raw.transactions || raw.items || []) as Transaction[],
        total: (raw.total || 0) as number,
        page: (raw.page || 1) as number,
        pageSize: (raw.page_size || raw.pageSize || 50) as number,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch transactions';
      console.error('Error fetching transactions:', errorMessage);
      return { items: [], total: 0, page: 1, pageSize: 50 };
    }
  }

  /**
   * Get earnings breakdown by source
   * No equivalent API endpoint exists — returns null gracefully
   */
  async getEarningsBreakdown(): Promise<EarningsBreakdown | null> {
    // Endpoint /v1/public/developer/earnings/breakdown does not exist in the API.
    // Return null until a backend endpoint is implemented.
    return null;
  }

  /**
   * Get payout schedule information
   * No equivalent API endpoint exists — returns null gracefully
   */
  async getPayoutSchedule(): Promise<PayoutSchedule | null> {
    // Endpoint /v1/public/developer/earnings/payout-schedule does not exist in the API.
    // Return null until a backend endpoint is implemented.
    return null;
  }

  /**
   * Export transactions in specified format
   * Maps to GET /v1/payments/transactions/export
   * @param format - Export format (csv, pdf, json)
   * @param params - Optional filter parameters
   */
  async exportTransactions(
    format: ExportFormat,
    params?: TransactionQueryParams
  ): Promise<boolean> {
    try {
      const queryParams = new URLSearchParams({ format });

      if (params?.source) queryParams.append('source', params.source);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);

      const response = await apiClient.get(
        `${this.transactionsPath}/export?${queryParams.toString()}`,
        {
          responseType: 'blob',
        }
      );

      // Create download link
      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' : format === 'pdf' ? 'application/pdf' : 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `earnings-transactions.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to export transactions';
      console.error('Error exporting transactions:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get transaction source display text
   * @param source - Transaction source
   */
  getSourceDisplayText(source: TransactionSource): string {
    const sourceMap: Record<TransactionSource, string> = {
      api: 'API Usage',
      marketplace: 'Marketplace',
      referral: 'Referral',
    };

    return sourceMap[source] || source;
  }

  /**
   * Get transaction status display text
   * @param status - Transaction status
   */
  getStatusDisplayText(status: TransactionStatus): string {
    const statusMap: Record<TransactionStatus, string> = {
      completed: 'Completed',
      pending: 'Pending',
      failed: 'Failed',
      cancelled: 'Cancelled',
    };

    return statusMap[status] || status;
  }

  /**
   * Get transaction status color class for UI
   * @param status - Transaction status
   */
  getStatusColorClass(status: TransactionStatus): string {
    const colorMap: Record<TransactionStatus, string> = {
      completed: 'text-green-600 bg-green-50',
      pending: 'text-yellow-600 bg-yellow-50',
      failed: 'text-red-600 bg-red-50',
      cancelled: 'text-gray-600 bg-gray-50',
    };

    return colorMap[status] || 'text-gray-600 bg-gray-50';
  }

  /**
   * Format currency amount for display
   * @param amount - Amount in dollars (not cents)
   * @param currency - Currency code (default: USD)
   */
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  }

  /**
   * Format date for display
   * @param dateString - ISO date string
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  }

  /**
   * Calculate growth percentage
   * @param current - Current value
   * @param previous - Previous value
   */
  calculateGrowthPercentage(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Calculate percentage of total
   * @param value - Part value
   * @param total - Total value
   */
  calculatePercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return (value / total) * 100;
  }
}

// Export singleton instance
export const earningsService = new EarningsService();
