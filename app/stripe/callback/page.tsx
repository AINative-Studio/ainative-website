import { Metadata } from 'next';
import { Suspense } from 'react';
import StripeCallbackClient from './StripeCallbackClient';

// Force dynamic rendering for callback pages
export const dynamic = 'force-dynamic';

/**
 * Stripe Connect OAuth Callback Page
 * Server component for SEO and metadata
 */

export const metadata: Metadata = {
  title: 'Connecting Stripe Account',
  description: 'Completing Stripe Connect integration for developer payouts',
  robots: {
    index: false,
    follow: false,
  },
};

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );
}

export default function StripeCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <StripeCallbackClient />
    </Suspense>
  );
}
