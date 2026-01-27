import apiClient from '../api-client';
import notificationService, { isNotificationApiEnabled } from '../notification-service';

// Mock the apiClient
jest.mock('../api-client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: jest.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('NotificationService', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    // Default: API disabled (backend endpoints don't exist)
    process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS = 'false';
  });

  // ===========================================================
  // Feature Flag Tests
  // ===========================================================

  describe('isNotificationApiEnabled', () => {
    it('returns false by default', () => {
      delete process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS;
      expect(isNotificationApiEnabled()).toBe(false);
    });

    it('returns false when explicitly disabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS = 'false';
      expect(isNotificationApiEnabled()).toBe(false);
    });

    it('returns true when enabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS = 'true';
      expect(isNotificationApiEnabled()).toBe(true);
    });
  });

  // ===========================================================
  // Offline Mode (API disabled - default behavior)
  // ===========================================================

  describe('offline mode (API disabled)', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS = 'false';
    });

    describe('getNotifications', () => {
      it('returns mock data without calling API', async () => {
        const result = await notificationService.getNotifications();

        expect(mockApiClient.get).not.toHaveBeenCalled();
        expect(result.length).toBeGreaterThan(0);
        expect(result[0]).toHaveProperty('id');
        expect(result[0]).toHaveProperty('title');
      });

      it('filters unread notifications from mock data', async () => {
        const result = await notificationService.getNotifications('unread');

        expect(mockApiClient.get).not.toHaveBeenCalled();
        result.forEach(notification => {
          expect(notification.read).toBe(false);
        });
      });

      it('filters read notifications from mock data', async () => {
        const result = await notificationService.getNotifications('read');

        expect(mockApiClient.get).not.toHaveBeenCalled();
        result.forEach(notification => {
          expect(notification.read).toBe(true);
        });
      });
    });

    describe('getNotification', () => {
      it('returns notification by ID from mock data', async () => {
        const result = await notificationService.getNotification('1');

        expect(mockApiClient.get).not.toHaveBeenCalled();
        expect(result.id).toBe('1');
        expect(result.title).toBeDefined();
      });

      it('throws for non-existent notification', async () => {
        await expect(notificationService.getNotification('non-existent')).rejects.toThrow('Notification not found');
      });
    });

    describe('markAsRead', () => {
      it('marks notification as read and persists to localStorage', async () => {
        const result = await notificationService.markAsRead('1');

        expect(mockApiClient.put).not.toHaveBeenCalled();
        expect(result.read).toBe(true);
        expect(result.readAt).toBeDefined();

        // Verify localStorage was updated
        expect(localStorageMock.setItem).toHaveBeenCalled();
      });

      it('persists read state across subsequent calls', async () => {
        await notificationService.markAsRead('1');
        const notifications = await notificationService.getNotifications();
        const notification = notifications.find(n => n.id === '1');

        expect(notification?.read).toBe(true);
      });

      it('throws for non-existent notification', async () => {
        await expect(notificationService.markAsRead('non-existent')).rejects.toThrow('Notification not found');
      });
    });

    describe('markAsUnread', () => {
      it('marks notification as unread and persists to localStorage', async () => {
        // First mark as read
        await notificationService.markAsRead('1');
        // Then mark as unread
        const result = await notificationService.markAsUnread('1');

        expect(mockApiClient.put).not.toHaveBeenCalled();
        expect(result.read).toBe(false);
        expect(result.readAt).toBeUndefined();
      });

      it('throws for non-existent notification', async () => {
        await expect(notificationService.markAsUnread('non-existent')).rejects.toThrow('Notification not found');
      });
    });

    describe('deleteNotification', () => {
      it('deletes notification by persisting to localStorage', async () => {
        await notificationService.deleteNotification('1');

        expect(mockApiClient.delete).not.toHaveBeenCalled();

        // Verify it no longer appears
        const notifications = await notificationService.getNotifications();
        const deleted = notifications.find(n => n.id === '1');
        expect(deleted).toBeUndefined();
      });
    });

    describe('markAllAsRead', () => {
      it('marks all notifications as read and persists to localStorage', async () => {
        const result = await notificationService.markAllAsRead();

        expect(mockApiClient.put).not.toHaveBeenCalled();
        expect(result.success).toBe(true);
        expect(result.count).toBeGreaterThan(0);

        // Verify all are now read
        const unread = await notificationService.getNotifications('unread');
        expect(unread.length).toBe(0);
      });
    });

    describe('getPreferences', () => {
      it('returns default preferences without calling API', async () => {
        const result = await notificationService.getPreferences();

        expect(mockApiClient.get).not.toHaveBeenCalled();
        expect(result.email).toBeDefined();
        expect(result.inApp).toBeDefined();
        expect(result.push).toBeDefined();
        expect(result.email.enabled).toBe(true);
        expect(result.push.enabled).toBe(false);
      });

      it('returns stored preferences if available', async () => {
        const customPrefs = {
          email: { enabled: false, system: false, billing: false, security: false, feature: false, marketing: false },
          inApp: { enabled: true, system: true, billing: true, security: true, feature: true, marketing: true },
          push: { enabled: true, system: true, billing: true, security: true, feature: true, marketing: true },
        };
        localStorageMock.setItem('ainative:notification-preferences', JSON.stringify(customPrefs));

        const result = await notificationService.getPreferences();
        expect(result.email.enabled).toBe(false);
        expect(result.push.enabled).toBe(true);
      });
    });

    describe('updatePreferences', () => {
      it('persists preferences to localStorage', async () => {
        const preferences = {
          email: { enabled: true, system: true, billing: true, security: true, feature: false, marketing: false },
          inApp: { enabled: true, system: true, billing: true, security: true, feature: true, marketing: false },
          push: { enabled: true, system: true, billing: false, security: true, feature: false, marketing: false },
        };

        const result = await notificationService.updatePreferences(preferences);

        expect(mockApiClient.put).not.toHaveBeenCalled();
        expect(result).toEqual(preferences);
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'ainative:notification-preferences',
          JSON.stringify(preferences)
        );
      });
    });

    describe('subscribeToPush', () => {
      it('returns failure message when API is disabled', async () => {
        const result = await notificationService.subscribeToPush({
          endpoint: 'https://push.example.com/123',
          keys: { p256dh: 'key123', auth: 'auth123' },
        });

        expect(mockApiClient.post).not.toHaveBeenCalled();
        expect(result.success).toBe(false);
        expect(result.message).toContain('not available');
      });
    });

    describe('getStats', () => {
      it('calculates stats from mock data without calling API', async () => {
        const result = await notificationService.getStats();

        expect(mockApiClient.get).not.toHaveBeenCalled();
        expect(result.total).toBeGreaterThan(0);
        expect(result.unread).toBeGreaterThanOrEqual(0);
        expect(result.byType).toBeDefined();
        expect(result.byCategory).toBeDefined();
      });

      it('reflects local state changes in stats', async () => {
        const statsBefore = await notificationService.getStats();
        const unreadBefore = statsBefore.unread;

        await notificationService.markAsRead('1');
        const statsAfter = await notificationService.getStats();

        // notification '1' starts as unread in mock data
        expect(statsAfter.unread).toBe(unreadBefore - 1);
      });
    });
  });

  // ===========================================================
  // Online Mode (API enabled)
  // ===========================================================

  describe('online mode (API enabled)', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS = 'true';
    });

    describe('getNotifications', () => {
      it('fetches all notifications from API', async () => {
        const mockNotifications = {
          notifications: [
            {
              id: '1',
              title: 'Welcome',
              message: 'Welcome to the platform',
              type: 'success',
              category: 'system',
              read: false,
              createdAt: '2025-12-21T10:00:00Z',
            },
          ],
        };

        mockApiClient.get.mockResolvedValueOnce({
          data: mockNotifications,
          status: 200,
          statusText: 'OK',
        });

        const result = await notificationService.getNotifications();

        expect(mockApiClient.get).toHaveBeenCalledWith('/v1/notifications');
        expect(result).toEqual(mockNotifications.notifications);
      });

      it('fetches filtered notifications from API', async () => {
        const mockNotifications = {
          notifications: [
            {
              id: '1',
              title: 'Unread notification',
              message: 'This is unread',
              type: 'info',
              category: 'system',
              read: false,
              createdAt: '2025-12-21T10:00:00Z',
            },
          ],
        };

        mockApiClient.get.mockResolvedValueOnce({
          data: mockNotifications,
          status: 200,
          statusText: 'OK',
        });

        const result = await notificationService.getNotifications('unread');

        expect(mockApiClient.get).toHaveBeenCalledWith('/v1/notifications?filter=unread');
        expect(result).toEqual(mockNotifications.notifications);
      });

      it('returns empty array when API returns no notifications field', async () => {
        mockApiClient.get.mockResolvedValueOnce({
          data: {},
          status: 200,
          statusText: 'OK',
        });

        const result = await notificationService.getNotifications();
        expect(result).toEqual([]);
      });

      it('falls back to mock data when API fails', async () => {
        mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

        const result = await notificationService.getNotifications();

        expect(result.length).toBeGreaterThan(0);
        expect(result[0]).toHaveProperty('id');
      });
    });

    describe('getNotification', () => {
      it('fetches notification by ID from API', async () => {
        const mockNotification = {
          id: '1',
          title: 'Welcome',
          message: 'Welcome to the platform',
          type: 'success',
          category: 'system',
          read: false,
          createdAt: '2025-12-21T10:00:00Z',
        };

        mockApiClient.get.mockResolvedValueOnce({
          data: mockNotification,
          status: 200,
          statusText: 'OK',
        });

        const result = await notificationService.getNotification('1');

        expect(mockApiClient.get).toHaveBeenCalledWith('/v1/notifications/1');
        expect(result).toEqual(mockNotification);
      });

      it('falls back to mock data on API failure', async () => {
        mockApiClient.get.mockRejectedValueOnce(new Error('Not found'));

        const result = await notificationService.getNotification('1');
        expect(result.id).toBe('1');
      });

      it('throws for non-existent notification when API fails', async () => {
        mockApiClient.get.mockRejectedValueOnce(new Error('Not found'));

        await expect(notificationService.getNotification('invalid-id')).rejects.toThrow('Notification not found');
      });
    });

    describe('markAsRead', () => {
      it('marks notification as read via API', async () => {
        const mockNotification = {
          id: '1',
          title: 'Welcome',
          message: 'Welcome to the platform',
          type: 'success',
          category: 'system',
          read: true,
          readAt: '2025-12-21T12:00:00Z',
          createdAt: '2025-12-21T10:00:00Z',
        };

        mockApiClient.put.mockResolvedValueOnce({
          data: mockNotification,
          status: 200,
          statusText: 'OK',
        });

        const result = await notificationService.markAsRead('1');

        expect(mockApiClient.put).toHaveBeenCalledWith('/v1/notifications/1/read');
        expect(result.read).toBe(true);
        expect(result.readAt).toBeDefined();
      });

      it('falls back to localStorage on API failure', async () => {
        mockApiClient.put.mockRejectedValueOnce(new Error('Network error'));

        const result = await notificationService.markAsRead('1');

        expect(result.read).toBe(true);
        expect(result.readAt).toBeDefined();
      });
    });

    describe('markAsUnread', () => {
      it('marks notification as unread via API', async () => {
        const mockNotification = {
          id: '1',
          title: 'Welcome',
          message: 'Welcome to the platform',
          type: 'success',
          category: 'system',
          read: false,
          createdAt: '2025-12-21T10:00:00Z',
        };

        mockApiClient.put.mockResolvedValueOnce({
          data: mockNotification,
          status: 200,
          statusText: 'OK',
        });

        const result = await notificationService.markAsUnread('1');

        expect(mockApiClient.put).toHaveBeenCalledWith('/v1/notifications/1/unread');
        expect(result.read).toBe(false);
      });

      it('falls back to localStorage on API failure', async () => {
        mockApiClient.put.mockRejectedValueOnce(new Error('Network error'));

        const result = await notificationService.markAsUnread('1');

        expect(result.read).toBe(false);
        expect(result.readAt).toBeUndefined();
      });
    });

    describe('deleteNotification', () => {
      it('deletes a notification via API', async () => {
        mockApiClient.delete.mockResolvedValueOnce({
          data: undefined,
          status: 204,
          statusText: 'No Content',
        });

        await notificationService.deleteNotification('1');

        expect(mockApiClient.delete).toHaveBeenCalledWith('/v1/notifications/1');
      });

      it('falls back to localStorage on API failure', async () => {
        mockApiClient.delete.mockRejectedValueOnce(new Error('Network error'));

        await notificationService.deleteNotification('1');

        // Should not throw, deletion persisted locally
        const notifications = await notificationService.getNotifications();
        const deleted = notifications.find(n => n.id === '1');
        // When API is enabled but fails, it falls through to local fallback
        expect(deleted).toBeUndefined();
      });
    });

    describe('markAllAsRead', () => {
      it('marks all notifications as read via API', async () => {
        mockApiClient.put.mockResolvedValueOnce({
          data: { success: true, count: 5 },
          status: 200,
          statusText: 'OK',
        });

        const result = await notificationService.markAllAsRead();

        expect(mockApiClient.put).toHaveBeenCalledWith('/v1/notifications/mark-all-read');
        expect(result.success).toBe(true);
        expect(result.count).toBe(5);
      });

      it('falls back to localStorage on API failure', async () => {
        mockApiClient.put.mockRejectedValueOnce(new Error('Network error'));

        const result = await notificationService.markAllAsRead();

        expect(result.success).toBe(true);
        expect(result.count).toBeGreaterThanOrEqual(0);
      });
    });

    describe('getPreferences', () => {
      it('fetches preferences from API', async () => {
        const mockPreferences = {
          email: { enabled: true, system: true, billing: true, security: true, feature: true, marketing: false },
          inApp: { enabled: true, system: true, billing: true, security: true, feature: true, marketing: true },
          push: { enabled: false, system: false, billing: false, security: false, feature: false, marketing: false },
        };

        mockApiClient.get.mockResolvedValueOnce({
          data: mockPreferences,
          status: 200,
          statusText: 'OK',
        });

        const result = await notificationService.getPreferences();

        expect(mockApiClient.get).toHaveBeenCalledWith('/v1/notifications/preferences');
        expect(result).toEqual(mockPreferences);
      });

      it('falls back to defaults on API failure', async () => {
        mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

        const result = await notificationService.getPreferences();

        expect(result.email).toBeDefined();
        expect(result.inApp).toBeDefined();
        expect(result.push).toBeDefined();
      });
    });

    describe('updatePreferences', () => {
      it('updates preferences via API', async () => {
        const preferences = {
          email: { enabled: true, system: true, billing: true, security: true, feature: false, marketing: false },
          inApp: { enabled: true, system: true, billing: true, security: true, feature: true, marketing: false },
          push: { enabled: true, system: true, billing: false, security: true, feature: false, marketing: false },
        };

        mockApiClient.put.mockResolvedValueOnce({
          data: preferences,
          status: 200,
          statusText: 'OK',
        });

        const result = await notificationService.updatePreferences(preferences);

        expect(mockApiClient.put).toHaveBeenCalledWith('/v1/notifications/preferences', preferences);
        expect(result).toEqual(preferences);
      });

      it('falls back to localStorage on API failure', async () => {
        const preferences = {
          email: { enabled: true, system: true, billing: true, security: true, feature: false, marketing: false },
          inApp: { enabled: true, system: true, billing: true, security: true, feature: true, marketing: false },
          push: { enabled: false, system: false, billing: false, security: false, feature: false, marketing: false },
        };

        mockApiClient.put.mockRejectedValueOnce(new Error('Network error'));

        const result = await notificationService.updatePreferences(preferences);
        expect(result).toEqual(preferences);
      });
    });

    describe('subscribeToPush', () => {
      it('subscribes to push notifications via API', async () => {
        const subscription = {
          endpoint: 'https://push.example.com/123',
          keys: { p256dh: 'key123', auth: 'auth123' },
        };

        mockApiClient.post.mockResolvedValueOnce({
          data: { success: true, message: 'Push notifications enabled' },
          status: 200,
          statusText: 'OK',
        });

        const result = await notificationService.subscribeToPush(subscription);

        expect(mockApiClient.post).toHaveBeenCalledWith('/v1/notifications/subscribe', subscription);
        expect(result.success).toBe(true);
      });

      it('falls back gracefully on API failure', async () => {
        mockApiClient.post.mockRejectedValueOnce(new Error('Network error'));

        const result = await notificationService.subscribeToPush({
          endpoint: 'https://push.example.com/123',
          keys: { p256dh: 'key123', auth: 'auth123' },
        });

        expect(result.success).toBe(false);
        expect(result.message).toContain('not available');
      });
    });

    describe('getStats', () => {
      it('fetches stats from API', async () => {
        const mockStats = {
          total: 10,
          unread: 5,
          byType: { info: 3, success: 2, warning: 3, error: 2 },
          byCategory: { system: 4, billing: 2, security: 2, feature: 2 },
        };

        mockApiClient.get.mockResolvedValueOnce({
          data: mockStats,
          status: 200,
          statusText: 'OK',
        });

        const result = await notificationService.getStats();

        expect(mockApiClient.get).toHaveBeenCalledWith('/v1/notifications/stats');
        expect(result).toEqual(mockStats);
      });

      it('calculates stats from mock data on API failure', async () => {
        mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

        const result = await notificationService.getStats();

        expect(result.total).toBeGreaterThan(0);
        expect(result.unread).toBeGreaterThanOrEqual(0);
        expect(result.byType).toBeDefined();
        expect(result.byCategory).toBeDefined();
      });
    });
  });

  // ===========================================================
  // isApiEnabled accessor
  // ===========================================================

  describe('isApiEnabled', () => {
    it('exposes feature flag state on the service object', () => {
      process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS = 'false';
      expect(notificationService.isApiEnabled()).toBe(false);

      process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS = 'true';
      expect(notificationService.isApiEnabled()).toBe(true);
    });
  });
});
