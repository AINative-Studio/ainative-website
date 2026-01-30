import { Metadata } from 'next';
import { Suspense } from 'react';
import SignInClient from './SignInClient';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to AI Native Studio to access your dashboard, manage API keys, and build with quantum-enhanced AI tools.',
  robots: {
    index: false, // Don't index auth pages
    follow: false,
  },
};

function SignInFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-vite-bg">
      <div className="animate-pulse">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInClient />
    </Suspense>
  );
}
