'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Error Boundary for Model Detail Page
 *
 * This component catches errors that occur during rendering or data fetching
 * in the model detail page and its children.
 *
 * Common errors:
 * - API fetch failures
 * - Invalid model data
 * - Component rendering errors
 * - Network timeouts
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Model detail page error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
      {/* Icon */}
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>

      {/* Heading */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
        <p className="text-sm text-gray-400 max-w-md">
          An error occurred while loading the model details. Please try again.
        </p>
      </div>

      {/* Error Details (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="max-w-2xl w-full bg-red-500/5 border border-red-500/20 rounded-lg p-4">
          <p className="text-xs font-mono text-red-400 break-all">{error.message}</p>
          {error.digest && (
            <p className="text-xs text-gray-500 mt-2">Error ID: {error.digest}</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button onClick={reset} variant="default" size="sm">
          Try Again
        </Button>
        <Button
          onClick={() => (window.location.href = '/dashboard/ai-settings')}
          variant="outline"
          size="sm"
        >
          Go Back
        </Button>
      </div>

      {/* Help Text */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          If this problem persists,{' '}
          <a
            href="mailto:support@ainative.studio"
            className="text-primary hover:underline"
          >
            contact support
          </a>
        </p>
      </div>
    </div>
  );
}
