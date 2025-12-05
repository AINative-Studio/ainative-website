"use client";

import { ReactNode, useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, Stripe } from "@stripe/stripe-js";

/**
 * Singleton pattern for Stripe instance.
 * Ensures we only load Stripe once across the application.
 */
let stripePromise: Promise<Stripe | null> | null = null;

function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!key || key === "undefined") {
      console.warn("⚠️ Stripe disabled - missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
      return Promise.resolve(null);
    }

    // Log initialization in development
    if (process.env.NODE_ENV === "development") {
      console.log("🔧 Initializing Stripe with key:", key.substring(0, 20) + "...");
    }

    stripePromise = loadStripe(key);
  }
  return stripePromise;
}

/**
 * StripeProvider wraps components that need access to Stripe Elements.
 *
 * This provider:
 * - Lazily loads Stripe.js only when needed
 * - Gracefully handles missing Stripe configuration
 * - Shows loading state during initialization
 *
 * Usage:
 * ```tsx
 * <StripeProvider>
 *   <CheckoutForm />
 * </StripeProvider>
 * ```
 *
 * Note: This should NOT be wrapped around the entire app.
 * Only wrap components that actually need Stripe Elements.
 * For global availability, use StripeElementsProvider in checkout pages.
 */
export function StripeProvider({ children }: { children: ReactNode }) {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const stripeInstance = await getStripe();
        setStripe(stripeInstance);

        if (stripeInstance && process.env.NODE_ENV === "development") {
          console.log("✅ Stripe initialized successfully");
        }
      } catch (err) {
        console.error("❌ Stripe initialization failed:", err);
        setError(err instanceof Error ? err.message : "Failed to load Stripe");
      } finally {
        setLoading(false);
      }
    };

    initializeStripe();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
        <span className="ml-2 text-sm text-muted-foreground">Loading payment provider...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md">
        Payment provider error: {error}
      </div>
    );
  }

  // Render without Elements wrapper if Stripe is not available
  if (!stripe) {
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️ Stripe not available, rendering children without Elements wrapper");
    }
    return <>{children}</>;
  }

  // Wrap children with Stripe Elements
  return <Elements stripe={stripe}>{children}</Elements>;
}

/**
 * Hook to check if Stripe is available.
 * Useful for conditionally rendering payment-related UI.
 */
export function useStripeAvailable(): boolean {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    const checkStripe = async () => {
      const stripe = await getStripe();
      setAvailable(stripe !== null);
    };
    checkStripe();
  }, []);

  return available;
}

/**
 * Re-export Stripe hooks for convenience.
 * Components using these must be wrapped in StripeProvider.
 */
export {
  useStripe,
  useElements,
  CardElement,
  PaymentElement,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
