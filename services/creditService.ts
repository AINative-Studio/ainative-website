/**
 * Credit Service
 * Handles credit balance, transactions, packages, and purchases
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
 * Credit balance information
 */
export interface CreditBalance {
  available: number;
  used: number;
  total: number;
  currency: string;
  next_reset_date?: string;
}

/**
 * Credit transaction record
 */
export interface CreditTransaction {
  id: string;
  amount: number;
  description: string;
  type: 'purchase' | 'usage' | 'refund' | 'adjustment' | 'expiration';
  created_at: string;
  balance_after: number;
  metadata?: {
    invoice_id?: string;
    reference_id?: string;
    feature?: string;
  };
}

/**
 * Credit package available for purchase
 */
export interface CreditPackage {
  id: string;
  name: string;
  description: string;
  credits: number;
  price: number;
  currency: string;
  is_popular?: boolean;
  bonus_credits?: number;
  features?: string[];
}

/**
 * Credit balance response for dashboard display
 */
export interface CreditBalanceResponse {
  base_used: number;
  base_quota: number;
  add_on_used: number;
  add_on_quota: number;
  next_refresh: string;
  period_start?: string;
}

/**
 * Standard operation result
 */
export interface OperationResult {
  success: boolean;
  message: string;
  transactionId?: string;
}

/**
 * Auto-refill configuration
 */
export interface AutoRefillConfig {
  enabled: boolean;
  threshold?: number;
  amount?: number;
  payment_method_id?: string;
  next_refill_date?: string;
}

/**
 * Transaction history query parameters
 */
export interface TransactionHistoryParams {
  page?: number;
  limit?: number;
  type?: string;
  start_date?: string;
  end_date?: string;
}

/**
 * Credit Service Class
 * Manages all credit-related API operations
 */
export class CreditService {
  private readonly basePath = '/v1/credits';

  /**
   * Get current credit balance
   */
  async getCreditBalance(): Promise<CreditBalance | null> {
    try {
      const response = await apiClient.get<ApiResponse<{ balance: CreditBalance }>>(
        `${this.basePath}/balance`
      );

      if (!response.data.success || !response.data.data?.balance) {
        throw new Error(response.data.message || 'Failed to fetch credit balance');
      }

      return response.data.data.balance;
    } catch (error) {
      console.error('Error fetching credit balance:', error);
      return null;
    }
  }

  /**
   * Get credit transaction history
   * @param params - Query parameters for filtering transactions
   */
  async getTransactionHistory(
    params?: TransactionHistoryParams
  ): Promise<{ transactions: CreditTransaction[]; total: number } | null> {
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', params.page.toString());
      if (params?.limit) queryParams.set('limit', params.limit.toString());
      if (params?.type) queryParams.set('type', params.type);
      if (params?.start_date) queryParams.set('start_date', params.start_date);
      if (params?.end_date) queryParams.set('end_date', params.end_date);

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `${this.basePath}/transactions?${queryString}`
        : `${this.basePath}/transactions`;

      const response = await apiClient.get<
        ApiResponse<{ transactions: CreditTransaction[]; total: number }>
      >(endpoint);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch transaction history');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return null;
    }
  }

  /**
   * Get available credit packages
   */
  async getCreditPackages(): Promise<CreditPackage[]> {
    try {
      const response = await apiClient.get<ApiResponse<{ packages: CreditPackage[] }>>(
        `${this.basePath}/packages`
      );

      if (!response.data.success || !response.data.data?.packages) {
        throw new Error(response.data.message || 'Failed to fetch credit packages');
      }

      return response.data.data.packages;
    } catch (error) {
      console.error('Error fetching credit packages:', error);
      throw error;
    }
  }

  /**
   * Purchase credits
   * @param packageId - The ID of the credit package to purchase
   * @param paymentMethodId - Optional payment method ID
   */
  async purchaseCredits(packageId: string, paymentMethodId?: string): Promise<OperationResult> {
    try {
      const response = await apiClient.post<ApiResponse<{ transaction_id: string }>>(
        `${this.basePath}/purchase`,
        { package_id: packageId, payment_method_id: paymentMethodId }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to purchase credits');
      }

      return {
        success: true,
        message: 'Credits purchased successfully',
        transactionId: response.data.data?.transaction_id
      };
    } catch (error) {
      console.error('Error purchasing credits:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to purchase credits'
      };
    }
  }

  /**
   * Get credits information in the format expected by DashboardPage
   * Includes robust error handling and logging for debugging
   */
  async getCredits(): Promise<CreditBalanceResponse> {
    try {
      console.log('Fetching credits data...');

      const response = await apiClient.get<ApiResponse<CreditBalanceResponse>>(this.basePath);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch credits information');
      }

      console.log('Credits data fetched successfully');
      return response.data.data;
    } catch (error: unknown) {
      console.error('Error fetching credits information:', error);

      // Enhanced error logging with more context
      if (error instanceof Error) {
        if (error.message === 'Network Error') {
          console.warn('This appears to be a CORS or network connectivity issue');
        }
      }

      // Check for response status if available
      const errorWithResponse = error as { response?: { status?: number } };
      if (errorWithResponse?.response?.status === 404) {
        console.warn('Credits endpoint not found - check API route configuration');
      } else if (errorWithResponse?.response?.status === 401) {
        console.warn('Authentication failed when fetching credits');
      }

      throw error;
    }
  }

  /**
   * Set up automatic refill for credits
   * @param params - Auto-refill configuration parameters
   */
  async setupAutomaticRefill(params: {
    enabled: boolean;
    threshold?: number;
    amount?: number;
    paymentMethodId?: string;
  }): Promise<OperationResult> {
    try {
      const response = await apiClient.post<ApiResponse<{ auto_refill: AutoRefillConfig }>>(
        `${this.basePath}/auto-refill`,
        params
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update automatic refill settings');
      }

      return {
        success: true,
        message: 'Automatic refill settings updated successfully'
      };
    } catch (error) {
      console.error('Error updating automatic refill settings:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update automatic refill settings'
      };
    }
  }

  /**
   * Get auto-refill settings
   */
  async getAutoRefillSettings(): Promise<AutoRefillConfig | null> {
    try {
      const response = await apiClient.get<ApiResponse<{ auto_refill: AutoRefillConfig }>>(
        `${this.basePath}/auto-refill`
      );

      if (!response.data.success || !response.data.data?.auto_refill) {
        throw new Error(response.data.message || 'Failed to fetch auto-refill settings');
      }

      return response.data.data.auto_refill;
    } catch (error) {
      console.error('Error fetching auto-refill settings:', error);
      return null;
    }
  }

  /**
   * Calculate the percentage of credits used
   * @param balance - Credit balance object
   */
  calculateUsagePercentage(balance: CreditBalance): number {
    if (balance.total === 0) return 0;
    return Math.round((balance.used / balance.total) * 100);
  }

  /**
   * Format credit amount for display
   * @param amount - Credit amount
   * @param currency - Currency code
   */
  formatCreditAmount(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Get transaction type display text
   * @param type - Transaction type
   */
  getTransactionTypeDisplay(type: CreditTransaction['type']): string {
    const typeMap: Record<CreditTransaction['type'], string> = {
      purchase: 'Purchase',
      usage: 'Usage',
      refund: 'Refund',
      adjustment: 'Adjustment',
      expiration: 'Expiration'
    };

    return typeMap[type] || type;
  }

  /**
   * Get transaction type color class for UI
   * @param type - Transaction type
   */
  getTransactionTypeColorClass(type: CreditTransaction['type']): string {
    const colorMap: Record<CreditTransaction['type'], string> = {
      purchase: 'text-green-600 bg-green-50',
      usage: 'text-blue-600 bg-blue-50',
      refund: 'text-purple-600 bg-purple-50',
      adjustment: 'text-yellow-600 bg-yellow-50',
      expiration: 'text-red-600 bg-red-50'
    };

    return colorMap[type] || 'text-gray-600 bg-gray-50';
  }
}

// Export singleton instance
export const creditService = new CreditService();
