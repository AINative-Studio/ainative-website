import { Metadata } from 'next';
import { Suspense } from 'react';
import ErrorClient from './ErrorClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Authentication Error',
  description: 'An error occurred during authentication.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
      <ErrorClient />
    </Suspense>
  );
}
