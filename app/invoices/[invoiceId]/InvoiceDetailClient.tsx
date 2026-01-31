'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { InvoiceStatusBadge } from '@/components/invoices/InvoiceStatusBadge';
import { LineItemEditor } from '@/components/invoices/LineItemEditor';
import { PaymentButton } from '@/components/invoices/PaymentButton';
import { invoiceService, Invoice } from '@/services/invoiceService';
import { ArrowLeft, Download, Mail, Send, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { env } from '@/lib/env';

// Initialize Stripe with the publishable key from environment
const stripePromise = loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_dummy');

interface InvoiceDetailClientProps {
  invoiceId: string;
}

export default function InvoiceDetailClient({ invoiceId }: InvoiceDetailClientProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showMarkPaidDialog, setShowMarkPaidDialog] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId]);

  const fetchInvoice = async () => {
    if (!invoiceId) return;

    try {
      setLoading(true);
      const data = await invoiceService.get(invoiceId);
      setInvoice(data);
    } catch (error) {
      console.error('Failed to fetch invoice:', error);
      toast.error('Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!invoice) return;
    invoiceService.downloadPDF(invoice.id, invoice.invoice_pdf);
  };

  const handleSendEmail = async () => {
    if (!invoice) return;

    setProcessing(true);
    try {
      const success = await invoiceService.sendEmail(invoice.id);
      if (success) {
        toast.success('Invoice email sent successfully');
      } else {
        toast.error('Failed to send invoice email');
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      toast.error('Failed to send invoice email');
    } finally {
      setProcessing(false);
    }
  };

  const handleFinalize = async () => {
    if (!invoice) return;

    setProcessing(true);
    try {
      const updated = await invoiceService.finalize(invoice.id);
      if (updated) {
        setInvoice(updated);
        toast.success('Invoice finalized and sent successfully');
      }
    } catch (error) {
      console.error('Failed to finalize invoice:', error);
      toast.error('Failed to finalize invoice');
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!invoice) return;

    setProcessing(true);
    try {
      const updated = await invoiceService.markPaid(invoice.id, {
        payment_method: 'manual',
        payment_reference: paymentReference,
        paid_at: new Date().toISOString()
      });

      if (updated) {
        setInvoice(updated);
        setShowMarkPaidDialog(false);
        setPaymentReference('');
        toast.success('Invoice marked as paid');
      }
    } catch (error) {
      console.error('Failed to mark invoice as paid:', error);
      toast.error('Failed to mark invoice as paid');
    } finally {
      setProcessing(false);
    }
  };

  const handleVoid = async () => {
    if (!invoice) return;

    const confirmed = window.confirm('Are you sure you want to void this invoice? This action cannot be undone.');
    if (!confirmed) return;

    setProcessing(true);
    try {
      const updated = await invoiceService.void(invoice.id);
      if (updated) {
        setInvoice(updated);
        toast.success('Invoice voided');
      }
    } catch (error) {
      console.error('Failed to void invoice:', error);
      toast.error('Failed to void invoice');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Invoice not found</h2>
        <Button onClick={() => router.push('/invoices')} variant="outline">
          Back to Invoices
        </Button>
      </div>
    );
  }

  const isOverdue = invoiceService.isOverdue(invoice);
  const daysUntilDue = invoiceService.daysUntilDue(invoice);

  return (
    <motion.div
      className="max-w-4xl mx-auto px-4 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/invoices')}
          className="mb-4 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Invoices
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Invoice #{invoice.number || invoice.id.slice(0, 8)}
            </h1>
            <p className="text-gray-400">
              Created {invoiceService.formatDate(invoice.created_at)}
            </p>
          </div>
          <InvoiceStatusBadge status={invoice.status} />
        </div>
      </div>

      <div className="space-y-6">
        {/* Invoice Details */}
        <Card className="border-gray-800 bg-[#161B22]">
          <CardHeader>
            <CardTitle className="text-white">Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-400 text-sm">Customer</Label>
                <p className="text-white mt-1">
                  {invoice.customer_name || invoice.customer_email || 'No customer'}
                </p>
              </div>

              <div>
                <Label className="text-gray-400 text-sm">Amount</Label>
                <p className="text-white mt-1 text-xl font-semibold">
                  {invoiceService.formatAmount(invoice.amount_total, invoice.currency)}
                </p>
              </div>

              <div>
                <Label className="text-gray-400 text-sm">Due Date</Label>
                <p className="text-white mt-1">
                  {invoiceService.formatDate(invoice.due_date)}
                </p>
                {!isOverdue && invoice.status !== 'paid' && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {daysUntilDue > 0 ? `${daysUntilDue} days left` : 'Due today'}
                  </p>
                )}
                {isOverdue && (
                  <p className="text-xs text-red-400 mt-0.5">
                    {Math.abs(daysUntilDue)} days overdue
                  </p>
                )}
              </div>

              {invoice.paid_at && (
                <div>
                  <Label className="text-gray-400 text-sm">Paid At</Label>
                  <p className="text-green-400 mt-1">
                    {invoiceService.formatDate(invoice.paid_at)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card className="border-gray-800 bg-[#161B22]">
          <CardHeader>
            <CardTitle className="text-white">Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <LineItemEditor
              lineItems={invoice.line_items}
              onChange={() => {}}
              readOnly={true}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="border-gray-800 bg-[#161B22]">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3">
              {/* Download PDF */}
              {invoice.invoice_pdf && (
                <Button
                  variant="outline"
                  onClick={handleDownloadPDF}
                  className="border-gray-700 hover:bg-gray-800 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              )}

              {/* Finalize (draft only) */}
              {invoice.status === 'draft' && (
                <Button
                  onClick={handleFinalize}
                  disabled={processing}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Finalizing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Finalize & Send
                    </>
                  )}
                </Button>
              )}

              {/* Send Email (sent/overdue) */}
              {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                <Button
                  variant="outline"
                  onClick={handleSendEmail}
                  disabled={processing}
                  className="border-gray-700 hover:bg-gray-800 text-white"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Resend Email
                    </>
                  )}
                </Button>
              )}

              {/* Mark as Paid (sent/overdue) */}
              {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                <Button
                  variant="outline"
                  onClick={() => setShowMarkPaidDialog(true)}
                  disabled={processing}
                  className="border-green-700 hover:bg-green-900/20 text-green-400 hover:text-green-300"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Paid
                </Button>
              )}

              {/* Pay Now Button (Stripe) */}
              {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                <Elements stripe={stripePromise}>
                  <PaymentButton
                    invoiceId={invoice.id}
                    amount={invoice.amount_total}
                    currency={invoice.currency}
                    onSuccess={fetchInvoice}
                  />
                </Elements>
              )}

              {/* Void Invoice */}
              {invoice.status !== 'paid' && invoice.status !== 'void' && invoice.status !== 'cancelled' && (
                <Button
                  variant="outline"
                  onClick={handleVoid}
                  disabled={processing}
                  className="border-red-700 hover:bg-red-900/20 text-red-400 hover:text-red-300"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Void Invoice
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mark as Paid Dialog */}
        {showMarkPaidDialog && (
          <Card className="border-gray-800 bg-[#161B22]">
            <CardHeader>
              <CardTitle className="text-white">Mark Invoice as Paid</CardTitle>
              <CardDescription className="text-gray-400">
                Record a manual payment for this invoice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-300">Payment Reference (optional)</Label>
                <Input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="e.g., Check #1234, Wire Transfer..."
                  className="mt-1.5 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowMarkPaidDialog(false);
                    setPaymentReference('');
                  }}
                  disabled={processing}
                  className="flex-1 border-gray-700 hover:bg-gray-800 text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleMarkPaid}
                  disabled={processing}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm Payment
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  );
}
