import { Metadata } from 'next';
import { Suspense } from 'react';
import LoginClient from './LoginClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to AI Native Studio to access your dashboard, manage API keys, and build with quantum-enhanced AI tools.',
  robots: {
    index: false,
    follow: false,
  },
};

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginClient />
    </Suspense>
  );
}
