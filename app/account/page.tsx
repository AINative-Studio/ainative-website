import { Metadata } from 'next';
import AccountClient from './AccountClient';

export const metadata: Metadata = {
  title: 'Account Settings | AINative Studio',
  description: 'Manage your AINative Studio account settings, view AI metrics, and update your profile information.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountPage() {
  return <AccountClient />;
}
