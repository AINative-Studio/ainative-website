// src/components/billing/PaymentHistory.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Invoice } from '@/services/InvoiceService';
import { CheckCircle2, XCircle, Clock, Download } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

interface PaymentHistoryProps {
  invoices: Invoice[];
  onDownload?: (invoiceId: string) => void;
}

export function PaymentHistory({ invoices, onDownload }: PaymentHistoryProps) {
  const paidInvoices = invoices.filter((inv) => inv.status === 'paid');

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

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case 'cancelled':
      case 'void':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-400" />;
    }
  };

  return (
    <Card className="border-gray-800 bg-[#161B22]">
      <CardHeader>
        <CardTitle className="text-white">Payment History</CardTitle>
        <CardDescription className="text-gray-400">
          View all your past payments and transaction details
        </CardDescription>
      </CardHeader>

      <CardContent>
        {paidInvoices.length === 0 ? (
          <div className="text-center py-8 bg-gray-900/50 rounded-lg border border-gray-800">
            <p className="text-gray-400 text-sm">No payment history available</p>
            <p className="text-gray-500 text-xs mt-1">
              Your paid invoices will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {paidInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">
                    {getPaymentStatusIcon(invoice.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium">
                        {invoice.number || `Invoice #${invoice.id.slice(0, 8)}`}
                      </span>
                      <Badge
                        variant="outline"
                        className="bg-green-500/20 text-green-300 border-green-500/30"
                      >
                        Paid
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm">
                      <span className="text-gray-400">
                        Paid on {formatDate(invoice.paid_at || invoice.updated_at)}
                      </span>
                      {invoice.line_items && invoice.line_items.length > 0 && (
                        <span className="text-gray-500 text-xs sm:text-sm">
                          {invoice.line_items[0].description}
                          {invoice.line_items.length > 1 && ` +${invoice.line_items.length - 1}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 ml-4">
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      {formatAmount(invoice.amount_paid || invoice.amount_total, invoice.currency)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {invoice.currency.toUpperCase()}
                    </div>
                  </div>
                  {onDownload && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDownload(invoice.id)}
                      className="text-gray-400 hover:text-white hover:bg-gray-800"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
