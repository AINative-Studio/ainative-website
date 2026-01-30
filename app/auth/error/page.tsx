import { Metadata } from 'next';
import { Suspense } from 'react';
import ErrorClient from './ErrorClient';

export const metadata: Metadata = {
  title: 'Authentication Error',
  description: 'An error occurred during authentication.',
  robots: {
    index: false,
    follow: false,
  },
};

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-vite-bg px-4">
      <div className="text-center text-gray-400">Loading...</div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ErrorClient />
    </Suspense>
  );
}
