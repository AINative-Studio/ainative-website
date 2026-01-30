/**
 * Notification Service - Backend integration for Notification Center
 * Integrates with all backend notification endpoints
 */

import apiClient from './api-client';
import { env } from './env';

// Custom Error Classes
export class NotificationAPIError extends Error {
  constructor(message: string, public readonly statusCode?: number, public readonly originalError?: unknown) {
    super(message);
    this.name = 'NotificationAPIError';
  }
}

export class NotificationServiceError extends Error {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message);
    this.name = 'NotificationServiceError';
  }
}

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

// Mock Data Generator (Development Only)
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

// Helper to determine if mock mode is enabled
function isDevMockEnabled(): boolean {
  return env.NEXT_PUBLIC_ENVIRONMENT === 'development' && !env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS_API;
}

// Notification Service
const notificationService = {
  /**
   * Get list of notifications with optional filtering
   */
  async getNotifications(filter?: 'all' | 'unread' | 'read'): Promise<Notification[]> {
    try {
      const params = filter ? `?filter=${filter}` : '';
      const response = await apiClient.get<{ notifications: Notification[] }>(`/v1/notifications${params}`);
      return response.data.notifications || [];
    } catch (error) {
      // Only use mock data in development mode when API is disabled
      if (isDevMockEnabled()) {
        console.warn('[DEV MODE] Failed to fetch notifications from API, using mock data:', error);
        const mockNotifications = generateMockNotifications();

        if (filter === 'unread') {
          return mockNotifications.filter(n => !n.read);
        } else if (filter === 'read') {
          return mockNotifications.filter(n => n.read);
        }

        return mockNotifications;
      }

      // Production mode: throw proper error
      throw new NotificationAPIError(
        'Failed to fetch notifications',
        (error as { status?: number }).status,
        error
      );
    }
  },

  /**
   * Get a specific notification by ID
   */
  async getNotification(id: string): Promise<Notification> {
    try {
      const response = await apiClient.get<Notification>(`/v1/notifications/${id}`);
      return response.data;
    } catch (error) {
      // Only use mock data in development mode when API is disabled
      if (isDevMockEnabled()) {
        console.warn('[DEV MODE] Failed to fetch notification from API, using mock data:', error);
        const mockNotifications = generateMockNotifications();
        const notification = mockNotifications.find(n => n.id === id);

        if (!notification) {
          throw new NotificationServiceError('Notification not found');
        }

        return notification;
      }

      // Production mode: throw proper error
      throw new NotificationAPIError(
        `Failed to fetch notification with id ${id}`,
        (error as { status?: number }).status,
        error
      );
    }
  },

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<Notification> {
    try {
      const response = await apiClient.put<Notification>(`/v1/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      // Only use mock data in development mode when API is disabled
      if (isDevMockEnabled()) {
        console.warn('[DEV MODE] Failed to mark notification as read via API, using mock data:', error);
        const mockNotifications = generateMockNotifications();
        const notification = mockNotifications.find(n => n.id === id);

        if (!notification) {
          throw new NotificationServiceError('Notification not found');
        }

        return {
          ...notification,
          read: true,
          readAt: new Date().toISOString(),
        };
      }

      // Production mode: throw proper error
      throw new NotificationAPIError(
        `Failed to mark notification ${id} as read`,
        (error as { status?: number }).status,
        error
      );
    }
  },

  /**
   * Mark notification as unread
   */
  async markAsUnread(id: string): Promise<Notification> {
    try {
      const response = await apiClient.put<Notification>(`/v1/notifications/${id}/unread`);
      return response.data;
    } catch (error) {
      // Only use mock data in development mode when API is disabled
      if (isDevMockEnabled()) {
        console.warn('[DEV MODE] Failed to mark notification as unread via API, using mock data:', error);
        const mockNotifications = generateMockNotifications();
        const notification = mockNotifications.find(n => n.id === id);

        if (!notification) {
          throw new NotificationServiceError('Notification not found');
        }

        return {
          ...notification,
          read: false,
          readAt: undefined,
        };
      }

      // Production mode: throw proper error
      throw new NotificationAPIError(
        `Failed to mark notification ${id} as unread`,
        (error as { status?: number }).status,
        error
      );
    }
  },

  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<void> {
    try {
      await apiClient.delete(`/v1/notifications/${id}`);
    } catch (error) {
      // Only silently succeed in development mode when API is disabled
      if (isDevMockEnabled()) {
        console.warn('[DEV MODE] Failed to delete notification via API, simulating success:', error);
        return;
      }

      // Production mode: throw proper error
      throw new NotificationAPIError(
        `Failed to delete notification ${id}`,
        (error as { status?: number }).status,
        error
      );
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ success: boolean; count: number }> {
    try {
      const response = await apiClient.put<{ success: boolean; count: number }>('/v1/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      // Only use mock data in development mode when API is disabled
      if (isDevMockEnabled()) {
        console.warn('[DEV MODE] Failed to mark all as read via API, using mock data:', error);
        const mockNotifications = generateMockNotifications();
        const unreadCount = mockNotifications.filter(n => !n.read).length;

        return {
          success: true,
          count: unreadCount,
        };
      }

      // Production mode: throw proper error
      throw new NotificationAPIError(
        'Failed to mark all notifications as read',
        (error as { status?: number }).status,
        error
      );
    }
  },

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const response = await apiClient.get<NotificationPreferences>('/v1/notifications/preferences');
      return response.data;
    } catch (error) {
      // Only use default preferences in development mode when API is disabled
      if (isDevMockEnabled()) {
        console.warn('[DEV MODE] Failed to fetch preferences from API, using defaults:', error);

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

      // Production mode: throw proper error
      throw new NotificationAPIError(
        'Failed to fetch notification preferences',
        (error as { status?: number }).status,
        error
      );
    }
  },

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: NotificationPreferences): Promise<NotificationPreferences> {
    try {
      const response = await apiClient.put<NotificationPreferences>('/v1/notifications/preferences', preferences);
      return response.data;
    } catch (error) {
      // Only simulate success in development mode when API is disabled
      if (isDevMockEnabled()) {
        console.warn('[DEV MODE] Failed to update preferences via API, simulating success:', error);
        return preferences;
      }

      // Production mode: throw proper error
      throw new NotificationAPIError(
        'Failed to update notification preferences',
        (error as { status?: number }).status,
        error
      );
    }
  },

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(subscription: PushSubscription): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>('/v1/notifications/subscribe', subscription);
      return response.data;
    } catch (error) {
      // Only simulate success in development mode when API is disabled
      if (isDevMockEnabled()) {
        console.warn('[DEV MODE] Failed to subscribe to push notifications via API, simulating success:', error);
        return {
          success: true,
          message: 'Push notifications enabled (development mock)',
        };
      }

      // Production mode: throw proper error
      throw new NotificationAPIError(
        'Failed to subscribe to push notifications',
        (error as { status?: number }).status,
        error
      );
    }
  },

  /**
   * Get notification statistics
   */
  async getStats(): Promise<NotificationStats> {
    try {
      const response = await apiClient.get<NotificationStats>('/v1/notifications/stats');
      return response.data;
    } catch (error) {
      // Only calculate from mock data in development mode when API is disabled
      if (isDevMockEnabled()) {
        console.warn('[DEV MODE] Failed to fetch stats from API, calculating from mock data:', error);
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

      // Production mode: throw proper error
      throw new NotificationAPIError(
        'Failed to fetch notification statistics',
        (error as { status?: number }).status,
        error
      );
    }
  },
};

export default notificationService;
