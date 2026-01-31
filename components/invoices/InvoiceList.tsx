'use client';

import { useState } from 'react';
import { Invoice, invoiceService } from '@/services/invoiceService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, Download, CreditCard, Eye } from 'lucide-react';
import { toast } from 'sonner';

export interface InvoiceListProps {
  invoices: Invoice[];
  total: number;
  limit: number;
  offset: number;
  loading?: boolean;
  onPageChange?: (offset: number) => void;
  onStatusChange?: (status: string) => void;
  onInvoiceClick?: (invoice: Invoice) => void;
  onPayClick?: (invoice: Invoice) => void;
  currentStatus?: string;
}

export function InvoiceList({
  invoices,
  total,
  limit,
  offset,
  loading = false,
  onPageChange,
  onStatusChange,
  onInvoiceClick,
  onPayClick,
  currentStatus = 'all',
}: InvoiceListProps) {
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  const statusFilters = [
    { value: 'all', label: 'All', count: total },
    { value: 'paid', label: 'Paid', variant: 'default' as const },
    { value: 'open', label: 'Open', variant: 'default' as const },
    { value: 'overdue', label: 'Overdue', variant: 'destructive' as const },
  ];

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
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

  const formatBillingPeriod = (start?: string, end?: string) => {
    if (!start || !end) return 'N/A';
    const startDate = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endDate = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startDate} - ${endDate}`;
  };

  const handleDownloadPdf = async (invoice: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadingPdf(invoice.id);

    try {
      await invoiceService.downloadMyInvoicePDF(invoice.id);
      toast.success('Invoice PDF opened');
    } catch (error) {
      console.error('Failed to download PDF:', error);
      toast.error('Failed to download invoice PDF');
    } finally {
      setDownloadingPdf(null);
    }
  };

  const handlePayClick = (invoice: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    onPayClick?.(invoice);
  };

  const handlePageChange = (newPage: number) => {
    const newOffset = (newPage - 1) * limit;
    onPageChange?.(newOffset);
  };

  const isOverdue = (invoice: Invoice): boolean => {
    if (invoice.status === 'paid' || invoice.status === 'cancelled' || invoice.status === 'void') {
      return false;
    }

    if (!invoice.due_date) return false;

    const dueDate = new Date(invoice.due_date);
    const now = new Date();

    return now > dueDate;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Filter Tabs */}
      <Tabs value={currentStatus} onValueChange={onStatusChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-900/50 border border-gray-800">
          {statusFilters.map((filter) => (
            <TabsTrigger
              key={filter.value}
              value={filter.value}
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              {filter.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Empty State */}
      {invoices.length === 0 ? (
        <Card className="border-gray-800 bg-[#161B22]">
          <CardContent className="pt-16 pb-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No invoices found</h3>
            <p className="text-gray-400">
              {currentStatus === 'all'
                ? 'You have no invoices yet'
                : `You have no ${currentStatus} invoices`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block border border-gray-800 rounded-lg overflow-hidden bg-[#161B22]">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800 hover:bg-transparent">
                  <TableHead className="text-gray-400">Invoice</TableHead>
                  <TableHead className="text-gray-400">Billing Period</TableHead>
                  <TableHead className="text-gray-400">Due Date</TableHead>
                  <TableHead className="text-gray-400">Amount</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow
                    key={invoice.id}
                    className="border-gray-800 cursor-pointer hover:bg-gray-900/50"
                    onClick={() => onInvoiceClick?.(invoice)}
                  >
                    <TableCell className="font-medium text-white">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span>{invoice.number}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {formatBillingPeriod(invoice.period_start, invoice.period_end)}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      <div className="flex flex-col">
                        <span>{formatDate(invoice.due_date)}</span>
                        {isOverdue(invoice) && (
                          <span className="text-xs text-red-400">Overdue</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-white font-medium">
                      {formatAmount(invoice.amount_total, invoice.currency)}
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onInvoiceClick?.(invoice);
                          }}
                          className="text-gray-400 hover:text-white hover:bg-gray-800"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleDownloadPdf(invoice, e)}
                          disabled={downloadingPdf === invoice.id}
                          className="text-gray-400 hover:text-white hover:bg-gray-800"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {invoice.status !== 'paid' && invoice.status !== 'void' && invoice.status !== 'cancelled' && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={(e) => handlePayClick(invoice, e)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <CreditCard className="h-4 w-4 mr-1" />
                            Pay
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {invoices.map((invoice) => (
              <Card
                key={invoice.id}
                className="border-gray-800 bg-[#161B22] cursor-pointer hover:bg-gray-900/50"
                onClick={() => onInvoiceClick?.(invoice)}
              >
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-white">{invoice.number}</span>
                      </div>
                      {getStatusBadge(invoice.status)}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Billing Period</span>
                        <span className="text-gray-300">
                          {formatBillingPeriod(invoice.period_start, invoice.period_end)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Due Date</span>
                        <span className={`text-gray-300 ${isOverdue(invoice) ? 'text-red-400' : ''}`}>
                          {formatDate(invoice.due_date)}
                          {isOverdue(invoice) && ' (Overdue)'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Amount</span>
                        <span className="text-white font-medium">
                          {formatAmount(invoice.amount_total, invoice.currency)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => handleDownloadPdf(invoice, e)}
                        disabled={downloadingPdf === invoice.id}
                        className="flex-1 border-gray-700 hover:bg-gray-800 text-white"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                      {invoice.status !== 'paid' && invoice.status !== 'void' && invoice.status !== 'cancelled' && (
                        <Button
                          size="sm"
                          onClick={(e) => handlePayClick(invoice, e)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <CreditCard className="h-4 w-4 mr-1" />
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    className={
                      currentPage === 1
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer hover:bg-gray-800 text-white'
                    }
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageNum)}
                        isActive={currentPage === pageNum}
                        className={`cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'hover:bg-gray-800 text-white'
                        }`}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    className={
                      currentPage === totalPages
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer hover:bg-gray-800 text-white'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}

          {/* Results count */}
          <div className="text-center text-sm text-gray-400">
            Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} invoices
          </div>
        </>
      )}
    </div>
  );
}
