// src/components/billing/PaymentMethodManager.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreditCard, Plus, Check, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PaymentMethod } from '@/services/billingService';

interface PaymentMethodManagerProps {
  paymentMethods: PaymentMethod[];
  onUpdate?: () => void;
}

export function PaymentMethodManager({ paymentMethods, onUpdate }: PaymentMethodManagerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error('Payment system not ready');
      return;
    }

    setProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!paymentMethod) {
        throw new Error('Failed to create payment method');
      }

      // TODO: Send paymentMethod.id to backend to attach to customer
      // For now, just show success
      toast.success('Payment method added successfully!');
      setShowAddDialog(false);
      onUpdate?.();
    } catch (error) {
      console.error('Payment method error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add payment method');
    } finally {
      setProcessing(false);
    }
  };

  const getBrandIcon = (brand: string) => {
    // You can replace these with actual brand icons
    const brandColors: Record<string, string> = {
      visa: 'text-blue-500',
      mastercard: 'text-orange-500',
      amex: 'text-green-500',
      discover: 'text-purple-500',
    };

    return brandColors[brand.toLowerCase()] || 'text-gray-400';
  };

  return (
    <Card className="border-gray-800 bg-[#161B22]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Payment Methods</CardTitle>
            <CardDescription className="text-gray-400">
              Manage your payment methods for subscriptions and purchases
            </CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-gray-700 hover:bg-gray-800 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#161B22] border-gray-800 text-white">
              <DialogHeader>
                <DialogTitle>Add Payment Method</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Enter your card details to add a new payment method
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddPaymentMethod} className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Card Details
                  </label>
                  <div className="p-3 bg-gray-900 border border-gray-700 rounded-md">
                    <CardElement
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#ffffff',
                            '::placeholder': {
                              color: '#6b7280',
                            },
                          },
                          invalid: {
                            color: '#ef4444',
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
                    disabled={processing}
                    className="flex-1 border-gray-700 hover:bg-gray-800 text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!stripe || processing}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Payment Method'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {paymentMethods.length === 0 ? (
          <div className="text-center py-8 bg-gray-900/50 rounded-lg border border-gray-800">
            <CreditCard className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No payment methods added yet</p>
            <p className="text-gray-500 text-xs mt-1">
              Add a payment method to enable automatic billing
            </p>
          </div>
        ) : (
          paymentMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <CreditCard className={`h-5 w-5 ${getBrandIcon(method.brand)}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium capitalize">
                      {method.brand}
                    </span>
                    <span className="text-gray-400">ending in {method.last4}</span>
                    {method.is_default && (
                      <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Expires {method.exp_month}/{method.exp_year}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {method.is_default ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled
                    className="text-green-400 cursor-not-allowed"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Default
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white hover:bg-gray-800"
                    >
                      Set as Default
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
