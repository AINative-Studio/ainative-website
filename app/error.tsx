"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global Error Boundary for the application.
 *
 * This component catches errors in the React component tree and displays
 * a user-friendly error message with options to recover.
 *
 * - In development: Shows detailed error information
 * - In production: Shows generic message with error digest for tracking
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to console (can be replaced with error reporting service)
    console.error("Application error:", error);
  }, [error]);

  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Something went wrong!
        </h1>

        <p className="text-muted-foreground mb-6">
          We apologize for the inconvenience. An unexpected error has occurred.
        </p>

        {/* Show detailed error in development mode */}
        {isDevelopment && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left">
            <p className="text-sm font-mono text-red-600 dark:text-red-400 break-all">
              {error.message}
            </p>
            {error.stack && (
              <pre className="mt-2 text-xs text-red-500 dark:text-red-300 overflow-auto max-h-40">
                {error.stack}
              </pre>
            )}
          </div>
        )}

        {/* Show error digest in production for support reference */}
        {!isDevelopment && error.digest && (
          <p className="text-sm text-muted-foreground mb-6">
            Error ID: <code className="font-mono">{error.digest}</code>
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} variant="default">
            Try again
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
          >
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
