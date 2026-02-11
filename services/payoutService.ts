/**
 * Payout Service
 * Handles developer payouts, Stripe Connect integration, tax forms, and payout settings
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
 * Manages developer payouts, Stripe Connect, tax forms, and settings
 */
export class PayoutService {
  private readonly basePath = '/v1/public/developer/payouts';

  // ==========================================================================
  // Stripe Connect Methods
  // ==========================================================================

  /**
   * Get Stripe Connect account status
   */
  async getStripeConnectStatus(): Promise<StripeConnectStatus | null> {
    try {
      const response = await apiClient.get<ApiResponse<StripeConnectStatus>>(
        `${this.basePath}/connect/status`
      );

      if (!response.data.success || !response.data.data) {
        return null;
      }

      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch Stripe Connect status:', error);
      return null;
    }
  }

  /**
   * Create Stripe Connect account link for onboarding
   */
  async createConnectAccountLink(): Promise<{ url: string } | null> {
    try {
      const response = await apiClient.post<ApiResponse<{ url: string }>>(
        `${this.basePath}/connect/account-link`
      );

      if (!response.data.success || !response.data.data) {
        return null;
      }

      return response.data.data;
    } catch (error) {
      console.error('Failed to create Stripe Connect account link:', error);
      return null;
    }
  }

  /**
   * Create Stripe Connect dashboard link
   */
  async createConnectDashboardLink(): Promise<{ url: string } | null> {
    try {
      const response = await apiClient.post<ApiResponse<{ url: string }>>(
        `${this.basePath}/connect/dashboard-link`
      );

      if (!response.data.success || !response.data.data) {
        return null;
      }

      return response.data.data;
    } catch (error) {
      console.error('Failed to create Stripe Connect dashboard link:', error);
      return null;
    }
  }

  // ==========================================================================
  // Payment Method Methods
  // ==========================================================================

  /**
   * Get all connected payment methods
   */
  async getPaymentMethods(): Promise<ConnectedPaymentMethod[]> {
    try {
      const response = await apiClient.get<
        ApiResponse<{ payment_methods: ConnectedPaymentMethod[] }>
      >(`${this.basePath}/payment-methods`);

      if (!response.data.success || !response.data.data?.payment_methods) {
        return [];
      }

      return response.data.data.payment_methods;
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
      return [];
    }
  }

  /**
   * Add a new payment method
   * @param methodDetails - Payment method details
   */
  async addPaymentMethod(methodDetails: {
    type: PaymentMethodType;
    bank_account_token?: string;
    debit_card_token?: string;
  }): Promise<OperationResult> {
    try {
      const response = await apiClient.post<
        ApiResponse<{ payment_method: ConnectedPaymentMethod }>
      >(`${this.basePath}/payment-methods`, methodDetails);

      if (!response.data.success) {
        return {
          success: false,
          message: response.data.message || 'Failed to add payment method',
        };
      }

      return { success: true, message: 'Payment method added successfully' };
    } catch (error) {
      console.error('Failed to add payment method:', error);
      return {
        success: false,
        message: 'Failed to add payment method. Please try again.',
      };
    }
  }

  /**
   * Remove a payment method
   * @param methodId - Payment method ID to remove
   */
  async removePaymentMethod(methodId: string): Promise<OperationResult> {
    try {
      const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(
        `${this.basePath}/payment-methods/${methodId}`
      );

      if (!response.data.success) {
        return {
          success: false,
          message: response.data.message || 'Failed to remove payment method',
        };
      }

      return { success: true, message: 'Payment method removed successfully' };
    } catch (error) {
      console.error('Failed to remove payment method:', error);
      return {
        success: false,
        message: 'Failed to remove payment method. Please try again.',
      };
    }
  }

  /**
   * Set default payment method
   * @param methodId - Payment method ID to set as default
   */
  async setDefaultPaymentMethod(methodId: string): Promise<OperationResult> {
    try {
      const response = await apiClient.put<ApiResponse<{ success: boolean }>>(
        `${this.basePath}/payment-methods/${methodId}/default`
      );

      if (!response.data.success) {
        return {
          success: false,
          message: response.data.message || 'Failed to set default payment method',
        };
      }

      return { success: true, message: 'Default payment method updated' };
    } catch (error) {
      console.error('Failed to set default payment method:', error);
      return {
        success: false,
        message: 'Failed to set default payment method. Please try again.',
      };
    }
  }

  // ==========================================================================
  // Payout History Methods
  // ==========================================================================

  /**
   * Get payout history
   * @param params - Optional filter parameters
   */
  async getPayouts(params?: {
    limit?: number;
    starting_after?: string;
  }): Promise<Payout[]> {
    try {
      const response = await apiClient.get<
        ApiResponse<{ payouts: Payout[]; has_more: boolean }>
      >(`${this.basePath}`, { params });

      if (!response.data.success || !response.data.data?.payouts) {
        return [];
      }

      return response.data.data.payouts;
    } catch (error) {
      console.error('Failed to fetch payouts:', error);
      return [];
    }
  }

  /**
   * Get a specific payout by ID
   * @param payoutId - Payout ID to retrieve
   */
  async getPayoutById(payoutId: string): Promise<Payout | null> {
    try {
      const response = await apiClient.get<ApiResponse<Payout>>(
        `${this.basePath}/${payoutId}`
      );

      if (!response.data.success || !response.data.data) {
        return null;
      }

      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch payout ${payoutId}:`, error);
      return null;
    }
  }

  /**
   * Get payout balance
   */
  async getPayoutBalance(): Promise<PayoutBalance | null> {
    try {
      const response = await apiClient.get<ApiResponse<PayoutBalance>>(
        `${this.basePath}/balance`
      );

      if (!response.data.success || !response.data.data) {
        return null;
      }

      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch payout balance:', error);
      return null;
    }
  }

  /**
   * Request manual payout
   * @param amount - Amount to payout in cents
   */
  async requestPayout(amount: number): Promise<OperationResult> {
    try {
      const response = await apiClient.post<ApiResponse<{ payout: Payout }>>(
        `${this.basePath}/request`,
        { amount }
      );

      if (!response.data.success) {
        return {
          success: false,
          message: response.data.message || 'Failed to request payout',
        };
      }

      return { success: true, message: 'Payout requested successfully' };
    } catch (error) {
      console.error('Failed to request payout:', error);
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
   */
  async getAutoPayoutSettings(): Promise<AutoPayoutSettings | null> {
    try {
      const response = await apiClient.get<
        ApiResponse<{ settings: AutoPayoutSettings }>
      >(`${this.basePath}/settings/auto`);

      if (!response.data.success || !response.data.data?.settings) {
        return null;
      }

      return response.data.data.settings;
    } catch (error) {
      console.error('Failed to fetch auto-payout settings:', error);
      return null;
    }
  }

  /**
   * Update automatic payout settings
   * @param settings - New auto-payout settings
   */
  async updateAutoPayoutSettings(
    settings: AutoPayoutSettings
  ): Promise<OperationResult> {
    try {
      const response = await apiClient.put<
        ApiResponse<{ settings: AutoPayoutSettings }>
      >(`${this.basePath}/settings/auto`, settings);

      if (!response.data.success) {
        return {
          success: false,
          message: response.data.message || 'Failed to update auto-payout settings',
        };
      }

      return {
        success: true,
        message: 'Auto-payout settings updated successfully',
      };
    } catch (error) {
      console.error('Failed to update auto-payout settings:', error);
      return {
        success: false,
        message: 'Failed to update auto-payout settings. Please try again.',
      };
    }
  }

  // ==========================================================================
  // Tax Form Methods
  // ==========================================================================

  /**
   * Get all tax forms
   */
  async getTaxForms(): Promise<TaxForm[]> {
    try {
      const response = await apiClient.get<
        ApiResponse<{ forms: TaxForm[] }>
      >(`${this.basePath}/tax-forms`);

      if (!response.data.success || !response.data.data?.forms) {
        return [];
      }

      return response.data.data.forms;
    } catch (error) {
      console.error('Failed to fetch tax forms:', error);
      return [];
    }
  }

  /**
   * Upload a tax form
   * @param formType - Type of tax form
   * @param year - Tax year
   * @param file - File to upload
   */
  async uploadTaxForm(
    formType: TaxFormType,
    year: number,
    file: File
  ): Promise<OperationResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', formType);
      formData.append('year', year.toString());

      const response = await apiClient.post<ApiResponse<{ form: TaxForm }>>(
        `${this.basePath}/tax-forms`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (!response.data.success) {
        return {
          success: false,
          message: response.data.message || 'Failed to upload tax form',
        };
      }

      return { success: true, message: 'Tax form uploaded successfully' };
    } catch (error) {
      console.error('Failed to upload tax form:', error);
      return {
        success: false,
        message: 'Failed to upload tax form. Please try again.',
      };
    }
  }

  /**
   * Download a tax form
   * @param formId - Tax form ID
   */
  async downloadTaxForm(formId: string): Promise<string | null> {
    try {
      const response = await apiClient.get<ApiResponse<{ url: string }>>(
        `${this.basePath}/tax-forms/${formId}/download`
      );

      if (!response.data.success || !response.data.data?.url) {
        return null;
      }

      return response.data.data.url;
    } catch (error) {
      console.error('Failed to download tax form:', error);
      return null;
    }
  }

  // ==========================================================================
  // Notification Preferences Methods
  // ==========================================================================

  /**
   * Get notification preferences
   */
  async getNotificationPreferences(): Promise<PayoutNotificationPreferences | null> {
    try {
      const response = await apiClient.get<
        ApiResponse<{ preferences: PayoutNotificationPreferences }>
      >(`${this.basePath}/settings/notifications`);

      if (!response.data.success || !response.data.data?.preferences) {
        return null;
      }

      return response.data.data.preferences;
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error);
      return null;
    }
  }

  /**
   * Update notification preferences
   * @param preferences - New notification preferences
   */
  async updateNotificationPreferences(
    preferences: PayoutNotificationPreferences
  ): Promise<OperationResult> {
    try {
      const response = await apiClient.put<
        ApiResponse<{ preferences: PayoutNotificationPreferences }>
      >(`${this.basePath}/settings/notifications`, preferences);

      if (!response.data.success) {
        return {
          success: false,
          message: response.data.message || 'Failed to update notification preferences',
        };
      }

      return {
        success: true,
        message: 'Notification preferences updated successfully',
      };
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      return {
        success: false,
        message: 'Failed to update notification preferences. Please try again.',
      };
    }
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
