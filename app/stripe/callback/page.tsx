import { Metadata } from 'next';
import StripeCallbackClient from './StripeCallbackClient';

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

export default function StripeCallbackPage() {
  return <StripeCallbackClient />;
}
