// jest.setup.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Load global CSS for design tokens
import './app/globals.css';

// MSW (Mock Service Worker) Setup for API Mocking
// Note: MSW has ESM compatibility issues with Jest. Re-enable when resolved.
// import { server, setupMockServer, resetMockHandlers } from './mocks/server';

// // Start the MSW server before all tests
// beforeAll(() => {
//   setupMockServer();
// });

// // Reset handlers after each test to ensure test isolation
// afterEach(() => {
//   resetMockHandlers();
// });

// // Clean up after all tests
// afterAll(() => {
//   server.close();
// });

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

// Mock window.matchMedia (only in jsdom environment)
if (typeof window !== 'undefined') {
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
}

// Mock IntersectionObserver (only in jsdom environment)
class MockIntersectionObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
}

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
}

// Mock ResizeObserver (only in jsdom environment)
class MockResizeObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
}

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: MockResizeObserver,
  });
}

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, initial, animate, whileInView, viewport, transition, variants, ...props }) => (
      <div className={className} {...props}>{children}</div>
    ),
    section: ({ children, className, initial, animate, whileInView, viewport, transition, variants, ...props }) => (
      <section className={className} {...props}>{children}</section>
    ),
    article: ({ children, className, initial, animate, whileInView, viewport, transition, variants, exit, ...props }) => (
      <article className={className} {...props}>{children}</article>
    ),
  },
  AnimatePresence: ({ children, mode }) => <>{children}</>,
}));
