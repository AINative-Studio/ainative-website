import apiClient from '@/utils/apiClient';
import { InvoiceService } from '../InvoiceService';

jest.mock('@/utils/apiClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('InvoiceService', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
  let service: InvoiceService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new InvoiceService();
  });

  describe('getMyInvoices', () => {
    it('calls /v1/public/billing/invoices', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'OK',
          data: { invoices: [], total: 0, limit: 20, offset: 0 },
        },
      });

      await service.getMyInvoices();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/billing/invoices');
    });

    it('appends query params for filters', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'OK',
          data: { invoices: [], total: 0, limit: 10, offset: 5 },
        },
      });

      await service.getMyInvoices({ status: 'paid', limit: 10, offset: 5 });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/v1/public/billing/invoices?status=paid&limit=10&offset=5'
      );
    });

    it('returns empty list on error', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.getMyInvoices();

      expect(result).toEqual({ invoices: [], total: 0, limit: 20, offset: 0 });
    });
  });

  describe('list', () => {
    it('calls /v1/public/billing/invoices for admin listing', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'OK',
          data: { invoices: [], total: 0, limit: 20, offset: 0 },
        },
      });

      await service.list();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/billing/invoices');
    });
  });

  describe('getMyInvoice', () => {
    it('calls /v1/public/billing/invoices/{id}', async () => {
      const mockInvoice = {
        id: 'inv-1',
        user_id: 'user-1',
        amount_total: 5000,
        amount_paid: 0,
        currency: 'USD',
        status: 'sent',
        due_date: '2026-02-01',
        line_items: [],
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: { success: true, message: 'OK', data: mockInvoice },
      });

      const result = await service.getMyInvoice('inv-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/billing/invoices/inv-1');
      expect(result).toEqual(mockInvoice);
    });

    it('returns null on error', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Not found'));

      const result = await service.getMyInvoice('bad-id');

      expect(result).toBeNull();
    });
  });

  describe('get', () => {
    it('calls /v1/public/billing/invoices/{id}', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'OK',
          data: { id: 'inv-1' },
        },
      });

      await service.get('inv-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/billing/invoices/inv-1');
    });
  });

  describe('create', () => {
    it('posts to /v1/public/billing/invoices', async () => {
      const createData = {
        customer_id: 'cust-1',
        line_items: [{ description: 'Test', quantity: 1, unit_price: 1000, amount: 1000 }],
        due_date: '2026-02-01',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: { success: true, message: 'Created', data: { id: 'inv-new', ...createData } },
      });

      await service.create(createData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/public/billing/invoices', createData);
    });
  });

  describe('update', () => {
    it('patches /v1/public/billing/invoices/{id}', async () => {
      const updateData = { due_date: '2026-03-01' };

      mockApiClient.patch.mockResolvedValueOnce({
        data: { success: true, message: 'Updated', data: { id: 'inv-1' } },
      });

      await service.update('inv-1', updateData);

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        '/v1/public/billing/invoices/inv-1',
        updateData
      );
    });
  });

  describe('finalize', () => {
    it('posts to /v1/public/billing/invoices/{id}/finalize', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        data: { success: true, message: 'Finalized', data: { id: 'inv-1', status: 'sent' } },
      });

      await service.finalize('inv-1');

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/public/billing/invoices/inv-1/finalize');
    });
  });

  describe('sendEmail', () => {
    it('posts to /v1/public/billing/invoices/{id}/send-email', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        data: { success: true, message: 'Sent', data: { email_sent: true } },
      });

      const result = await service.sendEmail('inv-1');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/v1/public/billing/invoices/inv-1/send-email'
      );
      expect(result).toBe(true);
    });
  });

  describe('void', () => {
    it('posts to /v1/public/billing/invoices/{id}/void', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        data: { success: true, message: 'Voided', data: { id: 'inv-1', status: 'void' } },
      });

      await service.void('inv-1');

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/public/billing/invoices/inv-1/void');
    });
  });

  describe('markPaid', () => {
    it('posts to /v1/public/billing/invoices/{id}/mark-paid', async () => {
      const paidData = { payment_method: 'bank_transfer', payment_reference: 'REF-123' };

      mockApiClient.post.mockResolvedValueOnce({
        data: { success: true, message: 'Marked paid', data: { id: 'inv-1', status: 'paid' } },
      });

      await service.markPaid('inv-1', paidData);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/v1/public/billing/invoices/inv-1/mark-paid',
        paidData
      );
    });
  });

  describe('createPaymentIntent', () => {
    it('posts to /v1/public/billing/invoices/{id}/payment-intent', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'OK',
          data: {
            client_secret: 'pi_secret',
            publishable_key: 'pk_test',
            amount: 5000,
            currency: 'USD',
          },
        },
      });

      await service.createPaymentIntent('inv-1');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/v1/public/billing/invoices/inv-1/payment-intent'
      );
    });
  });

  describe('createMyInvoicePaymentIntent', () => {
    it('posts to /v1/public/billing/invoices/{id}/payment-intent', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'OK',
          data: {
            client_secret: 'pi_secret',
            publishable_key: 'pk_test',
            amount: 5000,
            currency: 'USD',
          },
        },
      });

      await service.createMyInvoicePaymentIntent('inv-1');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/v1/public/billing/invoices/inv-1/payment-intent'
      );
    });
  });

  describe('utility methods', () => {
    it('formatAmount converts cents to currency string', () => {
      expect(service.formatAmount(5000)).toBe('$50.00');
      expect(service.formatAmount(12345, 'USD')).toBe('$123.45');
    });

    it('isOverdue returns true for past-due invoices', () => {
      const overdueInvoice = {
        id: 'inv-1',
        user_id: 'user-1',
        amount_total: 5000,
        amount_paid: 0,
        currency: 'USD',
        status: 'sent' as const,
        due_date: '2020-01-01',
        line_items: [],
        created_at: '2020-01-01T00:00:00Z',
        updated_at: '2020-01-01T00:00:00Z',
      };

      expect(service.isOverdue(overdueInvoice)).toBe(true);
    });

    it('isOverdue returns false for paid invoices', () => {
      const paidInvoice = {
        id: 'inv-1',
        user_id: 'user-1',
        amount_total: 5000,
        amount_paid: 5000,
        currency: 'USD',
        status: 'paid' as const,
        due_date: '2020-01-01',
        line_items: [],
        created_at: '2020-01-01T00:00:00Z',
        updated_at: '2020-01-01T00:00:00Z',
      };

      expect(service.isOverdue(paidInvoice)).toBe(false);
    });
  });
});
