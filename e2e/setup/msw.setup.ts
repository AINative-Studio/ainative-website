/**
 * MSW Setup for Playwright E2E Tests
 * 
 * This file provides utilities to enable MSW in Playwright tests.
 * MSW runs in the browser context during E2E tests to intercept network requests.
 */
import { Page } from '@playwright/test';

/**
 * Initialize MSW in the browser context before running tests
 * Call this in beforeEach() or beforeAll() hooks
 * 
 * @example
 * ```ts
 * import { test } from '@playwright/test';
 * import { initializeMSW } from './setup/msw.setup';
 * 
 * test.beforeEach(async ({ page }) => {
 *   await initializeMSW(page);
 * });
 * ```
 */
export async function initializeMSW(page: Page) {
  await page.addInitScript(() => {
    // This script runs before the page loads, enabling MSW
    if (typeof window !== 'undefined') {
      // Check if MSW should be enabled (set via environment or test config)
      (window as any).__MSW_ENABLED__ = true;
    }
  });

  // Navigate to a page that will start the MSW worker
  // The worker will be started by the app initialization code
  await page.goto('/');
  
  // Wait for MSW to be ready
  await page.waitForFunction(() => {
    return (window as any).__MSW_READY__ === true;
  }, { timeout: 5000 }).catch(() => {
    console.warn('MSW did not initialize within timeout. Tests may hit real APIs.');
  });
}

/**
 * Override specific handlers for a test
 * Useful when you need custom responses for specific test scenarios
 * 
 * @example
 * ```ts
 * await overrideMSWHandlers(page, [
 *   {
 *     method: 'GET',
 *     url: '/api/v1/users/me',
 *     response: { id: '123', email: 'custom@test.com' },
 *     status: 200
 *   }
 * ]);
 * ```
 */
export async function overrideMSWHandlers(
  page: Page,
  handlers: Array<{
    method: string;
    url: string;
    response: any;
    status?: number;
  }>
) {
  await page.evaluate((handlersData) => {
    if ((window as any).__MSW_WORKER__) {
      const { http, HttpResponse } = require('msw');
      const newHandlers = handlersData.map(({ method, url, response, status }) => {
        const httpMethod = method.toLowerCase();
        return (http as any)[httpMethod](url, () => {
          return HttpResponse.json(response, { status: status || 200 });
        });
      });
      (window as any).__MSW_WORKER__.use(...newHandlers);
    }
  }, handlers);
}

/**
 * Reset MSW handlers to their initial state
 * Call this in afterEach() to ensure test isolation
 */
export async function resetMSWHandlers(page: Page) {
  await page.evaluate(() => {
    if ((window as any).__MSW_WORKER__) {
      (window as any).__MSW_WORKER__.resetHandlers();
    }
  });
}
