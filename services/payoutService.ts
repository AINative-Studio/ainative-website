/**
 * Payout Service
 * Handles developer payouts, payment methods, and payout settings
 *
 * Endpoint mapping (Fixes #587):
 *   - Payment methods (GET):  GET  /v1/public/billing/payment-methods
 *   - Payment methods (POST): POST /v1/public/billing/payment-methods
 *   - Bank accounts (DELETE): DELETE /v1/public/payments/bank-accounts/{account_id}
 *   - Transactions/payouts:   GET  /v1/public/payments/transactions
 *   - Wallet balance:         GET  /v1/public/payments/wallets/me/balance
 *   - Withdraw:               POST /v1/public/payments/withdraw
 *   - Stripe Connect:         No backend endpoint (returns null)
 *   - Auto-payout settings:   No backend endpoint (returns null)
 *   - Tax forms:              No backend endpoint (returns [])
 *   - Notification prefs:     No backend endpoint (returns null)
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
// Payout Interfaces
// ============================================================================

/**
 * Payout status types
 */
export type PayoutStatus =
  | 'pending'
  | 'in_transit'
  | 'paid'
  | 'failed'
  | 'canceled';

/**
 * Payout record
 */
export interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  description?: string;
  created_at: string;
  arrival_date?: string;
  failure_reason?: string;
  destination_type: 'bank_account' | 'debit_card';
  destination_last4?: string;
}

/**
 * Payment method types for Stripe Connect
 */
export type PaymentMethodType = 'bank_account' | 'debit_card';

/**
 * Connected payment method details
 */
export interface ConnectedPaymentMethod {
  id: string;
  type: PaymentMethodType;
  bank_name?: string;
  account_holder_name?: string;
  routing_number?: string;
  last4: string;
  currency: string;
  is_default: boolean;
  status: 'verified' | 'verification_required' | 'errored';
}

/**
 * Payout schedule types
 */
export type PayoutSchedule = 'daily' | 'weekly' | 'monthly' | 'manual';

/**
 * Automatic payout settings
 */
export interface AutoPayoutSettings {
  enabled: boolean;
  schedule: PayoutSchedule;
  threshold: number; // Minimum balance required before auto-payout
  delay_days: number; // Delay in days after funds become available
}

/**
 * Tax form types
 */
export type TaxFormType = 'W9' | '1099-K' | '1099-MISC';

/**
 * Tax form record
 */
export interface TaxForm {
  id: string;
  type: TaxFormType;
  year: number;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  file_url?: string;
  submitted_at?: string;
  approved_at?: string;
}

/**
 * Notification preferences for payouts
 */
export interface PayoutNotificationPreferences {
  email_on_payout_sent: boolean;
  email_on_payout_paid: boolean;
  email_on_payout_failed: boolean;
  sms_on_payout_paid: boolean;
}

/**
 * Stripe Connect account status
 */
export interface StripeConnectStatus {
  is_connected: boolean;
  account_id?: string;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  requirements?: {
    currently_due: string[];
    eventually_due: string[];
    past_due: string[];
  };
}

/**
 * Payout balance information
 */
export interface PayoutBalance {
  available: number;
  pending: number;
  total: number;
  currency: string;
}

// ============================================================================
// Payout Service Class
// ============================================================================

/**
 * Payout Service Class
 * Manages developer payouts, payment methods, and settings
 */
export class PayoutService {
  private readonly paymentMethodsPath = '/v1/public/billing/payment-methods';
  private readonly transactionsPath = '/v1/public/payments/transactions';
  private readonly walletBalancePath = '/v1/public/payments/wallets/me/balance';
  private readonly bankAccountsPath = '/v1/public/payments/bank-accounts';
  private readonly withdrawPath = '/v1/public/payments/withdraw';

  // ==========================================================================
  // Stripe Connect Methods
  // ==========================================================================

  /**
   * Get Stripe Connect account status
   * No equivalent API endpoint exists — returns null gracefully
   */
  async getStripeConnectStatus(): Promise<StripeConnectStatus | null> {
    // Endpoint /v1/public/developer/payouts/connect/status does not exist in the API.
    // Return null until a backend endpoint is implemented.
    return null;
  }

  /**
   * Create Stripe Connect account link for onboarding
   * No equivalent API endpoint exists — returns null gracefully
   */
  async createConnectAccountLink(): Promise<{ url: string } | null> {
    // No backend endpoint available.
    return null;
  }

  /**
   * Create Stripe Connect dashboard link
   * No equivalent API endpoint exists — returns null gracefully
   */
  async createConnectDashboardLink(): Promise<{ url: string } | null> {
    // No backend endpoint available.
    return null;
  }

  // ==========================================================================
  // Payment Method Methods
  // ==========================================================================

  /**
   * Get all connected payment methods
   * Maps to GET /v1/public/billing/payment-methods
   */
  async getPaymentMethods(): Promise<ConnectedPaymentMethod[]> {
    try {
      const response = await apiClient.get<
        ConnectedPaymentMethod[] | ApiResponse<ConnectedPaymentMethod[]> | ApiResponse<{ payment_methods: ConnectedPaymentMethod[] }>
      >(this.paymentMethodsPath);

      const data = response.data;

      // Handle wrapped {success, data} response format
      if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
        const inner = (data as ApiResponse<ConnectedPaymentMethod[] | { payment_methods: ConnectedPaymentMethod[] }>).data;
        if (!inner) return [];
        // Handle nested { payment_methods: [...] } format
        if ('payment_methods' in inner) {
          return (inner as { payment_methods: ConnectedPaymentMethod[] }).payment_methods || [];
        }
        // Handle direct array format
        return Array.isArray(inner) ? inner : [];
      }

      // Handle raw array response
      if (Array.isArray(data)) {
        return data;
      }

      return [];
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch payment methods';
      console.error('Failed to fetch payment methods:', errorMessage);
      return [];
    }
  }

  /**
   * Add a new payment method
   * Maps to POST /v1/public/billing/payment-methods
   * @param methodDetails - Payment method details
   */
  async addPaymentMethod(methodDetails: {
    type: PaymentMethodType;
    bank_account_token?: string;
    debit_card_token?: string;
  }): Promise<OperationResult> {
    try {
      const response = await apiClient.post<ApiResponse<{ payment_method: ConnectedPaymentMethod }>>(
        this.paymentMethodsPath,
        methodDetails
      );

      const data = response.data;

      if (data && typeof data === 'object' && 'success' in data && !data.success) {
        return {
          success: false,
          message: (data as ApiResponse<unknown>).message || 'Failed to add payment method',
        };
      }

      return { success: true, message: 'Payment method added successfully' };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to add payment method';
      console.error('Failed to add payment method:', errorMessage);
      return {
        success: false,
        message: 'Failed to add payment method. Please try again.',
      };
    }
  }

  /**
   * Remove a payment method
   * Maps to DELETE /v1/public/payments/bank-accounts/{account_id}
   * @param methodId - Payment method ID to remove
   */
  async removePaymentMethod(methodId: string): Promise<OperationResult> {
    try {
      const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(
        `${this.bankAccountsPath}/${methodId}`
      );

      const data = response.data;

      if (data && typeof data === 'object' && 'success' in data && !data.success) {
        return {
          success: false,
          message: (data as ApiResponse<unknown>).message || 'Failed to remove payment method',
        };
      }

      return { success: true, message: 'Payment method removed successfully' };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to remove payment method';
      console.error('Failed to remove payment method:', errorMessage);
      return {
        success: false,
        message: 'Failed to remove payment method. Please try again.',
      };
    }
  }

  /**
   * Set default payment method
   * No equivalent API endpoint exists — returns failure gracefully
   * @param methodId - Payment method ID to set as default
   */
  async setDefaultPaymentMethod(_methodId: string): Promise<OperationResult> {
    // No backend endpoint available for setting default payment method.
    return {
      success: false,
      message: 'Setting default payment method is not yet supported.',
    };
  }

  // ==========================================================================
  // Payout History Methods
  // ==========================================================================

  /**
   * Get payout history
   * Maps to GET /v1/public/payments/transactions
   * @param params - Optional filter parameters
   */
  async getPayouts(params?: {
    limit?: number;
    starting_after?: string;
  }): Promise<Payout[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.starting_after) queryParams.append('starting_after', params.starting_after);

      const url = `${this.transactionsPath}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await apiClient.get<
        Payout[] | ApiResponse<Payout[]> | ApiResponse<{ payouts: Payout[] }>
      >(url);

      const data = response.data;

      // Handle wrapped {success, data} response format
      if (data && typeof data === 'object' && !Array.isArray(data) && 'success' in data && 'data' in data) {
        const inner = (data as ApiResponse<Payout[] | { payouts: Payout[] }>).data;
        if (!inner) return [];
        if ('payouts' in inner) {
          return (inner as { payouts: Payout[] }).payouts || [];
        }
        return Array.isArray(inner) ? inner : [];
      }

      // Handle raw array or object with transactions field
      if (Array.isArray(data)) {
        return data;
      }

      const raw = data as Record<string, unknown>;
      if (raw.transactions) {
        return raw.transactions as Payout[];
      }

      return [];
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch payouts';
      console.error('Failed to fetch payouts:', errorMessage);
      return [];
    }
  }

  /**
   * Get a specific payout by ID
   * No dedicated endpoint — returns null gracefully
   * @param payoutId - Payout ID to retrieve
   */
  async getPayoutById(_payoutId: string): Promise<Payout | null> {
    // No individual payout endpoint exists in the API.
    return null;
  }

  /**
   * Get payout balance
   * Maps to GET /v1/public/payments/wallets/me/balance
   */
  async getPayoutBalance(): Promise<PayoutBalance | null> {
    try {
      const response = await apiClient.get<PayoutBalance | ApiResponse<PayoutBalance>>(
        this.walletBalancePath
      );

      const data = response.data;

      // Handle wrapped {success, data} response format
      if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
        return (data as ApiResponse<PayoutBalance>).data || null;
      }

      return data as PayoutBalance;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch payout balance';
      console.error('Failed to fetch payout balance:', errorMessage);
      return null;
    }
  }

  /**
   * Request manual payout
   * Maps to POST /v1/public/payments/withdraw
   * @param amount - Amount to payout in cents
   */
  async requestPayout(amount: number): Promise<OperationResult> {
    try {
      const response = await apiClient.post<ApiResponse<{ payout: Payout }>>(
        this.withdrawPath,
        { amount }
      );

      const data = response.data;

      if (data && typeof data === 'object' && 'success' in data && !data.success) {
        return {
          success: false,
          message: (data as ApiResponse<unknown>).message || 'Failed to request payout',
        };
      }

      return { success: true, message: 'Payout requested successfully' };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to request payout';
      console.error('Failed to request payout:', errorMessage);
      return {
        success: false,
        message: 'Failed to request payout. Please try again.',
      };
    }
  }

  // ==========================================================================
  // Auto-Payout Settings Methods
  // ==========================================================================

  /**
   * Get automatic payout settings
   * No equivalent API endpoint exists — returns null gracefully
   */
  async getAutoPayoutSettings(): Promise<AutoPayoutSettings | null> {
    // No backend endpoint available.
    return null;
  }

  /**
   * Update automatic payout settings
   * No equivalent API endpoint exists — returns failure gracefully
   * @param _settings - New auto-payout settings
   */
  async updateAutoPayoutSettings(
    _settings: AutoPayoutSettings
  ): Promise<OperationResult> {
    // No backend endpoint available.
    return {
      success: false,
      message: 'Auto-payout settings are not yet supported.',
    };
  }

  // ==========================================================================
  // Tax Form Methods
  // ==========================================================================

  /**
   * Get all tax forms
   * No equivalent API endpoint exists — returns empty array gracefully
   */
  async getTaxForms(): Promise<TaxForm[]> {
    // No backend endpoint available.
    return [];
  }

  /**
   * Upload a tax form
   * No equivalent API endpoint exists — returns failure gracefully
   * @param _formType - Type of tax form
   * @param _year - Tax year
   * @param _file - File to upload
   */
  async uploadTaxForm(
    _formType: TaxFormType,
    _year: number,
    _file: File
  ): Promise<OperationResult> {
    // No backend endpoint available.
    return {
      success: false,
      message: 'Tax form upload is not yet supported.',
    };
  }

  /**
   * Download a tax form
   * No equivalent API endpoint exists — returns null gracefully
   * @param _formId - Tax form ID
   */
  async downloadTaxForm(_formId: string): Promise<string | null> {
    // No backend endpoint available.
    return null;
  }

  // ==========================================================================
  // Notification Preferences Methods
  // ==========================================================================

  /**
   * Get notification preferences
   * No equivalent API endpoint exists — returns null gracefully
   */
  async getNotificationPreferences(): Promise<PayoutNotificationPreferences | null> {
    // No backend endpoint available.
    return null;
  }

  /**
   * Update notification preferences
   * No equivalent API endpoint exists — returns failure gracefully
   * @param _preferences - New notification preferences
   */
  async updateNotificationPreferences(
    _preferences: PayoutNotificationPreferences
  ): Promise<OperationResult> {
    // No backend endpoint available.
    return {
      success: false,
      message: 'Notification preferences are not yet supported.',
    };
  }

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  /**
   * Get payout status display text
   * @param status - Payout status
   */
  getPayoutStatusDisplayText(status: PayoutStatus): string {
    const statusMap: Record<PayoutStatus, string> = {
      pending: 'Pending',
      in_transit: 'In Transit',
      paid: 'Paid',
      failed: 'Failed',
      canceled: 'Canceled',
    };

    return statusMap[status] || status;
  }

  /**
   * Get payout status color class for UI
   * @param status - Payout status
   */
  getPayoutStatusColorClass(status: PayoutStatus): string {
    const colorMap: Record<PayoutStatus, string> = {
      pending: 'text-yellow-600 bg-yellow-50',
      in_transit: 'text-blue-600 bg-blue-50',
      paid: 'text-green-600 bg-green-50',
      failed: 'text-red-600 bg-red-50',
      canceled: 'text-gray-600 bg-gray-50',
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

  /**
   * Format date for display
   * @param dateString - ISO date string
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}

// Export singleton instance
export const payoutService = new PayoutService();
