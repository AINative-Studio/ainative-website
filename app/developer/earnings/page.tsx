import { Metadata } from 'next';
import EarningsClient from './EarningsClient';

export const metadata: Metadata = {
  title: 'Developer Earnings',
  description: 'Track your developer earnings, revenue breakdown, and payout schedule on AINative',
  openGraph: {
    title: 'Developer Earnings | AINative',
    description: 'Monitor your developer earnings and transaction history',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Developer Earnings | AINative',
    description: 'Monitor your developer earnings and transaction history',
  },
};

export default function DeveloperEarningsPage() {
  return <EarningsClient />;
}
