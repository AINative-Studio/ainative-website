import { Metadata } from 'next';
import PayoutsClient from './PayoutsClient';

export const metadata: Metadata = {
  title: 'Developer Payouts',
  description:
    'Manage your developer payouts, configure payment methods, view payout history, and manage tax forms for your AINative Studio developer account.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DeveloperPayoutsPage() {
  return <PayoutsClient />;
}
