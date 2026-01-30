/**
 * Notification Service - Backend integration for Notification Center
 * Integrates with all backend notification endpoints
 * Refs #436
 */

import apiClient from './api-client';

// Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'update' | 'promotion';
  category: 'system' | 'billing' | 'security' | 'feature' | 'marketing';
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  readAt?: string;
}

export interface NotificationPreferences {
  email: {
    enabled: boolean;
    system: boolean;
    billing: boolean;
    security: boolean;
    feature: boolean;
    marketing: boolean;
  };
  inApp: {
    enabled: boolean;
    system: boolean;
    billing: boolean;
    security: boolean;
    feature: boolean;
    marketing: boolean;
  };
  push: {
    enabled: boolean;
    system: boolean;
    billing: boolean;
    security: boolean;
    feature: boolean;
    marketing: boolean;
  };
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
}

// Custom Error Classes for proper error handling
export class NotificationServiceError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly statusCode?: number,
        public readonly originalError?: unknown
    ) {
        super(message);
        this.name = 'NotificationServiceError';
    }
}

export class NotificationNotFoundError extends NotificationServiceError {
    constructor(id: string) {
        super(`Notification with id '${id}' not found`, 'NOTIFICATION_NOT_FOUND', 404);
        this.name = 'NotificationNotFoundError';
    }
}

export class NotificationNetworkError extends NotificationServiceError {
    constructor(operation: string, originalError?: unknown) {
        super(
            `Network error during ${operation}. Please check your connection and try again.`,
            'NETWORK_ERROR',
            undefined,
            originalError
        );
        this.name = 'NotificationNetworkError';
    }
}

// Helper to check if we're in development mode with mock enabled
const isDevMockEnabled = (): boolean => {
    return process.env.NODE_ENV === 'development' &&
           process.env.NEXT_PUBLIC_USE_MOCK_NOTIFICATIONS === 'true';
};

// Development-only mock data generator (only used when explicitly enabled)
function generateDevMockNotifications(): Notification[] {
    if (!isDevMockEnabled()) {
        return [];
    }

    const now = new Date();
    return [
        {
            id: 'dev-1',
            title: '[DEV] Welcome to AI Native Studio',
            message: 'Your account has been successfully created. Start building with AI-native tools.',
            type: 'success',
            category: 'system',
            read: false,
            actionUrl: '/getting-started',
            actionLabel: 'Get Started',
            createdAt: new Date(now.getTime() - 5 * 60000).toISOString(),
        },
        {
            id: 'dev-2',
            title: '[DEV] QNN Training Complete',
            message: 'Your quantum neural network training job has completed successfully with 94% accuracy.',
            type: 'success',
            category: 'feature',
            read: false,
            actionUrl: '/products/qnn',
            actionLabel: 'View Results',
            createdAt: new Date(now.getTime() - 30 * 60000).toISOString(),
        },
        {
            id: 'dev-3',
            title: '[DEV] Security Alert',
            message: 'New login detected from Chrome on Linux. If this was not you, please secure your account.',
            type: 'warning',
            category: 'security',
            read: false,
            actionUrl: '/settings/security',
            actionLabel: 'Review Activity',
            createdAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
        },
        {
            id: 'dev-4',
            title: '[DEV] Invoice Available',
            message: 'Your monthly invoice for $49.99 is now available for download.',
            type: 'info',
            category: 'billing',
            read: true,
            actionUrl: '/billing',
            actionLabel: 'View Invoice',
            createdAt: new Date(now.getTime() - 24 * 3600000).toISOString(),
            readAt: new Date(now.getTime() - 22 * 3600000).toISOString(),
        },
    ];
}

// Default notification preferences
const DEFAULT_PREFERENCES: NotificationPreferences = {
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

// Notification Service
const notificationService = {
    /**
     * Get list of notifications with optional filtering
     * @throws {NotificationNetworkError} When API call fails
     */
    async getNotifications(filter?: 'all' | 'unread' | 'read'): Promise<Notification[]> {
        // Development mock mode - only when explicitly enabled
        if (isDevMockEnabled()) {
            console.info('[DEV] Using mock notifications data');
            const mockNotifications = generateDevMockNotifications();
            if (filter === 'unread') {
                return mockNotifications.filter(n => !n.read);
            } else if (filter === 'read') {
                return mockNotifications.filter(n => n.read);
            }
            return mockNotifications;
        }

        try {
            const params = filter ? `?filter=${filter}` : '';
            const response = await apiClient.get<{ notifications: Notification[] }>(`/v1/notifications${params}`);
            return response.data.notifications || [];
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            throw new NotificationNetworkError('fetching notifications', error);
        }
    },

    /**
     * Get a specific notification by ID
     * @throws {NotificationNotFoundError} When notification doesn't exist
     * @throws {NotificationNetworkError} When API call fails
     */
    async getNotification(id: string): Promise<Notification> {
        // Development mock mode
        if (isDevMockEnabled()) {
            const mockNotifications = generateDevMockNotifications();
            const notification = mockNotifications.find(n => n.id === id);
            if (!notification) {
                throw new NotificationNotFoundError(id);
            }
            return notification;
        }

        try {
            const response = await apiClient.get<Notification>(`/v1/notifications/${id}`);
            return response.data;
        } catch (error) {
            // Check if it's a 404 error
            if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
                throw new NotificationNotFoundError(id);
            }
            console.error(`Failed to fetch notification ${id}:`, error);
            throw new NotificationNetworkError('fetching notification', error);
        }
    },

    /**
     * Mark notification as read
     * @throws {NotificationNotFoundError} When notification doesn't exist
     * @throws {NotificationNetworkError} When API call fails
     */
    async markAsRead(id: string): Promise<Notification> {
        // Development mock mode
        if (isDevMockEnabled()) {
            const mockNotifications = generateDevMockNotifications();
            const notification = mockNotifications.find(n => n.id === id);
            if (!notification) {
                throw new NotificationNotFoundError(id);
            }
            return {
                ...notification,
                read: true,
                readAt: new Date().toISOString(),
            };
        }

        try {
            const response = await apiClient.put<Notification>(`/v1/notifications/${id}/read`);
            return response.data;
        } catch (error) {
            if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
                throw new NotificationNotFoundError(id);
            }
            console.error(`Failed to mark notification ${id} as read:`, error);
            throw new NotificationNetworkError('marking notification as read', error);
        }
    },

    /**
     * Mark notification as unread
     * @throws {NotificationNotFoundError} When notification doesn't exist
     * @throws {NotificationNetworkError} When API call fails
     */
    async markAsUnread(id: string): Promise<Notification> {
        // Development mock mode
        if (isDevMockEnabled()) {
            const mockNotifications = generateDevMockNotifications();
            const notification = mockNotifications.find(n => n.id === id);
            if (!notification) {
                throw new NotificationNotFoundError(id);
            }
            return {
                ...notification,
                read: false,
                readAt: undefined,
            };
        }

        try {
            const response = await apiClient.put<Notification>(`/v1/notifications/${id}/unread`);
            return response.data;
        } catch (error) {
            if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
                throw new NotificationNotFoundError(id);
            }
            console.error(`Failed to mark notification ${id} as unread:`, error);
            throw new NotificationNetworkError('marking notification as unread', error);
        }
    },

    /**
     * Delete a notification
     * @throws {NotificationNotFoundError} When notification doesn't exist
     * @throws {NotificationNetworkError} When API call fails
     */
    async deleteNotification(id: string): Promise<void> {
        // Development mock mode - simulate success
        if (isDevMockEnabled()) {
            console.info(`[DEV] Simulating delete for notification ${id}`);
            return;
        }

        try {
            await apiClient.delete(`/v1/notifications/${id}`);
        } catch (error) {
            if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
                throw new NotificationNotFoundError(id);
            }
            console.error(`Failed to delete notification ${id}:`, error);
            throw new NotificationNetworkError('deleting notification', error);
        }
    },

    /**
     * Mark all notifications as read
     * @throws {NotificationNetworkError} When API call fails
     */
    async markAllAsRead(): Promise<{ success: boolean; count: number }> {
        // Development mock mode
        if (isDevMockEnabled()) {
            const mockNotifications = generateDevMockNotifications();
            const unreadCount = mockNotifications.filter(n => !n.read).length;
            return { success: true, count: unreadCount };
        }

        try {
            const response = await apiClient.put<{ success: boolean; count: number }>('/v1/notifications/mark-all-read');
            return response.data;
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
            throw new NotificationNetworkError('marking all notifications as read', error);
        }
    },

    /**
     * Get notification preferences
     * Returns default preferences if API fails (graceful degradation for preferences)
     */
    async getPreferences(): Promise<NotificationPreferences> {
        // Development mock mode
        if (isDevMockEnabled()) {
            return DEFAULT_PREFERENCES;
        }

        try {
            const response = await apiClient.get<NotificationPreferences>('/v1/notifications/preferences');
            return response.data;
        } catch (error) {
            // For preferences, we allow graceful degradation to defaults
            // since this doesn't show fake user data
            console.warn('Failed to fetch preferences, using defaults:', error);
            return DEFAULT_PREFERENCES;
        }
    },

    /**
     * Update notification preferences
     * @throws {NotificationNetworkError} When API call fails
     */
    async updatePreferences(preferences: NotificationPreferences): Promise<NotificationPreferences> {
        // Development mock mode
        if (isDevMockEnabled()) {
            console.info('[DEV] Simulating preferences update');
            return preferences;
        }

        try {
            const response = await apiClient.put<NotificationPreferences>('/v1/notifications/preferences', preferences);
            return response.data;
        } catch (error) {
            console.error('Failed to update preferences:', error);
            throw new NotificationNetworkError('updating preferences', error);
        }
    },

    /**
     * Subscribe to push notifications
     * @throws {NotificationNetworkError} When API call fails
     */
    async subscribeToPush(subscription: PushSubscription): Promise<{ success: boolean; message: string }> {
        // Development mock mode
        if (isDevMockEnabled()) {
            return {
                success: true,
                message: '[DEV] Push notifications enabled (mock)',
            };
        }

        try {
            const response = await apiClient.post<{ success: boolean; message: string }>('/v1/notifications/subscribe', subscription);
            return response.data;
        } catch (error) {
            console.error('Failed to subscribe to push notifications:', error);
            throw new NotificationNetworkError('subscribing to push notifications', error);
        }
    },

    /**
     * Get notification statistics
     * @throws {NotificationNetworkError} When API call fails
     */
    async getStats(): Promise<NotificationStats> {
        // Development mock mode
        if (isDevMockEnabled()) {
            const mockNotifications = generateDevMockNotifications();
            return {
                total: mockNotifications.length,
                unread: mockNotifications.filter(n => !n.read).length,
                byType: mockNotifications.reduce((acc, n) => {
                    acc[n.type] = (acc[n.type] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>),
                byCategory: mockNotifications.reduce((acc, n) => {
                    acc[n.category] = (acc[n.category] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>),
            };
        }

        try {
            const response = await apiClient.get<NotificationStats>('/v1/notifications/stats');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch notification stats:', error);
            throw new NotificationNetworkError('fetching notification statistics', error);
        }
    },
};

export default notificationService;
