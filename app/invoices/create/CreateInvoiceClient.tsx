'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LineItemEditor } from '@/components/invoices/LineItemEditor';
import { invoiceService, InvoiceLineItem, InvoiceCreateData } from '@/services/InvoiceService';
import { ArrowLeft, Save, Send, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CreateInvoiceClient() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  const [customerId, setCustomerId] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    {
      description: '',
      quantity: 1,
      unit_price: 0,
      amount: 0
    }
  ]);

  // Set default due date to 30 days from now
  useState(() => {
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 30);
    setDueDate(defaultDueDate.toISOString().split('T')[0]);
  });

  const handleSaveDraft = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const data: InvoiceCreateData = {
        customer_id: customerId || customerEmail,
        line_items: lineItems,
        due_date: dueDate,
        metadata: {
          customer_email: customerEmail
        }
      };

      const invoice = await invoiceService.create(data);

      if (invoice) {
        toast.success('Invoice draft saved successfully');
        router.push(`/invoices/${invoice.id}`);
      }
    } catch (error) {
      console.error('Failed to save draft:', error);
      toast.error('Failed to save invoice draft');
    } finally {
      setSaving(false);
    }
  };

  const handleFinalizeAndSend = async () => {
    if (!validateForm()) return;

    setFinalizing(true);
    try {
      // First create the invoice
      const data: InvoiceCreateData = {
        customer_id: customerId || customerEmail,
        line_items: lineItems,
        due_date: dueDate,
        metadata: {
          customer_email: customerEmail
        }
      };

      const invoice = await invoiceService.create(data);

      if (!invoice) {
        throw new Error('Failed to create invoice');
      }

      // Then finalize it (generates PDF and sends email)
      await invoiceService.finalize(invoice.id);

      toast.success('Invoice created and sent successfully!');
      router.push(`/invoices/${invoice.id}`);
    } catch (error) {
      console.error('Failed to finalize invoice:', error);
      toast.error('Failed to create and send invoice');
    } finally {
      setFinalizing(false);
    }
  };

  const validateForm = (): boolean => {
    if (!customerEmail.trim()) {
      toast.error('Please enter customer email');
      return false;
    }

    if (!dueDate) {
      toast.error('Please select a due date');
      return false;
    }

    if (lineItems.length === 0) {
      toast.error('Please add at least one line item');
      return false;
    }

    const hasEmptyItems = lineItems.some(
      item => !item.description.trim() || item.quantity <= 0 || item.unit_price <= 0
    );

    if (hasEmptyItems) {
      toast.error('Please fill in all line item details');
      return false;
    }

    return true;
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

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

        <h1 className="text-3xl font-bold text-white mb-2">Create Invoice</h1>
        <p className="text-gray-400">
          Create a new invoice and send it to your customer
        </p>
      </div>

      <div className="space-y-6">
        {/* Customer Information */}
        <Card className="border-gray-800 bg-[#161B22]">
          <CardHeader>
            <CardTitle className="text-white">Customer Information</CardTitle>
            <CardDescription className="text-gray-400">
              Who is this invoice for?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-300">Customer ID (optional)</Label>
              <Input
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="Enter customer ID or user UUID"
                className="mt-1.5 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty if customer doesn&apos;t have an account
              </p>
            </div>

            <div>
              <Label className="text-gray-300">Customer Email *</Label>
              <Input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@example.com"
                required
                className="mt-1.5 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>

            <div>
              <Label className="text-gray-300">Due Date *</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="mt-1.5 bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card className="border-gray-800 bg-[#161B22]">
          <CardHeader>
            <CardTitle className="text-white">Line Items</CardTitle>
            <CardDescription className="text-gray-400">
              What are you charging for?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LineItemEditor
              lineItems={lineItems}
              onChange={setLineItems}
            />
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="border-gray-800 bg-[#161B22]">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Amount</p>
                <p className="text-3xl font-bold text-white">
                  {formatCurrency(calculateTotal())}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={saving || finalizing}
                  className="border-gray-700 hover:bg-gray-800 text-white"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Draft
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleFinalizeAndSend}
                  disabled={saving || finalizing}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {finalizing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Finalize & Send
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
