/**
 * Jest configuration for deployment tests
 *
 * These tests run in Node environment (not jsdom) because they:
 * - Test file system operations
 * - Run CLI commands
 * - Make HTTP requests to deployed services
 * - Don't require browser APIs
 */

module.exports = {
  rootDir: './',
  displayName: 'deployment-tests',

  // Use Node environment for deployment tests
  testEnvironment: 'node',

  // Module name mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/services/(.*)$': '<rootDir>/services/$1',
  },

  // Only run deployment tests
  testMatch: [
    '**/__tests__/deployment/**/*.test.[jt]s?(x)',
  ],

  // No transform - tests are written in simple enough JS/TS
  transform: {},

  // Coverage collection
  collectCoverageFrom: [
    '__tests__/deployment/**/*.ts',
    'scripts/pre-deployment-check.ts',
    'scripts/post-deployment-verify.ts',
  ],

  // Coverage thresholds for deployment tests
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Coverage reporters
  coverageReporters: ['text', 'text-summary', 'lcov', 'html'],

  // Test path ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/e2e/',
    '<rootDir>/coverage/',
  ],

  // Timeout for deployment tests (they may be slower)
  testTimeout: 60000, // 60 seconds

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,

  // Verbose output
  verbose: true,

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

};
