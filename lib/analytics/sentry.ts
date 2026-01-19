/**
 * Sentry error tracking verification and utilities
 * Note: Sentry requires @sentry/nextjs package to be installed
 */

export interface SentryVerificationResult {
  sentryExists: boolean;
  clientInitialized: boolean;
  dsn: string | undefined;
  isConfigured: boolean;
  errors: string[];
}

/**
 * Verify that Sentry is properly loaded and configured
 */
export function verifySentry(): SentryVerificationResult {
  const result: SentryVerificationResult = {
    sentryExists: false,
    clientInitialized: false,
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    isConfigured: false,
    errors: [],
  };

  if (typeof window === 'undefined') {
    result.errors.push('Running in server-side context');
    return result;
  }

  try {
    // Check if Sentry client exists on window
    const sentryHub = (window as any).__SENTRY__;
    result.sentryExists = Boolean(sentryHub);

    if (!result.sentryExists) {
      result.errors.push('Sentry not found on window object (package not installed or not initialized)');
    } else {
      // Check if client is initialized
      result.clientInitialized = Boolean(sentryHub.hub);
      if (!result.clientInitialized) {
        result.errors.push('Sentry hub not initialized');
      }
    }

    // Check if DSN is configured
    if (!result.dsn) {
      result.errors.push('NEXT_PUBLIC_SENTRY_DSN environment variable not set');
    }

    result.isConfigured = result.sentryExists && result.clientInitialized && Boolean(result.dsn);

    console.log('[Sentry Verification]', {
      ...result,
      dsn: result.dsn ? '***configured***' : undefined, // Don't log actual DSN
    });
  } catch (error) {
    result.errors.push(`Verification error: ${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}

/**
 * Capture a test message to verify Sentry is working
 * This should only be called from admin/testing contexts
 */
export function captureSentryTestMessage(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const Sentry = (window as any).Sentry;
    if (!Sentry) {
      console.warn('[Sentry] Not available for test message');
      return false;
    }

    if (typeof Sentry.captureMessage === 'function') {
      Sentry.captureMessage('Analytics verification test - Sentry is working', 'info');
      console.log('[Sentry] Test message sent');
      return true;
    } else {
      console.warn('[Sentry] captureMessage function not available');
      return false;
    }
  } catch (error) {
    console.error('[Sentry] Error sending test message:', error);
    return false;
  }
}

/**
 * Capture an exception in Sentry
 */
export function captureSentryException(error: Error, context?: Record<string, any>): void {
  if (typeof window === 'undefined') return;

  try {
    const Sentry = (window as any).Sentry;
    if (!Sentry || typeof Sentry.captureException !== 'function') {
      console.warn('[Sentry] Not available, logging error locally:', error);
      return;
    }

    if (context) {
      Sentry.withScope((scope: any) => {
        Object.entries(context).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
        Sentry.captureException(error);
      });
    } else {
      Sentry.captureException(error);
    }

    console.log('[Sentry] Exception captured:', error.message);
  } catch (err) {
    console.error('[Sentry] Error capturing exception:', err);
  }
}

/**
 * Set user context in Sentry
 */
export function setSentryUser(user: {
  id?: string;
  email?: string;
  username?: string;
  [key: string]: any;
}): void {
  if (typeof window === 'undefined') return;

  try {
    const Sentry = (window as any).Sentry;
    if (!Sentry || typeof Sentry.setUser !== 'function') {
      console.warn('[Sentry] Not available for setting user context');
      return;
    }

    Sentry.setUser(user);
    console.log('[Sentry] User context set');
  } catch (error) {
    console.error('[Sentry] Error setting user context:', error);
  }
}
