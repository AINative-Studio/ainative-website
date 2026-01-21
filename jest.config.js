const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFiles: ['<rootDir>/jest.polyfills.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',

  // Module name mapping for better module resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/services/(.*)$': '<rootDir>/services/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
  },

  // Test matching patterns
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],

  // Coverage collection patterns (comprehensive)
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'services/**/*.{js,jsx,ts,tsx}',
    'utils/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/__mocks__/**',
    '!**/e2e/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/dist/**',
    '!**/build/**',
    // Exclude index files that only re-export
    '!**/index.{js,ts,jsx,tsx}',
  ],

  // Coverage thresholds (gradual improvement strategy)
  // Start at 50% to match current goal, will increase over time
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },

  // Coverage reporters for multiple output formats
  coverageReporters: ['text', 'text-summary', 'lcov', 'html', 'json-summary'],

  // Test path ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/e2e/',
    '<rootDir>/coverage/',
    '<rootDir>/dist/',
  ],

  // Transform ignore patterns (for node_modules that need transformation)
  transformIgnorePatterns: [
    '/node_modules/(?!(@radix-ui|@tanstack|axios|msw|@mswjs|until-async|outvariant|strict-event-emitter)/)',
  ],

  // Performance optimizations
  maxWorkers: '50%', // Use 50% of available CPU cores for parallel execution
  testTimeout: 10000, // Increase timeout for complex tests (10 seconds)

  // Clear mocks between tests for better isolation
  clearMocks: true,
  restoreMocks: true,
  resetMocks: false,

  // Verbose output for debugging
  verbose: false, // Set to true for detailed test output

  // Global setup/teardown (if needed)
  // globalSetup: '<rootDir>/jest.global-setup.js',
  // globalTeardown: '<rootDir>/jest.global-teardown.js',
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
