/**
 * MSW Server for Node.js (Jest tests)
 * Intercepts API requests during unit and integration tests
 */
import { setupServer } from 'msw/node';
import { handlers } from './handlers';
import type { RequestHandler } from 'msw';

// Create the server with all handlers
export const server = setupServer(...handlers);

// Export helper to add runtime handlers
export { http, HttpResponse } from 'msw';

/**
 * Setup mock server for tests
 * Call this in beforeAll() to enable request interception
 */
export const setupMockServer = () => {
  server.listen({
    onUnhandledRequest: 'warn',
  });
};

/**
 * Reset all request handlers to their initial state
 * Call this in afterEach() to ensure test isolation
 */
export const resetMockHandlers = () => {
  server.resetHandlers();
};

/**
 * Add additional request handlers at runtime
 * Useful for test-specific endpoint mocking
 */
export const addMockHandlers = (...newHandlers: RequestHandler[]) => {
  server.use(...newHandlers);
};
