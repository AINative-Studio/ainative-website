/**
 * Test suite for ConversionTrackingService
 * Verifies correct API endpoint paths for conversion tracking
 */

import apiClient from '@/lib/api-client';

// Mock the API client
jest.mock('@/lib/api-client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock browser APIs
const mockSessionStorage: Record<string, string> = {};
Object.defineProperty(global, 'window', {
  value: {
    location: {
      href: 'https://ainative.studio/pricing',
      search: '',
      pathname: '/pricing',
    },
    sessionStorage: {
      getItem: (key: string) => mockSessionStorage[key] || null,
      setItem: (key: string, value: string) => {
        mockSessionStorage[key] = value;
      },
    },
    localStorage: {
      getItem: () => null,
    },
  },
  writable: true,
});

Object.defineProperty(global, 'document', {
  value: {
    title: 'Test Page',
    referrer: '',
  },
  writable: true,
});

Object.defineProperty(global, 'navigator', {
  value: {
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  },
  writable: true,
});

Object.defineProperty(global, 'sessionStorage', {
  value: {
    getItem: (key: string) => mockSessionStorage[key] || null,
    setItem: (key: string, value: string) => {
      mockSessionStorage[key] = value;
    },
  },
  writable: true,
});

describe('ConversionTrackingService', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockSessionStorage).forEach((key) => delete mockSessionStorage[key]);
  });

  describe('trackEvent', () => {
    it('posts to /v1/events/conversions endpoint', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        data: { success: true },
        status: 200,
        statusText: 'OK',
      });

      // Re-import to get fresh instance
      jest.resetModules();
      const { conversionTracking } = await import('../ConversionTrackingService');

      await conversionTracking.trackEvent({
        event_type: 'page_view',
        event_name: 'Test Page View',
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/v1/events/conversions',
        expect.objectContaining({
          event_type: 'page_view',
          event_name: 'Test Page View',
        })
      );
    });

    it('does not post to old /v1/events/track endpoint', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        data: { success: true },
        status: 200,
        statusText: 'OK',
      });

      jest.resetModules();
      const { conversionTracking } = await import('../ConversionTrackingService');

      await conversionTracking.trackEvent({
        event_type: 'signup',
        event_name: 'User Signup',
      });

      // Verify it was NOT called with the old endpoint
      const callArgs = mockApiClient.post.mock.calls;
      callArgs.forEach((call) => {
        expect(call[0]).not.toBe('/v1/events/track');
      });
    });
  });

  describe('updateFunnel', () => {
    it('posts to /v1/events/reconcile endpoint', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        data: { success: true },
        status: 200,
        statusText: 'OK',
      });

      jest.resetModules();
      const { conversionTracking } = await import('../ConversionTrackingService');

      await conversionTracking.updateFunnel({
        stage: 'visited_pricing',
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/v1/events/reconcile',
        expect.objectContaining({
          stage: 'visited_pricing',
        })
      );
    });

    it('does not post to old /v1/events/funnel endpoint', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        data: { success: true },
        status: 200,
        statusText: 'OK',
      });

      jest.resetModules();
      const { conversionTracking } = await import('../ConversionTrackingService');

      await conversionTracking.updateFunnel({
        stage: 'completed_signup',
        user_id: 'user-123',
      });

      const callArgs = mockApiClient.post.mock.calls;
      callArgs.forEach((call) => {
        expect(call[0]).not.toBe('/v1/events/funnel');
      });
    });
  });
});
