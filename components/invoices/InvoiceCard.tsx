'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { Invoice, invoiceService } from '@/services/InvoiceService';
import { FileText, Download, Mail, Eye, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface InvoiceCardProps {
  invoice: Invoice;
  onAction?: () => void;
}

export function InvoiceCard({ invoice, onAction }: InvoiceCardProps) {
  const router = useRouter();

  const handleView = () => {
    router.push(`/invoices/${invoice.id}`);
  };

  const handleDownloadPDF = () => {
    invoiceService.downloadPDF(invoice.id, invoice.invoice_pdf);
  };

  const handleSendEmail = async () => {
    await invoiceService.sendEmail(invoice.id);
    onAction?.();
  };

  const daysUntilDue = invoiceService.daysUntilDue(invoice);
  const isOverdue = invoiceService.isOverdue(invoice);

  return (
    <Card className="border-gray-800 bg-[#161B22] hover:border-gray-700 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-400" />
              Invoice #{invoice.number || invoice.id.slice(0, 8)}
            </CardTitle>
            <CardDescription className="text-gray-400 mt-1">
              {invoice.customer_name || invoice.customer_email || 'No customer'}
            </CardDescription>
          </div>
          <InvoiceStatusBadge status={invoice.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Amount and Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Amount</p>
            <p className="text-lg font-semibold text-white">
              {invoiceService.formatAmount(invoice.amount_total, invoice.currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Due Date</p>
            <p className="text-sm text-white">
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
        </div>

        {/* Line Items Preview */}
        {invoice.line_items && invoice.line_items.length > 0 && (
          <div className="pt-2 border-t border-gray-800">
            <p className="text-xs text-gray-400 mb-2">Items</p>
            <div className="space-y-1">
              {invoice.line_items.slice(0, 2).map((item, idx) => (
                <p key={idx} className="text-xs text-gray-300 truncate">
                  {item.description} × {item.quantity}
                </p>
              ))}
              {invoice.line_items.length > 2 && (
                <p className="text-xs text-gray-500">
                  +{invoice.line_items.length - 2} more items
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleView}
            className="flex-1 border-gray-700 hover:bg-gray-800 text-white"
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>

          {invoice.invoice_pdf && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              className="border-gray-700 hover:bg-gray-800 text-white"
            >
              <Download className="h-3 w-3" />
            </Button>
          )}

          {(invoice.status === 'sent' || invoice.status === 'overdue') && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendEmail}
              className="border-gray-700 hover:bg-gray-800 text-white"
            >
              <Mail className="h-3 w-3" />
            </Button>
          )}

          {invoice.status !== 'paid' && invoice.status !== 'cancelled' && invoice.status !== 'void' && (
            <Button
              size="sm"
              onClick={() => router.push(`/invoices/${invoice.id}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <DollarSign className="h-3 w-3 mr-1" />
              Pay
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
