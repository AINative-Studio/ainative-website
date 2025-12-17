import { Metadata } from 'next';
import BillingClient from './BillingClient';

export const metadata: Metadata = {
  title: 'Billing | AINative Studio',
  description: 'Manage your payment methods, view billing history, and track your AINative Studio subscription.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function BillingPage() {
  return <BillingClient />;
}
