'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { InvoiceLineItem } from '@/services/invoiceService';

interface LineItemEditorProps {
  lineItems: InvoiceLineItem[];
  onChange: (items: InvoiceLineItem[]) => void;
  readOnly?: boolean;
}

export function LineItemEditor({ lineItems, onChange, readOnly = false }: LineItemEditorProps) {
  const addLineItem = () => {
    const newItem: InvoiceLineItem = {
      description: '',
      quantity: 1,
      unit_price: 0,
      amount: 0
    };
    onChange([...lineItems, newItem]);
  };

  const removeLineItem = (index: number) => {
    onChange(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof InvoiceLineItem, value: unknown) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-calculate amount when quantity or unit_price changes
    if (field === 'quantity' || field === 'unit_price') {
      const quantity = field === 'quantity' ? value as number : updated[index].quantity;
      const unitPrice = field === 'unit_price' ? value as number : updated[index].unit_price;
      updated[index].amount = quantity * unitPrice;
    }

    onChange(updated);
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

  if (readOnly) {
    return (
      <div className="space-y-4">
        <div className="border border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">Description</th>
                <th className="text-right text-xs font-medium text-gray-400 px-4 py-3 w-24">Qty</th>
                <th className="text-right text-xs font-medium text-gray-400 px-4 py-3 w-32">Unit Price</th>
                <th className="text-right text-xs font-medium text-gray-400 px-4 py-3 w-32">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {lineItems.map((item, index) => (
                <tr key={index} className="hover:bg-gray-900/30">
                  <td className="px-4 py-3 text-sm text-white">{item.description}</td>
                  <td className="px-4 py-3 text-sm text-white text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm text-white text-right">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-white text-right">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-900/50 border-t border-gray-800">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-white text-right">
                  Total
                </td>
                <td className="px-4 py-3 text-sm font-bold text-white text-right">
                  {formatCurrency(calculateTotal())}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-white">Line Items</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addLineItem}
          className="border-gray-700 hover:bg-gray-800 text-white"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Item
        </Button>
      </div>

      <div className="space-y-3">
        {lineItems.map((item, index) => (
          <Card key={index} className="border-gray-800 bg-gray-900/50">
            <CardContent className="pt-4">
              <div className="grid gap-4">
                {/* Description */}
                <div>
                  <Label className="text-gray-300 text-xs mb-1.5">Description</Label>
                  <Textarea
                    value={item.description}
                    onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                    placeholder="Enter item description..."
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 resize-none"
                    rows={2}
                  />
                </div>

                {/* Quantity, Unit Price, Amount */}
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <Label className="text-gray-300 text-xs mb-1.5">Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300 text-xs mb-1.5">Unit Price ($)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={(item.unit_price / 100).toFixed(2)}
                      onChange={(e) => {
                        const dollars = parseFloat(e.target.value) || 0;
                        updateLineItem(index, 'unit_price', Math.round(dollars * 100));
                      }}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300 text-xs mb-1.5">Amount</Label>
                    <div className="flex items-center h-9 px-3 bg-gray-800/50 border border-gray-700 rounded-md text-sm text-gray-400">
                      {formatCurrency(item.amount)}
                    </div>
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeLineItem(index)}
                      className="w-full border-red-800 hover:bg-red-900/20 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Total */}
      <div className="flex justify-end pt-4 border-t border-gray-800">
        <div className="text-right">
          <p className="text-sm text-gray-400 mb-1">Total Amount</p>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(calculateTotal())}
          </p>
        </div>
      </div>
    </div>
  );
}
