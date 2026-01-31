/**
 * Admin Billing Service Tests
 */

import { adminBillingService } from '@/services/admin/billing';
import { adminApi } from '@/services/admin/client';

jest.mock('@/services/admin/client');

describe('AdminBillingService', () => {
  const mockAdminApi = adminApi as jest.Mocked<typeof adminApi>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBillingInfo', () => {
    it('should fetch billing information', async () => {
      const mockInfo = {
        customer_id: 'cust123',
        subscription_status: 'active' as const,
        current_plan: 'Pro',
        billing_cycle: 'monthly' as const,
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockInfo,
      });

      const result = await adminBillingService.getBillingInfo();
      expect(result.customer_id).toBe('cust123');
    });

    it('should fetch billing info for specific user', async () => {
      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: {
          customer_id: 'cust456',
          subscription_status: 'active' as const,
          current_plan: 'Enterprise',
          billing_cycle: 'annual' as const,
        },
      });

      await adminBillingService.getBillingInfo('user123');
      expect(mockAdminApi.get).toHaveBeenCalledWith('billing/info?user_id=user123');
    });
  });

  describe('listInvoices', () => {
    it('should list invoices', async () => {
      const mockInvoices = {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        hasMore: false,
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockInvoices,
      });

      const result = await adminBillingService.listInvoices();
      expect(result.items).toEqual([]);
    });
  });

  describe('getInvoice', () => {
    it('should fetch a specific invoice', async () => {
      const mockInvoice = {
        id: 'inv123',
        invoice_number: 'INV-2024-001',
        amount: 100,
        currency: 'USD',
        status: 'paid' as const,
        issued_date: '2024-01-01',
        due_date: '2024-01-15',
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockInvoice,
      });

      const result = await adminBillingService.getInvoice('inv123');
      expect(result.invoice_number).toBe('INV-2024-001');
    });
  });

  describe('getPaymentMethods', () => {
    it('should fetch payment methods', async () => {
      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: { payment_methods: [] },
      });

      const result = await adminBillingService.getPaymentMethods('user123');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getCreditBalance', () => {
    it('should fetch credit balance', async () => {
      const mockBalance = {
        total_credits: 10000,
        used_credits: 3000,
        remaining_credits: 7000,
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockBalance,
      });

      const result = await adminBillingService.getCreditBalance();
      expect(result.remaining_credits).toBe(7000);
    });
  });

  describe('listCreditTransactions', () => {
    it('should list credit transactions', async () => {
      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: { items: [], total: 0, page: 1, limit: 10, hasMore: false },
      });

      const result = await adminBillingService.listCreditTransactions();
      expect(result.items).toEqual([]);
    });
  });

  describe('getCurrentUsage', () => {
    it('should fetch current credit usage', async () => {
      const mockUsage = {
        credits_used_today: 100,
        credits_used_this_month: 2000,
        avg_daily_usage: 90,
        estimated_monthly_cost: 150,
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockUsage,
      });

      const result = await adminBillingService.getCurrentUsage();
      expect(result.credits_used_today).toBe(100);
    });
  });

  describe('getCreditPackages', () => {
    it('should fetch available credit packages', async () => {
      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: { packages: [] },
      });

      const result = await adminBillingService.getCreditPackages();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('purchaseCredits', () => {
    it('should purchase credits', async () => {
      mockAdminApi.post.mockResolvedValue({
        success: true,
        message: 'Credits purchased',
        data: { transaction_id: 'txn123', credits_added: 5000 },
      });

      const result = await adminBillingService.purchaseCredits('user123', 'pkg1');
      expect(result.credits_added).toBe(5000);
    });
  });

  describe('addBonusCredits', () => {
    it('should add bonus credits', async () => {
      mockAdminApi.post.mockResolvedValue({
        success: true,
        message: 'Bonus credits added',
        data: null,
      });

      const result = await adminBillingService.addBonusCredits('user123', 1000, 'Promotion');
      expect(result.success).toBe(true);
    });
  });

  describe('getAutoRefillSettings', () => {
    it('should fetch auto-refill settings', async () => {
      const mockSettings = {
        enabled: true,
        threshold_credits: 100,
        refill_amount: 1000,
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockSettings,
      });

      const result = await adminBillingService.getAutoRefillSettings('user123');
      expect(result.enabled).toBe(true);
    });
  });

  describe('updateAutoRefillSettings', () => {
    it('should update auto-refill settings', async () => {
      mockAdminApi.put.mockResolvedValue({
        success: true,
        message: 'Settings updated',
        data: null,
      });

      const result = await adminBillingService.updateAutoRefillSettings('user123', {
        enabled: false,
      });
      expect(result.success).toBe(true);
    });
  });
});
