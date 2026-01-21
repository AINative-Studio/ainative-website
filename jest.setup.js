// jest.setup.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// MSW (Mock Service Worker) Setup for API Mocking
// Note: MSW is conditionally loaded to avoid issues with ESM modules in certain test configurations
let server;
let setupMockServer;
let resetMockHandlers;

try {
  const mswServer = require('./mocks/server');
  server = mswServer.server;
  setupMockServer = mswServer.setupMockServer;
  resetMockHandlers = mswServer.resetMockHandlers;
} catch (error) {
  // MSW not available, skip mock server setup
  console.warn('MSW server not loaded:', error.message);
}

// Start the MSW server before all tests
beforeAll(() => {
  if (setupMockServer) {
    setupMockServer();
  }
});

// Reset handlers after each test to ensure test isolation
afterEach(() => {
  if (resetMockHandlers) {
    resetMockHandlers();
  }
});

// Clean up after all tests
afterAll(() => {
  if (server) {
    server.close();
  }
});

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: MockResizeObserver,
});
