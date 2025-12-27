/**
 * API Client utility
 * Re-exports from lib/api-client with additional utilities
 */

// Re-export the default apiClient instance
export { default } from '@/lib/api-client';

/**
 * Determines if an error should be logged based on error type
 * Silences expected/handled errors like 401s, network issues, etc.
 */
export function shouldLogError(error: unknown): boolean {
  if (!error) return false;

  // Check for axios-like errors
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;

    // Don't log 401 unauthorized - handled by auth flow
    if (err.status === 401 || (err.response as Record<string, unknown>)?.status === 401) {
      return false;
    }

    // Don't log network errors in development
    if (process.env.NODE_ENV === 'development') {
      if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
        return false;
      }
    }

    // Don't log AbortController cancellations
    if (err.name === 'AbortError' || err.name === 'CanceledError') {
      return false;
    }
  }

  return true;
}

/**
 * Type-safe error message extractor
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;
    if (typeof err.message === 'string') {
      return err.message;
    }
    if (typeof err.error === 'string') {
      return err.error;
    }
  }
  return 'An unknown error occurred';
}
