/**
 * Notification Service - Backend integration for Notification Center
 * Integrates with all backend notification endpoints
 *
 * NOTE: Mock fallback behavior is controlled by NEXT_PUBLIC_USE_MOCKS environment variable.
 * In production, API errors will propagate as proper errors with error state.
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

// Service Error class for notification-specific errors
export class NotificationServiceError extends Error {
  constructor(
    message: string,
    public code: string = 'NOTIFICATION_ERROR',
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'NotificationServiceError';
  }
}

// Check if mocks should be used (development only)
const shouldUseMocks = (): boolean => {
  return process.env.NEXT_PUBLIC_USE_MOCKS === 'true';
};

// Mock Data Generator - Only used in development when NEXT_PUBLIC_USE_MOCKS=true
function generateMockNotifications(): Notification[] {
  const now = new Date();
  const notifications: Notification[] = [
    {
      id: '1',
      title: 'Welcome to AI Native Studio',
      message: 'Your account has been successfully created. Start building with AI-native tools.',
      type: 'success',
      category: 'system',
      read: false,
      actionUrl: '/getting-started',
      actionLabel: 'Get Started',
      createdAt: new Date(now.getTime() - 5 * 60000).toISOString(),
    },
    {
      id: '2',
      title: 'QNN Training Complete',
      message: 'Your quantum neural network training job has completed successfully with 94% accuracy.',
      type: 'success',
      category: 'feature',
      read: false,
      actionUrl: '/products/qnn',
      actionLabel: 'View Results',
      createdAt: new Date(now.getTime() - 30 * 60000).toISOString(),
    },
    {
      id: '3',
      title: 'Security Alert',
      message: 'New login detected from Chrome on Linux. If this was not you, please secure your account.',
      type: 'warning',
      category: 'security',
      read: false,
      actionUrl: '/settings/security',
      actionLabel: 'Review Activity',
      createdAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
    },
    {
      id: '4',
      title: 'Invoice Available',
      message: 'Your monthly invoice for $49.99 is now available for download.',
      type: 'info',
      category: 'billing',
      read: true,
      actionUrl: '/billing',
      actionLabel: 'View Invoice',
      createdAt: new Date(now.getTime() - 24 * 3600000).toISOString(),
      readAt: new Date(now.getTime() - 22 * 3600000).toISOString(),
    },
    {
      id: '5',
      title: 'New Feature: Agent Swarm',
      message: 'Check out our new Agent Swarm feature for multi-agent development workflows.',
      type: 'update',
      category: 'feature',
      read: true,
      actionUrl: '/agent-swarm',
      actionLabel: 'Learn More',
      createdAt: new Date(now.getTime() - 3 * 24 * 3600000).toISOString(),
      readAt: new Date(now.getTime() - 2 * 24 * 3600000).toISOString(),
    },
    {
      id: '6',
      title: 'Limited Time Offer',
      message: 'Upgrade to Pro and get 50% off your first 3 months. Offer ends soon!',
      type: 'promotion',
      category: 'marketing',
      read: false,
      actionUrl: '/pricing',
      actionLabel: 'Upgrade Now',
      createdAt: new Date(now.getTime() - 5 * 24 * 3600000).toISOString(),
    },
    {
      id: '7',
      title: 'API Key Expiring Soon',
      message: 'Your API key will expire in 7 days. Rotate your key to maintain access.',
      type: 'warning',
      category: 'security',
      read: false,
      actionUrl: '/settings/api-keys',
      actionLabel: 'Rotate Key',
      createdAt: new Date(now.getTime() - 7 * 24 * 3600000).toISOString(),
    },
    {
      id: '8',
      title: 'System Maintenance Scheduled',
      message: 'Scheduled maintenance on Dec 25, 2025 from 2:00 AM - 4:00 AM UTC. Services may be unavailable.',
      type: 'info',
      category: 'system',
      read: true,
      actionUrl: '/status',
      actionLabel: 'View Status',
      createdAt: new Date(now.getTime() - 10 * 24 * 3600000).toISOString(),
      readAt: new Date(now.getTime() - 9 * 24 * 3600000).toISOString(),
    },
  ];

  return notifications;
}

// Default preferences for development mocks
function getDefaultPreferences(): NotificationPreferences {
  return {
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
}

// Notification Service
const notificationService = {
  /**
   * Get list of notifications with optional filtering
   * @throws NotificationServiceError if API call fails and mocks are disabled
   */
  async getNotifications(filter?: 'all' | 'unread' | 'read'): Promise<Notification[]> {
    try {
      const params = filter ? `?filter=${filter}` : '';
      const response = await apiClient.get<{ notifications: Notification[] }>(`/v1/notifications${params}`);
      return response.data.notifications || [];
    } catch (error) {
      // In development with mocks enabled, return mock data
      if (shouldUseMocks()) {
        console.warn('[DEV] Using mock notifications data');
        const mockNotifications = generateMockNotifications();

        if (filter === 'unread') {
          return mockNotifications.filter(n => !n.read);
        } else if (filter === 'read') {
          return mockNotifications.filter(n => n.read);
        }

        return mockNotifications;
      }

      // In production, throw error to be handled by UI
      console.error('Failed to fetch notifications:', error);
      throw new NotificationServiceError(
        'Failed to fetch notifications',
        'FETCH_NOTIFICATIONS_ERROR',
        error
      );
    }
  },

  /**
   * Get a specific notification by ID
   * @throws NotificationServiceError if API call fails and mocks are disabled
   */
  async getNotification(id: string): Promise<Notification> {
    try {
      const response = await apiClient.get<Notification>(`/v1/notifications/${id}`);
      return response.data;
    } catch (error) {
      // In development with mocks enabled, return mock data
      if (shouldUseMocks()) {
        console.warn('[DEV] Using mock notification data');
        const mockNotifications = generateMockNotifications();
        const notification = mockNotifications.find(n => n.id === id);

        if (!notification) {
          throw new NotificationServiceError('Notification not found', 'NOT_FOUND');
        }

        return notification;
      }

      // In production, throw error
      console.error('Failed to fetch notification:', error);
      throw new NotificationServiceError(
        'Notification not found',
        'FETCH_NOTIFICATION_ERROR',
        error
      );
    }
  },

  /**
   * Mark notification as read
   * @throws NotificationServiceError if API call fails and mocks are disabled
   */
  async markAsRead(id: string): Promise<Notification> {
    try {
      const response = await apiClient.put<Notification>(`/v1/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      // In development with mocks enabled, simulate success
      if (shouldUseMocks()) {
        console.warn('[DEV] Simulating mark as read');
        const mockNotifications = generateMockNotifications();
        const notification = mockNotifications.find(n => n.id === id);

        if (!notification) {
          throw new NotificationServiceError('Notification not found', 'NOT_FOUND');
        }

        return {
          ...notification,
          read: true,
          readAt: new Date().toISOString(),
        };
      }

      // In production, throw error
      console.error('Failed to mark notification as read:', error);
      throw new NotificationServiceError(
        'Failed to mark notification as read',
        'MARK_AS_READ_ERROR',
        error
      );
    }
  },

  /**
   * Mark notification as unread
   * @throws NotificationServiceError if API call fails and mocks are disabled
   */
  async markAsUnread(id: string): Promise<Notification> {
    try {
      const response = await apiClient.put<Notification>(`/v1/notifications/${id}/unread`);
      return response.data;
    } catch (error) {
      // In development with mocks enabled, simulate success
      if (shouldUseMocks()) {
        console.warn('[DEV] Simulating mark as unread');
        const mockNotifications = generateMockNotifications();
        const notification = mockNotifications.find(n => n.id === id);

        if (!notification) {
          throw new NotificationServiceError('Notification not found', 'NOT_FOUND');
        }

        return {
          ...notification,
          read: false,
          readAt: undefined,
        };
      }

      // In production, throw error
      console.error('Failed to mark notification as unread:', error);
      throw new NotificationServiceError(
        'Failed to mark notification as unread',
        'MARK_AS_UNREAD_ERROR',
        error
      );
    }
  },

  /**
   * Delete a notification
   * @throws NotificationServiceError if API call fails and mocks are disabled
   */
  async deleteNotification(id: string): Promise<void> {
    try {
      await apiClient.delete(`/v1/notifications/${id}`);
    } catch (error) {
      // In development with mocks enabled, simulate success
      if (shouldUseMocks()) {
        console.warn('[DEV] Simulating delete notification');
        return;
      }

      // In production, throw error
      console.error('Failed to delete notification:', error);
      throw new NotificationServiceError(
        'Failed to delete notification',
        'DELETE_NOTIFICATION_ERROR',
        error
      );
    }
  },

  /**
   * Mark all notifications as read
   * @throws NotificationServiceError if API call fails and mocks are disabled
   */
  async markAllAsRead(): Promise<{ success: boolean; count: number }> {
    try {
      const response = await apiClient.put<{ success: boolean; count: number }>('/v1/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      // In development with mocks enabled, simulate success
      if (shouldUseMocks()) {
        console.warn('[DEV] Simulating mark all as read');
        const mockNotifications = generateMockNotifications();
        const unreadCount = mockNotifications.filter(n => !n.read).length;

        return {
          success: true,
          count: unreadCount,
        };
      }

      // In production, throw error
      console.error('Failed to mark all as read:', error);
      throw new NotificationServiceError(
        'Failed to mark all notifications as read',
        'MARK_ALL_AS_READ_ERROR',
        error
      );
    }
  },

  /**
   * Get notification preferences
   * @throws NotificationServiceError if API call fails and mocks are disabled
   */
  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const response = await apiClient.get<NotificationPreferences>('/v1/notifications/preferences');
      return response.data;
    } catch (error) {
      // In development with mocks enabled, return default preferences
      if (shouldUseMocks()) {
        console.warn('[DEV] Using default notification preferences');
        return getDefaultPreferences();
      }

      // In production, throw error
      console.error('Failed to fetch preferences:', error);
      throw new NotificationServiceError(
        'Failed to fetch notification preferences',
        'FETCH_PREFERENCES_ERROR',
        error
      );
    }
  },

  /**
   * Update notification preferences
   * @throws NotificationServiceError if API call fails and mocks are disabled
   */
  async updatePreferences(preferences: NotificationPreferences): Promise<NotificationPreferences> {
    try {
      const response = await apiClient.put<NotificationPreferences>('/v1/notifications/preferences', preferences);
      return response.data;
    } catch (error) {
      // In development with mocks enabled, return the preferences (simulating success)
      if (shouldUseMocks()) {
        console.warn('[DEV] Simulating update preferences');
        return preferences;
      }

      // In production, throw error
      console.error('Failed to update preferences:', error);
      throw new NotificationServiceError(
        'Failed to update notification preferences',
        'UPDATE_PREFERENCES_ERROR',
        error
      );
    }
  },

  /**
   * Subscribe to push notifications
   * @throws NotificationServiceError if API call fails and mocks are disabled
   */
  async subscribeToPush(subscription: PushSubscription): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>('/v1/notifications/subscribe', subscription);
      return response.data;
    } catch (error) {
      // In development with mocks enabled, simulate success
      if (shouldUseMocks()) {
        console.warn('[DEV] Simulating push subscription');
        return {
          success: true,
          message: 'Push notifications enabled (mock)',
        };
      }

      // In production, throw error
      console.error('Failed to subscribe to push notifications:', error);
      throw new NotificationServiceError(
        'Failed to subscribe to push notifications',
        'SUBSCRIBE_PUSH_ERROR',
        error
      );
    }
  },

  /**
   * Get notification statistics
   * @throws NotificationServiceError if API call fails and mocks are disabled
   */
  async getStats(): Promise<NotificationStats> {
    try {
      const response = await apiClient.get<NotificationStats>('/v1/notifications/stats');
      return response.data;
    } catch (error) {
      // In development with mocks enabled, calculate stats from mock data
      if (shouldUseMocks()) {
        console.warn('[DEV] Calculating stats from mock data');
        const mockNotifications = generateMockNotifications();

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

      // In production, throw error
      console.error('Failed to fetch stats:', error);
      throw new NotificationServiceError(
        'Failed to fetch notification statistics',
        'FETCH_STATS_ERROR',
        error
      );
    }
  },
};

export default notificationService;

// Export for testing purposes
export { generateMockNotifications, getDefaultPreferences, shouldUseMocks };
