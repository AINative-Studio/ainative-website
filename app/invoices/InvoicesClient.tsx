'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Plus,
  Search,
  FileText,
  Download,
  Eye,
  DollarSign,
} from 'lucide-react';

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'void';

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

interface Invoice {
  id: string;
  number: string;
  customer_name: string;
  customer_email: string;
  status: InvoiceStatus;
  amount_total: number;
  currency: string;
  due_date: string;
  created_at: string;
  invoice_pdf?: string;
  line_items?: LineItem[];
}

// Mock invoices for demo
const mockInvoices: Invoice[] = [
  {
    id: 'inv-001',
    number: 'INV-2024-001',
    customer_name: 'Acme Corp',
    customer_email: 'billing@acme.com',
    status: 'paid',
    amount_total: 2499.00,
    currency: 'USD',
    due_date: '2024-12-15',
    created_at: '2024-11-15',
    invoice_pdf: '/invoices/inv-001.pdf',
    line_items: [
      { description: 'AI Kit Pro - Annual License', quantity: 1, unit_price: 1999.00 },
      { description: 'Premium Support Package', quantity: 1, unit_price: 500.00 },
    ],
  },
  {
    id: 'inv-002',
    number: 'INV-2024-002',
    customer_name: 'TechStart Inc',
    customer_email: 'finance@techstart.io',
    status: 'sent',
    amount_total: 599.00,
    currency: 'USD',
    due_date: '2024-12-30',
    created_at: '2024-12-01',
    line_items: [
      { description: 'AI Kit Team - Monthly', quantity: 1, unit_price: 599.00 },
    ],
  },
  {
    id: 'inv-003',
    number: 'INV-2024-003',
    customer_name: 'DataFlow Systems',
    customer_email: 'accounts@dataflow.com',
    status: 'overdue',
    amount_total: 1299.00,
    currency: 'USD',
    due_date: '2024-11-30',
    created_at: '2024-11-01',
    line_items: [
      { description: 'ZeroDB Enterprise', quantity: 1, unit_price: 999.00 },
      { description: 'Data Migration Service', quantity: 1, unit_price: 300.00 },
    ],
  },
  {
    id: 'inv-004',
    number: 'INV-2024-004',
    customer_name: 'CloudNine Ltd',
    customer_email: 'invoices@cloudnine.co',
    status: 'draft',
    amount_total: 4999.00,
    currency: 'USD',
    due_date: '2025-01-15',
    created_at: '2024-12-10',
    line_items: [
      { description: 'QNN Enterprise - Annual', quantity: 1, unit_price: 4999.00 },
    ],
  },
  {
    id: 'inv-005',
    number: 'INV-2024-005',
    customer_name: 'Neural Networks Co',
    customer_email: 'billing@neuralnet.ai',
    status: 'paid',
    amount_total: 799.00,
    currency: 'USD',
    due_date: '2024-12-01',
    created_at: '2024-11-10',
    invoice_pdf: '/invoices/inv-005.pdf',
    line_items: [
      { description: 'AI Kit Pro - Monthly', quantity: 1, unit_price: 199.00 },
      { description: 'Prompt Credits (10,000)', quantity: 6, unit_price: 100.00 },
    ],
  },
  {
    id: 'inv-006',
    number: 'INV-2024-006',
    customer_name: 'Startup Labs',
    customer_email: 'hello@startuplabs.dev',
    status: 'cancelled',
    amount_total: 299.00,
    currency: 'USD',
    due_date: '2024-11-15',
    created_at: '2024-10-15',
    line_items: [
      { description: 'AI Kit Starter - Monthly', quantity: 1, unit_price: 299.00 },
    ],
  },
];

type FilterStatus = 'all' | InvoiceStatus;

const filters: { label: string; value: FilterStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Sent', value: 'sent' },
  { label: 'Paid', value: 'paid' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Cancelled', value: 'cancelled' },
];

const statusConfig: Record<InvoiceStatus, { label: string; className: string }> = {
  draft: {
    label: 'Draft',
    className: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  },
  sent: {
    label: 'Sent',
    className: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  },
  paid: {
    label: 'Paid',
    className: 'bg-green-500/20 text-green-300 border-green-500/30',
  },
  overdue: {
    label: 'Overdue',
    className: 'bg-red-500/20 text-red-300 border-red-500/30',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-gray-600/20 text-gray-400 border-gray-600/30',
  },
  void: {
    label: 'Void',
    className: 'bg-gray-600/20 text-gray-400 border-gray-600/30',
  },
};

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount / 100);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function daysUntilDue(dueDate: string): number {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function InvoiceCard({ invoice }: { invoice: Invoice }) {
  const days = daysUntilDue(invoice.due_date);
  const isOverdue = invoice.status === 'overdue' || (days < 0 && invoice.status !== 'paid' && invoice.status !== 'cancelled');

  return (
    <Card className="border-gray-800 bg-[#161B22] hover:border-gray-700 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-400" />
              Invoice #{invoice.number}
            </CardTitle>
            <CardDescription className="text-gray-400 mt-1">
              {invoice.customer_name}
            </CardDescription>
          </div>
          <InvoiceStatusBadge status={invoice.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Amount</p>
            <p className="text-lg font-semibold text-white">
              {formatAmount(invoice.amount_total * 100, invoice.currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Due Date</p>
            <p className="text-sm text-white">{formatDate(invoice.due_date)}</p>
            {!isOverdue && invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
              <p className="text-xs text-gray-500 mt-0.5">
                {days > 0 ? `${days} days left` : 'Due today'}
              </p>
            )}
            {isOverdue && (
              <p className="text-xs text-red-400 mt-0.5">
                {Math.abs(days)} days overdue
              </p>
            )}
          </div>
        </div>

        {invoice.line_items && invoice.line_items.length > 0 && (
          <div className="pt-2 border-t border-gray-800">
            <p className="text-xs text-gray-400 mb-2">Items</p>
            <div className="space-y-1">
              {invoice.line_items.slice(0, 2).map((item, idx) => (
                <p key={idx} className="text-xs text-gray-300 truncate">
                  {item.description} x {item.quantity}
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

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-gray-700 hover:bg-gray-800 text-white"
            asChild
          >
            <Link href={`/invoices/${invoice.id}`}>
              <Eye className="h-3 w-3 mr-1" />
              View
            </Link>
          </Button>

          {invoice.invoice_pdf && (
            <Button
              variant="outline"
              size="sm"
              className="border-gray-700 hover:bg-gray-800 text-white"
            >
              <Download className="h-3 w-3" />
            </Button>
          )}

          {invoice.status !== 'paid' &&
            invoice.status !== 'cancelled' &&
            invoice.status !== 'void' && (
              <Button
                size="sm"
                className="bg-[#4B6FED] hover:bg-[#3A56D3] text-white"
                asChild
              >
                <Link href={`/invoices/${invoice.id}`}>
                  <DollarSign className="h-3 w-3 mr-1" />
                  Pay
                </Link>
              </Button>
            )}
        </div>
      </CardContent>
    </Card>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function InvoicesClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [invoices] = useState<Invoice[]>(mockInvoices);

  const filteredInvoices = useMemo(() => {
    let result = invoices;

    // Apply status filter
    if (activeFilter !== 'all') {
      result = result.filter((inv) => inv.status === activeFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (inv) =>
          inv.number?.toLowerCase().includes(query) ||
          inv.customer_name?.toLowerCase().includes(query) ||
          inv.customer_email?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [invoices, activeFilter, searchQuery]);

  const getStatusCount = (status: FilterStatus) => {
    if (status === 'all') return invoices.length;
    return invoices.filter((inv) => inv.status === status).length;
  };

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 py-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div className="mb-8" variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Invoices</h1>
            <p className="text-gray-400">Manage and track all your invoices</p>
          </div>
          <Button className="bg-[#4B6FED] hover:bg-[#3A56D3] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by invoice number, customer name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const count = getStatusCount(filter.value);
              return (
                <Button
                  key={filter.value}
                  variant={activeFilter === filter.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter(filter.value)}
                  className={cn(
                    activeFilter === filter.value
                      ? 'bg-[#4B6FED] hover:bg-[#3A56D3] text-white'
                      : 'border-gray-700 hover:bg-gray-800 text-gray-300'
                  )}
                >
                  {filter.label}
                  {count > 0 && (
                    <span className="ml-1.5 text-xs opacity-75">({count})</span>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Invoice Grid */}
      {filteredInvoices.length === 0 ? (
        <motion.div className="text-center py-16" variants={itemVariants}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            {searchQuery ? 'No invoices found' : 'No invoices yet'}
          </h3>
          <p className="text-gray-400 mb-6">
            {searchQuery
              ? 'Try adjusting your search or filters'
              : 'Create your first invoice to get started'}
          </p>
          {!searchQuery && (
            <Button className="bg-[#4B6FED] hover:bg-[#3A56D3] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerVariants}
        >
          {filteredInvoices.map((invoice) => (
            <motion.div key={invoice.id} variants={itemVariants}>
              <InvoiceCard invoice={invoice} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Results Summary */}
      {filteredInvoices.length > 0 && (
        <motion.div
          className="mt-8 text-center text-sm text-gray-400"
          variants={itemVariants}
        >
          Showing {filteredInvoices.length} of {invoices.length} invoices
        </motion.div>
      )}
    </motion.div>
  );
}
