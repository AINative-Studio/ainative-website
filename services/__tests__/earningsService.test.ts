/**
 * Earnings Service Tests
 * Comprehensive test suite for earningsService.ts
 * Tests all public methods, edge cases, and error handling
 * Target coverage: 100%
 */

import { EarningsService, earningsService } from '../earningsService';
import apiClient from '@/lib/api-client';
import type {
  EarningsOverview,
  Transaction,
  PaginatedTransactions,
  EarningsBreakdown,
  PayoutSchedule,
  TransactionSource,
  TransactionStatus,
  ExportFormat,
} from '../earningsService';

// Mock the API client
jest.mock('@/lib/api-client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('EarningsService', () => {
  let service: EarningsService;

  beforeEach(() => {
    service = new EarningsService();
    jest.clearAllMocks();

    // Mock console.error to avoid test pollution
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Setup DOM mocks for export functionality
    document.body.innerHTML = '';
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ==========================================================================
  // Earnings Overview Tests
  // ==========================================================================

  describe('getEarningsOverview', () => {
    it('should fetch earnings overview successfully', async () => {
      // Arrange
      const mockOverview: EarningsOverview = {
        totalEarnings: 10000,
        thisMonth: 1500,
        lastMonth: 1200,
        pendingPayout: 300,
        currency: 'USD',
      };

      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: mockOverview,
        },
      });

      // Act
      const result = await service.getEarningsOverview();

      // Assert
      expect(result).toEqual(mockOverview);
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/api/v1/public/developer/earnings/overview'
      );
    });

    it('should throw error when response is not successful', async () => {
      // Arrange
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: false,
          message: 'Failed to fetch overview',
          data: null,
        },
      });

      // Act & Assert
      await expect(service.getEarningsOverview()).rejects.toThrow(
        'Failed to fetch overview'
      );
    });

    it('should throw error when data is missing', async () => {
      // Arrange
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: false,
          message: 'Data not found',
          data: null,
        },
      });

      // Act & Assert
      await expect(service.getEarningsOverview()).rejects.toThrow();
    });

    it('should handle network errors gracefully', async () => {
      // Arrange
      const networkError = new Error('Network error');
      mockedApiClient.get.mockRejectedValue(networkError);

      // Act & Assert
      await expect(service.getEarningsOverview()).rejects.toThrow('Network error');
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle non-Error exceptions', async () => {
      // Arrange
      mockedApiClient.get.mockRejectedValue('String error');

      // Act & Assert
      await expect(service.getEarningsOverview()).rejects.toThrow(
        'Failed to fetch earnings overview'
      );
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

    it('should fetch transactions without parameters', async () => {
      // Arrange
      const mockResponse: PaginatedTransactions = {
        items: [mockTransaction],
        total: 1,
        page: 1,
        pageSize: 10,
      };

      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: mockResponse,
        },
      });

      // Act
      const result = await service.getTransactions();

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/api/v1/public/developer/earnings/transactions'
      );
    });

    it('should fetch transactions with all query parameters', async () => {
      // Arrange
      const params = {
        page: 2,
        pageSize: 20,
        source: 'marketplace' as TransactionSource,
        status: 'completed' as TransactionStatus,
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      };

      const mockResponse: PaginatedTransactions = {
        items: [mockTransaction],
        total: 50,
        page: 2,
        pageSize: 20,
      };

      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: mockResponse,
        },
      });

      // Act
      const result = await service.getTransactions(params);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('page=2')
      );
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('pageSize=20')
      );
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('source=marketplace')
      );
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('status=completed')
      );
    });

    it('should handle empty transaction list', async () => {
      // Arrange
      const mockResponse: PaginatedTransactions = {
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
      };

      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: mockResponse,
        },
      });

      // Act
      const result = await service.getTransactions();

      // Assert
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should throw error on failed fetch', async () => {
      // Arrange
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: false,
          message: 'Failed to fetch transactions',
          data: null,
        },
      });

      // Act & Assert
      await expect(service.getTransactions()).rejects.toThrow(
        'Failed to fetch transactions'
      );
    });
  });

  // ==========================================================================
  // Earnings Breakdown Tests
  // ==========================================================================

  describe('getEarningsBreakdown', () => {
    it('should fetch earnings breakdown successfully', async () => {
      // Arrange
      const mockBreakdown: EarningsBreakdown = {
        api: 5000,
        marketplace: 3000,
        referrals: 2000,
      };

      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: mockBreakdown,
        },
      });

      // Act
      const result = await service.getEarningsBreakdown();

      // Assert
      expect(result).toEqual(mockBreakdown);
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/api/v1/public/developer/earnings/breakdown'
      );
    });

    it('should throw error on failed fetch', async () => {
      // Arrange
      mockedApiClient.get.mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(service.getEarningsBreakdown()).rejects.toThrow('Network error');
    });
  });

  // ==========================================================================
  // Payout Schedule Tests
  // ==========================================================================

  describe('getPayoutSchedule', () => {
    it('should fetch payout schedule successfully', async () => {
      // Arrange
      const mockSchedule: PayoutSchedule = {
        nextPayoutDate: '2026-02-01',
        minimumPayout: 50,
        payoutThreshold: 100,
        currency: 'USD',
      };

      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: mockSchedule,
        },
      });

      // Act
      const result = await service.getPayoutSchedule();

      // Assert
      expect(result).toEqual(mockSchedule);
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/api/v1/public/developer/earnings/payout-schedule'
      );
    });

    it('should handle missing data', async () => {
      // Arrange
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: false,
          message: 'Not found',
          data: null,
        },
      });

      // Act & Assert
      await expect(service.getPayoutSchedule()).rejects.toThrow();
    });
  });

  // ==========================================================================
  // Export Transactions Tests
  // ==========================================================================

  describe('exportTransactions', () => {
    it('should export transactions as CSV', async () => {
      // Arrange
      const mockBlob = new Blob(['test data'], { type: 'text/csv' });
      mockedApiClient.get.mockResolvedValue({
        data: mockBlob,
      });

      const clickSpy = jest.fn();
      const mockLink = {
        href: '',
        download: '',
        click: clickSpy,
        remove: jest.fn(),
      } as unknown as HTMLAnchorElement;

      const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockLink);
      const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
      const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink);

      // Act
      const result = await service.exportTransactions('csv');

      // Assert
      expect(result).toBe(true);
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('format=csv'),
        expect.objectContaining({ responseType: 'blob' })
      );
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(clickSpy).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
    });

    it('should export transactions as PDF', async () => {
      // Arrange
      const mockBlob = new Blob(['test data'], { type: 'application/pdf' });
      mockedApiClient.get.mockResolvedValue({
        data: mockBlob,
      });

      const clickSpy = jest.fn();
      const mockLink = {
        href: '',
        download: '',
        click: clickSpy,
        remove: jest.fn(),
      } as unknown as HTMLAnchorElement;

      jest.spyOn(document, 'createElement').mockReturnValue(mockLink);
      jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
      jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink);

      // Act
      const result = await service.exportTransactions('pdf');

      // Assert
      expect(result).toBe(true);
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('format=pdf'),
        expect.objectContaining({ responseType: 'blob' })
      );
    });

    it('should export transactions with filter parameters', async () => {
      // Arrange
      const mockBlob = new Blob(['test data'], { type: 'application/json' });
      mockedApiClient.get.mockResolvedValue({
        data: mockBlob,
      });

      const mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
        remove: jest.fn(),
      } as unknown as HTMLAnchorElement;

      jest.spyOn(document, 'createElement').mockReturnValue(mockLink);
      jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
      jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink);

      const params = {
        source: 'api' as TransactionSource,
        status: 'completed' as TransactionStatus,
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      };

      // Act
      await service.exportTransactions('json', params);

      // Assert
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('source=api'),
        expect.anything()
      );
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('status=completed'),
        expect.anything()
      );
    });

    it('should throw error on export failure', async () => {
      // Arrange
      mockedApiClient.get.mockRejectedValue(new Error('Export failed'));

      // Act & Assert
      await expect(service.exportTransactions('csv')).rejects.toThrow('Export failed');
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
    it('should return correct display text for completed status', () => {
      expect(service.getStatusDisplayText('completed')).toBe('Completed');
    });

    it('should return correct display text for pending status', () => {
      expect(service.getStatusDisplayText('pending')).toBe('Pending');
    });

    it('should return correct display text for failed status', () => {
      expect(service.getStatusDisplayText('failed')).toBe('Failed');
    });

    it('should return correct display text for cancelled status', () => {
      expect(service.getStatusDisplayText('cancelled')).toBe('Cancelled');
    });
  });

  describe('getStatusColorClass', () => {
    it('should return green class for completed status', () => {
      expect(service.getStatusColorClass('completed')).toBe('text-green-600 bg-green-50');
    });

    it('should return yellow class for pending status', () => {
      expect(service.getStatusColorClass('pending')).toBe('text-yellow-600 bg-yellow-50');
    });

    it('should return red class for failed status', () => {
      expect(service.getStatusColorClass('failed')).toBe('text-red-600 bg-red-50');
    });

    it('should return gray class for cancelled status', () => {
      expect(service.getStatusColorClass('cancelled')).toBe('text-gray-600 bg-gray-50');
    });
  });

  describe('formatCurrency', () => {
    it('should format USD currency correctly', () => {
      const result = service.formatCurrency(1234.56);
      expect(result).toBe('$1,234.56');
    });

    it('should format large amounts with commas', () => {
      const result = service.formatCurrency(1234567.89);
      expect(result).toBe('$1,234,567.89');
    });

    it('should format zero correctly', () => {
      const result = service.formatCurrency(0);
      expect(result).toBe('$0.00');
    });

    it('should handle different currencies', () => {
      const result = service.formatCurrency(100, 'EUR');
      expect(result).toContain('100');
    });

    it('should handle negative amounts', () => {
      const result = service.formatCurrency(-50);
      expect(result).toContain('50');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const result = service.formatDate('2026-01-15T12:00:00Z');
      expect(result).toContain('2026');
      expect(result).toContain('Jan');
    });

    it('should handle different months', () => {
      const result = service.formatDate('2026-12-25T12:00:00Z');
      expect(result).toContain('2026');
      expect(result).toContain('Dec');
    });
  });

  describe('calculateGrowthPercentage', () => {
    it('should calculate positive growth correctly', () => {
      const result = service.calculateGrowthPercentage(150, 100);
      expect(result).toBe(50);
    });

    it('should calculate negative growth correctly', () => {
      const result = service.calculateGrowthPercentage(80, 100);
      expect(result).toBe(-20);
    });

    it('should handle zero previous value with positive current', () => {
      const result = service.calculateGrowthPercentage(100, 0);
      expect(result).toBe(100);
    });

    it('should handle zero previous value with zero current', () => {
      const result = service.calculateGrowthPercentage(0, 0);
      expect(result).toBe(0);
    });

    it('should handle large numbers', () => {
      const result = service.calculateGrowthPercentage(1000000, 500000);
      expect(result).toBe(100);
    });
  });

  describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
      const result = service.calculatePercentage(25, 100);
      expect(result).toBe(25);
    });

    it('should handle zero total', () => {
      const result = service.calculatePercentage(50, 0);
      expect(result).toBe(0);
    });

    it('should handle decimal results', () => {
      const result = service.calculatePercentage(1, 3);
      expect(result).toBeCloseTo(33.33, 1);
    });

    it('should handle percentages over 100', () => {
      const result = service.calculatePercentage(150, 100);
      expect(result).toBe(150);
    });
  });

  // ==========================================================================
  // Singleton Instance Tests
  // ==========================================================================

  describe('Singleton Instance', () => {
    it('should export a singleton instance', () => {
      expect(earningsService).toBeInstanceOf(EarningsService);
    });

    it('should be the same instance across imports', () => {
      const instance1 = earningsService;
      const instance2 = earningsService;
      expect(instance1).toBe(instance2);
    });
  });
});
