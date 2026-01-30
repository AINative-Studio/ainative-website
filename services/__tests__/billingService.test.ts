/**
 * Billing Service Tests
 * Comprehensive tests for billing, invoices, and payment management
 */

import apiClient from '@/lib/api-client';

// Mock apiClient
jest.mock('@/lib/api-client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

import type { BillingService as BillingServiceType } from '../billingService';

describe('BillingService', () => {
  let billingService: BillingServiceType;

  const mockPaymentMethod = {
    id: 'pm-123',
    type: 'card',
    brand: 'visa',
    last4: '4242',
    exp_month: 12,
    exp_year: 2026,
    is_default: true,
  };

  const mockBillingInfo = {
    payment_methods: [mockPaymentMethod],
    balance: 0,
    credit_balance: 5000,
    next_billing_date: '2025-02-01T00:00:00Z',
    status: 'active' as const,
  };

  const mockInvoice = {
    id: 'inv-123',
    amount: 4999,
    currency: 'USD',
    status: 'paid' as const,
    created_at: '2025-01-01T00:00:00Z',
    paid_at: '2025-01-01T00:01:00Z',
    invoice_pdf: 'https://example.com/invoice.pdf',
    number: 'INV-001',
    description: 'Pro Plan - January 2025',
  };

  const mockSubscription = {
    id: 'sub-123',
    plan_id: 'plan-pro',
    status: 'active' as const,
    current_period_start: '2025-01-01T00:00:00Z',
    current_period_end: '2025-02-01T00:00:00Z',
    cancel_at_period_end: false,
  };

  const mockSubscriptionPlan = {
    id: 'plan-pro',
    name: 'Pro Plan',
    description: 'Professional tier',
    price: 4999,
    currency: 'USD',
    interval: 'month' as const,
    features: ['Feature 1', 'Feature 2'],
    is_active: true,
  };

  const mockCreditBalance = {
    available: 6500,
    used: 3500,
    total: 10000,
    currency: 'USD',
  };

  const mockCreditUsage = {
    period: {
      start: '2025-01-01',
      end: '2025-02-01',
    },
    total_used: 3500,
    breakdown: [
      { date: '2025-01-14', amount: 100, description: 'API calls' },
      { date: '2025-01-15', amount: 150, description: 'API calls' },
    ],
  };

  const mockCreditTransaction = {
    id: 'txn-123',
    amount: 1000,
    description: 'Credit purchase',
    type: 'purchase' as const,
    created_at: '2025-01-15T12:00:00Z',
    balance_after: 7500,
  };

  const mockAutoRefillSettings = {
    enabled: true,
    threshold: 100,
    amount: '50',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const { BillingService } = await import('../billingService');
    billingService = new BillingService();
  });

  describe('getBillingInfo()', () => {
    it('should fetch billing info successfully', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: mockBillingInfo,
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await billingService.getBillingInfo();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/v1/billing/info');
      expect(result).toEqual(mockBillingInfo);
    });

    it('should throw error when fetch fails', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: false,
          message: 'Billing info unavailable',
          data: null,
        },
        status: 200,
        statusText: 'OK',
      });

      await expect(billingService.getBillingInfo()).rejects.toThrow('Billing info unavailable');
    });

    it('should handle network errors', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Network Error'));

      await expect(billingService.getBillingInfo()).rejects.toThrow('Network Error');
    });
  });

  describe('getInvoices()', () => {
    it('should fetch invoices successfully', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { items: [mockInvoice] },
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await billingService.getInvoices();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/v1/billing/invoices');
      expect(result).toEqual([mockInvoice]);
    });

    it('should return empty array when fetch fails', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Error'));

      const result = await billingService.getInvoices();

      expect(result).toEqual([]);
    });

    it('should return empty array when no invoices', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { items: [] },
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await billingService.getInvoices();

      expect(result).toEqual([]);
    });
  });

  describe('getInvoiceById()', () => {
    it('should fetch a specific invoice', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: mockInvoice,
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await billingService.getInvoiceById('inv-123');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/v1/billing/invoices/inv-123');
      expect(result).toEqual(mockInvoice);
    });

    it('should return null when invoice not found', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: false,
          message: 'Not found',
          data: null,
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await billingService.getInvoiceById('invalid');

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Error'));

      const result = await billingService.getInvoiceById('inv-123');

      expect(result).toBeNull();
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
        status: 200,
        statusText: 'OK',
      });

      const result = await billingService.addPaymentMethod('pm_stripe_token');

      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/v1/billing/payment-method', {
        payment_method_id: 'pm_stripe_token',
      });
      expect(result.success).toBe(true);
    });

    it('should return failure when add fails', async () => {
      mockedApiClient.post.mockResolvedValue({
        data: {
          success: false,
          message: 'Card declined',
          data: null,
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await billingService.addPaymentMethod('pm_invalid');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Card declined');
    });

    it('should handle axios errors with response', async () => {
      mockedApiClient.post.mockRejectedValue({
        response: {
          data: {
            message: 'Invalid card number',
          },
        },
      });

      const result = await billingService.addPaymentMethod('pm_invalid');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid card number');
    });
  });

  describe('getSubscription()', () => {
    it('should fetch subscription successfully', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { subscription: mockSubscription },
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await billingService.getSubscription();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/v1/subscription');
      expect(result).toEqual(mockSubscription);
    });

    it('should return null when no subscription', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: false,
          message: 'No subscription',
          data: null,
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await billingService.getSubscription();

      expect(result).toBeNull();
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
        status: 200,
        statusText: 'OK',
      });

      const result = await billingService.updateSubscription({ plan_id: 'plan-enterprise' });

      expect(mockedApiClient.put).toHaveBeenCalledWith('/api/v1/subscription', {
        plan_id: 'plan-enterprise',
      });
      expect(result.success).toBe(true);
    });

    it('should return failure when update fails', async () => {
      mockedApiClient.put.mockResolvedValue({
        data: {
          success: false,
          message: 'Downgrade not allowed',
          data: null,
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await billingService.updateSubscription({ plan_id: 'plan-basic' });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Downgrade not allowed');
    });
  });

  describe('getSubscriptionPlans()', () => {
    it('should fetch subscription plans successfully', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { plans: [mockSubscriptionPlan] },
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await billingService.getSubscriptionPlans();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/v1/subscription/plans');
      expect(result).toEqual([mockSubscriptionPlan]);
    });

    it('should return empty array on error', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Error'));

      const result = await billingService.getSubscriptionPlans();

      expect(result).toEqual([]);
    });
  });

  describe('getCreditBalance()', () => {
    it('should fetch credit balance successfully', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { balance: mockCreditBalance },
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await billingService.getCreditBalance();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/v1/credits');
      expect(result).toEqual(mockCreditBalance);
    });

    it('should return null on error', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Error'));

      const result = await billingService.getCreditBalance();

      expect(result).toBeNull();
    });
  });

  describe('purchaseCredits()', () => {
    it('should purchase credits successfully', async () => {
      mockedApiClient.post.mockResolvedValue({
        data: {
          success: true,
          message: 'Purchased',
          data: { transaction_id: 'txn-new' },
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await billingService.purchaseCredits(5000, 'pm-123');

      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/v1/credits/purchase', {
        amount: 5000,
        payment_method_id: 'pm-123',
      });
      expect(result.success).toBe(true);
    });

    it('should return failure when purchase fails', async () => {
      mockedApiClient.post.mockResolvedValue({
        data: {
          success: false,
          message: 'Insufficient funds',
          data: null,
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await billingService.purchaseCredits(5000);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Insufficient funds');
    });

    it('should handle axios errors', async () => {
      mockedApiClient.post.mockRejectedValue({
        response: {
          data: {
            message: 'Payment failed',
          },
        },
      });

      const result = await billingService.purchaseCredits(5000);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Payment failed');
    });
  });

  describe('getCreditUsage()', () => {
    it('should fetch credit usage successfully', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { usage: mockCreditUsage },
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await billingService.getCreditUsage();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/v1/credits/usage');
      expect(result).toEqual(mockCreditUsage);
    });

    it('should return null on error', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Error'));

      const result = await billingService.getCreditUsage();

      expect(result).toBeNull();
    });
  });

  describe('getCreditTransactions()', () => {
    it('should fetch credit transactions successfully', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { transactions: [mockCreditTransaction] },
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await billingService.getCreditTransactions();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/v1/credits/transactions');
      expect(result).toEqual([mockCreditTransaction]);
    });

    it('should return empty array on error', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Error'));

      const result = await billingService.getCreditTransactions();

      expect(result).toEqual([]);
    });
  });

  describe('getAutoRefillSettings()', () => {
    it('should fetch auto-refill settings successfully', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { auto_refill: mockAutoRefillSettings },
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await billingService.getAutoRefillSettings();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/v1/billing/auto-refill-settings');
      expect(result).toEqual(mockAutoRefillSettings);
    });

    it('should return null on error', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Error'));

      const result = await billingService.getAutoRefillSettings();

      expect(result).toBeNull();
    });
  });

  describe('updateAutoRefillSettings()', () => {
    it('should update auto-refill settings successfully', async () => {
      mockedApiClient.put.mockResolvedValue({
        data: {
          success: true,
          message: 'Updated',
          data: { success: true },
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await billingService.updateAutoRefillSettings({
        enabled: true,
        threshold: 50,
        amount: '100',
      });

      expect(mockedApiClient.put).toHaveBeenCalledWith('/api/v1/billing/auto-refill-settings', {
        enabled: true,
        threshold: 50,
        amount: '100',
      });
      expect(result.success).toBe(true);
    });

    it('should return failure when update fails', async () => {
      mockedApiClient.put.mockResolvedValue({
        data: {
          success: false,
          message: 'Invalid threshold',
          data: null,
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await billingService.updateAutoRefillSettings({
        enabled: true,
        threshold: -1,
        amount: '50',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('Utility Methods', () => {
    describe('getStatusDisplayText()', () => {
      it('should return correct display text for billing status', () => {
        expect(billingService.getStatusDisplayText('active')).toBe('Active');
        expect(billingService.getStatusDisplayText('past_due')).toBe('Past Due');
        expect(billingService.getStatusDisplayText('canceled')).toBe('Canceled');
        expect(billingService.getStatusDisplayText('trialing')).toBe('Trial');
        expect(billingService.getStatusDisplayText('unpaid')).toBe('Unpaid');
      });

      it('should return raw status for unknown status', () => {
        // @ts-expect-error Testing with invalid status
        expect(billingService.getStatusDisplayText('unknown')).toBe('unknown');
      });
    });

    describe('getStatusColorClass()', () => {
      it('should return correct color classes', () => {
        expect(billingService.getStatusColorClass('active')).toContain('green');
        expect(billingService.getStatusColorClass('past_due')).toContain('yellow');
        expect(billingService.getStatusColorClass('canceled')).toContain('gray');
        expect(billingService.getStatusColorClass('unpaid')).toContain('red');
      });
    });

    describe('getInvoiceStatusDisplayText()', () => {
      it('should return correct invoice status text', () => {
        expect(billingService.getInvoiceStatusDisplayText('paid')).toBe('Paid');
        expect(billingService.getInvoiceStatusDisplayText('pending')).toBe('Pending');
        expect(billingService.getInvoiceStatusDisplayText('failed')).toBe('Failed');
        expect(billingService.getInvoiceStatusDisplayText('void')).toBe('Void');
      });
    });

    describe('getInvoiceStatusColorClass()', () => {
      it('should return correct invoice status colors', () => {
        expect(billingService.getInvoiceStatusColorClass('paid')).toContain('green');
        expect(billingService.getInvoiceStatusColorClass('pending')).toContain('yellow');
        expect(billingService.getInvoiceStatusColorClass('failed')).toContain('red');
        expect(billingService.getInvoiceStatusColorClass('void')).toContain('gray');
      });
    });

    describe('formatCurrency()', () => {
      it('should format currency amounts correctly', () => {
        expect(billingService.formatCurrency(4999)).toBe('$49.99');
        expect(billingService.formatCurrency(10000)).toBe('$100.00');
        expect(billingService.formatCurrency(0)).toBe('$0.00');
      });

      it('should support different currencies', () => {
        expect(billingService.formatCurrency(4999, 'EUR')).toContain('€');
        expect(billingService.formatCurrency(4999, 'GBP')).toContain('£');
      });
    });
  });

  describe('Singleton Export', () => {
    it('should export a singleton instance', async () => {
      const { billingService } = await import('../billingService');
      expect(billingService).toBeDefined();
      expect(typeof billingService.getBillingInfo).toBe('function');
    });
  });
});
