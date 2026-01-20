const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

// Integration test specific configuration
const customJestConfig = {
  displayName: 'integration',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/__tests__/integration/**/*.integration.test.[jt]s?(x)',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/e2e/',
    '<rootDir>/__tests__/integration/setup.ts',
    '<rootDir>/__tests__/integration/helpers/',
  ],
  collectCoverageFrom: [
    'services/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/coverage/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageDirectory: '<rootDir>/coverage/integration',
  verbose: true,
  maxWorkers: '50%',
  testTimeout: 30000, // 30 seconds for integration tests
};

module.exports = createJestConfig(customJestConfig);
