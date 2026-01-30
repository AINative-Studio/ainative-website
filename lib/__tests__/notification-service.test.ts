import apiClient from '../api-client';
import notificationService, { NotificationAPIError, NotificationServiceError } from '../notification-service';
import { env } from '../env';

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

// Mock the environment configuration
jest.mock('../env', () => ({
  env: {
    NEXT_PUBLIC_ENVIRONMENT: 'production',
    NEXT_PUBLIC_ENABLE_NOTIFICATIONS_API: true,
  },
}));

// Mock console methods to avoid noise in tests
jest.spyOn(console, 'warn').mockImplementation(() => {});

describe('NotificationService', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset to production mode by default
    (env as unknown as { NEXT_PUBLIC_ENVIRONMENT: string }).NEXT_PUBLIC_ENVIRONMENT = 'production';
    (env as unknown as { NEXT_PUBLIC_ENABLE_NOTIFICATIONS_API: boolean }).NEXT_PUBLIC_ENABLE_NOTIFICATIONS_API = true;
  });

  describe('getNotifications', () => {
    it('fetches all notifications successfully', async () => {
      const mockNotifications = {
        notifications: [
          {
            id: '1',
            title: 'Welcome',
            message: 'Welcome to the platform',
            type: 'success' as const,
            category: 'system' as const,
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

    it('throws NotificationAPIError in production on API failure', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(notificationService.getNotifications()).rejects.toThrow(NotificationAPIError);
      await expect(notificationService.getNotifications()).rejects.toThrow('Failed to fetch notifications');
    });

    it('uses mock data in development mode when API is disabled', async () => {
      (env as unknown as { NEXT_PUBLIC_ENVIRONMENT: string }).NEXT_PUBLIC_ENVIRONMENT = 'development';
      (env as unknown as { NEXT_PUBLIC_ENABLE_NOTIFICATIONS_API: boolean }).NEXT_PUBLIC_ENABLE_NOTIFICATIONS_API = false;

      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await notificationService.getNotifications();

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('title');
    });
  });

  describe('getNotification', () => {
    it('fetches notification by ID successfully', async () => {
      const mockNotification = {
        id: '1',
        title: 'Welcome',
        message: 'Welcome to the platform',
        type: 'success' as const,
        category: 'system' as const,
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

    it('throws NotificationAPIError in production on API failure', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Not found'));

      await expect(notificationService.getNotification('invalid-id')).rejects.toThrow(NotificationAPIError);
    });
  });

  describe('markAsRead', () => {
    it('marks notification as read successfully', async () => {
      const mockNotification = {
        id: '1',
        title: 'Welcome',
        message: 'Welcome to the platform',
        type: 'success' as const,
        category: 'system' as const,
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

    it('throws NotificationAPIError in production on API failure', async () => {
      mockApiClient.put.mockRejectedValueOnce(new Error('Network error'));

      await expect(notificationService.markAsRead('1')).rejects.toThrow(NotificationAPIError);
    });
  });

  describe('deleteNotification', () => {
    it('deletes a notification successfully', async () => {
      mockApiClient.delete.mockResolvedValueOnce({
        data: undefined,
        status: 204,
        statusText: 'No Content',
      });

      await notificationService.deleteNotification('1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/v1/notifications/1');
    });

    it('throws NotificationAPIError in production on delete errors', async () => {
      mockApiClient.delete.mockRejectedValueOnce(new Error('Network error'));

      await expect(notificationService.deleteNotification('1')).rejects.toThrow(NotificationAPIError);
    });
  });

  describe('getPreferences', () => {
    it('fetches notification preferences successfully', async () => {
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

    it('throws NotificationAPIError in production on API failure', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(notificationService.getPreferences()).rejects.toThrow(NotificationAPIError);
    });
  });
});
