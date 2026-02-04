/**
 * Subscription Service
 * Handles subscription management, billing, and payment methods
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
 * Subscription plan definition
 */
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  interval_count: number;
  features: string[];
  is_popular?: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  metadata?: {
    recommended?: boolean;
    most_popular?: boolean;
    annual_discount?: number;
  };
}

/**
 * User subscription details
 */
export interface Subscription {
  id: string;
  status:
    | 'active'
    | 'past_due'
    | 'canceled'
    | 'unpaid'
    | 'incomplete'
    | 'incomplete_expired'
    | 'trialing'
    | 'active_until_period_end';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  ended_at: string | null;
  trial_start: string | null;
  trial_end: string | null;
  plan: SubscriptionPlan;
  auto_renew: boolean;
  payment_method_id?: string;
  next_payment_date?: string;
  billing_cycle_anchor?: string;
  quantity: number;
  metadata?: Record<string, string | number | boolean | null>;
}

/**
 * Subscription invoice from Stripe
 */
export interface SubscriptionInvoice {
  id: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
  number: string;
  pdf_url: string;
  hosted_invoice_url: string;
  created: number;
  period_start: number;
  period_end: number;
  lines: {
    amount: number;
    currency: string;
    description: string;
    period: {
      start: number;
      end: number;
    };
    plan: {
      id: string;
      name: string;
    };
  }[];
}

/**
 * Usage data for the current billing period
 */
export interface UsageData {
  used: number;
  limit: number;
  period: {
    start: string;
    end: string;
  };
}

/**
 * Payment method details
 */
export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'paypal' | 'other';
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
    country: string;
  };
  billing_details: {
    email?: string;
    name?: string;
    phone?: string;
    address?: {
      city?: string;
      country?: string;
      line1?: string;
      line2?: string;
      postal_code?: string;
      state?: string;
    };
  };
  created: number;
  is_default: boolean;
}

/**
 * Standard operation result
 */
export interface OperationResult {
  success: boolean;
  message: string;
}

/**
 * Current plan details for UI display
 */
export interface CurrentPlanInfo {
  id: string;
  name: string;
  price: number;
  currency: string;
  status: Subscription['status'];
  current_period_end: string;
  features: string[];
}

/**
 * Subscription Service Class
 * Manages all subscription-related API operations
 */
export class SubscriptionService {
  private readonly basePath = '/v1/subscription';

  /**
   * Get current subscription details
   */
  async getCurrentSubscription(): Promise<Subscription | null> {
    try {
      const response = await apiClient.get<ApiResponse<{ subscription: Subscription }>>(
        this.basePath
      );

      if (!response.data.success || !response.data.data?.subscription) {
        throw new Error(response.data.message || 'No subscription found');
      }

      return response.data.data.subscription;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      throw error;
    }
  }

  /**
   * Get available subscription plans
   */
  async getAvailablePlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await apiClient.get<ApiResponse<{ plans: SubscriptionPlan[] }>>(
        `${this.basePath}/plans`
      );

      if (!response.data.success || !response.data.data?.plans) {
        throw new Error(response.data.message || 'Failed to fetch subscription plans');
      }

      return response.data.data.plans;
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return [];
    }
  }

  /**
   * Subscribe to a plan
   */
  async subscribe(planId: string, paymentMethodId?: string): Promise<OperationResult> {
    try {
      const response = await apiClient.post<ApiResponse<{ subscription: Subscription }>>(
        `${this.basePath}/subscribe`,
        { plan_id: planId, payment_method_id: paymentMethodId }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to subscribe to plan');
      }

      return {
        success: true,
        message: 'Successfully subscribed to the plan'
      };
    } catch (error) {
      console.error('Error subscribing to plan:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to subscribe to plan'
      };
    }
  }

  /**
   * Update subscription plan
   */
  async updateSubscription(planId: string): Promise<OperationResult> {
    try {
      const response = await apiClient.put<ApiResponse<{ subscription: Subscription }>>(
        `${this.basePath}/update`,
        { plan_id: planId }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update subscription');
      }

      return {
        success: true,
        message: 'Subscription updated successfully'
      };
    } catch (error) {
      console.error('Error updating subscription:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update subscription'
      };
    }
  }

  /**
   * Cancel subscription
   * @param cancelAtPeriodEnd - If true, cancels at end of billing period; if false, cancels immediately
   */
  async cancelSubscription(cancelAtPeriodEnd: boolean = true): Promise<OperationResult> {
    try {
      const response = await apiClient.post<ApiResponse<{ subscription: Subscription }>>(
        `${this.basePath}/cancel`,
        { cancel_at_period_end: cancelAtPeriodEnd }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to cancel subscription');
      }

      return {
        success: true,
        message: cancelAtPeriodEnd
          ? 'Subscription will be canceled at the end of the billing period'
          : 'Subscription has been canceled'
      };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to cancel subscription'
      };
    }
  }

  /**
   * Reactivate a canceled subscription
   */
  async reactivateSubscription(): Promise<OperationResult> {
    try {
      const response = await apiClient.post<ApiResponse<{ subscription: Subscription }>>(
        `${this.basePath}/reactivate`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to reactivate subscription');
      }

      return {
        success: true,
        message: 'Subscription has been reactivated'
      };
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to reactivate subscription'
      };
    }
  }

  /**
   * Get subscription invoices
   * @param limit - Maximum number of invoices to return
   */
  async getInvoices(limit: number = 10): Promise<SubscriptionInvoice[]> {
    try {
      const response = await apiClient.get<ApiResponse<{ invoices: SubscriptionInvoice[] }>>(
        `${this.basePath}/invoices?limit=${limit}`
      );

      // Handle non-200 responses gracefully
      if (response.status >= 400) {
        console.warn(`Invoices endpoint returned ${response.status}: ${response.statusText}`);
        return [];
      }

      // Check for successful response structure
      if (!response.data.success) {
        console.warn('Invoices API returned unsuccessful response:', response.data.message);
        return [];
      }

      // Return invoices or empty array if none exist
      return response.data.data?.invoices || [];
    } catch (error) {
      // Network errors, timeout, or other issues - graceful degradation
      if (error instanceof Error) {
        console.warn('Invoices fetch failed (service may be unavailable):', error.message);
      } else {
        console.warn('Invoices fetch failed with unknown error');
      }
      return [];
    }
  }

  /**
   * Get payment methods
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await apiClient.get<ApiResponse<{ payment_methods: PaymentMethod[] }>>(
        `${this.basePath}/payment-methods`
      );

      // Handle non-200 responses gracefully
      if (response.status >= 400) {
        console.warn(`Payment methods endpoint returned ${response.status}: ${response.statusText}`);
        return [];
      }

      // Check for successful response structure
      if (!response.data.success) {
        console.warn('Payment methods API returned unsuccessful response:', response.data.message);
        return [];
      }

      // Return payment methods or empty array if none exist
      return response.data.data?.payment_methods || [];
    } catch (error) {
      // Network errors, timeout, or other issues - graceful degradation
      if (error instanceof Error) {
        console.warn('Payment methods fetch failed (service may be unavailable):', error.message);
      } else {
        console.warn('Payment methods fetch failed with unknown error');
      }
      return [];
    }
  }

  /**
   * Add a payment method
   * @param paymentMethodId - Stripe payment method ID from Elements
   */
  async addPaymentMethod(paymentMethodId: string): Promise<OperationResult> {
    try {
      const response = await apiClient.post<ApiResponse<{ payment_method: PaymentMethod }>>(
        `${this.basePath}/payment-methods`,
        { payment_method_id: paymentMethodId }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to add payment method');
      }

      return {
        success: true,
        message: 'Payment method added successfully'
      };
    } catch (error) {
      console.error('Error adding payment method:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add payment method'
      };
    }
  }

  /**
   * Remove a payment method
   * @param paymentMethodId - Payment method ID to remove
   */
  async removePaymentMethod(paymentMethodId: string): Promise<OperationResult> {
    try {
      const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(
        `${this.basePath}/payment-methods/${paymentMethodId}`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to remove payment method');
      }

      return {
        success: true,
        message: 'Payment method removed successfully'
      };
    } catch (error) {
      console.error('Error removing payment method:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to remove payment method'
      };
    }
  }

  /**
   * Set default payment method
   * @param paymentMethodId - Payment method ID to set as default
   */
  async setDefaultPaymentMethod(paymentMethodId: string): Promise<OperationResult> {
    try {
      const response = await apiClient.post<ApiResponse<{ success: boolean }>>(
        `${this.basePath}/default-payment-method`,
        { payment_method_id: paymentMethodId }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to set default payment method');
      }

      return {
        success: true,
        message: 'Default payment method updated successfully'
      };
    } catch (error) {
      console.error('Error setting default payment method:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to set default payment method'
      };
    }
  }

  /**
   * Get usage data for the current billing period
   */
  async getUsage(): Promise<UsageData | null> {
    try {
      const response = await apiClient.get<ApiResponse<{ usage: UsageData }>>(
        `${this.basePath}/usage`
      );

      if (!response.data.success || !response.data.data?.usage) {
        throw new Error(response.data.message || 'Failed to fetch usage data');
      }

      return response.data.data.usage;
    } catch (error) {
      console.error('Error fetching usage data:', error);
      return null;
    }
  }

  /**
   * Get current plan details in a format suitable for the UI
   */
  async getCurrentPlan(): Promise<CurrentPlanInfo> {
    try {
      const subscription = await this.getCurrentSubscription();

      if (!subscription) {
        throw new Error('No subscription found');
      }

      return {
        id: subscription.plan.id,
        name: subscription.plan.name,
        price: subscription.plan.price,
        currency: subscription.plan.currency,
        status: subscription.status,
        current_period_end: subscription.current_period_end,
        features: subscription.plan.features || []
      };
    } catch (error) {
      console.error('Error getting current plan:', error);
      throw error;
    }
  }

  /**
   * Check if the user has an active subscription
   */
  async hasActiveSubscription(): Promise<boolean> {
    try {
      const subscription = await this.getCurrentSubscription();

      if (!subscription) {
        return false;
      }

      const activeStatuses: Subscription['status'][] = [
        'active',
        'trialing',
        'active_until_period_end'
      ];

      return activeStatuses.includes(subscription.status);
    } catch {
      return false;
    }
  }

  /**
   * Get subscription status display text
   */
  getStatusDisplayText(status: Subscription['status']): string {
    const statusMap: Record<Subscription['status'], string> = {
      active: 'Active',
      past_due: 'Past Due',
      canceled: 'Canceled',
      unpaid: 'Unpaid',
      incomplete: 'Incomplete',
      incomplete_expired: 'Expired',
      trialing: 'Trial',
      active_until_period_end: 'Canceling'
    };

    return statusMap[status] || status;
  }

  /**
   * Get subscription status color class for UI
   */
  getStatusColorClass(status: Subscription['status']): string {
    const colorMap: Record<Subscription['status'], string> = {
      active: 'text-green-600 bg-green-50',
      past_due: 'text-yellow-600 bg-yellow-50',
      canceled: 'text-gray-600 bg-gray-50',
      unpaid: 'text-red-600 bg-red-50',
      incomplete: 'text-orange-600 bg-orange-50',
      incomplete_expired: 'text-red-600 bg-red-50',
      trialing: 'text-blue-600 bg-blue-50',
      active_until_period_end: 'text-yellow-600 bg-yellow-50'
    };

    return colorMap[status] || 'text-gray-600 bg-gray-50';
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();
