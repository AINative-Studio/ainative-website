/**
 * Credit Service Tests
 * Comprehensive tests for credit balance, transactions, and purchases
 */

import apiClient from '@/lib/api-client';

// Mock apiClient
jest.mock('@/lib/api-client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

import type { CreditService as CreditServiceType } from '../creditService';

describe('CreditService', () => {
  let creditService: CreditServiceType;

  const mockCreditBalance = {
    available: 6500,
    used: 3500,
    total: 10000,
    currency: 'USD',
    next_reset_date: '2025-02-01T00:00:00Z',
  };

  const mockCreditTransaction = {
    id: 'txn-123',
    amount: 1000,
    description: 'Credit purchase',
    type: 'purchase' as const,
    created_at: '2025-01-15T12:00:00Z',
    balance_after: 7500,
    metadata: {
      invoice_id: 'inv-123',
    },
  };

  const mockCreditPackage = {
    id: 'pkg-starter',
    name: 'Starter Pack',
    description: '1,000 credits',
    credits: 1000,
    price: 999,
    currency: 'USD',
    is_popular: false,
    bonus_credits: 0,
    features: ['Basic support'],
  };

  const mockCreditBalanceResponse = {
    base_used: 500,
    base_quota: 1000,
    add_on_used: 100,
    add_on_quota: 500,
    next_refresh: '2025-02-01T00:00:00Z',
    period_start: '2025-01-01T00:00:00Z',
  };

  const mockAutoRefillConfig = {
    enabled: true,
    threshold: 100,
    amount: 500,
    payment_method_id: 'pm-123',
    next_refill_date: '2025-01-20T00:00:00Z',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const { CreditService } = await import('../creditService');
    creditService = new CreditService();
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

      const result = await creditService.getCreditBalance();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/v1/credits/balance');
      expect(result).toEqual(mockCreditBalance);
    });

    it('should return null when fetch fails', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Network Error'));

      const result = await creditService.getCreditBalance();

      expect(result).toBeNull();
    });

    it('should return null when API returns unsuccessful', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: false,
          message: 'Error',
          data: null,
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await creditService.getCreditBalance();

      expect(result).toBeNull();
    });
  });

  describe('getTransactionHistory()', () => {
    it('should fetch transaction history without params', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { transactions: [mockCreditTransaction], total: 1 },
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await creditService.getTransactionHistory();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/v1/credits/transactions');
      expect(result?.transactions).toEqual([mockCreditTransaction]);
      expect(result?.total).toBe(1);
    });

    it('should fetch transaction history with pagination params', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { transactions: [mockCreditTransaction], total: 50 },
        },
        status: 200,
        statusText: 'OK',
      });

      await creditService.getTransactionHistory({ page: 2, limit: 10 });

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('page=2')
      );
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('limit=10')
      );
    });

    it('should fetch transaction history with type filter', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { transactions: [], total: 0 },
        },
        status: 200,
        statusText: 'OK',
      });

      await creditService.getTransactionHistory({ type: 'purchase' });

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('type=purchase')
      );
    });

    it('should fetch transaction history with date range', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { transactions: [], total: 0 },
        },
        status: 200,
        statusText: 'OK',
      });

      await creditService.getTransactionHistory({
        start_date: '2025-01-01',
        end_date: '2025-01-31',
      });

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('start_date=2025-01-01')
      );
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('end_date=2025-01-31')
      );
    });

    it('should return null on error', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Error'));

      const result = await creditService.getTransactionHistory();

      expect(result).toBeNull();
    });
  });

  describe('getCreditPackages()', () => {
    it('should fetch credit packages successfully', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { packages: [mockCreditPackage] },
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await creditService.getCreditPackages();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/v1/credits/packages');
      expect(result).toEqual([mockCreditPackage]);
    });

    it('should throw error when fetch fails', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: false,
          message: 'Packages unavailable',
          data: null,
        },
        status: 200,
        statusText: 'OK',
      });

      await expect(creditService.getCreditPackages()).rejects.toThrow('Packages unavailable');
    });

    it('should handle network errors', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Network Error'));

      await expect(creditService.getCreditPackages()).rejects.toThrow('Network Error');
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

      const result = await creditService.purchaseCredits('pkg-starter', 'pm-123');

      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/v1/credits/purchase', {
        package_id: 'pkg-starter',
        payment_method_id: 'pm-123',
      });
      expect(result.success).toBe(true);
      expect(result.transactionId).toBe('txn-new');
    });

    it('should purchase credits without payment method', async () => {
      mockedApiClient.post.mockResolvedValue({
        data: {
          success: true,
          message: 'Purchased',
          data: { transaction_id: 'txn-new' },
        },
        status: 200,
        statusText: 'OK',
      });

      await creditService.purchaseCredits('pkg-starter');

      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/v1/credits/purchase', {
        package_id: 'pkg-starter',
        payment_method_id: undefined,
      });
    });

    it('should return failure when purchase fails', async () => {
      mockedApiClient.post.mockResolvedValue({
        data: {
          success: false,
          message: 'Payment declined',
          data: null,
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await creditService.purchaseCredits('pkg-starter');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Payment declined');
    });

    it('should handle errors gracefully', async () => {
      mockedApiClient.post.mockRejectedValue(new Error('Server error'));

      const result = await creditService.purchaseCredits('pkg-starter');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Server error');
    });
  });

  describe('getCredits()', () => {
    it('should fetch credits for dashboard successfully', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: mockCreditBalanceResponse,
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await creditService.getCredits();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/v1/credits');
      expect(result).toEqual(mockCreditBalanceResponse);
    });

    it('should throw error when fetch fails', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: false,
          message: 'Credits unavailable',
          data: null,
        },
        status: 200,
        statusText: 'OK',
      });

      await expect(creditService.getCredits()).rejects.toThrow('Credits unavailable');
    });

    it('should handle 404 errors', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockedApiClient.get.mockRejectedValue({
        response: { status: 404 },
      });

      await expect(creditService.getCredits()).rejects.toBeDefined();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Credits endpoint not found - check API route configuration'
      );
      consoleWarnSpy.mockRestore();
    });

    it('should handle 401 errors', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockedApiClient.get.mockRejectedValue({
        response: { status: 401 },
      });

      await expect(creditService.getCredits()).rejects.toBeDefined();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Authentication failed when fetching credits'
      );
      consoleWarnSpy.mockRestore();
    });

    it('should handle network/CORS errors', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockedApiClient.get.mockRejectedValue(new Error('Network Error'));

      await expect(creditService.getCredits()).rejects.toThrow('Network Error');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'This appears to be a CORS or network connectivity issue'
      );
      consoleWarnSpy.mockRestore();
    });
  });

  describe('setupAutomaticRefill()', () => {
    it('should setup automatic refill successfully', async () => {
      mockedApiClient.post.mockResolvedValue({
        data: {
          success: true,
          message: 'Configured',
          data: { auto_refill: mockAutoRefillConfig },
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await creditService.setupAutomaticRefill({
        enabled: true,
        threshold: 100,
        amount: 500,
        paymentMethodId: 'pm-123',
      });

      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/v1/credits/auto-refill', {
        enabled: true,
        threshold: 100,
        amount: 500,
        paymentMethodId: 'pm-123',
      });
      expect(result.success).toBe(true);
    });

    it('should disable automatic refill', async () => {
      mockedApiClient.post.mockResolvedValue({
        data: {
          success: true,
          message: 'Disabled',
          data: { auto_refill: { enabled: false } },
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await creditService.setupAutomaticRefill({
        enabled: false,
      });

      expect(result.success).toBe(true);
    });

    it('should return failure when setup fails', async () => {
      mockedApiClient.post.mockResolvedValue({
        data: {
          success: false,
          message: 'Invalid configuration',
          data: null,
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await creditService.setupAutomaticRefill({
        enabled: true,
        threshold: -1,
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid configuration');
    });
  });

  describe('getAutoRefillSettings()', () => {
    it('should fetch auto-refill settings successfully', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { auto_refill: mockAutoRefillConfig },
        },
        status: 200,
        statusText: 'OK',
      });

      const result = await creditService.getAutoRefillSettings();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/v1/credits/auto-refill');
      expect(result).toEqual(mockAutoRefillConfig);
    });

    it('should return null on error', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Error'));

      const result = await creditService.getAutoRefillSettings();

      expect(result).toBeNull();
    });
  });

  describe('Utility Methods', () => {
    describe('calculateUsagePercentage()', () => {
      it('should calculate usage percentage correctly', () => {
        expect(creditService.calculateUsagePercentage({ available: 50, used: 50, total: 100, currency: 'USD' })).toBe(50);
        expect(creditService.calculateUsagePercentage({ available: 25, used: 75, total: 100, currency: 'USD' })).toBe(75);
        expect(creditService.calculateUsagePercentage({ available: 100, used: 0, total: 100, currency: 'USD' })).toBe(0);
      });

      it('should return 0 when total is 0', () => {
        expect(creditService.calculateUsagePercentage({ available: 0, used: 0, total: 0, currency: 'USD' })).toBe(0);
      });

      it('should round to nearest integer', () => {
        expect(creditService.calculateUsagePercentage({ available: 67, used: 33, total: 100, currency: 'USD' })).toBe(33);
        expect(creditService.calculateUsagePercentage({ available: 2, used: 1, total: 3, currency: 'USD' })).toBe(33);
      });
    });

    describe('formatCreditAmount()', () => {
      it('should format credit amounts correctly', () => {
        expect(creditService.formatCreditAmount(1000)).toBe('$1,000');
        expect(creditService.formatCreditAmount(999.99)).toBe('$999.99');
        expect(creditService.formatCreditAmount(0)).toBe('$0');
      });

      it('should support different currencies', () => {
        expect(creditService.formatCreditAmount(1000, 'EUR')).toContain('€');
        expect(creditService.formatCreditAmount(1000, 'GBP')).toContain('£');
      });
    });

    describe('getTransactionTypeDisplay()', () => {
      it('should return correct display text for transaction types', () => {
        expect(creditService.getTransactionTypeDisplay('purchase')).toBe('Purchase');
        expect(creditService.getTransactionTypeDisplay('usage')).toBe('Usage');
        expect(creditService.getTransactionTypeDisplay('refund')).toBe('Refund');
        expect(creditService.getTransactionTypeDisplay('adjustment')).toBe('Adjustment');
        expect(creditService.getTransactionTypeDisplay('expiration')).toBe('Expiration');
      });

      it('should return raw type for unknown type', () => {
        // @ts-expect-error Testing with invalid type
        expect(creditService.getTransactionTypeDisplay('unknown')).toBe('unknown');
      });
    });

    describe('getTransactionTypeColorClass()', () => {
      it('should return correct color classes for transaction types', () => {
        expect(creditService.getTransactionTypeColorClass('purchase')).toContain('green');
        expect(creditService.getTransactionTypeColorClass('usage')).toContain('blue');
        expect(creditService.getTransactionTypeColorClass('refund')).toContain('purple');
        expect(creditService.getTransactionTypeColorClass('adjustment')).toContain('yellow');
        expect(creditService.getTransactionTypeColorClass('expiration')).toContain('red');
      });

      it('should return gray for unknown type', () => {
        // @ts-expect-error Testing with invalid type
        expect(creditService.getTransactionTypeColorClass('unknown')).toContain('gray');
      });
    });
  });

  describe('Singleton Export', () => {
    it('should export a singleton instance', async () => {
      const { creditService } = await import('../creditService');
      expect(creditService).toBeDefined();
      expect(typeof creditService.getCreditBalance).toBe('function');
    });
  });
});
