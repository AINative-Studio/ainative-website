/**
 * Stripe API utilities
 */

interface PaymentIntentResponse {
  clientSecret: string | null;
  error: string | null;
}

/**
 * Create a Stripe payment intent
 */
export async function createPaymentIntent(
  planId: string,
  amount: number
): Promise<PaymentIntentResponse> {
  try {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ planId, amount }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    const data = await response.json();
    return {
      clientSecret: data.clientSecret,
      error: null,
    };
  } catch (error) {
    return {
      clientSecret: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
