import * as Sentry from '@sentry/nextjs';

/**
 * Sentry client-side configuration
 * This file is loaded automatically by the Sentry Next.js SDK
 */

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT || 'development';

Sentry.init({
  dsn: SENTRY_DSN,

  // Set environment
  environment: ENVIRONMENT,

  // Adjust the sample rate in production to reduce noise
  tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,

  // Capture Replay for 10% of all sessions in production,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,

  // Enable debug mode in development
  debug: ENVIRONMENT === 'development',

  // Ignore common errors that aren't actionable
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    'Non-Error promise rejection captured',
    'Network request failed',
    'Failed to fetch',
  ],

  // Configure integrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Configure beforeSend to filter out unwanted events
  beforeSend(event, hint) {
    // Don't send events if DSN is not configured
    if (!SENTRY_DSN) {
      return null;
    }

    // Filter out localhost errors in development
    if (ENVIRONMENT === 'development' && typeof window !== 'undefined') {
      if (window.location.hostname === 'localhost') {
        return null;
      }
    }

    return event;
  },
});
