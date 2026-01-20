/**
 * MSW Browser Worker
 * Intercepts API requests during development and E2E tests in the browser
 */
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Create the worker with all handlers
export const worker = setupWorker(...handlers);

// Export helper to add runtime handlers
export { http, HttpResponse } from 'msw';

/**
 * Start the mock service worker in the browser
 * Call this conditionally based on environment (e.g., development mode with mocking enabled)
 *
 * @example
 * ```ts
 * if (process.env.NEXT_PUBLIC_ENABLE_MOCKING === 'true') {
 *   startMockServiceWorker();
 * }
 * ```
 */
export async function startMockServiceWorker() {
  if (typeof window === 'undefined') {
    throw new Error('startMockServiceWorker can only be called in the browser');
  }

  await worker.start({
    onUnhandledRequest: 'warn',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  });

  console.log('[MSW] Mock Service Worker started');
}
