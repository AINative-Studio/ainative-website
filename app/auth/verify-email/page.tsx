import { Metadata } from 'next';
import { Suspense } from 'react';
import VerifyEmailClient from './VerifyEmailClient';

export const metadata: Metadata = {
  title: 'Verify Email',
  description: 'Verify your email address to activate your AINative Studio account.',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Verify Email | AI Native Studio',
    description: 'Verify your email address to activate your AINative Studio account.',
  },
  twitter: {
    title: 'Verify Email | AI Native Studio',
    description: 'Verify your email address to activate your AINative Studio account.',
  },
};

function VerifyEmailFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-vite-bg px-4">
      <div className="max-w-md w-full bg-[#161B22] rounded-2xl border border-[#2D333B]/50 p-8 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-16 w-16 bg-[#1C2128] rounded-full mx-auto" />
          <div className="h-8 bg-[#1C2128] rounded w-3/4 mx-auto" />
          <div className="h-4 bg-[#1C2128] rounded w-full mx-auto" />
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailClient />
    </Suspense>
  );
}
