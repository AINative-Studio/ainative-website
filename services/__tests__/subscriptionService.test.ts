/**
 * Subscription Service Tests
 * Comprehensive tests for subscription management operations
 */

import apiClient from '@/lib/api-client';

// Mock apiClient
jest.mock('@/lib/api-client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

import type { SubscriptionService as SubscriptionServiceType } from '../subscriptionService';

describe('SubscriptionService', () => {
  let subscriptionService: SubscriptionServiceType;

  const mockPlan = {
    id: 'plan-pro',
    name: 'Pro Plan',
    description: 'Professional tier',
    price: 4999,
    currency: 'USD',
    interval: 'month' as const,
    interval_count: 1,
    features: ['Feature 1', 'Feature 2'],
    is_popular: true,
    is_active: true,
  };

  const mockSubscription = {
    id: 'sub-123',
    status: 'active' as const,
    current_period_start: '2025-01-01T00:00:00Z',
    current_period_end: '2025-02-01T00:00:00Z',
    cancel_at_period_end: false,
    canceled_at: null,
    ended_at: null,
    trial_start: null,
    trial_end: null,
    plan: mockPlan,
    auto_renew: true,
    quantity: 1,
  };

  const mockInvoice = {
    id: 'inv-123',
    amount_due: 4999,
    amount_paid: 4999,
    currency: 'usd',
    status: 'paid' as const,
    number: 'INV-001',
    pdf_url: 'https://example.com/invoice.pdf',
    hosted_invoice_url: 'https://example.com/view',
    created: 1704067200,
    period_start: 1704067200,
    period_end: 1706745600,
    lines: [],
  };

  const mockPaymentMethod = {
    id: 'pm-123',
    type: 'card' as const,
    card: {
      brand: 'visa',
      last4: '4242',
      exp_month: 12,
      exp_year: 2026,
      country: 'US',
    },
    billing_details: {
      email: 'test@example.com',
      name: 'Test User',
    },
    created: 1704067200,
    is_default: true,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const { SubscriptionService } = await import('../subscriptionService');
    subscriptionService = new SubscriptionService();
  });

  describe('getCurrentSubscription()', () => {
    it('should fetch current subscription successfully', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { subscription: mockSubscription },
        },
      });

      const result = await subscriptionService.getCurrentSubscription();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/v1/subscription');
      expect(result).toEqual(mockSubscription);
    });

    it('should throw error when no subscription found', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: false,
          message: 'No subscription found',
          data: null,
        },
      });

      await expect(subscriptionService.getCurrentSubscription()).rejects.toThrow('No subscription found');
    });
  });

  describe('getAvailablePlans()', () => {
    it('should fetch available plans successfully', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { plans: [mockPlan] },
        },
      });

      const result = await subscriptionService.getAvailablePlans();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/v1/subscription/plans');
      expect(result).toEqual([mockPlan]);
    });

    it('should return empty array when fetch fails', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Network Error'));

      const result = await subscriptionService.getAvailablePlans();

      expect(result).toEqual([]);
    });
  });

  describe('subscribe()', () => {
    it('should subscribe to a plan successfully', async () => {
      mockedApiClient.post.mockResolvedValue({
        data: {
          success: true,
          message: 'Subscribed',
          data: { subscription: mockSubscription },
        },
      });

      const result = await subscriptionService.subscribe('plan-pro', 'pm-123');

      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/v1/subscription/subscribe', {
        plan_id: 'plan-pro',
        payment_method_id: 'pm-123',
      });
      expect(result.success).toBe(true);
    });

    it('should return failure when subscription fails', async () => {
      mockedApiClient.post.mockResolvedValue({
        data: {
          success: false,
          message: 'Payment failed',
          data: null,
        },
      });

      const result = await subscriptionService.subscribe('plan-pro');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Payment failed');
    });
  });

  describe('updateSubscription()', () => {
    it('should update subscription successfully', async () => {
      mockedApiClient.put.mockResolvedValue({
        data: {
          success: true,
          message: 'Updated',
          data: { subscription: mockSubscription },
        },
      });

      const result = await subscriptionService.updateSubscription('plan-enterprise');

      expect(mockedApiClient.put).toHaveBeenCalledWith('/api/v1/subscription/update', {
        plan_id: 'plan-enterprise',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('cancelSubscription()', () => {
    it('should cancel at period end by default', async () => {
      mockedApiClient.post.mockResolvedValue({
        data: {
          success: true,
          message: 'Canceled',
          data: { subscription: { ...mockSubscription, cancel_at_period_end: true } },
        },
      });

      const result = await subscriptionService.cancelSubscription();

      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/v1/subscription/cancel', {
        cancel_at_period_end: true,
      });
      expect(result.success).toBe(true);
      expect(result.message).toContain('end of the billing period');
    });

    it('should cancel immediately when specified', async () => {
      mockedApiClient.post.mockResolvedValue({
        data: {
          success: true,
          message: 'Canceled',
          data: { subscription: mockSubscription },
        },
      });

      const result = await subscriptionService.cancelSubscription(false);

      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/v1/subscription/cancel', {
        cancel_at_period_end: false,
      });
      expect(result.message).toBe('Subscription has been canceled');
    });
  });

  describe('reactivateSubscription()', () => {
    it('should reactivate subscription successfully', async () => {
      mockedApiClient.post.mockResolvedValue({
        data: {
          success: true,
          message: 'Reactivated',
          data: { subscription: mockSubscription },
        },
      });

      const result = await subscriptionService.reactivateSubscription();

      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/v1/subscription/reactivate');
      expect(result.success).toBe(true);
    });
  });

  describe('getInvoices()', () => {
    it('should fetch invoices with default limit', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { invoices: [mockInvoice] },
        },
      });

      const result = await subscriptionService.getInvoices();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/v1/subscription/invoices?limit=10');
      expect(result).toEqual([mockInvoice]);
    });

    it('should fetch invoices with custom limit', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { invoices: [mockInvoice] },
        },
      });

      await subscriptionService.getInvoices(25);

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/v1/subscription/invoices?limit=25');
    });

    it('should return empty array on error', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Error'));

      const result = await subscriptionService.getInvoices();

      expect(result).toEqual([]);
    });
  });

  describe('getPaymentMethods()', () => {
    it('should fetch payment methods successfully', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { payment_methods: [mockPaymentMethod] },
        },
      });

      const result = await subscriptionService.getPaymentMethods();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/v1/subscription/payment-methods');
      expect(result).toEqual([mockPaymentMethod]);
    });
  });

  describe('addPaymentMethod()', () => {
    it('should add payment method successfully', async () => {
      mockedApiClient.post.mockResolvedValue({
        data: {
          success: true,
          message: 'Added',
          data: { payment_method: mockPaymentMethod },
        },
      });

      const result = await subscriptionService.addPaymentMethod('pm-new-123');

      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/v1/subscription/payment-methods', {
        payment_method_id: 'pm-new-123',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('removePaymentMethod()', () => {
    it('should remove payment method successfully', async () => {
      mockedApiClient.delete.mockResolvedValue({
        data: {
          success: true,
          message: 'Removed',
          data: { success: true },
        },
      });

      const result = await subscriptionService.removePaymentMethod('pm-123');

      expect(mockedApiClient.delete).toHaveBeenCalledWith('/api/v1/subscription/payment-methods/pm-123');
      expect(result.success).toBe(true);
    });
  });

  describe('setDefaultPaymentMethod()', () => {
    it('should set default payment method successfully', async () => {
      mockedApiClient.post.mockResolvedValue({
        data: {
          success: true,
          message: 'Updated',
          data: { success: true },
        },
      });

      const result = await subscriptionService.setDefaultPaymentMethod('pm-123');

      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/v1/subscription/default-payment-method', {
        payment_method_id: 'pm-123',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('getUsage()', () => {
    it('should fetch usage data successfully', async () => {
      const mockUsage = {
        used: 500,
        limit: 1000,
        period: { start: '2025-01-01', end: '2025-02-01' },
      };

      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { usage: mockUsage },
        },
      });

      const result = await subscriptionService.getUsage();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/v1/subscription/usage');
      expect(result).toEqual(mockUsage);
    });

    it('should return null on error', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Error'));

      const result = await subscriptionService.getUsage();

      expect(result).toBeNull();
    });
  });

  describe('getCurrentPlan()', () => {
    it('should return current plan info', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { subscription: mockSubscription },
        },
      });

      const result = await subscriptionService.getCurrentPlan();

      expect(result.id).toBe(mockPlan.id);
      expect(result.name).toBe(mockPlan.name);
      expect(result.status).toBe('active');
    });
  });

  describe('hasActiveSubscription()', () => {
    it('should return true for active subscription', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { subscription: mockSubscription },
        },
      });

      const result = await subscriptionService.hasActiveSubscription();

      expect(result).toBe(true);
    });

    it('should return true for trialing subscription', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { subscription: { ...mockSubscription, status: 'trialing' } },
        },
      });

      const result = await subscriptionService.hasActiveSubscription();

      expect(result).toBe(true);
    });

    it('should return false for canceled subscription', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { subscription: { ...mockSubscription, status: 'canceled' } },
        },
      });

      const result = await subscriptionService.hasActiveSubscription();

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Error'));

      const result = await subscriptionService.hasActiveSubscription();

      expect(result).toBe(false);
    });
  });

  describe('Utility Methods', () => {
    describe('getStatusDisplayText()', () => {
      it('should return correct display text for each status', () => {
        expect(subscriptionService.getStatusDisplayText('active')).toBe('Active');
        expect(subscriptionService.getStatusDisplayText('past_due')).toBe('Past Due');
        expect(subscriptionService.getStatusDisplayText('canceled')).toBe('Canceled');
        expect(subscriptionService.getStatusDisplayText('trialing')).toBe('Trial');
        expect(subscriptionService.getStatusDisplayText('active_until_period_end')).toBe('Canceling');
      });

      it('should return raw status for unknown status', () => {
        expect(subscriptionService.getStatusDisplayText('unknown')).toBe('unknown');
      });
    });

    describe('getStatusColorClass()', () => {
      it('should return correct color classes for each status', () => {
        expect(subscriptionService.getStatusColorClass('active')).toContain('green');
        expect(subscriptionService.getStatusColorClass('past_due')).toContain('yellow');
        expect(subscriptionService.getStatusColorClass('canceled')).toContain('gray');
        expect(subscriptionService.getStatusColorClass('unpaid')).toContain('red');
        expect(subscriptionService.getStatusColorClass('trialing')).toContain('blue');
      });
    });
  });

  describe('Singleton Export', () => {
    it('should export a singleton instance', async () => {
      const { subscriptionService } = await import('../subscriptionService');
      expect(subscriptionService).toBeDefined();
      expect(typeof subscriptionService.getCurrentSubscription).toBe('function');
    });
  });
});
