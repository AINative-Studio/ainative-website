import { Metadata } from 'next';
import CreditRefillsClient from './CreditRefillsClient';

export const metadata: Metadata = {
  title: 'Credit Refills | AINative Studio',
  description: 'Purchase additional prompt credits for your AI workflows. Credits work across all supported models and never expire.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CreditRefillsPage() {
  return <CreditRefillsClient />;
}
