'use client';

import { useState } from 'react';
import { Invoice, invoiceService } from '@/services/invoiceService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe (publishable key from environment variable)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export interface PaymentFormProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface PaymentFormContentProps {
  invoice: Invoice;
  clientSecret: string;
  onSuccess?: () => void;
  onCancel: () => void;
}

function PaymentFormContent({ invoice, clientSecret, onSuccess, onCancel }: PaymentFormContentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const formatAmount = (amountInCents: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amountInCents / 100);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/billing?payment=success`,
        },
        redirect: 'if_required',
      });

      if (submitError) {
        setError(submitError.message || 'Payment failed');
        toast.error(submitError.message || 'Payment failed');
      } else {
        setSuccess(true);
        toast.success('Payment successful!');
        setTimeout(() => {
          onSuccess?.();
        }, 2000);
      }
    } catch (err: unknown) {
      console.error('Payment error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error('Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="py-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Payment Successful!</h3>
        <p className="text-gray-400 mb-6">Your invoice has been paid successfully.</p>
        <p className="text-sm text-gray-500">Redirecting...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Summary */}
      <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400">Invoice</span>
          <span className="text-white font-medium">{invoice.number}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Amount to Pay</span>
          <span className="text-2xl font-bold text-white">
            {formatAmount(invoice.amount_total, invoice.currency)}
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-500">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Payment Element */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-white">Payment Details</label>
        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
          <PaymentElement
            options={{
              layout: 'tabs',
              paymentMethodOrder: ['card'],
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
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
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay {formatAmount(invoice.amount_total, invoice.currency)}
            </>
          )}
        </Button>
      </div>

      {/* Security Notice */}
      <p className="text-xs text-gray-500 text-center">
        Your payment is secured by Stripe. We never store your card details.
      </p>
    </form>
  );
}

export function PaymentForm({ invoice, open, onOpenChange, onSuccess }: PaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load payment intent when modal opens
  const handleOpenChange = async (isOpen: boolean) => {
    if (isOpen && invoice && !clientSecret) {
      setLoading(true);
      setError(null);

      try {
        const paymentIntent = await invoiceService.createMyInvoicePaymentIntent(invoice.id);
        if (paymentIntent) {
          setClientSecret(paymentIntent.client_secret);
        }
      } catch (err: unknown) {
        console.error('Failed to create payment intent:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize payment';
        setError(errorMessage);
        toast.error('Failed to initialize payment');
      } finally {
        setLoading(false);
      }
    }

    // Reset state when closing
    if (!isOpen) {
      setClientSecret(null);
      setError(null);
    }

    onOpenChange(isOpen);
  };

  const handleSuccess = () => {
    setClientSecret(null);
    onOpenChange(false);
    onSuccess?.();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!invoice) return null;

  const formatAmount = (amountInCents: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amountInCents / 100);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg bg-[#161B22] border-gray-800 text-white">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <CreditCard className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">Pay Invoice</DialogTitle>
              <DialogDescription className="text-gray-400">
                Complete payment for {invoice.number}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6">
          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500 mb-4" />
              <p className="text-gray-400">Initializing payment...</p>
            </div>
          ) : error ? (
            <div className="py-8">
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-500 mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 border-gray-700 hover:bg-gray-800 text-white"
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleOpenChange(true)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : clientSecret ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'night',
                  variables: {
                    colorPrimary: '#3b82f6',
                    colorBackground: '#0d1117',
                    colorText: '#ffffff',
                    colorDanger: '#ef4444',
                    fontFamily: 'system-ui, sans-serif',
                    spacingUnit: '4px',
                    borderRadius: '8px',
                  },
                },
              }}
            >
              <PaymentFormContent
                invoice={invoice}
                clientSecret={clientSecret}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            </Elements>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
