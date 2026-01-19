import * as Sentry from '@sentry/nextjs';

/**
 * Sentry edge runtime configuration
 * This file is loaded automatically by the Sentry Next.js SDK for edge functions
 */

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT || 'development';

Sentry.init({
  dsn: SENTRY_DSN,

  // Set environment
  environment: ENVIRONMENT,

  // Adjust the sample rate in production to reduce noise
  tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,

  // Enable debug mode in development
  debug: ENVIRONMENT === 'development',

  // Configure beforeSend to filter out unwanted events
  beforeSend(event, hint) {
    // Don't send events if DSN is not configured
    if (!SENTRY_DSN) {
      return null;
    }

    return event;
  },
});
