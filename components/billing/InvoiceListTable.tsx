// src/components/billing/InvoiceListTable.tsx
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { InvoiceStatusBadge } from '@/components/invoices/InvoiceStatusBadge';
import { Invoice, invoiceService } from '@/services/invoiceService';
import { Download, Eye, CreditCard, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface InvoiceListTableProps {
  invoices: Invoice[];
  onRefresh?: () => void;
  onPaySuccess?: () => void;
}

export function InvoiceListTable({ invoices, onRefresh, onPaySuccess }: InvoiceListTableProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const handleDownloadPDF = async (invoice: Invoice) => {
    setDownloadingId(invoice.id);
    try {
      await invoiceService.downloadMyInvoicePDF(invoice.id);
      toast.success('Invoice PDF downloaded successfully');
    } catch (error) {
      console.error('Failed to download PDF:', error);
      toast.error('Failed to download invoice PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleOpenPaymentDialog = (invoice: Invoice) => {
    setPayingInvoice(invoice);
  };

  const handleClosePaymentDialog = () => {
    if (!paymentLoading) {
      setPayingInvoice(null);
    }
  };

  const handlePayInvoice = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!payingInvoice || !stripe || !elements) {
      toast.error('Payment system not ready');
      return;
    }

    setPaymentLoading(true);

    try {
      // Step 1: Create payment intent on backend
      const paymentIntent = await invoiceService.createMyInvoicePaymentIntent(payingInvoice.id);

      if (!paymentIntent || !paymentIntent.client_secret) {
        throw new Error('Failed to create payment intent');
      }

      // Step 2: Confirm payment with Stripe.js
      const { error, paymentIntent: confirmedPayment } = await stripe.confirmCardPayment(
        paymentIntent.client_secret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
          },
        }
      );

      if (error) {
        throw new Error(error.message || 'Payment failed');
      }

      if (confirmedPayment?.status === 'succeeded') {
        toast.success('Invoice paid successfully!');
        setPayingInvoice(null);
        onPaySuccess?.();
        onRefresh?.();
      } else {
        throw new Error('Payment was not successful');
      }
    } catch (error: any) {
      console.error('Failed to pay invoice:', error);
      toast.error(error.message || 'Failed to pay invoice');
    } finally {
      setPaymentLoading(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800/50 rounded-lg border border-gray-700">
        <p className="text-gray-400">No invoices found</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-800 bg-[#161B22] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-800 hover:bg-gray-800/50">
            <TableHead className="text-gray-400">Invoice</TableHead>
            <TableHead className="text-gray-400">Status</TableHead>
            <TableHead className="text-gray-400">Amount</TableHead>
            <TableHead className="text-gray-400">Due Date</TableHead>
            <TableHead className="text-gray-400">Paid At</TableHead>
            <TableHead className="text-gray-400 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow
              key={invoice.id}
              className="border-gray-800 hover:bg-gray-800/30 transition-colors"
            >
              <TableCell className="font-medium text-white">
                <div className="flex flex-col">
                  <span className="text-sm">
                    {invoice.number || `#${invoice.id.slice(0, 8)}`}
                  </span>
                  {invoice.line_items && invoice.line_items.length > 0 && (
                    <span className="text-xs text-gray-500 mt-1">
                      {invoice.line_items[0].description}
                      {invoice.line_items.length > 1 && ` +${invoice.line_items.length - 1} more`}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <InvoiceStatusBadge status={invoice.status} />
              </TableCell>
              <TableCell className="text-white font-semibold">
                {formatAmount(invoice.amount_total, invoice.currency)}
              </TableCell>
              <TableCell className="text-gray-300">
                {formatDate(invoice.due_date)}
              </TableCell>
              <TableCell className="text-gray-300">
                {invoice.paid_at ? formatDate(invoice.paid_at) : '-'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {/* View button */}
                  {invoice.hosted_invoice_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(invoice.hosted_invoice_url, '_blank')}
                      className="text-gray-400 hover:text-white hover:bg-gray-800"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Download PDF button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownloadPDF(invoice)}
                    disabled={downloadingId === invoice.id}
                    className="text-gray-400 hover:text-white hover:bg-gray-800"
                  >
                    {downloadingId === invoice.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </Button>

                  {/* Pay button for unpaid invoices */}
                  {invoice.status !== 'paid' &&
                   invoice.status !== 'cancelled' &&
                   invoice.status !== 'void' && (
                    <Button
                      size="sm"
                      onClick={() => handleOpenPaymentDialog(invoice)}
                      disabled={payingInvoice?.id === invoice.id && paymentLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {payingInvoice?.id === invoice.id && paymentLoading ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Paying...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-3 w-3 mr-1" />
                          Pay
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Payment Dialog */}
      <Dialog open={!!payingInvoice} onOpenChange={handleClosePaymentDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Pay Invoice</DialogTitle>
            <DialogDescription className="text-gray-400">
              {payingInvoice && (
                <span>
                  Invoice #{payingInvoice.number || payingInvoice.id.slice(0, 8)} - {formatAmount(payingInvoice.amount_total, payingInvoice.currency)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePayInvoice} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Card Details</label>
              <div className="p-3 bg-gray-800 border border-gray-700 rounded-md">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#fff',
                        '::placeholder': { color: '#6B7280' },
                      },
                      invalid: { color: '#EF4444' },
                    },
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClosePaymentDialog}
                disabled={paymentLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={paymentLoading || !stripe}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {paymentLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ${payingInvoice ? formatAmount(payingInvoice.amount_total, payingInvoice.currency) : ''}`
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
