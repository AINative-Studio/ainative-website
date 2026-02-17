/**
 * @jest-environment node
 */

/**
 * Payout Service Tests
 * Comprehensive test suite for payoutService.ts
 * Updated to verify correct API endpoint paths (Fixes #587)
 */

import { PayoutService, payoutService } from '../payoutService';
import apiClient from '@/lib/api-client';
import type {
  ConnectedPaymentMethod,
  PaymentMethodType,
  Payout,
  PayoutBalance,
  AutoPayoutSettings,
  PayoutNotificationPreferences,
} from '../payoutService';

// Mock the API client
jest.mock('@/lib/api-client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('PayoutService', () => {
  let service: PayoutService;

  beforeEach(() => {
    service = new PayoutService();
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ==========================================================================
  // Stripe Connect Methods (all return null — no backend)
  // ==========================================================================

  describe('getStripeConnectStatus', () => {
    it('should return null (no backend endpoint exists)', async () => {
      const result = await service.getStripeConnectStatus();
      expect(result).toBeNull();
    });

    it('should not make any API calls', async () => {
      await service.getStripeConnectStatus();
      expect(mockedApiClient.get).not.toHaveBeenCalled();
    });
  });

  describe('createConnectAccountLink', () => {
    it('should return null (no backend endpoint exists)', async () => {
      const result = await service.createConnectAccountLink();
      expect(result).toBeNull();
    });

    it('should not make any API calls', async () => {
      await service.createConnectAccountLink();
      expect(mockedApiClient.post).not.toHaveBeenCalled();
    });
  });

  describe('createConnectDashboardLink', () => {
    it('should return null (no backend endpoint exists)', async () => {
      const result = await service.createConnectDashboardLink();
      expect(result).toBeNull();
    });

    it('should not make any API calls', async () => {
      await service.createConnectDashboardLink();
      expect(mockedApiClient.post).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Payment Method Tests
  // ==========================================================================

  describe('getPaymentMethods', () => {
    const mockMethod: ConnectedPaymentMethod = {
      id: 'pm_123',
      type: 'bank_account',
      bank_name: 'Test Bank',
      account_holder_name: 'John Doe',
      routing_number: '110000000',
      last4: '1234',
      currency: 'USD',
      is_default: true,
      status: 'verified',
    };

    it('should call the correct billing endpoint', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { success: true, message: 'Success', data: [mockMethod] },
      });

      await service.getPaymentMethods();
      expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/public/billing/payment-methods');
    });

    it('should handle wrapped response with direct array data', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { success: true, message: 'Success', data: [mockMethod] },
      });

      const result = await service.getPaymentMethods();
      expect(result).toEqual([mockMethod]);
    });

    it('should handle wrapped response with nested payment_methods field', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { success: true, message: 'Success', data: { payment_methods: [mockMethod] } },
      });

      const result = await service.getPaymentMethods();
      expect(result).toEqual([mockMethod]);
    });

    it('should handle wrapped response with null data', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { success: true, message: 'Success', data: null },
      });

      const result = await service.getPaymentMethods();
      expect(result).toEqual([]);
    });

    it('should handle wrapped response with non-array inner data', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { success: true, message: 'Success', data: {} },
      });

      const result = await service.getPaymentMethods();
      expect(result).toEqual([]);
    });

    it('should handle raw array response', async () => {
      mockedApiClient.get.mockResolvedValue({ data: [mockMethod] });

      const result = await service.getPaymentMethods();
      expect(result).toEqual([mockMethod]);
    });

    it('should return empty array for non-array raw response', async () => {
      mockedApiClient.get.mockResolvedValue({ data: {} });

      const result = await service.getPaymentMethods();
      expect(result).toEqual([]);
    });

    it('should return empty array on error', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Network error'));

      const result = await service.getPaymentMethods();
      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalled();
    });

    it('should return empty array on non-Error exception', async () => {
      mockedApiClient.get.mockRejectedValue('String error');

      const result = await service.getPaymentMethods();
      expect(result).toEqual([]);
    });
  });

  describe('addPaymentMethod', () => {
    const methodDetails = {
      type: 'bank_account' as PaymentMethodType,
      bank_account_token: 'btok_123',
    };

    it('should call the correct billing endpoint', async () => {
      mockedApiClient.post.mockResolvedValue({
        data: { success: true, message: 'Added', data: { payment_method: {} } },
      });

      await service.addPaymentMethod(methodDetails);
      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/v1/public/billing/payment-methods',
        methodDetails
      );
    });

    it('should return success on successful addition', async () => {
      mockedApiClient.post.mockResolvedValue({
        data: { success: true, message: 'Added', data: { payment_method: {} } },
      });

      const result = await service.addPaymentMethod(methodDetails);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Payment method added successfully');
    });

    it('should return error when API reports failure', async () => {
      mockedApiClient.post.mockResolvedValue({
        data: { success: false, message: 'Invalid token', data: null },
      });

      const result = await service.addPaymentMethod(methodDetails);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid token');
    });

    it('should return error with default message when API message is empty', async () => {
      mockedApiClient.post.mockResolvedValue({
        data: { success: false, message: '', data: null },
      });

      const result = await service.addPaymentMethod(methodDetails);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to add payment method');
    });

    it('should handle network errors', async () => {
      mockedApiClient.post.mockRejectedValue(new Error('Network error'));

      const result = await service.addPaymentMethod(methodDetails);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to add payment method. Please try again.');
    });

    it('should handle non-Error exceptions', async () => {
      mockedApiClient.post.mockRejectedValue('String error');

      const result = await service.addPaymentMethod(methodDetails);
      expect(result.success).toBe(false);
    });
  });

  describe('removePaymentMethod', () => {
    it('should call the correct bank-accounts endpoint', async () => {
      mockedApiClient.delete.mockResolvedValue({
        data: { success: true, message: 'Removed', data: { success: true } },
      });

      await service.removePaymentMethod('pm_123');
      expect(mockedApiClient.delete).toHaveBeenCalledWith(
        '/v1/public/payments/bank-accounts/pm_123'
      );
    });

    it('should return success on successful removal', async () => {
      mockedApiClient.delete.mockResolvedValue({
        data: { success: true, message: 'Removed', data: { success: true } },
      });

      const result = await service.removePaymentMethod('pm_123');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Payment method removed successfully');
    });

    it('should return error when API reports failure', async () => {
      mockedApiClient.delete.mockResolvedValue({
        data: { success: false, message: 'Cannot remove default method', data: null },
      });

      const result = await service.removePaymentMethod('pm_123');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Cannot remove default method');
    });

    it('should handle network errors', async () => {
      mockedApiClient.delete.mockRejectedValue(new Error('Network error'));

      const result = await service.removePaymentMethod('pm_123');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to remove payment method. Please try again.');
    });

    it('should handle non-Error exceptions', async () => {
      mockedApiClient.delete.mockRejectedValue('String error');

      const result = await service.removePaymentMethod('pm_123');
      expect(result.success).toBe(false);
    });
  });

  describe('setDefaultPaymentMethod', () => {
    it('should return failure (no backend endpoint exists)', async () => {
      const result = await service.setDefaultPaymentMethod('pm_123');
      expect(result.success).toBe(false);
      expect(result.message).toContain('not yet supported');
    });

    it('should not make any API calls', async () => {
      await service.setDefaultPaymentMethod('pm_123');
      expect(mockedApiClient.put).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Payout History Tests
  // ==========================================================================

  describe('getPayouts', () => {
    const mockPayout: Payout = {
      id: 'po_123',
      amount: 10000,
      currency: 'USD',
      status: 'paid',
      description: 'Monthly payout',
      created_at: '2026-01-01T00:00:00Z',
      arrival_date: '2026-01-03T00:00:00Z',
      destination_type: 'bank_account',
      destination_last4: '1234',
    };

    it('should call the correct transactions endpoint', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { success: true, message: 'Success', data: [mockPayout] },
      });

      await service.getPayouts();
      expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/public/payments/transactions');
    });

    it('should handle wrapped response with direct array data', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { success: true, message: 'Success', data: [mockPayout] },
      });

      const result = await service.getPayouts();
      expect(result).toEqual([mockPayout]);
    });

    it('should handle wrapped response with nested payouts field', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { success: true, message: 'Success', data: { payouts: [mockPayout] } },
      });

      const result = await service.getPayouts();
      expect(result).toEqual([mockPayout]);
    });

    it('should handle wrapped response with null data', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { success: true, message: 'Success', data: null },
      });

      const result = await service.getPayouts();
      expect(result).toEqual([]);
    });

    it('should handle wrapped response with non-array inner data', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { success: true, message: 'Success', data: {} },
      });

      const result = await service.getPayouts();
      expect(result).toEqual([]);
    });

    it('should handle raw array response', async () => {
      mockedApiClient.get.mockResolvedValue({ data: [mockPayout] });

      const result = await service.getPayouts();
      expect(result).toEqual([mockPayout]);
    });

    it('should handle raw response with transactions field', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { transactions: [mockPayout] },
      });

      const result = await service.getPayouts();
      expect(result).toEqual([mockPayout]);
    });

    it('should return empty array for raw response with no matching fields', async () => {
      mockedApiClient.get.mockResolvedValue({ data: {} });

      const result = await service.getPayouts();
      expect(result).toEqual([]);
    });

    it('should include query params when provided', async () => {
      mockedApiClient.get.mockResolvedValue({ data: [mockPayout] });

      await service.getPayouts({ limit: 10, starting_after: 'po_100' });
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('limit=10')
      );
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('starting_after=po_100')
      );
    });

    it('should not add ? when no params provided', async () => {
      mockedApiClient.get.mockResolvedValue({ data: [] });

      await service.getPayouts();
      expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/public/payments/transactions');
    });

    it('should return empty array on error', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Network error'));

      const result = await service.getPayouts();
      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalled();
    });

    it('should return empty array on non-Error exception', async () => {
      mockedApiClient.get.mockRejectedValue('String error');

      const result = await service.getPayouts();
      expect(result).toEqual([]);
    });
  });

  describe('getPayoutById', () => {
    it('should return null (no backend endpoint exists)', async () => {
      const result = await service.getPayoutById('po_123');
      expect(result).toBeNull();
    });

    it('should not make any API calls', async () => {
      await service.getPayoutById('po_123');
      expect(mockedApiClient.get).not.toHaveBeenCalled();
    });
  });

  describe('getPayoutBalance', () => {
    const mockBalance: PayoutBalance = {
      available: 5000,
      pending: 2000,
      total: 7000,
      currency: 'USD',
    };

    it('should call the correct wallet balance endpoint', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { success: true, message: 'Success', data: mockBalance },
      });

      await service.getPayoutBalance();
      expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/public/payments/wallets/me/balance');
    });

    it('should handle wrapped response', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { success: true, message: 'Success', data: mockBalance },
      });

      const result = await service.getPayoutBalance();
      expect(result).toEqual(mockBalance);
    });

    it('should handle raw response', async () => {
      mockedApiClient.get.mockResolvedValue({ data: mockBalance });

      const result = await service.getPayoutBalance();
      expect(result).toEqual(mockBalance);
    });

    it('should return null when wrapped response has no data', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { success: true, message: 'Success', data: null },
      });

      const result = await service.getPayoutBalance();
      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Network error'));

      const result = await service.getPayoutBalance();
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it('should return null on non-Error exception', async () => {
      mockedApiClient.get.mockRejectedValue('String error');

      const result = await service.getPayoutBalance();
      expect(result).toBeNull();
    });
  });

  describe('requestPayout', () => {
    it('should call the correct withdraw endpoint', async () => {
      mockedApiClient.post.mockResolvedValue({
        data: { success: true, message: 'Requested', data: { payout: { id: 'po_123' } } },
      });

      await service.requestPayout(10000);
      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/v1/public/payments/withdraw',
        { amount: 10000 }
      );
    });

    it('should return success on successful request', async () => {
      mockedApiClient.post.mockResolvedValue({
        data: { success: true, message: 'Requested', data: { payout: { id: 'po_123' } } },
      });

      const result = await service.requestPayout(10000);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Payout requested successfully');
    });

    it('should return error when API reports failure', async () => {
      mockedApiClient.post.mockResolvedValue({
        data: { success: false, message: 'Insufficient balance', data: null },
      });

      const result = await service.requestPayout(10000);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Insufficient balance');
    });

    it('should handle network errors', async () => {
      mockedApiClient.post.mockRejectedValue(new Error('Network error'));

      const result = await service.requestPayout(10000);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to request payout. Please try again.');
    });

    it('should handle non-Error exceptions', async () => {
      mockedApiClient.post.mockRejectedValue('String error');

      const result = await service.requestPayout(10000);
      expect(result.success).toBe(false);
    });
  });

  // ==========================================================================
  // Auto-Payout Settings Tests (no backend)
  // ==========================================================================

  describe('getAutoPayoutSettings', () => {
    it('should return null (no backend endpoint exists)', async () => {
      const result = await service.getAutoPayoutSettings();
      expect(result).toBeNull();
    });

    it('should not make any API calls', async () => {
      await service.getAutoPayoutSettings();
      expect(mockedApiClient.get).not.toHaveBeenCalled();
    });
  });

  describe('updateAutoPayoutSettings', () => {
    it('should return failure (no backend endpoint exists)', async () => {
      const settings: AutoPayoutSettings = {
        enabled: true,
        schedule: 'weekly',
        threshold: 10000,
        delay_days: 2,
      };

      const result = await service.updateAutoPayoutSettings(settings);
      expect(result.success).toBe(false);
      expect(result.message).toContain('not yet supported');
    });

    it('should not make any API calls', async () => {
      await service.updateAutoPayoutSettings({
        enabled: true,
        schedule: 'weekly',
        threshold: 10000,
        delay_days: 2,
      });
      expect(mockedApiClient.put).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Tax Form Tests (no backend)
  // ==========================================================================

  describe('getTaxForms', () => {
    it('should return empty array (no backend endpoint exists)', async () => {
      const result = await service.getTaxForms();
      expect(result).toEqual([]);
    });

    it('should not make any API calls', async () => {
      await service.getTaxForms();
      expect(mockedApiClient.get).not.toHaveBeenCalled();
    });
  });

  describe('uploadTaxForm', () => {
    it('should return failure (no backend endpoint exists)', async () => {
      const mockFile = { name: 'w9.pdf', type: 'application/pdf' } as unknown as File;
      const result = await service.uploadTaxForm('W9', 2025, mockFile);
      expect(result.success).toBe(false);
      expect(result.message).toContain('not yet supported');
    });

    it('should not make any API calls', async () => {
      const mockFile = { name: 'w9.pdf', type: 'application/pdf' } as unknown as File;
      await service.uploadTaxForm('W9', 2025, mockFile);
      expect(mockedApiClient.post).not.toHaveBeenCalled();
    });
  });

  describe('downloadTaxForm', () => {
    it('should return null (no backend endpoint exists)', async () => {
      const result = await service.downloadTaxForm('tf_123');
      expect(result).toBeNull();
    });

    it('should not make any API calls', async () => {
      await service.downloadTaxForm('tf_123');
      expect(mockedApiClient.get).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Notification Preferences Tests (no backend)
  // ==========================================================================

  describe('getNotificationPreferences', () => {
    it('should return null (no backend endpoint exists)', async () => {
      const result = await service.getNotificationPreferences();
      expect(result).toBeNull();
    });

    it('should not make any API calls', async () => {
      await service.getNotificationPreferences();
      expect(mockedApiClient.get).not.toHaveBeenCalled();
    });
  });

  describe('updateNotificationPreferences', () => {
    it('should return failure (no backend endpoint exists)', async () => {
      const prefs: PayoutNotificationPreferences = {
        email_on_payout_sent: true,
        email_on_payout_paid: true,
        email_on_payout_failed: true,
        sms_on_payout_paid: false,
      };

      const result = await service.updateNotificationPreferences(prefs);
      expect(result.success).toBe(false);
      expect(result.message).toContain('not yet supported');
    });

    it('should not make any API calls', async () => {
      await service.updateNotificationPreferences({
        email_on_payout_sent: true,
        email_on_payout_paid: true,
        email_on_payout_failed: true,
        sms_on_payout_paid: false,
      });
      expect(mockedApiClient.put).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Utility Methods Tests
  // ==========================================================================

  describe('getPayoutStatusDisplayText', () => {
    it('should return correct display text for all statuses', () => {
      expect(service.getPayoutStatusDisplayText('pending')).toBe('Pending');
      expect(service.getPayoutStatusDisplayText('in_transit')).toBe('In Transit');
      expect(service.getPayoutStatusDisplayText('paid')).toBe('Paid');
      expect(service.getPayoutStatusDisplayText('failed')).toBe('Failed');
      expect(service.getPayoutStatusDisplayText('canceled')).toBe('Canceled');
    });
  });

  describe('getPayoutStatusColorClass', () => {
    it('should return correct color class for all statuses', () => {
      expect(service.getPayoutStatusColorClass('pending')).toBe('text-yellow-600 bg-yellow-50');
      expect(service.getPayoutStatusColorClass('in_transit')).toBe('text-blue-600 bg-blue-50');
      expect(service.getPayoutStatusColorClass('paid')).toBe('text-green-600 bg-green-50');
      expect(service.getPayoutStatusColorClass('failed')).toBe('text-red-600 bg-red-50');
      expect(service.getPayoutStatusColorClass('canceled')).toBe('text-gray-600 bg-gray-50');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency from cents to dollars', () => {
      expect(service.formatCurrency(10000)).toBe('$100.00');
    });

    it('should handle large amounts', () => {
      expect(service.formatCurrency(123456789)).toBe('$1,234,567.89');
    });

    it('should handle zero', () => {
      expect(service.formatCurrency(0)).toBe('$0.00');
    });

    it('should handle different currencies', () => {
      const result = service.formatCurrency(10000, 'EUR');
      expect(result).toContain('100');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const result = service.formatDate('2026-01-15T12:00:00Z');
      expect(result).toContain('2026');
      expect(result).toContain('Jan');
    });

    it('should handle different dates', () => {
      const result = service.formatDate('2025-12-25T12:00:00Z');
      expect(result).toContain('2025');
      expect(result).toContain('Dec');
    });
  });

  // ==========================================================================
  // Singleton Instance Tests
  // ==========================================================================

  describe('Singleton Instance', () => {
    it('should export a singleton instance', () => {
      expect(payoutService).toBeInstanceOf(PayoutService);
    });

    it('should be the same instance across imports', () => {
      const instance1 = payoutService;
      const instance2 = payoutService;
      expect(instance1).toBe(instance2);
    });
  });
});
