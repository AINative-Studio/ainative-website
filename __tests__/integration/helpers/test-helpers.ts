/**
 * Integration Test Helper Functions
 * Reusable utilities for integration testing
 */

import { mockUser, mockTokens, mockCredits, mockSubscription, mockVideo } from '../setup';

/**
 * Test data generators
 */
export const testDataGenerators = {
  /**
   * Generate mock user data
   */
  generateUser: (overrides?: Partial<typeof mockUser>) => ({
    ...mockUser,
    ...overrides,
  }),

  /**
   * Generate mock authentication tokens
   */
  generateTokens: (overrides?: Partial<typeof mockTokens>) => ({
    ...mockTokens,
    ...overrides,
  }),

  /**
   * Generate mock credit data
   */
  generateCredits: (overrides?: Partial<typeof mockCredits>) => ({
    ...mockCredits,
    ...overrides,
  }),

  /**
   * Generate mock subscription
   */
  generateSubscription: (overrides?: Partial<typeof mockSubscription>) => ({
    ...mockSubscription,
    ...overrides,
  }),

  /**
   * Generate mock video
   */
  generateVideo: (overrides?: Partial<typeof mockVideo>) => ({
    ...mockVideo,
    ...overrides,
  }),

  /**
   * Generate random string
   */
  generateRandomString: (length: number = 10): string => {
    return Math.random().toString(36).substring(2, 2 + length);
  },

  /**
   * Generate random email
   */
  generateRandomEmail: (): string => {
    return `test-${testDataGenerators.generateRandomString()}@example.com`;
  },

  /**
   * Generate timestamp
   */
  generateTimestamp: (daysOffset: number = 0): string => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString();
  },
};

/**
 * Assertion helpers
 */
export const assertionHelpers = {
  /**
   * Assert API response structure
   */
  assertApiResponse: <T>(
    response: unknown,
    expectedKeys: string[]
  ): asserts response is { success: boolean; message: string; data: T } => {
    expect(response).toBeDefined();
    expect(response).toHaveProperty('success');
    expect(response).toHaveProperty('message');

    const typedResponse = response as { success: boolean; message: string; data: T };
    if (typedResponse.success && expectedKeys.length > 0) {
      expectedKeys.forEach(key => {
        expect(typedResponse.data).toHaveProperty(key);
      });
    }
  },

  /**
   * Assert user object structure
   */
  assertUserStructure: (user: unknown): void => {
    expect(user).toBeDefined();
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
    expect(typeof (user as { email: string }).email).toBe('string');
  },

  /**
   * Assert credit balance structure
   */
  assertCreditBalanceStructure: (balance: unknown): void => {
    expect(balance).toBeDefined();
    expect(balance).toHaveProperty('available');
    expect(balance).toHaveProperty('used');
    expect(balance).toHaveProperty('total');
    expect(balance).toHaveProperty('currency');
  },

  /**
   * Assert subscription structure
   */
  assertSubscriptionStructure: (subscription: unknown): void => {
    expect(subscription).toBeDefined();
    expect(subscription).toHaveProperty('id');
    expect(subscription).toHaveProperty('status');
    expect(subscription).toHaveProperty('plan');
  },

  /**
   * Assert video structure
   */
  assertVideoStructure: (video: unknown): void => {
    expect(video).toBeDefined();
    expect(video).toHaveProperty('id');
    expect(video).toHaveProperty('title');
    expect(video).toHaveProperty('url');
    expect(video).toHaveProperty('status');
  },

  /**
   * Assert date is valid and in future
   */
  assertFutureDate: (dateString: string): void => {
    const date = new Date(dateString);
    expect(date.getTime()).toBeGreaterThan(Date.now());
  },

  /**
   * Assert date is valid and in past
   */
  assertPastDate: (dateString: string): void => {
    const date = new Date(dateString);
    expect(date.getTime()).toBeLessThan(Date.now());
  },
};

/**
 * Mock server helpers
 */
export const mockServerHelpers = {
  /**
   * Create mock API response
   */
  createMockResponse: <T>(data: T, success: boolean = true, message: string = 'Success') => ({
    success,
    message,
    data,
  }),

  /**
   * Create mock error response
   */
  createMockError: (message: string = 'Error occurred', code: string = 'ERROR') => ({
    success: false,
    message,
    error: {
      code,
      details: message,
    },
  }),

  /**
   * Simulate API delay
   */
  simulateDelay: async (ms: number = 100): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Simulate network error
   */
  simulateNetworkError: (): never => {
    throw new Error('Network Error: Connection failed');
  },

  /**
   * Simulate timeout error
   */
  simulateTimeoutError: (): never => {
    throw new Error('Timeout Error: Request timed out');
  },
};

/**
 * State management helpers
 */
export const stateHelpers = {
  /**
   * Setup complete authenticated state with all data
   */
  setupCompleteState: () => {
    localStorage.setItem('accessToken', mockTokens.access_token);
    localStorage.setItem('refresh_token', mockTokens.refresh_token);
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('credits', JSON.stringify(mockCredits));
  },

  /**
   * Clear all state
   */
  clearAllState: () => {
    localStorage.clear();
    sessionStorage.clear();
  },

  /**
   * Get current auth state
   */
  getCurrentAuthState: () => ({
    token: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refresh_token'),
    user: localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user')!)
      : null,
  }),

  /**
   * Check if authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('accessToken');
  },
};

/**
 * Validation helpers
 */
export const validationHelpers = {
  /**
   * Validate email format
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate UUID format
   */
  isValidUUID: (uuid: string): boolean => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  /**
   * Validate URL format
   */
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Validate credit amount
   */
  isValidCreditAmount: (amount: number): boolean => {
    return amount >= 0 && Number.isFinite(amount);
  },

  /**
   * Validate date string
   */
  isValidDateString: (dateString: string): boolean => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  },
};

/**
 * Test scenario builders
 */
export const scenarioBuilders = {
  /**
   * Build new user signup scenario
   */
  newUserSignup: () => ({
    email: testDataGenerators.generateRandomEmail(),
    password: 'SecurePassword123!',
    preferred_name: 'Test User',
  }),

  /**
   * Build subscription upgrade scenario
   */
  subscriptionUpgrade: (currentPlan: string, targetPlan: string) => ({
    currentPlan,
    targetPlan,
    expectedBehavior: currentPlan === 'free' ? 'immediate' : 'period_end',
  }),

  /**
   * Build credit purchase scenario
   */
  creditPurchase: (packageId: string, amount: number) => ({
    packageId,
    amount,
    paymentMethodId: 'pm-test-123',
    expectedCreditIncrease: amount,
  }),

  /**
   * Build video upload scenario
   */
  videoUpload: (sizeInMB: number) => ({
    file: {
      name: `test-video-${Date.now()}.mp4`,
      size: sizeInMB * 1024 * 1024,
      type: 'video/mp4',
    },
    expectedProcessingTime: sizeInMB * 10, // rough estimate in seconds
  }),
};

/**
 * Performance testing helpers
 */
export const performanceHelpers = {
  /**
   * Measure operation time
   */
  measureTime: async <T>(operation: () => Promise<T>): Promise<{ result: T; timeMs: number }> => {
    const start = performance.now();
    const result = await operation();
    const end = performance.now();
    return {
      result,
      timeMs: end - start,
    };
  },

  /**
   * Assert operation completes within time limit
   */
  assertCompletesWithin: async <T>(
    operation: () => Promise<T>,
    maxTimeMs: number
  ): Promise<T> => {
    const { result, timeMs } = await performanceHelpers.measureTime(operation);
    expect(timeMs).toBeLessThan(maxTimeMs);
    return result;
  },

  /**
   * Test concurrent operations
   */
  testConcurrent: async <T>(
    operation: () => Promise<T>,
    concurrency: number
  ): Promise<T[]> => {
    const operations = Array.from({ length: concurrency }, () => operation());
    return Promise.all(operations);
  },
};

/**
 * Retry helpers for flaky tests
 */
export const retryHelpers = {
  /**
   * Retry operation with exponential backoff
   */
  retryWithBackoff: async <T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    initialDelayMs: number = 100
  ): Promise<T> => {
    let lastError: Error | undefined;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          await mockServerHelpers.simulateDelay(initialDelayMs * Math.pow(2, i));
        }
      }
    }
    throw lastError;
  },

  /**
   * Poll until condition is met
   */
  pollUntil: async <T>(
    operation: () => Promise<T>,
    condition: (result: T) => boolean,
    maxAttempts: number = 10,
    delayMs: number = 100
  ): Promise<T> => {
    for (let i = 0; i < maxAttempts; i++) {
      const result = await operation();
      if (condition(result)) {
        return result;
      }
      if (i < maxAttempts - 1) {
        await mockServerHelpers.simulateDelay(delayMs);
      }
    }
    throw new Error('Polling timeout: condition not met');
  },
};

/**
 * Debugging helpers
 */
export const debugHelpers = {
  /**
   * Log test context
   */
  logTestContext: (context: string, data?: unknown) => {
    if (process.env.DEBUG_TESTS === 'true') {
      console.log(`[TEST CONTEXT] ${context}`, data ? JSON.stringify(data, null, 2) : '');
    }
  },

  /**
   * Log API request/response
   */
  logApiCall: (method: string, endpoint: string, data?: unknown, response?: unknown) => {
    if (process.env.DEBUG_TESTS === 'true') {
      console.log(`[API ${method}] ${endpoint}`);
      if (data) console.log('[REQUEST]', JSON.stringify(data, null, 2));
      if (response) console.log('[RESPONSE]', JSON.stringify(response, null, 2));
    }
  },

  /**
   * Create test snapshot
   */
  createSnapshot: (name: string, data: unknown) => {
    if (process.env.CREATE_SNAPSHOTS === 'true') {
      console.log(`[SNAPSHOT ${name}]`, JSON.stringify(data, null, 2));
    }
  },
};

/**
 * Export all helpers
 */
export const integrationTestHelpers = {
  ...testDataGenerators,
  ...assertionHelpers,
  ...mockServerHelpers,
  ...stateHelpers,
  ...validationHelpers,
  ...scenarioBuilders,
  ...performanceHelpers,
  ...retryHelpers,
  ...debugHelpers,
};

export default integrationTestHelpers;
