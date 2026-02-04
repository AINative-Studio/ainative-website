import { Metadata } from 'next';
import { Suspense } from 'react';
import SignInClient from './SignInClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to AI Native Studio to access your dashboard, manage API keys, and build with quantum-enhanced AI tools.',
  robots: {
    index: false, // Don't index auth pages
    follow: false,
  },
};

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
      <SignInClient />
    </Suspense>
  );
}
