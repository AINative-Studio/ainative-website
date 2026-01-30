/**
 * Notification Service Tests
 * Refs #436 - Tests for proper error handling without mock fallback
 */

import apiClient from '../api-client';
import notificationService, {
    NotificationNetworkError,
    NotificationNotFoundError,
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

// Mock console methods to avoid noise in tests
jest.spyOn(console, 'warn').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'info').mockImplementation(() => {});

describe('NotificationService', () => {
    const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

    beforeEach(() => {
        jest.clearAllMocks();
        // Ensure mock mode is disabled for tests
        Object.defineProperty(process.env, 'NODE_ENV', {
            value: 'test',
            writable: true,
            configurable: true,
        });
        delete process.env.NEXT_PUBLIC_USE_MOCK_NOTIFICATIONS;
    });

    describe('getNotifications', () => {
        it('fetches all notifications successfully', async () => {
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

        it('throws NotificationNetworkError on API failure', async () => {
            mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

            await expect(notificationService.getNotifications()).rejects.toThrow(NotificationNetworkError);
            await expect(notificationService.getNotifications()).rejects.toThrow(/fetching notifications/);
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

        it('throws NotificationNotFoundError for 404 response', async () => {
            mockApiClient.get.mockRejectedValueOnce({ status: 404 });

            await expect(notificationService.getNotification('invalid-id')).rejects.toThrow(NotificationNotFoundError);
        });

        it('throws NotificationNetworkError on API failure', async () => {
            mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

            await expect(notificationService.getNotification('1')).rejects.toThrow(NotificationNetworkError);
        });
    });

    describe('markAsRead', () => {
        it('marks notification as read successfully', async () => {
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

        it('throws NotificationNotFoundError for 404 response', async () => {
            mockApiClient.put.mockRejectedValueOnce({ status: 404 });

            await expect(notificationService.markAsRead('invalid-id')).rejects.toThrow(NotificationNotFoundError);
        });

        it('throws NotificationNetworkError on API failure', async () => {
            mockApiClient.put.mockRejectedValueOnce(new Error('Network error'));

            await expect(notificationService.markAsRead('1')).rejects.toThrow(NotificationNetworkError);
        });
    });

    describe('markAsUnread', () => {
        it('marks notification as unread successfully', async () => {
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

        it('throws NotificationNotFoundError for 404 response', async () => {
            mockApiClient.put.mockRejectedValueOnce({ status: 404 });

            await expect(notificationService.markAsUnread('invalid-id')).rejects.toThrow(NotificationNotFoundError);
        });

        it('throws NotificationNetworkError on API failure', async () => {
            mockApiClient.put.mockRejectedValueOnce(new Error('Network error'));

            await expect(notificationService.markAsUnread('1')).rejects.toThrow(NotificationNetworkError);
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

        it('throws NotificationNotFoundError for 404 response', async () => {
            mockApiClient.delete.mockRejectedValueOnce({ status: 404 });

            await expect(notificationService.deleteNotification('invalid-id')).rejects.toThrow(NotificationNotFoundError);
        });

        it('throws NotificationNetworkError on API failure', async () => {
            mockApiClient.delete.mockRejectedValueOnce(new Error('Network error'));

            await expect(notificationService.deleteNotification('1')).rejects.toThrow(NotificationNetworkError);
        });
    });

    describe('markAllAsRead', () => {
        it('marks all notifications as read successfully', async () => {
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

        it('throws NotificationNetworkError on API failure', async () => {
            mockApiClient.put.mockRejectedValueOnce(new Error('Network error'));

            await expect(notificationService.markAllAsRead()).rejects.toThrow(NotificationNetworkError);
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

        it('returns defaults on error (graceful degradation allowed for preferences)', async () => {
            mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

            const result = await notificationService.getPreferences();

            // Preferences allow graceful degradation since it's not user-specific data
            expect(result.email).toBeDefined();
            expect(result.inApp).toBeDefined();
            expect(result.push).toBeDefined();
        });
    });

    describe('updatePreferences', () => {
        it('updates notification preferences successfully', async () => {
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

        it('throws NotificationNetworkError on API failure', async () => {
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

            await expect(notificationService.updatePreferences(preferences)).rejects.toThrow(NotificationNetworkError);
        });
    });

    describe('subscribeToPush', () => {
        it('subscribes to push notifications successfully', async () => {
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

        it('throws NotificationNetworkError on API failure', async () => {
            mockApiClient.post.mockRejectedValueOnce(new Error('Network error'));

            await expect(notificationService.subscribeToPush({
                endpoint: 'https://push.example.com/123',
                keys: { p256dh: 'key123', auth: 'auth123' },
            })).rejects.toThrow(NotificationNetworkError);
        });
    });

    describe('getStats', () => {
        it('fetches notification statistics successfully', async () => {
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

        it('throws NotificationNetworkError on API failure', async () => {
            mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

            await expect(notificationService.getStats()).rejects.toThrow(NotificationNetworkError);
        });
    });

    describe('Custom Error Classes', () => {
        it('NotificationServiceError has correct properties', () => {
            const error = new NotificationNetworkError('test operation', new Error('original'));

            expect(error.name).toBe('NotificationNetworkError');
            expect(error.code).toBe('NETWORK_ERROR');
            expect(error.message).toContain('test operation');
            expect(error.originalError).toBeDefined();
        });

        it('NotificationNotFoundError has correct properties', () => {
            const error = new NotificationNotFoundError('test-id');

            expect(error.name).toBe('NotificationNotFoundError');
            expect(error.code).toBe('NOTIFICATION_NOT_FOUND');
            expect(error.statusCode).toBe(404);
            expect(error.message).toContain('test-id');
        });
    });

    describe('Development Mock Mode', () => {
        beforeEach(() => {
            // Enable dev mock mode for these tests
            Object.defineProperty(process.env, 'NODE_ENV', {
                value: 'development',
                writable: true,
                configurable: true,
            });
            process.env.NEXT_PUBLIC_USE_MOCK_NOTIFICATIONS = 'true';
        });

        afterEach(() => {
            Object.defineProperty(process.env, 'NODE_ENV', {
                value: 'test',
                writable: true,
                configurable: true,
            });
            delete process.env.NEXT_PUBLIC_USE_MOCK_NOTIFICATIONS;
        });

        it('returns mock data when dev mock mode is enabled', async () => {
            const result = await notificationService.getNotifications();

            // Should return mock data without calling API
            expect(mockApiClient.get).not.toHaveBeenCalled();
            expect(result.length).toBeGreaterThan(0);
            expect(result[0].title).toContain('[DEV]');
        });

        it('filters mock data for unread', async () => {
            const result = await notificationService.getNotifications('unread');

            result.forEach(notification => {
                expect(notification.read).toBe(false);
            });
        });

        it('returns mock stats in dev mode', async () => {
            const result = await notificationService.getStats();

            expect(mockApiClient.get).not.toHaveBeenCalled();
            expect(result.total).toBeGreaterThan(0);
            expect(result.byType).toBeDefined();
            expect(result.byCategory).toBeDefined();
        });

        it('throws NotificationNotFoundError for invalid mock ID', async () => {
            await expect(notificationService.getNotification('invalid-id')).rejects.toThrow(NotificationNotFoundError);
        });
    });
});
