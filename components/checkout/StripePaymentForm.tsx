// src/components/checkout/StripePaymentForm.tsx

'use client';

import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { createPaymentIntent } from '@/api/stripe';

interface StripePaymentFormProps {
  planId: string;
  amount: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function StripePaymentForm({
  planId,
  amount,
  onSuccess,
  onCancel,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [developmentMode, setDevelopmentMode] = useState(false);

  useEffect(() => {
    // Check if we have a valid publishable key for frontend
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    const hasValidPublishableKey = publishableKey && 
      publishableKey !== 'undefined' && 
      publishableKey.startsWith('pk_');
    
    setDevelopmentMode(!hasValidPublishableKey);
    
    if (stripe) {
      setStripeLoaded(true);
    } else {
      const timer = setTimeout(() => {
        if (!stripe && !developmentMode) {
          setError('Payment system is taking longer than expected to load.');
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [stripe, developmentMode]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Development mode simulation
    if (developmentMode) {
      setLoading(true);
      setTimeout(() => {
        toast.success('Development mode: Payment simulation successful!');
        onSuccess?.();
        router.push('/billing/success');
        setLoading(false);
      }, 2000);
      return;
    }

    if (!stripe || !elements) {
      setError('Payment system not ready. Try again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { clientSecret, error: paymentIntentError } = await createPaymentIntent(planId, amount);
      
      if (paymentIntentError) {
        throw new Error(paymentIntentError);
      }
      
      if (!clientSecret) {
        throw new Error('No client secret returned.');
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/billing/success`,
          receipt_email: 'customer@example.com',
        },
        redirect: 'if_required',
      });

      if (confirmError) throw confirmError;
      if (paymentIntent?.status === 'succeeded') {
        toast.success('Payment successful!');
        onSuccess?.();
        router.push('/billing/success');
      } else {
        throw new Error('Payment was not successful');
      }
    } catch (err: unknown) {
      console.error('Payment error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      toast.error('Payment failed', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (!stripeLoaded && !developmentMode) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {developmentMode && (
        <Alert className="border-yellow-500/50 bg-yellow-900/20">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-200">
            <strong>Development Mode:</strong> Real Stripe payments are disabled. 
            Set VITE_STRIPE_PUBLISHABLE_KEY in your .env file to enable live testing.
          </AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          {!developmentMode ? (
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#fff',
                    '::placeholder': { color: '#6B7280' },
                  },
                  invalid: { color: '#EF4444' },
                },
              }}
            />
          ) : (
            <div className="p-4 bg-gray-800 border border-gray-600 rounded-md">
              <p className="text-gray-300 text-sm text-center">
                💳 Development Mode - No actual payment required
              </p>
            </div>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <div className="flex space-x-3 pt-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading} className="w-full">
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Processing...' : 
             developmentMode ? `Simulate Payment $${amount.toFixed(2)}` : 
             `Pay $${amount.toFixed(2)}`}
          </Button>
        </div>
      </form>
    </div>
  );
}
