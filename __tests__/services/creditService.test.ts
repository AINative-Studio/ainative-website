/**
 * Credit Service Unit Tests
 * Tests for creditService with proper backend response format
 * Refs #607
 */

import { creditService, CreditBalance, CreditTransaction, CreditPackage } from '@/services/creditService';
import apiClient from '@/lib/api-client';

// Mock the API client
jest.mock('@/lib/api-client');

describe('CreditService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getCreditBalance', () => {
    it('should fetch and return credit balance successfully', async () => {
      const mockBalance: CreditBalance = {
        total_credits: 5000,
        used_credits: 1250,
        remaining_credits: 3750,
        plan: 'pro',
        period_start: '2025-01-01T00:00:00Z',
        period_end: '2025-02-01T00:00:00Z',
        usage_percentage: 25
      };

      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockBalance,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });

      const result = await creditService.getCreditBalance();

      expect(apiClient.get).toHaveBeenCalledWith('/v1/public/credits/balance');
      expect(result).toEqual(mockBalance);
    });

    it('should throw error when no data received', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: null,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });

      await expect(creditService.getCreditBalance()).rejects.toThrow(
        'No credit balance data received from server'
      );
    });

    it('should throw error when response has invalid format', async () => {
      const invalidBalance = {
        total_credits: 'invalid', // Should be number
        used_credits: 1250,
        remaining_credits: 3750
      };

      (apiClient.get as jest.Mock).mockResolvedValue({
        data: invalidBalance,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });

      await expect(creditService.getCreditBalance()).rejects.toThrow(
        'Invalid credit balance format received from server'
      );
    });

    it('should throw error when API call fails', async () => {
      const mockError = new Error('Network error');
      (apiClient.get as jest.Mock).mockRejectedValue(mockError);

      await expect(creditService.getCreditBalance()).rejects.toThrow(
        'Failed to fetch credit balance: Network error'
      );
    });

    it('should validate all required numeric fields', async () => {
      const invalidBalance = {
        total_credits: 5000,
        used_credits: 'not a number', // Invalid
        remaining_credits: 3750,
        plan: 'pro',
        period_start: '2025-01-01T00:00:00Z',
        period_end: null,
        usage_percentage: 25
      };

      (apiClient.get as jest.Mock).mockResolvedValue({
        data: invalidBalance,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });

      await expect(creditService.getCreditBalance()).rejects.toThrow(
        'Invalid credit balance format received from server'
      );
    });
  });

  describe('getCredits (deprecated)', () => {
    it('should call getCreditBalance and return the result', async () => {
      const mockBalance: CreditBalance = {
        total_credits: 1000,
        used_credits: 500,
        remaining_credits: 500,
        plan: 'basic',
        period_start: '2025-01-01T00:00:00Z',
        period_end: null,
        usage_percentage: 50
      };

      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockBalance,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });

      const result = await creditService.getCredits();

      expect(result).toEqual(mockBalance);
    });

    it('should throw error when getCreditBalance returns null', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: null,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });

      await expect(creditService.getCredits()).rejects.toThrow(
        'No credit balance data received from server'
      );
    });
  });

  describe('getTransactionHistory', () => {
    it('should fetch transaction history with pagination', async () => {
      const mockTransactions: CreditTransaction[] = [
        {
          id: 'tx-1',
          amount: -100,
          description: 'API usage',
          type: 'usage',
          created_at: '2025-01-15T10:00:00Z',
          balance_after: 900
        },
        {
          id: 'tx-2',
          amount: 1000,
          description: 'Credit purchase',
          type: 'purchase',
          created_at: '2025-01-01T00:00:00Z',
          balance_after: 1000
        }
      ];

      const mockResponse = {
        success: true,
        data: {
          transactions: mockTransactions,
          total: 2
        }
      };

      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });

      const result = await creditService.getTransactionHistory({
        page: 1,
        limit: 10
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/v1/public/credits/transactions?page=1&limit=10'
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle transaction history fetch error', async () => {
      (apiClient.get as jest.Mock).mockRejectedValue(new Error('API error'));

      const result = await creditService.getTransactionHistory();

      expect(result).toBeNull();
    });

    it('should build query string correctly with all params', async () => {
      const mockResponse = {
        success: true,
        data: {
          transactions: [],
          total: 0
        }
      };

      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });

      await creditService.getTransactionHistory({
        page: 2,
        limit: 20,
        type: 'purchase',
        start_date: '2025-01-01',
        end_date: '2025-01-31'
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/v1/public/credits/transactions?page=2&limit=20&type=purchase&start_date=2025-01-01&end_date=2025-01-31'
      );
    });
  });

  describe('getCreditPackages', () => {
    it('should fetch available credit packages', async () => {
      const mockPackages: CreditPackage[] = [
        {
          id: 'pkg-1',
          name: 'Starter Pack',
          description: '1000 credits',
          credits: 1000,
          price: 10,
          currency: 'USD',
          is_popular: false
        },
        {
          id: 'pkg-2',
          name: 'Pro Pack',
          description: '5000 credits',
          credits: 5000,
          price: 40,
          currency: 'USD',
          is_popular: true,
          bonus_credits: 500
        }
      ];

      const mockResponse = {
        success: true,
        data: {
          packages: mockPackages
        }
      };

      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });

      const result = await creditService.getCreditPackages();

      expect(apiClient.get).toHaveBeenCalledWith('/v1/public/credits/packages');
      expect(result).toEqual(mockPackages);
    });

    it('should throw error when packages fetch fails', async () => {
      (apiClient.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(creditService.getCreditPackages()).rejects.toThrow();
    });
  });

  describe('purchaseCredits', () => {
    it('should successfully purchase credits', async () => {
      const mockResponse = {
        success: true,
        data: {
          transaction_id: 'txn-123'
        }
      };

      (apiClient.post as jest.Mock).mockResolvedValue({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });

      const result = await creditService.purchaseCredits('pkg-1', 'pm_123');

      expect(apiClient.post).toHaveBeenCalledWith('/v1/public/credits/purchase', {
        package_id: 'pkg-1',
        payment_method_id: 'pm_123'
      });
      expect(result.success).toBe(true);
      expect(result.transactionId).toBe('txn-123');
    });

    it('should handle purchase failure', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue(new Error('Payment failed'));

      const result = await creditService.purchaseCredits('pkg-1');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Payment failed');
    });
  });

  describe('calculateUsagePercentage', () => {
    it('should calculate usage percentage correctly', () => {
      const balance: CreditBalance = {
        total_credits: 1000,
        used_credits: 250,
        remaining_credits: 750,
        plan: 'basic',
        period_start: '2025-01-01T00:00:00Z',
        period_end: null,
        usage_percentage: 25
      };

      const percentage = creditService.calculateUsagePercentage(balance);
      expect(percentage).toBe(25);
    });

    it('should return 0 when total credits is 0', () => {
      const balance: CreditBalance = {
        total_credits: 0,
        used_credits: 0,
        remaining_credits: 0,
        plan: 'free',
        period_start: '2025-01-01T00:00:00Z',
        period_end: null,
        usage_percentage: 0
      };

      const percentage = creditService.calculateUsagePercentage(balance);
      expect(percentage).toBe(0);
    });

    it('should round percentage to nearest integer', () => {
      const balance: CreditBalance = {
        total_credits: 1000,
        used_credits: 333,
        remaining_credits: 667,
        plan: 'pro',
        period_start: '2025-01-01T00:00:00Z',
        period_end: null,
        usage_percentage: 33
      };

      const percentage = creditService.calculateUsagePercentage(balance);
      expect(percentage).toBe(33); // 33.3 rounded down
    });
  });

  describe('formatCreditAmount', () => {
    it('should format credit amount with commas', () => {
      const formatted = creditService.formatCreditAmount(1000);
      expect(formatted).toBe('1,000');
    });

    it('should format large numbers correctly', () => {
      const formatted = creditService.formatCreditAmount(1000000);
      expect(formatted).toBe('1,000,000');
    });

    it('should handle zero', () => {
      const formatted = creditService.formatCreditAmount(0);
      expect(formatted).toBe('0');
    });

    it('should not show decimal places', () => {
      const formatted = creditService.formatCreditAmount(1234.56);
      expect(formatted).toBe('1,235'); // Rounded
    });
  });

  describe('getTransactionTypeDisplay', () => {
    it('should return correct display text for each type', () => {
      expect(creditService.getTransactionTypeDisplay('purchase')).toBe('Purchase');
      expect(creditService.getTransactionTypeDisplay('usage')).toBe('Usage');
      expect(creditService.getTransactionTypeDisplay('refund')).toBe('Refund');
      expect(creditService.getTransactionTypeDisplay('adjustment')).toBe('Adjustment');
      expect(creditService.getTransactionTypeDisplay('expiration')).toBe('Expiration');
    });
  });

  describe('getTransactionTypeColorClass', () => {
    it('should return correct color classes for each type', () => {
      expect(creditService.getTransactionTypeColorClass('purchase')).toBe('text-green-600 bg-green-50');
      expect(creditService.getTransactionTypeColorClass('usage')).toBe('text-blue-600 bg-blue-50');
      expect(creditService.getTransactionTypeColorClass('refund')).toBe('text-purple-600 bg-purple-50');
      expect(creditService.getTransactionTypeColorClass('adjustment')).toBe('text-yellow-600 bg-yellow-50');
      expect(creditService.getTransactionTypeColorClass('expiration')).toBe('text-red-600 bg-red-50');
    });
  });
});
