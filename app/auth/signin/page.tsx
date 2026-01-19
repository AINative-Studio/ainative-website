import { Metadata } from 'next';
import SignInClient from './SignInClient';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to AI Native Studio to access your dashboard, manage API keys, and build with quantum-enhanced AI tools.',
  robots: {
    index: false, // Don't index auth pages
    follow: false,
  },
};

export default function SignInPage() {
  return <SignInClient />;
}
