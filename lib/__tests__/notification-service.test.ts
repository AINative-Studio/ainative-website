import apiClient from '../api-client';
import notificationService, {
  NotificationServiceError,
  generateMockNotifications,
  getDefaultPreferences,
} from '../notification-service';

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

// Mock console.warn and console.error to avoid noise in tests
jest.spyOn(console, 'warn').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('NotificationService', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_USE_MOCKS;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getNotifications', () => {
    it('fetches all notifications', async () => {
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

    it('fetches filtered notifications', async () => {
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

    it('returns empty array when no notifications', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
      });

      const result = await notificationService.getNotifications();

      expect(result).toEqual([]);
    });

    it('throws NotificationServiceError on API failure when mocks disabled', async () => {
      process.env.NEXT_PUBLIC_USE_MOCKS = 'false';
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(notificationService.getNotifications()).rejects.toThrow(NotificationServiceError);
      await expect(notificationService.getNotifications()).rejects.toThrow('Failed to fetch notifications');
    });

    it('falls back to mock data when NEXT_PUBLIC_USE_MOCKS is true', async () => {
      process.env.NEXT_PUBLIC_USE_MOCKS = 'true';
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await notificationService.getNotifications();

      // Should return mock data
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('title');
    });

    it('filters mock data for unread when mocks enabled', async () => {
      process.env.NEXT_PUBLIC_USE_MOCKS = 'true';
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await notificationService.getNotifications('unread');

      result.forEach(notification => {
        expect(notification.read).toBe(false);
      });
    });

    it('filters mock data for read when mocks enabled', async () => {
      process.env.NEXT_PUBLIC_USE_MOCKS = 'true';
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await notificationService.getNotifications('read');

      result.forEach(notification => {
        expect(notification.read).toBe(true);
      });
    });
  });

  describe('getNotification', () => {
    it('fetches notification by ID', async () => {
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

    it('throws NotificationServiceError for API failure when mocks disabled', async () => {
      process.env.NEXT_PUBLIC_USE_MOCKS = 'false';
      mockApiClient.get.mockRejectedValueOnce(new Error('Not found'));

      await expect(notificationService.getNotification('invalid-id')).rejects.toThrow(NotificationServiceError);
    });

    it('throws NotificationServiceError for non-existent notification in mocks', async () => {
      process.env.NEXT_PUBLIC_USE_MOCKS = 'true';
      mockApiClient.get.mockRejectedValueOnce(new Error('Not found'));

      await expect(notificationService.getNotification('invalid-id')).rejects.toThrow('Notification not found');
    });

    it('returns mock notification when mocks enabled and API fails', async () => {
      process.env.NEXT_PUBLIC_USE_MOCKS = 'true';
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await notificationService.getNotification('1');

      expect(result).toHaveProperty('id', '1');
      expect(result).toHaveProperty('title');
    });
  });

  describe('markAsRead', () => {
    it('marks notification as read', async () => {
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

    it('throws NotificationServiceError on API failure when mocks disabled', async () => {
      process.env.NEXT_PUBLIC_USE_MOCKS = 'false';
      mockApiClient.put.mockRejectedValueOnce(new Error('Network error'));

      await expect(notificationService.markAsRead('1')).rejects.toThrow(NotificationServiceError);
      await expect(notificationService.markAsRead('1')).rejects.toThrow('Failed to mark notification as read');
    });

    it('simulates success when mocks enabled and API fails', async () => {
      process.env.NEXT_PUBLIC_USE_MOCKS = 'true';
      mockApiClient.put.mockRejectedValueOnce(new Error('Network error'));

      const result = await notificationService.markAsRead('1');

      expect(result.read).toBe(true);
      expect(result.readAt).toBeDefined();
    });

    it('throws error for invalid notification ID when mocks enabled', async () => {
      process.env.NEXT_PUBLIC_USE_MOCKS = 'true';
      mockApiClient.put.mockRejectedValueOnce(new Error('Network error'));

      await expect(notificationService.markAsRead('invalid-id')).rejects.toThrow('Notification not found');
    });
  });

  describe('markAsUnread', () => {
    it('marks notification as unread', async () => {
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

    it('throws NotificationServiceError on API failure when mocks disabled', async () => {
      process.env.NEXT_PUBLIC_USE_MOCKS = 'false';
      mockApiClient.put.mockRejectedValueOnce(new Error('Network error'));

      await expect(notificationService.markAsUnread('1')).rejects.toThrow(NotificationServiceError);
    });

    it('simulates success when mocks enabled and API fails', async () => {
      process.env.NEXT_PUBLIC_USE_MOCKS = 'true';
      mockApiClient.put.mockRejectedValueOnce(new Error('Network error'));

      const result = await notificationService.markAsUnread('1');

      expect(result.read).toBe(false);
      expect(result.readAt).toBeUndefined();
    });
  });

  describe('deleteNotification', () => {
    it('deletes a notification', async () => {
      mockApiClient.delete.mockResolvedValueOnce({
        data: undefined,
        status: 204,
        statusText: 'No Content',
      });

      await notificationService.deleteNotification('1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/v1/notifications/1');
    });

    it('throws NotificationServiceError on API failure when mocks disabled', async () => {
      process.env.NEXT_PUBLIC_USE_MOCKS = 'false';
      mockApiClient.delete.mockRejectedValueOnce(new Error('Network error'));

      await expect(notificationService.deleteNotification('1')).rejects.toThrow(NotificationServiceError);
    });

    it('simulates success when mocks enabled and API fails', async () => {
      process.env.NEXT_PUBLIC_USE_MOCKS = 'true';
      mockApiClient.delete.mockRejectedValueOnce(new Error('Network error'));

      // Should not throw
      await notificationService.deleteNotification('1');
    });
  });

  describe('markAllAsRead', () => {
    it('marks all notifications as read', async () => {
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

    it('throws NotificationServiceError on API failure when mocks disabled', async () => {
      process.env.NEXT_PUBLIC_USE_MOCKS = 'false';
      mockApiClient.put.mockRejectedValueOnce(new Error('Network error'));

      await expect(notificationService.markAllAsRead()).rejects.toThrow(NotificationServiceError);
    });

    it('simulates success when mocks enabled and API fails', async () => {
      process.env.NEXT_PUBLIC_USE_MOCKS = 'true';
      mockApiClient.put.mockRejectedValueOnce(new Error('Network error'));

      const result = await notificationService.markAllAsRead();

      expect(result.success).toBe(true);
      expect(result.count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getPreferences', () => {
    it('fetches notification preferences', async () => {
      const mockPreferences = {
        email: {
          enabled: true,
          system: true,
          billing: true,
          security: true,
          feature: true,
          marketing: false,
        },
        inApp: {
          enabled: true,
          system: true,
          billing: true,
          security: true,
          feature: true,
          marketing: true,
        },
        push: {
          enabled: false,
          system: false,
          billing: false,
          security: false,
          feature: false,
          marketing: false,
        },
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

    it('throws NotificationServiceError on API failure when mocks disabled', async () => {
      process.env.NEXT_PUBLIC_USE_MOCKS = 'false';
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(notificationService.getPreferences()).rejects.toThrow(NotificationServiceError);
    });

    it('returns default preferences when mocks enabled and API fails', async () => {
      process.env.NEXT_PUBLIC_USE_MOCKS = 'true';
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await notificationService.getPreferences();

      expect(result.email).toBeDefined();
      expect(result.inApp).toBeDefined();
      expect(result.push).toBeDefined();
    });
  });

  describe('updatePreferences', () => {
    it('updates notification preferences', async () => {
      const preferences = {
        email: {
          enabled: true,
          system: true,
          billing: true,
          security: true,
          feature: false,
          marketing: false,
        },
        inApp: {
          enabled: true,
          system: true,
          billing: true,
          security: true,
          feature: true,
          marketing: false,
        },
        push: {
          enabled: true,
          system: true,
          billing: false,
          security: true,
          feature: false,
          marketing: false,
        },
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

    it('throws NotificationServiceError on API failure when mocks disabled', async () => {
      process.env.NEXT_PUBLIC_USE_MOCKS = 'false';
      const preferences = getDefaultPreferences();
      mockApiClient.put.mockRejectedValueOnce(new Error('Network error'));

      await expect(notificationService.updatePreferences(preferences)).rejects.toThrow(NotificationServiceError);
    });

    it('returns preferences as-is when mocks enabled and API fails', async () => {
      process.env.NEXT_PUBLIC_USE_MOCKS = 'true';
      const preferences = {
        email: {
          enabled: true,
          system: true,
          billing: true,
          security: true,
          feature: false,
          marketing: false,
        },
        inApp: {
          enabled: true,
          system: true,
          billing: true,
          security: true,
          feature: true,
          marketing: false,
        },
        push: {
          enabled: false,
          system: false,
          billing: false,
          security: false,
          feature: false,
          marketing: false,
        },
      };

      mockApiClient.put.mockRejectedValueOnce(new Error('Network error'));

      const result = await notificationService.updatePreferences(preferences);

      expect(result).toEqual(preferences);
    });
  });

  describe('subscribeToPush', () => {
    it('subscribes to push notifications', async () => {
      const subscription = {
        endpoint: 'https://push.example.com/123',
        keys: {
          p256dh: 'key123',
          auth: 'auth123',
        },
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

    it('throws NotificationServiceError on API failure when mocks disabled', async () => {
      process.env.NEXT_PUBLIC_USE_MOCKS = 'false';
      mockApiClient.post.mockRejectedValueOnce(new Error('Network error'));

      await expect(notificationService.subscribeToPush({
        endpoint: 'https://push.example.com/123',
        keys: { p256dh: 'key123', auth: 'auth123' },
      })).rejects.toThrow(NotificationServiceError);
    });

    it('simulates success when mocks enabled and API fails', async () => {
      process.env.NEXT_PUBLIC_USE_MOCKS = 'true';
      mockApiClient.post.mockRejectedValueOnce(new Error('Network error'));

      const result = await notificationService.subscribeToPush({
        endpoint: 'https://push.example.com/123',
        keys: { p256dh: 'key123', auth: 'auth123' },
      });

      expect(result.success).toBe(true);
    });
  });

  describe('getStats', () => {
    it('fetches notification statistics', async () => {
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

    it('throws NotificationServiceError on API failure when mocks disabled', async () => {
      process.env.NEXT_PUBLIC_USE_MOCKS = 'false';
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(notificationService.getStats()).rejects.toThrow(NotificationServiceError);
    });

    it('calculates stats from mock data when mocks enabled and API fails', async () => {
      process.env.NEXT_PUBLIC_USE_MOCKS = 'true';
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await notificationService.getStats();

      expect(result.total).toBeGreaterThan(0);
      expect(result.unread).toBeGreaterThanOrEqual(0);
      expect(result.byType).toBeDefined();
      expect(result.byCategory).toBeDefined();
    });
  });

  describe('NotificationServiceError', () => {
    it('creates error with code and original error', () => {
      const originalError = new Error('Original');
      const error = new NotificationServiceError(
        'Test error',
        'TEST_ERROR',
        originalError
      );

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.originalError).toBe(originalError);
      expect(error.name).toBe('NotificationServiceError');
    });

    it('uses default code when not provided', () => {
      const error = new NotificationServiceError('Test error');

      expect(error.code).toBe('NOTIFICATION_ERROR');
    });
  });

  describe('mock data generators', () => {
    it('generates valid mock notifications', () => {
      const mockNotifications = generateMockNotifications();

      expect(mockNotifications.length).toBeGreaterThan(0);
      mockNotifications.forEach(notification => {
        expect(notification).toHaveProperty('id');
        expect(notification).toHaveProperty('title');
        expect(notification).toHaveProperty('message');
        expect(notification).toHaveProperty('type');
        expect(notification).toHaveProperty('category');
        expect(notification).toHaveProperty('read');
        expect(notification).toHaveProperty('createdAt');
      });
    });

    it('generates valid default preferences', () => {
      const preferences = getDefaultPreferences();

      expect(preferences).toHaveProperty('email');
      expect(preferences).toHaveProperty('inApp');
      expect(preferences).toHaveProperty('push');
      expect(preferences.email.enabled).toBe(true);
      expect(preferences.push.enabled).toBe(false);
    });
  });
});
