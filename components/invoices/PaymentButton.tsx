'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreditCard, Loader2 } from 'lucide-react';
import { invoiceService } from '@/services/InvoiceService';
import { toast } from 'sonner';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

interface PaymentButtonProps {
  invoiceId: string;
  amount: number;
  currency: string;
  onSuccess?: () => void;
  disabled?: boolean;
}

export function PaymentButton({
  invoiceId,
  amount,
  currency,
  onSuccess,
  disabled = false
}: PaymentButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const handlePaymentClick = async () => {
    setShowDialog(true);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error('Payment system not ready');
      return;
    }

    setProcessing(true);

    try {
      // Create payment intent
      const paymentIntent = await invoiceService.createPaymentIntent(invoiceId);

      if (!paymentIntent) {
        throw new Error('Failed to create payment intent');
      }

      // Get card element
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Confirm payment
      const { error, paymentIntent: confirmedPayment } = await stripe.confirmCardPayment(
        paymentIntent.client_secret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (confirmedPayment?.status === 'succeeded') {
        toast.success('Payment successful!');
        setShowDialog(false);
        onSuccess?.();
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const formatAmount = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  };

  return (
    <>
      <Button
        onClick={handlePaymentClick}
        disabled={disabled}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <CreditCard className="h-4 w-4 mr-2" />
        Pay {formatAmount(amount)}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-[#161B22] border-gray-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Pay Invoice</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter your payment details to complete the transaction
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitPayment} className="space-y-4 mt-4">
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

            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Amount to pay</span>
                <span className="text-xl font-bold text-white">
                  {formatAmount(amount)}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
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
                    Processing...
                  </>
                ) : (
                  <>Pay Now</>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
