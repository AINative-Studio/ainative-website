/**
 * Admin Billing Service
 * Handles billing, invoices, credits, and payment management
 */

import { adminApi } from './client';
import type {
  BillingInfo,
  Invoice,
  CreditBalance,
  CreditTransaction,
  CreditPackage,
  AutoRefillSettings,
  PaginatedResponse,
  OperationResult,
} from './types';

/**
 * Admin service for billing and credit management
 */
export class AdminBillingService {
  private readonly billingBasePath = 'billing';
  private readonly creditsBasePath = 'credits';

  /**
   * Get billing information for a user
   */
  async getBillingInfo(userId?: string): Promise<BillingInfo> {
    try {
      const queryString = userId ? `?user_id=${userId}` : '';
      const response = await adminApi.get<BillingInfo>(
        `${this.billingBasePath}/info${queryString}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch billing info');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching billing info:', error);
      throw error;
    }
  }

  /**
   * List invoices with optional filtering
   */
  async listInvoices(filters?: {
    user_id?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<Invoice>> {
    try {
      const queryString = filters ? adminApi.buildQueryString(filters) : '';
      const response = await adminApi.get<PaginatedResponse<Invoice>>(
        `${this.billingBasePath}/invoices${queryString}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch invoices');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(invoiceId: string): Promise<Invoice> {
    try {
      const response = await adminApi.get<Invoice>(`${this.billingBasePath}/invoices/${invoiceId}`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch invoice');
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching invoice ${invoiceId}:`, error);
      throw error;
    }
  }

  /**
   * Get payment methods for a user
   */
  async getPaymentMethods(userId: string): Promise<
    Array<{
      id: string;
      type: string;
      last4: string;
      expires: string;
      is_default: boolean;
    }>
  > {
    try {
      const response = await adminApi.get<{
        payment_methods: Array<{
          id: string;
          type: string;
          last4: string;
          expires: string;
          is_default: boolean;
        }>;
      }>(`${this.billingBasePath}/payment-methods?user_id=${userId}`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch payment methods');
      }

      return response.data.payment_methods || [];
    } catch (error) {
      console.error(`Error fetching payment methods for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get credit balance for a user
   */
  async getCreditBalance(userId?: string): Promise<CreditBalance> {
    try {
      const queryString = userId ? `?user_id=${userId}` : '';
      const response = await adminApi.get<CreditBalance>(
        `${this.creditsBasePath}/balance${queryString}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch credit balance');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching credit balance:', error);
      throw error;
    }
  }

  /**
   * List credit transactions
   */
  async listCreditTransactions(filters?: {
    user_id?: string;
    type?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<CreditTransaction>> {
    try {
      const queryString = filters ? adminApi.buildQueryString(filters) : '';
      const response = await adminApi.get<PaginatedResponse<CreditTransaction>>(
        `${this.creditsBasePath}/transactions${queryString}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch credit transactions');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching credit transactions:', error);
      throw error;
    }
  }

  /**
   * Get current credit usage
   */
  async getCurrentUsage(userId?: string): Promise<{
    credits_used_today: number;
    credits_used_this_month: number;
    avg_daily_usage: number;
    estimated_monthly_cost: number;
  }> {
    try {
      const queryString = userId ? `?user_id=${userId}` : '';
      const response = await adminApi.get<{
        credits_used_today: number;
        credits_used_this_month: number;
        avg_daily_usage: number;
        estimated_monthly_cost: number;
      }>(`${this.creditsBasePath}/usage/current${queryString}`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch current usage');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching current usage:', error);
      throw error;
    }
  }

  /**
   * Get available credit packages
   */
  async getCreditPackages(): Promise<CreditPackage[]> {
    try {
      const response = await adminApi.get<{ packages: CreditPackage[] }>(
        `${this.creditsBasePath}/packages`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch credit packages');
      }

      return response.data.packages || [];
    } catch (error) {
      console.error('Error fetching credit packages:', error);
      throw error;
    }
  }

  /**
   * Purchase credits for a user
   */
  async purchaseCredits(
    userId: string,
    packageId: string
  ): Promise<{ transaction_id: string; credits_added: number }> {
    try {
      const response = await adminApi.post<{ transaction_id: string; credits_added: number }>(
        `${this.creditsBasePath}/purchase`,
        { user_id: userId, package_id: packageId }
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to purchase credits');
      }

      return response.data;
    } catch (error) {
      console.error('Error purchasing credits:', error);
      throw error;
    }
  }

  /**
   * Add bonus credits to a user
   */
  async addBonusCredits(
    userId: string,
    amount: number,
    reason: string
  ): Promise<OperationResult> {
    try {
      const response = await adminApi.post<void>(`${this.creditsBasePath}/bonus`, {
        user_id: userId,
        amount,
        reason,
      });

      return {
        success: response.success,
        message: response.message || 'Bonus credits added successfully',
      };
    } catch (error) {
      console.error('Error adding bonus credits:', error);
      throw error;
    }
  }

  /**
   * Get auto-refill settings
   */
  async getAutoRefillSettings(userId: string): Promise<AutoRefillSettings> {
    try {
      const response = await adminApi.get<AutoRefillSettings>(
        `${this.creditsBasePath}/auto-refill-settings?user_id=${userId}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch auto-refill settings');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching auto-refill settings:', error);
      throw error;
    }
  }

  /**
   * Update auto-refill settings
   */
  async updateAutoRefillSettings(
    userId: string,
    settings: Partial<AutoRefillSettings>
  ): Promise<OperationResult> {
    try {
      const response = await adminApi.put<void>(
        `${this.creditsBasePath}/auto-refill-settings`,
        { user_id: userId, ...settings }
      );

      return {
        success: response.success,
        message: response.message || 'Auto-refill settings updated successfully',
      };
    } catch (error) {
      console.error('Error updating auto-refill settings:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const adminBillingService = new AdminBillingService();
