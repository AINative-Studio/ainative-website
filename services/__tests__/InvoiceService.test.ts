/**
 * InvoiceService Test Suite
 * Tests for invoice service with correct /v1/public/billing/invoices endpoints
 * Issue #437: Fix Invoice Service API endpoints
 */

import { InvoiceService, Invoice, InvoiceListFilters, PaymentIntentResponse } from '../invoiceService';
import apiClient from '@/utils/apiClient';

// Mock the API client
jest.mock('@/utils/apiClient');

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('InvoiceService', () => {
  let invoiceService: InvoiceService;

  beforeEach(() => {
    invoiceService = new InvoiceService();
    jest.clearAllMocks();
  });

  // ==========================================================================
  // Test Data Fixtures
  // ==========================================================================

  const mockInvoice: Invoice = {
    id: 'inv_123',
    user_id: 'user_123',
    subscription_id: 'sub_123',
    stripe_invoice_id: 'stripe_inv_123',
    amount_total: 10000, // $100.00
    amount_paid: 10000,
    currency: 'USD',
    status: 'paid',
    period_start: '2024-01-01T00:00:00Z',
    period_end: '2024-01-31T23:59:59Z',
    due_date: '2024-02-01T00:00:00Z',
    paid_at: '2024-01-15T12:00:00Z',
    invoice_pdf: 'https://example.com/invoice.pdf',
    hosted_invoice_url: 'https://example.com/invoice',
    line_items: [
      {
        description: 'Subscription Fee',
        quantity: 1,
        unit_price: 10000,
        amount: 10000,
      },
    ],
    metadata: { plan: 'pro' },
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    number: 'INV-2024-001',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T12:00:00Z',
  };

  // ==========================================================================
  // User Invoice Methods (/v1/public/billing/invoices/me/*)
  // ==========================================================================

  describe('getMyInvoices', () => {
    it('should fetch user invoices with correct endpoint', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Invoices fetched successfully',
          data: {
            invoices: [mockInvoice],
            total: 1,
            limit: 20,
            offset: 0,
          },
        },
      };

      mockedApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await invoiceService.getMyInvoices();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/public/billing/invoices/me');
      expect(result.invoices).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should handle filters correctly', async () => {
      const filters: InvoiceListFilters = {
        status: 'paid',
        limit: 10,
        offset: 5,
      };

      const mockResponse = {
        data: {
          success: true,
          message: 'Invoices fetched successfully',
          data: {
            invoices: [],
            total: 0,
            limit: 10,
            offset: 5,
          },
        },
      };

      mockedApiClient.get.mockResolvedValueOnce(mockResponse);

      await invoiceService.getMyInvoices(filters);

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/v1/public/billing/invoices/me?status=paid&limit=10&offset=5'
      );
    });

    it('should return empty list on error', async () => {
      mockedApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await invoiceService.getMyInvoices();

      expect(result.invoices).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('getMyInvoice', () => {
    it('should fetch a specific user invoice with correct endpoint', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Invoice fetched successfully',
          data: mockInvoice,
        },
      };

      mockedApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await invoiceService.getMyInvoice('inv_123');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/public/billing/invoices/me/inv_123');
      expect(result).toEqual(mockInvoice);
    });

    it('should return null on error', async () => {
      mockedApiClient.get.mockRejectedValueOnce(new Error('Not found'));

      const result = await invoiceService.getMyInvoice('inv_404');

      expect(result).toBeNull();
    });
  });

  describe('createMyInvoicePaymentIntent', () => {
    it('should create payment intent with correct endpoint', async () => {
      const mockPaymentIntent: PaymentIntentResponse = {
        client_secret: 'pi_secret_123',
        publishable_key: 'pk_test_123',
        amount: 10000,
        currency: 'USD',
      };

      const mockResponse = {
        data: {
          success: true,
          message: 'Payment intent created',
          data: mockPaymentIntent,
        },
      };

      mockedApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await invoiceService.createMyInvoicePaymentIntent('inv_123');

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/v1/public/billing/invoices/me/inv_123/payment-intent'
      );
      expect(result).toEqual(mockPaymentIntent);
    });

    it('should throw error on failure', async () => {
      const mockResponse = {
        data: {
          success: false,
          message: 'Payment intent creation failed',
          data: null,
        },
      };

      mockedApiClient.post.mockResolvedValueOnce(mockResponse);

      await expect(invoiceService.createMyInvoicePaymentIntent('inv_123')).rejects.toThrow(
        'Payment intent creation failed'
      );
    });
  });

  // ==========================================================================
  // Admin Invoice Methods (/v1/public/billing/invoices/*)
  // ==========================================================================

  describe('list (admin)', () => {
    it('should fetch all invoices with correct admin endpoint', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Invoices fetched successfully',
          data: {
            invoices: [mockInvoice],
            total: 1,
            limit: 20,
            offset: 0,
          },
        },
      };

      mockedApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await invoiceService.list();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/public/billing/invoices');
      expect(result.invoices).toHaveLength(1);
    });

    it('should handle filters correctly', async () => {
      const filters: InvoiceListFilters = {
        status: 'overdue',
        limit: 50,
        offset: 10,
      };

      const mockResponse = {
        data: {
          success: true,
          message: 'Invoices fetched successfully',
          data: {
            invoices: [],
            total: 0,
            limit: 50,
            offset: 10,
          },
        },
      };

      mockedApiClient.get.mockResolvedValueOnce(mockResponse);

      await invoiceService.list(filters);

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/v1/public/billing/invoices?status=overdue&limit=50&offset=10'
      );
    });
  });

  describe('get (admin)', () => {
    it('should fetch specific invoice with correct endpoint', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Invoice fetched successfully',
          data: mockInvoice,
        },
      };

      mockedApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await invoiceService.get('inv_123');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/public/billing/invoices/inv_123');
      expect(result).toEqual(mockInvoice);
    });
  });

  describe('create', () => {
    it('should create invoice with correct endpoint', async () => {
      const createData = {
        customer_id: 'cus_123',
        line_items: [
          {
            description: 'Test item',
            quantity: 1,
            unit_price: 5000,
            amount: 5000,
          },
        ],
        due_date: '2024-02-01T00:00:00Z',
      };

      const mockResponse = {
        data: {
          success: true,
          message: 'Invoice created successfully',
          data: mockInvoice,
        },
      };

      mockedApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await invoiceService.create(createData);

      expect(mockedApiClient.post).toHaveBeenCalledWith('/v1/public/billing/invoices', createData);
      expect(result).toEqual(mockInvoice);
    });
  });

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  describe('formatAmount', () => {
    it('should format amount in cents to currency string', () => {
      const result = invoiceService.formatAmount(10000, 'USD');
      expect(result).toBe('$100.00');
    });

    it('should handle different currencies', () => {
      const result = invoiceService.formatAmount(5000, 'EUR');
      expect(result).toContain('50');
    });
  });

  describe('formatDate', () => {
    it('should format ISO date string to readable format', () => {
      const result = invoiceService.formatDate('2024-01-15T12:00:00Z');
      expect(result).toContain('January');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });
  });

  describe('isOverdue', () => {
    it('should return true for overdue unpaid invoices', () => {
      const overdueInvoice = {
        ...mockInvoice,
        status: 'sent' as const,
        due_date: '2020-01-01T00:00:00Z',
      };

      const result = invoiceService.isOverdue(overdueInvoice);
      expect(result).toBe(true);
    });

    it('should return false for paid invoices', () => {
      const result = invoiceService.isOverdue(mockInvoice);
      expect(result).toBe(false);
    });

    it('should return false for future due dates', () => {
      const futureInvoice = {
        ...mockInvoice,
        status: 'sent' as const,
        due_date: '2099-12-31T00:00:00Z',
      };

      const result = invoiceService.isOverdue(futureInvoice);
      expect(result).toBe(false);
    });
  });

  describe('daysUntilDue', () => {
    it('should calculate days until due date correctly', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const invoice = {
        ...mockInvoice,
        due_date: futureDate.toISOString(),
      };

      const result = invoiceService.daysUntilDue(invoice);
      expect(result).toBeGreaterThanOrEqual(4);
      expect(result).toBeLessThanOrEqual(6);
    });

    it('should return negative days for overdue invoices', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);

      const invoice = {
        ...mockInvoice,
        due_date: pastDate.toISOString(),
      };

      const result = invoiceService.daysUntilDue(invoice);
      expect(result).toBeLessThan(0);
    });
  });

  // ==========================================================================
  // Deprecated Methods
  // ==========================================================================

  describe('payMyInvoice (deprecated)', () => {
    it('should return error indicating method is deprecated', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await invoiceService.payMyInvoice('inv_123');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('deprecated')
      );
      expect(result.success).toBe(false);
      expect(result.message).toContain('Stripe payment form');

      consoleWarnSpy.mockRestore();
    });
  });
});
