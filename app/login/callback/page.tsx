import { Metadata } from 'next';
import { Suspense } from 'react';
import OAuthCallbackClient from './OAuthCallbackClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Authenticating - AINative Studio',
  description: 'Processing your authentication request',
};

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Authenticating...</p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OAuthCallbackClient />
    </Suspense>
  );
}
