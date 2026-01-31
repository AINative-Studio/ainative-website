'use client';

import { Invoice, invoiceService } from '@/services/invoiceService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, CreditCard, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

export interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPayClick?: (invoice: Invoice) => void;
}

export function InvoiceDetailModal({ invoice, open, onOpenChange, onPayClick }: InvoiceDetailModalProps) {
  const [downloading, setDownloading] = useState(false);

  if (!invoice) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatAmount = (amountInCents: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amountInCents / 100);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { label: 'Paid', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
      open: { label: 'Open', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
      sent: { label: 'Sent', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
      overdue: { label: 'Overdue', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
      draft: { label: 'Draft', className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
      void: { label: 'Void', className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
      cancelled: { label: 'Cancelled', className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);

    try {
      await invoiceService.downloadMyInvoicePDF(invoice.id);
      toast.success('Invoice PDF opened');
    } catch (error) {
      console.error('Failed to download PDF:', error);
      toast.error('Failed to download invoice PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handlePayClick = () => {
    onPayClick?.(invoice);
    onOpenChange(false);
  };

  const subtotal = invoice.line_items.reduce((sum, item) => sum + item.amount, 0);
  const tax = 0; // Tax calculation would go here if applicable
  const total = invoice.amount_total;

  const canPay = invoice.status !== 'paid' && invoice.status !== 'void' && invoice.status !== 'cancelled';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#161B22] border-gray-800 text-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white">{invoice.number}</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Created {formatDate(invoice.created_at)}
                </DialogDescription>
              </div>
            </div>
            {getStatusBadge(invoice.status)}
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
            <div>
              <p className="text-xs text-gray-400 uppercase mb-1">Billing Period</p>
              <p className="text-sm text-white">
                {invoice.period_start && invoice.period_end
                  ? `${formatDate(invoice.period_start)} - ${formatDate(invoice.period_end)}`
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase mb-1">Due Date</p>
              <p className="text-sm text-white">{formatDate(invoice.due_date)}</p>
            </div>
            {invoice.paid_at && (
              <div>
                <p className="text-xs text-gray-400 uppercase mb-1">Paid Date</p>
                <p className="text-sm text-green-400">{formatDate(invoice.paid_at)}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400 uppercase mb-1">Invoice ID</p>
              <p className="text-sm text-gray-300 font-mono">{invoice.id.slice(0, 8)}...</p>
            </div>
          </div>

          <Separator className="bg-gray-800" />

          {/* Line Items */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Line Items</h3>
            <div className="border border-gray-800 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800 hover:bg-transparent">
                    <TableHead className="text-gray-400">Description</TableHead>
                    <TableHead className="text-gray-400 text-right">Quantity</TableHead>
                    <TableHead className="text-gray-400 text-right">Unit Price</TableHead>
                    <TableHead className="text-gray-400 text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.line_items.map((item, index) => (
                    <TableRow key={index} className="border-gray-800">
                      <TableCell className="text-white">
                        <div>
                          <p className="font-medium">{item.description}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-gray-300">
                        {item.quantity.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-gray-300">
                        {formatAmount(item.unit_price, invoice.currency)}
                      </TableCell>
                      <TableCell className="text-right text-white font-medium">
                        {formatAmount(item.amount, invoice.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <Separator className="bg-gray-800" />

          {/* Totals */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-white font-medium">{formatAmount(subtotal, invoice.currency)}</span>
            </div>
            {tax > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Tax</span>
                <span className="text-white font-medium">{formatAmount(tax, invoice.currency)}</span>
              </div>
            )}
            <Separator className="bg-gray-800" />
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-white">Total</span>
              <span className="text-2xl font-bold text-white">{formatAmount(total, invoice.currency)}</span>
            </div>
            {invoice.status === 'paid' && invoice.amount_paid > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-green-400">Amount Paid</span>
                <span className="text-green-400 font-medium">
                  {formatAmount(invoice.amount_paid, invoice.currency)}
                </span>
              </div>
            )}
          </div>

          <Separator className="bg-gray-800" />

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="flex-1 border-gray-700 hover:bg-gray-800 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              {downloading ? 'Downloading...' : 'Download PDF'}
            </Button>
            {canPay && (
              <Button onClick={handlePayClick} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                <CreditCard className="h-4 w-4 mr-2" />
                Pay Invoice
              </Button>
            )}
          </div>

          {/* Metadata (if any) */}
          {invoice.metadata && Object.keys(invoice.metadata).length > 0 && (
            <>
              <Separator className="bg-gray-800" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Additional Information</h3>
                <div className="space-y-2">
                  {Object.entries(invoice.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-400 capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="text-white">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
