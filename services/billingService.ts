/**
 * Billing Service
 * Handles billing information, invoices, payment methods, and credit management
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
 * Standard operation result
 */
export interface OperationResult {
  success: boolean;
  message: string;
}

// ============================================================================
// Billing Interfaces
// ============================================================================

/**
 * Payment method details
 */
export interface PaymentMethod {
  id: string;
  type: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

/**
 * Invoice details
 */
export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'void';
  created_at: string;
  paid_at: string | null;
  invoice_pdf: string;
  number: string;
  description?: string;
}

/**
 * Billing status type
 */
export type BillingStatus =
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'active_until_period_end';

/**
 * Billing information including payment methods and balances
 */
export interface BillingInfo {
  payment_methods: PaymentMethod[];
  balance: number;
  credit_balance: number;
  next_billing_date?: string;
  status: BillingStatus;
}

// ============================================================================
// Subscription Interfaces
// ============================================================================

/**
 * Subscription plan definition
 */
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  is_popular?: boolean;
  is_active: boolean;
}

/**
 * Auto-refill settings
 */
export interface AutoRefillSettings {
  enabled: boolean;
  threshold: number;
  amount: string;
}

/**
 * Subscription details
 */
export interface Subscription {
  id: string;
  plan_id: string;
  status: BillingStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  auto_refill?: AutoRefillSettings;
}

// ============================================================================
// Credit Interfaces
// ============================================================================

/**
 * Credit balance information
 */
export interface CreditBalance {
  available: number;
  used: number;
  total: number;
  currency: string;
}

/**
 * Credit usage breakdown item
 */
export interface CreditUsageBreakdownItem {
  date: string;
  amount: number;
  description: string;
}

/**
 * Credit usage for a period
 */
export interface CreditUsage {
  period: {
    start: string;
    end: string;
  };
  total_used: number;
  breakdown: CreditUsageBreakdownItem[];
}

/**
 * Credit transaction metadata
 */
export interface CreditTransactionMetadata {
  invoice_id?: string;
  reference_id?: string;
}

/**
 * Credit transaction record
 */
export interface CreditTransaction {
  id: string;
  amount: number;
  description: string;
  type: 'purchase' | 'usage' | 'refund' | 'adjustment';
  created_at: string;
  balance_after: number;
  metadata?: CreditTransactionMetadata;
}

// ============================================================================
// Billing Service Class
// ============================================================================

/**
 * Billing Service Class
 * Manages billing, invoices, payment methods, subscriptions, and credits
 */
export class BillingService {
  private readonly billingBasePath = '/v1/dashboard/billing';
  private readonly subscriptionBasePath = '/v1/subscription';
  private readonly creditsBasePath = '/v1/credits';

  // ==========================================================================
  // Billing Methods
  // ==========================================================================

  /**
   * Get billing information including payment methods and balances
   */
  async getBillingInfo(): Promise<BillingInfo | null> {
    try {
      const response = await apiClient.get<ApiResponse<BillingInfo>>(
        `${this.billingBasePath}/info`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch billing info');
      }

      return response.data.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch billing info';
      console.error('Error fetching billing info:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get all invoices
   */
  async getInvoices(): Promise<Invoice[]> {
    try {
      const response = await apiClient.get<ApiResponse<{ items: Invoice[] }>>(
        `${this.billingBasePath}/invoices`
      );

      if (!response.data.success || !response.data.data?.items) {
        return [];
      }

      return response.data.data.items;
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      return [];
    }
  }

  /**
   * Get a specific invoice by ID
   * @param invoiceId - The invoice ID to retrieve
   */
  async getInvoiceById(invoiceId: string): Promise<Invoice | null> {
    try {
      const response = await apiClient.get<ApiResponse<Invoice>>(
        `${this.billingBasePath}/invoices/${invoiceId}`
      );

      if (!response.data.success || !response.data.data) {
        return null;
      }

      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch invoice ${invoiceId}:`, error);
      return null;
    }
  }

  /**
   * Add a new payment method
   * @param paymentMethodId - Stripe payment method ID
   */
  async addPaymentMethod(paymentMethodId: string): Promise<OperationResult> {
    try {
      const response = await apiClient.post<
        ApiResponse<{ payment_method: PaymentMethod }>
      >(`${this.billingBasePath}/payment-method`, {
        payment_method_id: paymentMethodId,
      });

      if (!response.data.success) {
        return {
          success: false,
          message: response.data.message || 'Failed to add payment method',
        };
      }

      return { success: true, message: 'Payment method added successfully' };
    } catch (err: unknown) {
      console.error('Failed to add payment method:', err);
      let errorMessage = 'Failed to add payment method. Please try again.';

      if (err && typeof err === 'object') {
        if ('response' in err) {
          const axiosError = err as {
            response?: { data?: { message?: string } };
          };
          errorMessage = axiosError?.response?.data?.message || errorMessage;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
      }

      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  // ==========================================================================
  // Subscription Methods
  // ==========================================================================

  /**
   * Get current subscription
   */
  async getSubscription(): Promise<Subscription | null> {
    try {
      const response = await apiClient.get<
        ApiResponse<{ subscription: Subscription }>
      >(this.subscriptionBasePath);

      if (!response.data.success || !response.data.data?.subscription) {
        return null;
      }

      return response.data.data.subscription;
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      return null;
    }
  }

  /**
   * Update subscription
   * @param updates - Partial subscription updates
   */
  async updateSubscription(
    updates: Partial<Subscription>
  ): Promise<OperationResult> {
    try {
      const response = await apiClient.put<
        ApiResponse<{ subscription: Subscription }>
      >(this.subscriptionBasePath, { ...updates });

      if (!response.data.success) {
        return {
          success: false,
          message: response.data.message || 'Failed to update subscription',
        };
      }

      return { success: true, message: 'Subscription updated successfully' };
    } catch (error) {
      console.error('Failed to update subscription:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to update subscription. Please try again.';

      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Get available subscription plans
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await apiClient.get<
        ApiResponse<{ plans: SubscriptionPlan[] }>
      >(`${this.subscriptionBasePath}/plans`);

      if (!response.data.success || !response.data.data?.plans) {
        return [];
      }

      return response.data.data.plans;
    } catch (error) {
      console.error('Failed to fetch subscription plans:', error);
      return [];
    }
  }

  // ==========================================================================
  // Credit Methods
  // ==========================================================================

  /**
   * Get credit balance
   */
  async getCreditBalance(): Promise<CreditBalance | null> {
    try {
      const response = await apiClient.get<
        ApiResponse<{ balance: CreditBalance }>
      >(this.creditsBasePath);

      if (!response.data.success || !response.data.data?.balance) {
        return null;
      }

      return response.data.data.balance;
    } catch (error) {
      console.error('Failed to fetch credit balance:', error);
      return null;
    }
  }

  /**
   * Purchase credits
   * @param amount - Amount of credits to purchase
   * @param paymentMethodId - Optional specific payment method to use
   */
  async purchaseCredits(
    amount: number,
    paymentMethodId?: string
  ): Promise<OperationResult> {
    try {
      const response = await apiClient.post<
        ApiResponse<{ transaction_id: string }>
      >(`${this.creditsBasePath}/purchase`, {
        amount,
        payment_method_id: paymentMethodId,
      });

      if (!response.data.success) {
        return {
          success: false,
          message: response.data.message || 'Failed to purchase credits',
        };
      }

      return { success: true, message: 'Credits purchased successfully' };
    } catch (error: unknown) {
      console.error('Failed to purchase credits:', error);
      let errorMessage = 'Failed to purchase credits. Please try again.';
      if (
        error &&
        typeof error === 'object' &&
        'response' in error
      ) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      }

      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Get credit usage for the current period
   */
  async getCreditUsage(): Promise<CreditUsage | null> {
    try {
      const response = await apiClient.get<ApiResponse<{ usage: CreditUsage }>>(
        `${this.creditsBasePath}/usage`
      );

      if (!response.data.success || !response.data.data?.usage) {
        return null;
      }

      return response.data.data.usage;
    } catch (error) {
      console.error('Failed to fetch credit usage:', error);
      return null;
    }
  }

  /**
   * Get credit transactions history
   */
  async getCreditTransactions(): Promise<CreditTransaction[]> {
    try {
      const response = await apiClient.get<
        ApiResponse<{ transactions: CreditTransaction[] }>
      >(`${this.creditsBasePath}/transactions`);

      if (!response.data.success || !response.data.data?.transactions) {
        return [];
      }

      return response.data.data.transactions;
    } catch (error) {
      console.error('Failed to fetch credit transactions:', error);
      return [];
    }
  }

  // ==========================================================================
  // Auto-Refill Methods
  // ==========================================================================

  /**
   * Get auto-refill settings
   */
  async getAutoRefillSettings(): Promise<AutoRefillSettings | null> {
    try {
      const response = await apiClient.get<
        ApiResponse<{ auto_refill: AutoRefillSettings }>
      >(`${this.billingBasePath}/auto-refill-settings`);

      if (!response.data.success || !response.data.data?.auto_refill) {
        throw new Error(
          response.data.message || 'Failed to fetch auto-refill settings'
        );
      }

      return response.data.data.auto_refill;
    } catch (error) {
      console.error('Error fetching auto-refill settings:', error);
      return null;
    }
  }

  /**
   * Update auto-refill settings
   * @param settings - New auto-refill settings
   */
  async updateAutoRefillSettings(
    settings: AutoRefillSettings
  ): Promise<OperationResult> {
    try {
      const response = await apiClient.put<ApiResponse<{ success: boolean }>>(
        `${this.billingBasePath}/auto-refill-settings`,
        settings
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || 'Failed to update auto-refill settings'
        );
      }

      return {
        success: true,
        message: 'Auto-refill settings updated successfully',
      };
    } catch (error) {
      console.error('Error updating auto-refill settings:', error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to update auto-refill settings',
      };
    }
  }

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  /**
   * Get billing status display text
   * @param status - Billing status
   */
  getStatusDisplayText(status: BillingStatus): string {
    const statusMap: Record<BillingStatus, string> = {
      active: 'Active',
      past_due: 'Past Due',
      canceled: 'Canceled',
      unpaid: 'Unpaid',
      incomplete: 'Incomplete',
      incomplete_expired: 'Expired',
      trialing: 'Trial',
      active_until_period_end: 'Canceling',
    };

    return statusMap[status] || status;
  }

  /**
   * Get billing status color class for UI
   * @param status - Billing status
   */
  getStatusColorClass(status: BillingStatus): string {
    const colorMap: Record<BillingStatus, string> = {
      active: 'text-green-600 bg-green-50',
      past_due: 'text-yellow-600 bg-yellow-50',
      canceled: 'text-gray-600 bg-gray-50',
      unpaid: 'text-red-600 bg-red-50',
      incomplete: 'text-orange-600 bg-orange-50',
      incomplete_expired: 'text-red-600 bg-red-50',
      trialing: 'text-blue-600 bg-blue-50',
      active_until_period_end: 'text-yellow-600 bg-yellow-50',
    };

    return colorMap[status] || 'text-gray-600 bg-gray-50';
  }

  /**
   * Get invoice status display text
   * @param status - Invoice status
   */
  getInvoiceStatusDisplayText(status: Invoice['status']): string {
    const statusMap: Record<Invoice['status'], string> = {
      paid: 'Paid',
      pending: 'Pending',
      failed: 'Failed',
      void: 'Void',
    };

    return statusMap[status] || status;
  }

  /**
   * Get invoice status color class for UI
   * @param status - Invoice status
   */
  getInvoiceStatusColorClass(status: Invoice['status']): string {
    const colorMap: Record<Invoice['status'], string> = {
      paid: 'text-green-600 bg-green-50',
      pending: 'text-yellow-600 bg-yellow-50',
      failed: 'text-red-600 bg-red-50',
      void: 'text-gray-600 bg-gray-50',
    };

    return colorMap[status] || 'text-gray-600 bg-gray-50';
  }

  /**
   * Format currency amount for display
   * @param amount - Amount in cents
   * @param currency - Currency code (default: USD)
   */
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  }
}

// Export singleton instance
export const billingService = new BillingService();
