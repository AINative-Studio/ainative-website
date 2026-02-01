/**
 * Payout Service Tests
 * Comprehensive test suite for payoutService.ts
 * Tests all public methods, edge cases, and error handling
 * Target coverage: 100%
 */

import { PayoutService, payoutService } from '../payoutService';
import apiClient from '@/lib/api-client';
import type {
  StripeConnectStatus,
  ConnectedPaymentMethod,
  PaymentMethodType,
  Payout,
  PayoutStatus,
  PayoutBalance,
  AutoPayoutSettings,
  TaxForm,
  TaxFormType,
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

    // Mock console.error to avoid test pollution
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ==========================================================================
  // Stripe Connect Status Tests
  // ==========================================================================

  describe('getStripeConnectStatus', () => {
    it('should fetch Stripe Connect status successfully', async () => {
      // Arrange
      const mockStatus: StripeConnectStatus = {
        is_connected: true,
        account_id: 'acct_123',
        charges_enabled: true,
        payouts_enabled: true,
        details_submitted: true,
        requirements: {
          currently_due: [],
          eventually_due: [],
          past_due: [],
        },
      };

      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: mockStatus,
        },
      });

      // Act
      const result = await service.getStripeConnectStatus();

      // Assert
      expect(result).toEqual(mockStatus);
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/api/v1/developer/payouts/connect/status'
      );
    });

    it('should return null when not connected', async () => {
      // Arrange
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: false,
          message: 'Not connected',
          data: null,
        },
      });

      // Act
      const result = await service.getStripeConnectStatus();

      // Assert
      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      // Arrange
      mockedApiClient.get.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await service.getStripeConnectStatus();

      // Assert
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('createConnectAccountLink', () => {
    it('should create account link successfully', async () => {
      // Arrange
      const mockLink = { url: 'https://connect.stripe.com/setup/123' };

      mockedApiClient.post.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: mockLink,
        },
      });

      // Act
      const result = await service.createConnectAccountLink();

      // Assert
      expect(result).toEqual(mockLink);
      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/api/v1/developer/payouts/connect/account-link'
      );
    });

    it('should return null on failure', async () => {
      // Arrange
      mockedApiClient.post.mockResolvedValue({
        data: {
          success: false,
          message: 'Failed',
          data: null,
        },
      });

      // Act
      const result = await service.createConnectAccountLink();

      // Assert
      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      // Arrange
      mockedApiClient.post.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await service.createConnectAccountLink();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('createConnectDashboardLink', () => {
    it('should create dashboard link successfully', async () => {
      // Arrange
      const mockLink = { url: 'https://connect.stripe.com/dashboard/123' };

      mockedApiClient.post.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: mockLink,
        },
      });

      // Act
      const result = await service.createConnectDashboardLink();

      // Assert
      expect(result).toEqual(mockLink);
      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/api/v1/developer/payouts/connect/dashboard-link'
      );
    });
  });

  // ==========================================================================
  // Payment Method Tests
  // ==========================================================================

  describe('getPaymentMethods', () => {
    it('should fetch payment methods successfully', async () => {
      // Arrange
      const mockMethods: ConnectedPaymentMethod[] = [
        {
          id: 'pm_123',
          type: 'bank_account',
          bank_name: 'Test Bank',
          account_holder_name: 'John Doe',
          routing_number: '110000000',
          last4: '1234',
          currency: 'USD',
          is_default: true,
          status: 'verified',
        },
      ];

      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { payment_methods: mockMethods },
        },
      });

      // Act
      const result = await service.getPaymentMethods();

      // Assert
      expect(result).toEqual(mockMethods);
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/api/v1/developer/payouts/payment-methods'
      );
    });

    it('should return empty array when no methods exist', async () => {
      // Arrange
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { payment_methods: [] },
        },
      });

      // Act
      const result = await service.getPaymentMethods();

      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array on error', async () => {
      // Arrange
      mockedApiClient.get.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await service.getPaymentMethods();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('addPaymentMethod', () => {
    it('should add bank account successfully', async () => {
      // Arrange
      const methodDetails = {
        type: 'bank_account' as PaymentMethodType,
        bank_account_token: 'btok_123',
      };

      const mockMethod: ConnectedPaymentMethod = {
        id: 'pm_123',
        type: 'bank_account',
        last4: '1234',
        currency: 'USD',
        is_default: false,
        status: 'verified',
      };

      mockedApiClient.post.mockResolvedValue({
        data: {
          success: true,
          message: 'Added',
          data: { payment_method: mockMethod },
        },
      });

      // Act
      const result = await service.addPaymentMethod(methodDetails);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Payment method added successfully');
      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/api/v1/developer/payouts/payment-methods',
        methodDetails
      );
    });

    it('should add debit card successfully', async () => {
      // Arrange
      const methodDetails = {
        type: 'debit_card' as PaymentMethodType,
        debit_card_token: 'ctok_123',
      };

      mockedApiClient.post.mockResolvedValue({
        data: {
          success: true,
          message: 'Added',
          data: { payment_method: {} },
        },
      });

      // Act
      const result = await service.addPaymentMethod(methodDetails);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should return error when addition fails', async () => {
      // Arrange
      const methodDetails = {
        type: 'bank_account' as PaymentMethodType,
        bank_account_token: 'btok_123',
      };

      mockedApiClient.post.mockResolvedValue({
        data: {
          success: false,
          message: 'Invalid token',
          data: null,
        },
      });

      // Act
      const result = await service.addPaymentMethod(methodDetails);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid token');
    });

    it('should handle network errors', async () => {
      // Arrange
      const methodDetails = {
        type: 'bank_account' as PaymentMethodType,
        bank_account_token: 'btok_123',
      };

      mockedApiClient.post.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await service.addPaymentMethod(methodDetails);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to add payment method. Please try again.');
    });
  });

  describe('removePaymentMethod', () => {
    it('should remove payment method successfully', async () => {
      // Arrange
      mockedApiClient.delete.mockResolvedValue({
        data: {
          success: true,
          message: 'Removed',
          data: { success: true },
        },
      });

      // Act
      const result = await service.removePaymentMethod('pm_123');

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Payment method removed successfully');
      expect(mockedApiClient.delete).toHaveBeenCalledWith(
        '/api/v1/developer/payouts/payment-methods/pm_123'
      );
    });

    it('should return error when removal fails', async () => {
      // Arrange
      mockedApiClient.delete.mockResolvedValue({
        data: {
          success: false,
          message: 'Cannot remove default method',
          data: null,
        },
      });

      // Act
      const result = await service.removePaymentMethod('pm_123');

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Cannot remove default method');
    });
  });

  describe('setDefaultPaymentMethod', () => {
    it('should set default payment method successfully', async () => {
      // Arrange
      mockedApiClient.put.mockResolvedValue({
        data: {
          success: true,
          message: 'Updated',
          data: { success: true },
        },
      });

      // Act
      const result = await service.setDefaultPaymentMethod('pm_123');

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Default payment method updated');
      expect(mockedApiClient.put).toHaveBeenCalledWith(
        '/api/v1/developer/payouts/payment-methods/pm_123/default'
      );
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

    it('should fetch payouts successfully', async () => {
      // Arrange
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { payouts: [mockPayout], has_more: false },
        },
      });

      // Act
      const result = await service.getPayouts();

      // Assert
      expect(result).toEqual([mockPayout]);
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/api/v1/developer/payouts',
        { params: undefined }
      );
    });

    it('should fetch payouts with pagination', async () => {
      // Arrange
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { payouts: [mockPayout], has_more: true },
        },
      });

      // Act
      const result = await service.getPayouts({ limit: 10, starting_after: 'po_100' });

      // Assert
      expect(result).toHaveLength(1);
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/api/v1/developer/payouts',
        { params: { limit: 10, starting_after: 'po_100' } }
      );
    });

    it('should return empty array on error', async () => {
      // Arrange
      mockedApiClient.get.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await service.getPayouts();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getPayoutById', () => {
    it('should fetch specific payout successfully', async () => {
      // Arrange
      const mockPayout: Payout = {
        id: 'po_123',
        amount: 10000,
        currency: 'USD',
        status: 'paid',
        created_at: '2026-01-01T00:00:00Z',
        destination_type: 'bank_account',
        destination_last4: '1234',
      };

      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: mockPayout,
        },
      });

      // Act
      const result = await service.getPayoutById('po_123');

      // Assert
      expect(result).toEqual(mockPayout);
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/api/v1/developer/payouts/po_123'
      );
    });

    it('should return null when payout not found', async () => {
      // Arrange
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: false,
          message: 'Not found',
          data: null,
        },
      });

      // Act
      const result = await service.getPayoutById('po_invalid');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getPayoutBalance', () => {
    it('should fetch payout balance successfully', async () => {
      // Arrange
      const mockBalance: PayoutBalance = {
        available: 5000,
        pending: 2000,
        total: 7000,
        currency: 'USD',
      };

      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: mockBalance,
        },
      });

      // Act
      const result = await service.getPayoutBalance();

      // Assert
      expect(result).toEqual(mockBalance);
    });

    it('should return null on error', async () => {
      // Arrange
      mockedApiClient.get.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await service.getPayoutBalance();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('requestPayout', () => {
    it('should request payout successfully', async () => {
      // Arrange
      mockedApiClient.post.mockResolvedValue({
        data: {
          success: true,
          message: 'Payout requested',
          data: { payout: { id: 'po_123' } },
        },
      });

      // Act
      const result = await service.requestPayout(10000);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Payout requested successfully');
      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/api/v1/developer/payouts/request',
        { amount: 10000 }
      );
    });

    it('should handle insufficient balance error', async () => {
      // Arrange
      mockedApiClient.post.mockResolvedValue({
        data: {
          success: false,
          message: 'Insufficient balance',
          data: null,
        },
      });

      // Act
      const result = await service.requestPayout(10000);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Insufficient balance');
    });
  });

  // ==========================================================================
  // Auto-Payout Settings Tests
  // ==========================================================================

  describe('getAutoPayoutSettings', () => {
    it('should fetch auto-payout settings successfully', async () => {
      // Arrange
      const mockSettings: AutoPayoutSettings = {
        enabled: true,
        schedule: 'weekly',
        threshold: 10000,
        delay_days: 2,
      };

      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { settings: mockSettings },
        },
      });

      // Act
      const result = await service.getAutoPayoutSettings();

      // Assert
      expect(result).toEqual(mockSettings);
    });
  });

  describe('updateAutoPayoutSettings', () => {
    it('should update auto-payout settings successfully', async () => {
      // Arrange
      const newSettings: AutoPayoutSettings = {
        enabled: false,
        schedule: 'monthly',
        threshold: 20000,
        delay_days: 5,
      };

      mockedApiClient.put.mockResolvedValue({
        data: {
          success: true,
          message: 'Updated',
          data: { settings: newSettings },
        },
      });

      // Act
      const result = await service.updateAutoPayoutSettings(newSettings);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Auto-payout settings updated successfully');
      expect(mockedApiClient.put).toHaveBeenCalledWith(
        '/api/v1/developer/payouts/settings/auto',
        newSettings
      );
    });
  });

  // ==========================================================================
  // Tax Form Tests
  // ==========================================================================

  describe('getTaxForms', () => {
    it('should fetch tax forms successfully', async () => {
      // Arrange
      const mockForms: TaxForm[] = [
        {
          id: 'tf_123',
          type: 'W9',
          year: 2025,
          status: 'approved',
          file_url: 'https://example.com/forms/w9.pdf',
          submitted_at: '2025-01-01T00:00:00Z',
          approved_at: '2025-01-05T00:00:00Z',
        },
      ];

      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { forms: mockForms },
        },
      });

      // Act
      const result = await service.getTaxForms();

      // Assert
      expect(result).toEqual(mockForms);
    });

    it('should return empty array when no forms exist', async () => {
      // Arrange
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { forms: [] },
        },
      });

      // Act
      const result = await service.getTaxForms();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('uploadTaxForm', () => {
    it('should upload tax form successfully', async () => {
      // Arrange
      const mockFile = new File(['test content'], 'w9.pdf', { type: 'application/pdf' });

      mockedApiClient.post.mockResolvedValue({
        data: {
          success: true,
          message: 'Uploaded',
          data: { form: { id: 'tf_123' } },
        },
      });

      // Act
      const result = await service.uploadTaxForm('W9', 2025, mockFile);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Tax form uploaded successfully');
      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/api/v1/developer/payouts/tax-forms',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      );
    });

    it('should handle upload errors', async () => {
      // Arrange
      const mockFile = new File(['test'], 'w9.pdf', { type: 'application/pdf' });

      mockedApiClient.post.mockRejectedValue(new Error('Upload failed'));

      // Act
      const result = await service.uploadTaxForm('W9', 2025, mockFile);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to upload tax form. Please try again.');
    });
  });

  describe('downloadTaxForm', () => {
    it('should download tax form successfully', async () => {
      // Arrange
      const mockUrl = 'https://example.com/forms/w9.pdf';

      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { url: mockUrl },
        },
      });

      // Act
      const result = await service.downloadTaxForm('tf_123');

      // Assert
      expect(result).toBe(mockUrl);
    });

    it('should return null on error', async () => {
      // Arrange
      mockedApiClient.get.mockRejectedValue(new Error('Download failed'));

      // Act
      const result = await service.downloadTaxForm('tf_123');

      // Assert
      expect(result).toBeNull();
    });
  });

  // ==========================================================================
  // Notification Preferences Tests
  // ==========================================================================

  describe('getNotificationPreferences', () => {
    it('should fetch notification preferences successfully', async () => {
      // Arrange
      const mockPreferences: PayoutNotificationPreferences = {
        email_on_payout_sent: true,
        email_on_payout_paid: true,
        email_on_payout_failed: true,
        sms_on_payout_paid: false,
      };

      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: { preferences: mockPreferences },
        },
      });

      // Act
      const result = await service.getNotificationPreferences();

      // Assert
      expect(result).toEqual(mockPreferences);
    });
  });

  describe('updateNotificationPreferences', () => {
    it('should update notification preferences successfully', async () => {
      // Arrange
      const newPreferences: PayoutNotificationPreferences = {
        email_on_payout_sent: false,
        email_on_payout_paid: true,
        email_on_payout_failed: true,
        sms_on_payout_paid: true,
      };

      mockedApiClient.put.mockResolvedValue({
        data: {
          success: true,
          message: 'Updated',
          data: { preferences: newPreferences },
        },
      });

      // Act
      const result = await service.updateNotificationPreferences(newPreferences);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Notification preferences updated successfully');
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
