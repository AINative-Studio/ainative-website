/**
 * Usage Service Tests
 * Comprehensive tests for usage metrics, limits, and real-time tracking
 */

import apiClient from '@/lib/api-client';

// Mock apiClient
jest.mock('@/lib/api-client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

import type { UsageService as UsageServiceType } from '../usageService';

describe('UsageService', () => {
  let usageService: UsageServiceType;

  const mockUsageMetrics = {
    period: {
      start: '2025-01-01T00:00:00Z',
      end: '2025-01-31T23:59:59Z',
    },
    total_credits_used: 3500,
    credits_remaining: 6500,
    daily_usage: [
      { date: '2025-01-14', credits_used: 150, endpoint: '/api/v1/generate' },
      { date: '2025-01-15', credits_used: 200, endpoint: '/api/v1/generate' },
    ],
    by_feature: [
      { feature: 'Text Generation', credits_used: 2000, percentage: 57 },
      { feature: 'Image Analysis', credits_used: 1500, percentage: 43 },
    ],
  };

  const mockUsageLimits = {
    monthly_credits: 10000,
    credits_used: 3500,
    credits_remaining: 6500,
    reset_date: '2025-02-01T00:00:00Z',
    features: [
      { name: 'Text Generation', limit: 5000, used: 2000, remaining: 3000 },
      { name: 'Image Analysis', limit: 3000, used: 1500, remaining: 1500 },
    ],
  };

  const mockRealtimeUsage = {
    current_usage: 3500,
    limit: 10000,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const { UsageService } = await import('../usageService');
    usageService = new UsageService();
  });

  describe('getUsageMetrics()', () => {
    it('should fetch usage metrics with default period', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { metrics: mockUsageMetrics },
        },
      });

      const result = await usageService.getUsageMetrics();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/v1/usage/metrics?period=30d');
      expect(result).toEqual(mockUsageMetrics);
    });

    it('should fetch usage metrics with 7-day period', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { metrics: mockUsageMetrics },
        },
      });

      await usageService.getUsageMetrics('7d');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/v1/usage/metrics?period=7d');
    });

    it('should fetch usage metrics with 90-day period', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { metrics: mockUsageMetrics },
        },
      });

      await usageService.getUsageMetrics('90d');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/v1/usage/metrics?period=90d');
    });

    it('should return null when fetch fails', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Network Error'));

      const result = await usageService.getUsageMetrics();

      expect(result).toBeNull();
    });

    it('should return null when API returns unsuccessful', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: false,
          message: 'Metrics unavailable',
          data: null,
        },
      });

      const result = await usageService.getUsageMetrics();

      expect(result).toBeNull();
    });

    it('should return null when metrics data is missing', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: {},
        },
      });

      const result = await usageService.getUsageMetrics();

      expect(result).toBeNull();
    });
  });

  describe('getUsageLimits()', () => {
    it('should fetch usage limits successfully', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { limits: mockUsageLimits },
        },
      });

      const result = await usageService.getUsageLimits();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/v1/usage/limits');
      expect(result).toEqual(mockUsageLimits);
    });

    it('should return null when fetch fails', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Error'));

      const result = await usageService.getUsageLimits();

      expect(result).toBeNull();
    });

    it('should return null when API returns unsuccessful', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: false,
          message: 'Limits unavailable',
          data: null,
        },
      });

      const result = await usageService.getUsageLimits();

      expect(result).toBeNull();
    });
  });

  describe('getRealtimeUsage()', () => {
    it('should fetch real-time usage successfully', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: mockRealtimeUsage,
        },
      });

      const result = await usageService.getRealtimeUsage();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/v1/usage/current');
      expect(result).toEqual(mockRealtimeUsage);
    });

    it('should return null when fetch fails', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Error'));

      const result = await usageService.getRealtimeUsage();

      expect(result).toBeNull();
    });

    it('should return null when API returns unsuccessful', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: false,
          message: 'Real-time data unavailable',
          data: null,
        },
      });

      const result = await usageService.getRealtimeUsage();

      expect(result).toBeNull();
    });
  });

  describe('Utility Methods', () => {
    describe('calculateUsagePercentage()', () => {
      it('should calculate usage percentage correctly', () => {
        expect(usageService.calculateUsagePercentage(50, 100)).toBe(50);
        expect(usageService.calculateUsagePercentage(75, 100)).toBe(75);
        expect(usageService.calculateUsagePercentage(0, 100)).toBe(0);
        expect(usageService.calculateUsagePercentage(100, 100)).toBe(100);
      });

      it('should return 0 when limit is 0 or negative', () => {
        expect(usageService.calculateUsagePercentage(50, 0)).toBe(0);
        expect(usageService.calculateUsagePercentage(50, -10)).toBe(0);
      });

      it('should cap at 100% for overages', () => {
        expect(usageService.calculateUsagePercentage(150, 100)).toBe(100);
        expect(usageService.calculateUsagePercentage(200, 100)).toBe(100);
      });

      it('should round to nearest integer', () => {
        expect(usageService.calculateUsagePercentage(33, 100)).toBe(33);
        expect(usageService.calculateUsagePercentage(1, 3)).toBe(33);
      });
    });

    describe('getUsageStatus()', () => {
      it('should return healthy for low usage', () => {
        expect(usageService.getUsageStatus(0)).toBe('healthy');
        expect(usageService.getUsageStatus(50)).toBe('healthy');
        expect(usageService.getUsageStatus(74)).toBe('healthy');
      });

      it('should return warning for moderate usage', () => {
        expect(usageService.getUsageStatus(75)).toBe('warning');
        expect(usageService.getUsageStatus(80)).toBe('warning');
        expect(usageService.getUsageStatus(89)).toBe('warning');
      });

      it('should return critical for high usage', () => {
        expect(usageService.getUsageStatus(90)).toBe('critical');
        expect(usageService.getUsageStatus(95)).toBe('critical');
        expect(usageService.getUsageStatus(100)).toBe('critical');
      });
    });

    describe('getUsageStatusColorClass()', () => {
      it('should return green for healthy status', () => {
        expect(usageService.getUsageStatusColorClass(50)).toContain('green');
      });

      it('should return yellow for warning status', () => {
        expect(usageService.getUsageStatusColorClass(80)).toContain('yellow');
      });

      it('should return red for critical status', () => {
        expect(usageService.getUsageStatusColorClass(95)).toContain('red');
      });
    });

    describe('getProgressBarColorClass()', () => {
      it('should return green for healthy status', () => {
        expect(usageService.getProgressBarColorClass(50)).toBe('bg-green-500');
      });

      it('should return yellow for warning status', () => {
        expect(usageService.getProgressBarColorClass(80)).toBe('bg-yellow-500');
      });

      it('should return red for critical status', () => {
        expect(usageService.getProgressBarColorClass(95)).toBe('bg-red-500');
      });
    });

    describe('formatCredits()', () => {
      it('should format small numbers with commas', () => {
        expect(usageService.formatCredits(1000)).toBe('1,000');
        expect(usageService.formatCredits(9999)).toBe('9,999');
        expect(usageService.formatCredits(0)).toBe('0');
      });

      it('should format thousands with K suffix', () => {
        expect(usageService.formatCredits(10000)).toBe('10.0K');
        expect(usageService.formatCredits(50000)).toBe('50.0K');
        expect(usageService.formatCredits(100000)).toBe('100.0K');
      });

      it('should format millions with M suffix', () => {
        expect(usageService.formatCredits(1000000)).toBe('1.0M');
        expect(usageService.formatCredits(5000000)).toBe('5.0M');
      });
    });

    describe('getDaysUntilReset()', () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it('should calculate days until reset correctly', () => {
        jest.setSystemTime(new Date('2025-01-15T12:00:00Z'));

        expect(usageService.getDaysUntilReset('2025-01-20T00:00:00Z')).toBe(5);
        expect(usageService.getDaysUntilReset('2025-02-01T00:00:00Z')).toBe(17);
      });

      it('should return 0 for past dates', () => {
        jest.setSystemTime(new Date('2025-01-15T12:00:00Z'));

        expect(usageService.getDaysUntilReset('2025-01-10T00:00:00Z')).toBe(0);
        expect(usageService.getDaysUntilReset('2024-12-01T00:00:00Z')).toBe(0);
      });

      it('should handle same-day reset', () => {
        jest.setSystemTime(new Date('2025-01-15T06:00:00Z'));

        expect(usageService.getDaysUntilReset('2025-01-15T23:59:59Z')).toBe(1);
      });
    });
  });

  describe('Error Logging', () => {
    it('should log errors when fetching metrics fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockedApiClient.get.mockRejectedValue(new Error('Network Error'));

      await usageService.getUsageMetrics();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching usage metrics:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });

    it('should log errors when fetching limits fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockedApiClient.get.mockRejectedValue(new Error('Server Error'));

      await usageService.getUsageLimits();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching usage limits:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });

    it('should log errors when fetching real-time usage fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockedApiClient.get.mockRejectedValue(new Error('Connection Error'));

      await usageService.getRealtimeUsage();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching real-time usage:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });

  describe('Singleton Export', () => {
    it('should export a singleton instance', async () => {
      const { usageService } = await import('../usageService');
      expect(usageService).toBeDefined();
      expect(typeof usageService.getUsageMetrics).toBe('function');
    });
  });
});
