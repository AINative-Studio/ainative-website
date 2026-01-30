/**
 * Integration Test Setup
 * Configures test environment and mock server infrastructure
 */

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Base API URL for tests
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.ainative.studio';

// Mock user data
export const mockUser = {
  id: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  preferred_name: 'Tester',
  full_name: 'Test User',
  avatar_url: 'https://example.com/avatar.jpg',
  github_username: 'testuser',
  roles: ['user'],
};

// Mock authentication tokens
export const mockTokens = {
  access_token: 'mock-access-token-123',
  refresh_token: 'mock-refresh-token-456',
  token_type: 'Bearer',
  expires_in: 3600,
};

// Mock subscription data
export const mockSubscription = {
  id: 'sub-123',
  status: 'active' as const,
  current_period_start: '2025-01-01T00:00:00Z',
  current_period_end: '2025-02-01T00:00:00Z',
  cancel_at_period_end: false,
  canceled_at: null,
  ended_at: null,
  trial_start: null,
  trial_end: null,
  plan: {
    id: 'plan-pro',
    name: 'Pro Plan',
    description: 'Professional tier',
    price: 4999,
    currency: 'USD',
    interval: 'month' as const,
    interval_count: 1,
    features: ['Feature 1', 'Feature 2'],
    is_popular: true,
    is_active: true,
  },
  auto_renew: true,
  quantity: 1,
};

// Mock credit data
export const mockCredits = {
  available: 750,
  used: 250,
  total: 1000,
  currency: 'USD',
  next_reset_date: '2025-02-01T00:00:00Z',
};

// Mock payment method
export const mockPaymentMethod = {
  id: 'pm-123',
  type: 'card' as const,
  card: {
    brand: 'visa',
    last4: '4242',
    exp_month: 12,
    exp_year: 2026,
    country: 'US',
  },
  billing_details: {
    email: 'test@example.com',
    name: 'Test User',
  },
  created: 1704067200,
  is_default: true,
};

// Mock video data
export const mockVideo = {
  id: 'video-123',
  title: 'Test Video',
  description: 'A test video',
  duration: 120,
  url: 'https://storage.example.com/video-123.mp4',
  thumbnail: 'https://storage.example.com/video-123-thumb.jpg',
  status: 'ready' as const,
  created_at: '2025-01-01T00:00:00Z',
  user_id: 'test-user-123',
};

// Define MSW request handlers
export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE_URL}/v1/public/auth/login`, () => {
    return HttpResponse.json(
      {
        ...mockTokens,
        user: mockUser,
      },
      { status: 200 }
    );
  }),

  http.post(`${API_BASE_URL}/v1/public/auth/register`, () => {
    return HttpResponse.json(
      {
        success: true,
        message: 'Registration successful',
      },
      { status: 200 }
    );
  }),

  http.get(`${API_BASE_URL}/v1/auth/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ detail: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json(mockUser, { status: 200 });
  }),

  http.post(`${API_BASE_URL}/v1/auth/logout`, () => {
    return HttpResponse.json({ success: true }, { status: 200 });
  }),

  http.post(`${API_BASE_URL}/v1/public/auth/refresh`, () => {
    return HttpResponse.json(mockTokens, { status: 200 });
  }),

  // Subscription endpoints
  http.get(`${API_BASE_URL}/api/v1/subscription`, () => {
    return HttpResponse.json(
      {
        success: true,
        message: 'Success',
        data: { subscription: mockSubscription },
      },
      { status: 200 }
    );
  }),

  http.get(`${API_BASE_URL}/api/v1/subscription/plans`, () => {
    return HttpResponse.json(
      {
        success: true,
        message: 'Success',
        data: { plans: [mockSubscription.plan] },
      },
      { status: 200 }
    );
  }),

  http.post(`${API_BASE_URL}/api/v1/subscription/subscribe`, () => {
    return HttpResponse.json(
      {
        success: true,
        message: 'Subscribed successfully',
        data: { subscription: mockSubscription },
      },
      { status: 200 }
    );
  }),

  // Credit endpoints
  http.get(`${API_BASE_URL}/api/v1/credits/balance`, () => {
    return HttpResponse.json(
      {
        success: true,
        message: 'Success',
        data: { balance: mockCredits },
      },
      { status: 200 }
    );
  }),

  http.get(`${API_BASE_URL}/api/v1/credits`, () => {
    return HttpResponse.json(
      {
        success: true,
        message: 'Success',
        data: {
          base_used: 250,
          base_quota: 750,
          add_on_used: 0,
          add_on_quota: 250,
          next_refresh: '2025-02-01T00:00:00Z',
          period_start: '2025-01-01T00:00:00Z',
        },
      },
      { status: 200 }
    );
  }),

  http.post(`${API_BASE_URL}/api/v1/credits/purchase`, () => {
    return HttpResponse.json(
      {
        success: true,
        message: 'Credits purchased successfully',
        data: { transaction_id: 'txn-123' },
      },
      { status: 200 }
    );
  }),

  http.get(`${API_BASE_URL}/api/v1/credits/transactions`, () => {
    return HttpResponse.json(
      {
        success: true,
        message: 'Success',
        data: {
          transactions: [
            {
              id: 'txn-1',
              amount: 500,
              description: 'Credit purchase',
              type: 'purchase',
              created_at: '2025-01-15T00:00:00Z',
              balance_after: 1000,
            },
            {
              id: 'txn-2',
              amount: -250,
              description: 'API usage',
              type: 'usage',
              created_at: '2025-01-18T00:00:00Z',
              balance_after: 750,
            },
          ],
          total: 2,
        },
      },
      { status: 200 }
    );
  }),

  // Payment endpoints
  http.get(`${API_BASE_URL}/api/v1/subscription/payment-methods`, () => {
    return HttpResponse.json(
      {
        success: true,
        message: 'Success',
        data: { payment_methods: [mockPaymentMethod] },
      },
      { status: 200 }
    );
  }),

  http.post(`${API_BASE_URL}/api/v1/subscription/payment-methods`, () => {
    return HttpResponse.json(
      {
        success: true,
        message: 'Payment method added',
        data: { payment_method: mockPaymentMethod },
      },
      { status: 200 }
    );
  }),

  // Pricing/checkout endpoints
  http.post(`${API_BASE_URL}/v1/public/pricing/checkout`, () => {
    return HttpResponse.json(
      {
        success: true,
        message: 'Checkout session created',
        data: {
          sessionUrl: 'https://checkout.stripe.com/test-session',
          sessionId: 'cs_test_123',
        },
      },
      { status: 200 }
    );
  }),

  // Video endpoints
  http.post(`${API_BASE_URL}/api/v1/videos/upload`, () => {
    return HttpResponse.json(
      {
        success: true,
        message: 'Upload initiated',
        data: {
          uploadUrl: 'https://storage.example.com/upload',
          videoId: 'video-123',
        },
      },
      { status: 200 }
    );
  }),

  http.get(`${API_BASE_URL}/api/v1/videos/:videoId`, () => {
    return HttpResponse.json(
      {
        success: true,
        message: 'Success',
        data: { video: mockVideo },
      },
      { status: 200 }
    );
  }),

  http.get(`${API_BASE_URL}/api/v1/videos/:videoId/status`, () => {
    return HttpResponse.json(
      {
        success: true,
        message: 'Success',
        data: {
          status: 'ready',
          progress: 100,
        },
      },
      { status: 200 }
    );
  }),

  // RLHF endpoints
  http.post(`${API_BASE_URL}/v1/public/:projectId/database/rlhf/interactions`, () => {
    return HttpResponse.json(
      {
        id: 'feedback-123',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }),

  http.get(`${API_BASE_URL}/v1/public/:projectId/database/rlhf/stats`, () => {
    return HttpResponse.json(
      {
        total: 10,
        positive: 8,
        negative: 2,
        positivePercentage: 80,
      },
      { status: 200 }
    );
  }),
];

// Create MSW server
export const server = setupServer(...handlers);

// Test utilities
export const testUtils = {
  /**
   * Set auth token in localStorage
   */
  setAuthToken: (token: string = mockTokens.access_token) => {
    localStorage.setItem('accessToken', token);
  },

  /**
   * Clear auth token from localStorage
   */
  clearAuthToken: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refresh_token');
  },

  /**
   * Set user data in localStorage
   */
  setUserData: (user = mockUser) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  /**
   * Clear user data from localStorage
   */
  clearUserData: () => {
    localStorage.removeItem('user');
  },

  /**
   * Setup authenticated state
   */
  setupAuthenticatedState: () => {
    testUtils.setAuthToken();
    testUtils.setUserData();
  },

  /**
   * Clear all auth state
   */
  clearAuthState: () => {
    testUtils.clearAuthToken();
    testUtils.clearUserData();
  },

  /**
   * Wait for async operations
   */
  waitFor: (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms)),
};

// Setup before/after hooks
export const setupIntegrationTest = () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'warn' });
  });

  beforeEach(() => {
    testUtils.clearAuthState();
  });

  afterEach(() => {
    server.resetHandlers();
    testUtils.clearAuthState();
  });

  afterAll(() => {
    server.close();
  });
};
