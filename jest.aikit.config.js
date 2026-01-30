/**
 * AIKit Component Test Suite Configuration
 *
 * Specialized Jest configuration for AIKit components
 * Ensures 80%+ coverage and strict TDD compliance
 */

const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const aiKitConfig = {
  displayName: 'AIKit Components',
  setupFiles: ['<rootDir>/jest.polyfills.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',

  // Test matching - only AIKit tests
  testMatch: [
    '<rootDir>/components/ui/__tests__/aikit-*.test.tsx',
    '<rootDir>/app/ai-kit/__tests__/*.test.tsx',
  ],

  // Module resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/test/(.*)$': '<rootDir>/test/$1',
  },

  // Coverage configuration - STRICT 80% MINIMUM
  collectCoverageFrom: [
    // AIKit-related components
    'components/ui/button.tsx',
    'components/ui/input.tsx',
    'components/ui/tabs.tsx',
    'components/ui/slider.tsx',
    'components/ui/checkbox.tsx',
    'components/ui/select.tsx',
    'components/ui/separator.tsx',
    'app/ai-kit/AIKitClient.tsx',

    // Exclude test files and config
    '!**/__tests__/**',
    '!**/__mocks__/**',
    '!**/*.test.{ts,tsx}',
    '!**/*.spec.{ts,tsx}',
  ],

  // MANDATORY: 80% coverage threshold
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Per-file thresholds for critical components
    './components/ui/button.tsx': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './components/ui/input.tsx': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './app/ai-kit/AIKitClient.tsx': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },

  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html',
    'json-summary',
    'cobertura', // For CI/CD integration
  ],

  // Coverage directory
  coverageDirectory: '<rootDir>/coverage/aikit',

  // Test timeout
  testTimeout: 10000,

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
  resetMocks: false,

  // Verbose output for TDD workflow
  verbose: true,

  // Transform configuration
  transformIgnorePatterns: [
    '/node_modules/(?!(@radix-ui|@tanstack|framer-motion)/)',
  ],

  // Global setup for TDD workflow
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react',
      },
    },
  },

  // Maximum workers for parallel execution
  maxWorkers: '50%',

  // Bail on first failure in CI
  bail: process.env.CI === 'true',

  // Error on deprecated API usage
  errorOnDeprecated: true,
};

module.exports = createJestConfig(aiKitConfig);
