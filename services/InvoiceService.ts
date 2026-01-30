// src/services/InvoiceService.ts
import apiClient from '@/utils/apiClient';

// Base path for invoice endpoints
// Backend confirmed working: /v1/public/billing/invoices
const INVOICE_BASE_PATH = '/v1/public/billing/invoices';

// Invoice Interfaces
export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number; // in cents
  amount: number; // in cents
}

export interface Invoice {
  id: string;
  user_id: string;
  subscription_id?: string;
  stripe_invoice_id?: string;

  amount_total: number; // in cents
  amount_paid: number; // in cents
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'void';

  period_start?: string;
  period_end?: string;
  due_date: string;
  paid_at?: string;

  invoice_pdf?: string;
  hosted_invoice_url?: string;

  line_items: InvoiceLineItem[];
  metadata?: Record<string, unknown>;

  // Customer info
  customer_name?: string;
  customer_email?: string;

  // Invoice number
  number?: string;

  created_at: string;
  updated_at: string;
}

export interface InvoiceCreateData {
  customer_id: string;
  line_items: InvoiceLineItem[];
  due_date: string;
  metadata?: Record<string, unknown>;
}

export interface InvoiceUpdateData {
  line_items?: InvoiceLineItem[];
  due_date?: string;
  metadata?: Record<string, unknown>;
}

export interface InvoiceListFilters {
  status?: 'all' | 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  limit?: number;
  offset?: number;
}

export interface InvoiceListResponse {
  invoices: Invoice[];
  total: number;
  limit: number;
  offset: number;
}

export interface MarkPaidData {
  payment_method?: string;
  payment_reference?: string;
  paid_at?: string;
}

export interface PaymentIntentResponse {
  client_secret: string;
  publishable_key: string;
  amount: number;
  currency: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export class InvoiceService {
  /**
   * Get list of current user's invoices (Issue #165)
   * Uses /v1/public/billing/invoices endpoint
   */
  async getMyInvoices(filters?: InvoiceListFilters): Promise<InvoiceListResponse> {
    try {
      const params = new URLSearchParams();

      if (filters?.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters?.limit) {
        params.append('limit', filters.limit.toString());
      }
      if (filters?.offset) {
        params.append('offset', filters.offset.toString());
      }

      const queryString = params.toString();
      const url = `${INVOICE_BASE_PATH}${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get<ApiResponse<InvoiceListResponse>>(url);

      if (response.data.success) {
        return response.data.data;
      }

      return {
        invoices: [],
        total: 0,
        limit: filters?.limit || 20,
        offset: filters?.offset || 0
      };
    } catch (error) {
      console.error('Failed to fetch my invoices:', error);
      return {
        invoices: [],
        total: 0,
        limit: filters?.limit || 20,
        offset: filters?.offset || 0
      };
    }
  }

  /**
   * Get list of invoices with optional filters (admin)
   * Uses /v1/public/billing/invoices endpoint
   */
  async list(filters?: InvoiceListFilters): Promise<InvoiceListResponse> {
    try {
      const params = new URLSearchParams();

      if (filters?.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters?.limit) {
        params.append('limit', filters.limit.toString());
      }
      if (filters?.offset) {
        params.append('offset', filters.offset.toString());
      }

      const queryString = params.toString();
      const url = `${INVOICE_BASE_PATH}${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get<ApiResponse<InvoiceListResponse>>(url);

      if (response.data.success) {
        return response.data.data;
      }

      return {
        invoices: [],
        total: 0,
        limit: filters?.limit || 20,
        offset: filters?.offset || 0
      };
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      return {
        invoices: [],
        total: 0,
        limit: filters?.limit || 20,
        offset: filters?.offset || 0
      };
    }
  }

  /**
   * Get a specific invoice by ID for current user (Issue #165)
   * Uses /v1/public/billing/invoices/{invoice_id} endpoint
   */
  async getMyInvoice(invoiceId: string): Promise<Invoice | null> {
    try {
      const response = await apiClient.get<ApiResponse<Invoice>>(
        `${INVOICE_BASE_PATH}/${invoiceId}`
      );

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error) {
      console.error(`Failed to fetch my invoice ${invoiceId}:`, error);
      return null;
    }
  }

  /**
   * Download invoice PDF for current user (Issue #165)
   * TODO: Backend endpoint /v1/public/billing/invoices/{id}/pdf not yet implemented
   * Currently falls back to using invoice_pdf URL from invoice data if available
   */
  async downloadMyInvoicePDF(invoiceId: string): Promise<void> {
    // First try to get the invoice to check for existing PDF URL
    const invoice = await this.getMyInvoice(invoiceId);

    if (invoice?.invoice_pdf) {
      // Use existing PDF URL from invoice data
      window.open(invoice.invoice_pdf, '_blank');
      return;
    }

    // TODO: Backend PDF endpoint not implemented yet
    // When implemented, uncomment this code:
    // try {
    //   const response = await apiClient.get(`${INVOICE_BASE_PATH}/${invoiceId}/pdf`, {
    //     responseType: 'blob',
    //   } as Record<string, unknown>);
    //   const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
    //   const link = document.createElement('a');
    //   link.href = url;
    //   link.setAttribute('download', `invoice-${invoiceId}.pdf`);
    //   document.body.appendChild(link);
    //   link.click();
    //   link.parentNode?.removeChild(link);
    //   window.URL.revokeObjectURL(url);
    // } catch (error) {
    //   console.error(`Failed to download invoice PDF ${invoiceId}:`, error);
    //   throw error;
    // }

    console.warn(`PDF download endpoint not available for invoice ${invoiceId}`);
    throw new Error('Invoice PDF download is not available. Please contact support.');
  }

  /**
   * Create payment intent for user's invoice (Issue #165)
   * TODO: Backend endpoint /v1/public/billing/invoices/{id}/payment-intent not yet implemented
   * Returns null with error message until backend is ready
   */
  async createMyInvoicePaymentIntent(invoiceId: string): Promise<PaymentIntentResponse | null> {
    // TODO: Backend payment-intent endpoint not implemented yet
    // When implemented, uncomment this code:
    // try {
    //   const response = await apiClient.post<ApiResponse<PaymentIntentResponse>>(
    //     `${INVOICE_BASE_PATH}/${invoiceId}/payment-intent`
    //   );
    //   if (response.data.success) {
    //     return response.data.data;
    //   }
    //   throw new Error(response.data.message || 'Failed to create payment intent');
    // } catch (error) {
    //   console.error(`Failed to create payment intent for invoice ${invoiceId}:`, error);
    //   throw error;
    // }

    console.warn(`Payment intent endpoint not available for invoice ${invoiceId}`);
    throw new Error(
      'Invoice payment is not available at this time. ' +
      'Please use the hosted payment link or contact support.'
    );
  }

  /**
   * DEPRECATED: Use createMyInvoicePaymentIntent() + Stripe.js instead
   * This method is kept for backward compatibility but should not be used
   */
  async payMyInvoice(invoiceId: string, paymentMethodId?: string): Promise<{
    success: boolean;
    message: string;
    payment_intent_id?: string;
  }> {
    console.warn('payMyInvoice() is deprecated. Use createMyInvoicePaymentIntent() instead.');
    try {
      // This endpoint doesn't exist - need to use payment-intent flow instead
      throw new Error('Direct payment is not supported. Use Stripe.js payment flow.');
    } catch (error: unknown) {
      console.error(`Failed to pay invoice ${invoiceId}:`, error);
      return {
        success: false,
        message: 'Please use the Stripe payment form to pay this invoice',
      };
    }
  }

  /**
   * Get a specific invoice by ID
   * Uses /v1/public/billing/invoices/{invoice_id} endpoint
   */
  async get(invoiceId: string): Promise<Invoice | null> {
    try {
      const response = await apiClient.get<ApiResponse<Invoice>>(
        `${INVOICE_BASE_PATH}/${invoiceId}`
      );

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error) {
      console.error(`Failed to fetch invoice ${invoiceId}:`, error);
      return null;
    }
  }

  /**
   * Create a new invoice
   * Uses /v1/public/billing/invoices endpoint
   */
  async create(data: InvoiceCreateData): Promise<Invoice | null> {
    try {
      const response = await apiClient.post<ApiResponse<Invoice>>(INVOICE_BASE_PATH, data);

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to create invoice');
    } catch (error) {
      console.error('Failed to create invoice:', error);
      throw error;
    }
  }

  /**
   * Update a draft invoice
   * Uses /v1/public/billing/invoices/{invoice_id} endpoint
   */
  async update(invoiceId: string, data: InvoiceUpdateData): Promise<Invoice | null> {
    try {
      const response = await apiClient.patch<ApiResponse<Invoice>>(
        `${INVOICE_BASE_PATH}/${invoiceId}`,
        data
      );

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to update invoice');
    } catch (error) {
      console.error(`Failed to update invoice ${invoiceId}:`, error);
      throw error;
    }
  }

  /**
   * Finalize invoice (draft -> sent)
   * TODO: Backend endpoint /v1/public/billing/invoices/{id}/finalize not yet implemented
   * Returns null with error message until backend is ready
   */
  async finalize(invoiceId: string): Promise<Invoice | null> {
    // TODO: Backend finalize endpoint not implemented yet
    // When implemented, uncomment this code:
    // try {
    //   const response = await apiClient.post<ApiResponse<Invoice>>(
    //     `${INVOICE_BASE_PATH}/${invoiceId}/finalize`
    //   );
    //   if (response.data.success) {
    //     return response.data.data;
    //   }
    //   throw new Error(response.data.message || 'Failed to finalize invoice');
    // } catch (error) {
    //   console.error(`Failed to finalize invoice ${invoiceId}:`, error);
    //   throw error;
    // }

    console.warn(`Finalize endpoint not available for invoice ${invoiceId}`);
    throw new Error('Invoice finalization is not available at this time. Please contact support.');
  }

  /**
   * Send or resend invoice email
   * TODO: Backend endpoint /v1/public/billing/invoices/{id}/send-email not yet implemented
   * Returns false until backend is ready
   */
  async sendEmail(invoiceId: string): Promise<boolean> {
    // TODO: Backend send-email endpoint not implemented yet
    // When implemented, uncomment this code:
    // try {
    //   const response = await apiClient.post<ApiResponse<{ email_sent: boolean }>>(
    //     `${INVOICE_BASE_PATH}/${invoiceId}/send-email`
    //   );
    //   return response.data.success && response.data.data.email_sent;
    // } catch (error) {
    //   console.error(`Failed to send invoice email ${invoiceId}:`, error);
    //   return false;
    // }

    console.warn(`Send email endpoint not available for invoice ${invoiceId}`);
    return false;
  }

  /**
   * Void/cancel invoice
   * TODO: Backend endpoint /v1/public/billing/invoices/{id}/void not yet implemented
   * Returns null with error message until backend is ready
   */
  async void(invoiceId: string): Promise<Invoice | null> {
    // TODO: Backend void endpoint not implemented yet
    // When implemented, uncomment this code:
    // try {
    //   const response = await apiClient.post<ApiResponse<Invoice>>(
    //     `${INVOICE_BASE_PATH}/${invoiceId}/void`
    //   );
    //   if (response.data.success) {
    //     return response.data.data;
    //   }
    //   throw new Error(response.data.message || 'Failed to void invoice');
    // } catch (error) {
    //   console.error(`Failed to void invoice ${invoiceId}:`, error);
    //   throw error;
    // }

    console.warn(`Void endpoint not available for invoice ${invoiceId}`);
    throw new Error('Invoice voiding is not available at this time. Please contact support.');
  }

  /**
   * Mark invoice as paid (manual payment)
   * TODO: Backend endpoint /v1/public/billing/invoices/{id}/mark-paid not yet implemented
   * Returns null with error message until backend is ready
   */
  async markPaid(invoiceId: string, data: MarkPaidData): Promise<Invoice | null> {
    // Suppress unused variable warning for data parameter
    void data;

    // TODO: Backend mark-paid endpoint not implemented yet
    // When implemented, uncomment this code:
    // try {
    //   const response = await apiClient.post<ApiResponse<Invoice>>(
    //     `${INVOICE_BASE_PATH}/${invoiceId}/mark-paid`,
    //     data
    //   );
    //   if (response.data.success) {
    //     return response.data.data;
    //   }
    //   throw new Error(response.data.message || 'Failed to mark invoice as paid');
    // } catch (error) {
    //   console.error(`Failed to mark invoice as paid ${invoiceId}:`, error);
    //   throw error;
    // }

    console.warn(`Mark paid endpoint not available for invoice ${invoiceId}`);
    throw new Error(
      'Manual payment marking is not available at this time. Please contact support.'
    );
  }

  /**
   * Create payment intent for invoice (Stripe payment)
   * TODO: Backend endpoint /v1/public/billing/invoices/{id}/payment-intent not yet implemented
   * Returns null with error message until backend is ready
   */
  async createPaymentIntent(invoiceId: string): Promise<PaymentIntentResponse | null> {
    // TODO: Backend payment-intent endpoint not implemented yet
    // When implemented, uncomment this code:
    // try {
    //   const response = await apiClient.post<ApiResponse<PaymentIntentResponse>>(
    //     `${INVOICE_BASE_PATH}/${invoiceId}/payment-intent`
    //   );
    //   if (response.data.success) {
    //     return response.data.data;
    //   }
    //   throw new Error(response.data.message || 'Failed to create payment intent');
    // } catch (error) {
    //   console.error(`Failed to create payment intent for invoice ${invoiceId}:`, error);
    //   throw error;
    // }

    console.warn(`Payment intent endpoint not available for invoice ${invoiceId}`);
    throw new Error(
      'Invoice payment is not available at this time. ' +
      'Please use the hosted payment link or contact support.'
    );
  }

  /**
   * Download invoice PDF
   * TODO: Backend endpoint /v1/public/billing/invoices/{id}/pdf not yet implemented
   * Uses pdfUrl from invoice data if available, otherwise logs warning
   */
  downloadPDF(invoiceId: string, pdfUrl?: string): void {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    } else {
      // TODO: Backend PDF endpoint not implemented yet
      // When implemented, change to:
      // window.open(`${INVOICE_BASE_PATH}/${invoiceId}/pdf`, '_blank');
      console.warn(`PDF endpoint not available for invoice ${invoiceId}. No pdfUrl provided.`);
    }
  }

  /**
   * Format amount from cents to currency string
   */
  formatAmount(amountInCents: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amountInCents / 100);
  }

  /**
   * Format date to readable string
   */
  formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  /**
   * Check if invoice is overdue
   */
  isOverdue(invoice: Invoice): boolean {
    if (invoice.status === 'paid' || invoice.status === 'cancelled' || invoice.status === 'void') {
      return false;
    }

    const dueDate = new Date(invoice.due_date);
    const now = new Date();

    return now > dueDate;
  }

  /**
   * Calculate days until due date
   */
  daysUntilDue(invoice: Invoice): number {
    const dueDate = new Date(invoice.due_date);
    const now = new Date();

    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }
}

export const invoiceService = new InvoiceService();
