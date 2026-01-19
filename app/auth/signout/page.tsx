import { Metadata } from 'next';
import SignOutClient from './SignOutClient';

export const metadata: Metadata = {
  title: 'Sign Out',
  description: 'Sign out from AI Native Studio and clear your session across all subdomains.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignOutPage() {
  return <SignOutClient />;
}
