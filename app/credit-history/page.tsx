import { Metadata } from 'next';
import CreditHistoryClient from './CreditHistoryClient';

export const metadata: Metadata = {
  title: 'Credit History | AINative Studio',
  description: 'View your credit transaction history including purchases, refills, and usage.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CreditHistoryPage() {
  return <CreditHistoryClient />;
}
