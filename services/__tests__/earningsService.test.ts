/**
 * @jest-environment node
 */

/**
 * Earnings Service Tests
 * Comprehensive test suite for earningsService.ts
 * Updated to verify correct API endpoint paths (Fixes #585)
 */

import { EarningsService, earningsService } from '../earningsService';
import apiClient from '@/lib/api-client';
import type {
  EarningsOverview,
  Transaction,
  PaginatedTransactions,
  TransactionSource,
  TransactionStatus,
} from '../earningsService';

// Mock the API client
jest.mock('@/lib/api-client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('EarningsService', () => {
  let service: EarningsService;

  beforeEach(() => {
    service = new EarningsService();
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ==========================================================================
  // Earnings Overview Tests
  // ==========================================================================

  describe('getEarningsOverview', () => {
    it('should call the correct wallet endpoint', async () => {
      const mockOverview: EarningsOverview = {
        totalEarnings: 10000,
        thisMonth: 1500,
        lastMonth: 1200,
        pendingPayout: 300,
        currency: 'USD',
      };

      mockedApiClient.get.mockResolvedValue({
        data: { success: true, message: 'Success', data: mockOverview },
      });

      await service.getEarningsOverview();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/public/payments/wallets/me');
    });

    it('should handle wrapped {success, data} response format', async () => {
      const mockOverview: EarningsOverview = {
        totalEarnings: 10000,
        thisMonth: 1500,
        lastMonth: 1200,
        pendingPayout: 300,
        currency: 'USD',
      };

      mockedApiClient.get.mockResolvedValue({
        data: { success: true, message: 'Success', data: mockOverview },
      });

      const result = await service.getEarningsOverview();
      expect(result).toEqual(mockOverview);
    });

    it('should handle raw response format', async () => {
      const mockOverview: EarningsOverview = {
        totalEarnings: 5000,
        thisMonth: 800,
        lastMonth: 600,
        pendingPayout: 200,
        currency: 'USD',
      };

      mockedApiClient.get.mockResolvedValue({ data: mockOverview });

      const result = await service.getEarningsOverview();
      expect(result).toEqual(mockOverview);
    });

    it('should return null when wrapped response has no data', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { success: true, message: 'Success', data: null },
      });

      const result = await service.getEarningsOverview();
      expect(result).toBeNull();
    });

    it('should return null on network error', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Network error'));

      const result = await service.getEarningsOverview();
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it('should return null on non-Error exceptions', async () => {
      mockedApiClient.get.mockRejectedValue('String error');

      const result = await service.getEarningsOverview();
      expect(result).toBeNull();
    });
  });

  // ==========================================================================
  // Transactions Tests
  // ==========================================================================

  describe('getTransactions', () => {
    const mockTransaction: Transaction = {
      id: 'txn_123',
      date: '2026-01-01T00:00:00Z',
      description: 'API Usage - Project X',
      source: 'api',
      amount: 150.5,
      status: 'completed',
      currency: 'USD',
    };

    it('should call the correct transactions endpoint', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { success: true, message: 'Success', data: { items: [mockTransaction], total: 1, page: 1, pageSize: 50 } },
      });

      await service.getTransactions();
      expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/public/payments/transactions');
    });

    it('should handle wrapped {success, data} response format', async () => {
      const mockResponse: PaginatedTransactions = {
        items: [mockTransaction], total: 1, page: 1, pageSize: 10,
      };

      mockedApiClient.get.mockResolvedValue({
        data: { success: true, message: 'Success', data: mockResponse },
      });

      const result = await service.getTransactions();
      expect(result).toEqual(mockResponse);
    });

    it('should handle raw response with transactions array', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { transactions: [mockTransaction], total: 1, page: 1, page_size: 50 },
      });

      const result = await service.getTransactions();
      expect(result.items).toEqual([mockTransaction]);
      expect(result.total).toBe(1);
      expect(result.pageSize).toBe(50);
    });

    it('should handle raw response with items array and pageSize', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { items: [mockTransaction], total: 3, page: 2, pageSize: 25 },
      });

      const result = await service.getTransactions();
      expect(result.items).toEqual([mockTransaction]);
      expect(result.total).toBe(3);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(25);
    });

    it('should handle raw response with missing optional fields', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {},
      });

      const result = await service.getTransactions();
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
    });

    it('should build query params with page_size for API compatibility', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { transactions: [], total: 0, page: 2, page_size: 20 },
      });

      await service.getTransactions({ page: 2, pageSize: 20 });

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('page=2')
      );
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('page_size=20')
      );
    });

    it('should include filter parameters in query', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { transactions: [], total: 0, page: 1, page_size: 50 },
      });

      await service.getTransactions({
        source: 'marketplace' as TransactionSource,
        status: 'completed' as TransactionStatus,
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      });

      expect(mockedApiClient.get).toHaveBeenCalledWith(expect.stringContaining('source=marketplace'));
      expect(mockedApiClient.get).toHaveBeenCalledWith(expect.stringContaining('status=completed'));
      expect(mockedApiClient.get).toHaveBeenCalledWith(expect.stringContaining('startDate=2026-01-01'));
      expect(mockedApiClient.get).toHaveBeenCalledWith(expect.stringContaining('endDate=2026-01-31'));
    });

    it('should handle no query params without adding ? to URL', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { success: true, message: 'Success', data: { items: [], total: 0, page: 1, pageSize: 50 } },
      });

      await service.getTransactions({});
      expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/public/payments/transactions');
    });

    it('should return default when non-Error exception thrown', async () => {
      mockedApiClient.get.mockRejectedValue('String error');

      const result = await service.getTransactions();
      expect(result).toEqual({ items: [], total: 0, page: 1, pageSize: 50 });
    });

    it('should return empty paginated result on error', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Network error'));

      const result = await service.getTransactions();
      expect(result).toEqual({ items: [], total: 0, page: 1, pageSize: 50 });
    });

    it('should return default when wrapped response has no data', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { success: false, message: 'Error', data: null },
      });

      const result = await service.getTransactions();
      expect(result).toEqual({ items: [], total: 0, page: 1, pageSize: 50 });
    });
  });

  // ==========================================================================
  // Earnings Breakdown Tests
  // ==========================================================================

  describe('getEarningsBreakdown', () => {
    it('should return null (no backend endpoint exists)', async () => {
      const result = await service.getEarningsBreakdown();
      expect(result).toBeNull();
    });

    it('should not make any API calls', async () => {
      await service.getEarningsBreakdown();
      expect(mockedApiClient.get).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Payout Schedule Tests
  // ==========================================================================

  describe('getPayoutSchedule', () => {
    it('should return null (no backend endpoint exists)', async () => {
      const result = await service.getPayoutSchedule();
      expect(result).toBeNull();
    });

    it('should not make any API calls', async () => {
      await service.getPayoutSchedule();
      expect(mockedApiClient.get).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Export Transactions Tests (skipped in node env — requires DOM)
  // ==========================================================================

  describe('exportTransactions', () => {
    const mockLink = { href: '', download: '', click: jest.fn() };
    const mockCreateObjectURL = jest.fn().mockReturnValue('blob:mock-url');
    const mockRevokeObjectURL = jest.fn();
    const mockAppendChild = jest.fn();
    const mockRemoveChild = jest.fn();

    beforeEach(() => {
      mockLink.href = '';
      mockLink.download = '';
      mockLink.click = jest.fn();
      mockCreateObjectURL.mockClear();
      mockRevokeObjectURL.mockClear();
      mockAppendChild.mockClear();
      mockRemoveChild.mockClear();

      // Mock window and document (don't exist in node env)
      (global as Record<string, unknown>).window = {
        URL: {
          createObjectURL: mockCreateObjectURL,
          revokeObjectURL: mockRevokeObjectURL,
        },
      };
      (global as Record<string, unknown>).document = {
        createElement: jest.fn().mockReturnValue(mockLink),
        body: {
          appendChild: mockAppendChild,
          removeChild: mockRemoveChild,
        },
      };
    });

    afterEach(() => {
      delete (global as Record<string, unknown>).window;
      delete (global as Record<string, unknown>).document;
    });

    it('should call the correct export endpoint path', async () => {
      mockedApiClient.get.mockResolvedValue({ data: 'csv-data' });

      await service.exportTransactions('csv');

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/v1/public/payments/transactions/export'),
        expect.objectContaining({ responseType: 'blob' })
      );
    });

    it('should succeed and trigger download for csv format', async () => {
      mockedApiClient.get.mockResolvedValue({ data: 'csv-data' });

      const result = await service.exportTransactions('csv');

      expect(result).toBe(true);
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.download).toBe('earnings-transactions.csv');
    });

    it('should set correct download filename for pdf format', async () => {
      mockedApiClient.get.mockResolvedValue({ data: 'pdf-data' });

      await service.exportTransactions('pdf');

      expect(mockLink.download).toBe('earnings-transactions.pdf');
    });

    it('should set correct download filename for json format', async () => {
      mockedApiClient.get.mockResolvedValue({ data: 'json-data' });

      await service.exportTransactions('json');

      expect(mockLink.download).toBe('earnings-transactions.json');
    });

    it('should handle full download lifecycle', async () => {
      mockedApiClient.get.mockResolvedValue({ data: 'data' });

      await service.exportTransactions('csv');

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should include format parameter in URL', async () => {
      mockedApiClient.get.mockResolvedValue({ data: 'data' });

      await service.exportTransactions('pdf');

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('format=pdf'),
        expect.anything()
      );
    });

    it('should include filter params in export URL', async () => {
      mockedApiClient.get.mockResolvedValue({ data: 'data' });

      await service.exportTransactions('json', {
        source: 'api' as TransactionSource,
        status: 'completed' as TransactionStatus,
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      });

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('source=api'),
        expect.anything()
      );
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('status=completed'),
        expect.anything()
      );
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('startDate=2026-01-01'),
        expect.anything()
      );
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('endDate=2026-01-31'),
        expect.anything()
      );
    });

    it('should throw error on export failure', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Export failed'));

      await expect(service.exportTransactions('csv')).rejects.toThrow('Export failed');
    });

    it('should throw with default message on non-Error exception', async () => {
      mockedApiClient.get.mockRejectedValue('String error');

      await expect(service.exportTransactions('csv')).rejects.toThrow('Failed to export transactions');
    });
  });

  // ==========================================================================
  // Utility Methods Tests
  // ==========================================================================

  describe('getSourceDisplayText', () => {
    it('should return correct display text for API source', () => {
      expect(service.getSourceDisplayText('api')).toBe('API Usage');
    });
    it('should return correct display text for marketplace source', () => {
      expect(service.getSourceDisplayText('marketplace')).toBe('Marketplace');
    });
    it('should return correct display text for referral source', () => {
      expect(service.getSourceDisplayText('referral')).toBe('Referral');
    });
  });

  describe('getStatusDisplayText', () => {
    it('should return correct display text for completed', () => {
      expect(service.getStatusDisplayText('completed')).toBe('Completed');
    });
    it('should return correct display text for pending', () => {
      expect(service.getStatusDisplayText('pending')).toBe('Pending');
    });
    it('should return correct display text for failed', () => {
      expect(service.getStatusDisplayText('failed')).toBe('Failed');
    });
    it('should return correct display text for cancelled', () => {
      expect(service.getStatusDisplayText('cancelled')).toBe('Cancelled');
    });
  });

  describe('getStatusColorClass', () => {
    it('should return green for completed', () => {
      expect(service.getStatusColorClass('completed')).toBe('text-green-600 bg-green-50');
    });
    it('should return yellow for pending', () => {
      expect(service.getStatusColorClass('pending')).toBe('text-yellow-600 bg-yellow-50');
    });
    it('should return red for failed', () => {
      expect(service.getStatusColorClass('failed')).toBe('text-red-600 bg-red-50');
    });
    it('should return gray for cancelled', () => {
      expect(service.getStatusColorClass('cancelled')).toBe('text-gray-600 bg-gray-50');
    });
  });

  describe('formatCurrency', () => {
    it('should format USD currency correctly', () => {
      expect(service.formatCurrency(1234.56)).toBe('$1,234.56');
    });
    it('should format zero correctly', () => {
      expect(service.formatCurrency(0)).toBe('$0.00');
    });
    it('should handle different currencies', () => {
      expect(service.formatCurrency(100, 'EUR')).toContain('100');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const result = service.formatDate('2026-01-15T12:00:00Z');
      expect(result).toContain('2026');
      expect(result).toContain('Jan');
    });
  });

  describe('calculateGrowthPercentage', () => {
    it('should calculate positive growth', () => {
      expect(service.calculateGrowthPercentage(150, 100)).toBe(50);
    });
    it('should calculate negative growth', () => {
      expect(service.calculateGrowthPercentage(80, 100)).toBe(-20);
    });
    it('should handle zero previous with positive current', () => {
      expect(service.calculateGrowthPercentage(100, 0)).toBe(100);
    });
    it('should handle zero previous with zero current', () => {
      expect(service.calculateGrowthPercentage(0, 0)).toBe(0);
    });
  });

  describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(service.calculatePercentage(25, 100)).toBe(25);
    });
    it('should handle zero total', () => {
      expect(service.calculatePercentage(50, 0)).toBe(0);
    });
    it('should handle decimal results', () => {
      expect(service.calculatePercentage(1, 3)).toBeCloseTo(33.33, 1);
    });
  });

  // ==========================================================================
  // Singleton Instance Tests
  // ==========================================================================

  describe('Singleton Instance', () => {
    it('should export a singleton instance', () => {
      expect(earningsService).toBeInstanceOf(EarningsService);
    });
    it('should be the same instance', () => {
      expect(earningsService).toBe(earningsService);
    });
  });
});
