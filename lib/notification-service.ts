/**
 * Notification Service - Backend integration for Notification Center
 *
 * Since backend notification endpoints are not yet implemented (see #447),
 * this service uses a feature flag (NEXT_PUBLIC_ENABLE_NOTIFICATIONS) to
 * control whether API calls are attempted. When the flag is disabled (default),
 * all operations use local storage + mock data as a graceful fallback.
 *
 * When the backend endpoints become available, set NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
 * to enable real API integration.
 */

import apiClient from './api-client';

// ============================================================
// Feature Flag
// ============================================================

/**
 * Controls whether the service attempts real API calls.
 * Defaults to false since backend notification endpoints do not exist yet.
 */
export function isNotificationApiEnabled(): boolean {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true';
  }
  try {
    return process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true';
  } catch {
    return false;
  }
}

// ============================================================
// Types
// ============================================================

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

// ============================================================
// Local Storage Keys
// ============================================================

const STORAGE_KEYS = {
  NOTIFICATIONS: 'ainative:notifications',
  PREFERENCES: 'ainative:notification-preferences',
  DELETED_IDS: 'ainative:notification-deleted-ids',
} as const;

// ============================================================
// Local Storage Helpers
// ============================================================

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
  } catch {
    // localStorage may be unavailable (SSR, private browsing, etc.)
  }
  return null;
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  } catch {
    // localStorage may be unavailable or full
  }
}

function getStoredReadState(): Record<string, { read: boolean; readAt?: string }> {
  const raw = safeGetItem(STORAGE_KEYS.NOTIFICATIONS);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function setStoredReadState(state: Record<string, { read: boolean; readAt?: string }>): void {
  safeSetItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(state));
}

function getDeletedIds(): string[] {
  const raw = safeGetItem(STORAGE_KEYS.DELETED_IDS);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function addDeletedId(id: string): void {
  const ids = getDeletedIds();
  if (!ids.includes(id)) {
    ids.push(id);
    safeSetItem(STORAGE_KEYS.DELETED_IDS, JSON.stringify(ids));
  }
}

function getStoredPreferences(): NotificationPreferences | null {
  const raw = safeGetItem(STORAGE_KEYS.PREFERENCES);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setStoredPreferences(prefs: NotificationPreferences): void {
  safeSetItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
}

// ============================================================
// Default Preferences
// ============================================================

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

// ============================================================
// Mock Data Generator
// ============================================================

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

/**
 * Applies locally-stored read state and deletions to the mock notification list.
 */
function getLocalNotifications(): Notification[] {
  const base = generateMockNotifications();
  const readState = getStoredReadState();
  const deletedIds = getDeletedIds();

  return base
    .filter(n => !deletedIds.includes(n.id))
    .map(n => {
      const stored = readState[n.id];
      if (stored) {
        return { ...n, read: stored.read, readAt: stored.readAt };
      }
      return n;
    });
}

// ============================================================
// Notification Service
// ============================================================

const notificationService = {
  /**
   * Check if notification API is enabled via feature flag.
   */
  isApiEnabled: isNotificationApiEnabled,

  /**
   * Get list of notifications with optional filtering.
   * When API is disabled, returns mock data with local storage state.
   */
  async getNotifications(filter?: 'all' | 'unread' | 'read'): Promise<Notification[]> {
    if (isNotificationApiEnabled()) {
      try {
        const params = filter ? `?filter=${filter}` : '';
        const response = await apiClient.get<{ notifications: Notification[] }>(`/v1/notifications${params}`);
        return response.data.notifications || [];
      } catch {
        // Fall through to local fallback
      }
    }

    const notifications = getLocalNotifications();

    if (filter === 'unread') {
      return notifications.filter(n => !n.read);
    } else if (filter === 'read') {
      return notifications.filter(n => n.read);
    }

    return notifications;
  },

  /**
   * Get a specific notification by ID.
   */
  async getNotification(id: string): Promise<Notification> {
    if (isNotificationApiEnabled()) {
      try {
        const response = await apiClient.get<Notification>(`/v1/notifications/${id}`);
        return response.data;
      } catch {
        // Fall through to local fallback
      }
    }

    const notifications = getLocalNotifications();
    const notification = notifications.find(n => n.id === id);

    if (!notification) {
      throw new Error('Notification not found');
    }

    return notification;
  },

  /**
   * Mark notification as read. Persists to local storage when API is unavailable.
   */
  async markAsRead(id: string): Promise<Notification> {
    if (isNotificationApiEnabled()) {
      try {
        const response = await apiClient.put<Notification>(`/v1/notifications/${id}/read`);
        return response.data;
      } catch {
        // Fall through to local fallback
      }
    }

    const readAt = new Date().toISOString();
    const state = getStoredReadState();
    state[id] = { read: true, readAt };
    setStoredReadState(state);

    const notifications = getLocalNotifications();
    const notification = notifications.find(n => n.id === id);

    if (!notification) {
      throw new Error('Notification not found');
    }

    return notification;
  },

  /**
   * Mark notification as unread. Persists to local storage when API is unavailable.
   */
  async markAsUnread(id: string): Promise<Notification> {
    if (isNotificationApiEnabled()) {
      try {
        const response = await apiClient.put<Notification>(`/v1/notifications/${id}/unread`);
        return response.data;
      } catch {
        // Fall through to local fallback
      }
    }

    const state = getStoredReadState();
    state[id] = { read: false, readAt: undefined };
    setStoredReadState(state);

    const notifications = getLocalNotifications();
    const notification = notifications.find(n => n.id === id);

    if (!notification) {
      throw new Error('Notification not found');
    }

    return notification;
  },

  /**
   * Delete a notification. Persists deletion to local storage when API is unavailable.
   */
  async deleteNotification(id: string): Promise<void> {
    if (isNotificationApiEnabled()) {
      try {
        await apiClient.delete(`/v1/notifications/${id}`);
        return;
      } catch {
        // Fall through to local fallback
      }
    }

    addDeletedId(id);
  },

  /**
   * Mark all notifications as read. Persists to local storage when API is unavailable.
   */
  async markAllAsRead(): Promise<{ success: boolean; count: number }> {
    if (isNotificationApiEnabled()) {
      try {
        const response = await apiClient.put<{ success: boolean; count: number }>('/v1/notifications/mark-all-read');
        return response.data;
      } catch {
        // Fall through to local fallback
      }
    }

    const notifications = getLocalNotifications();
    const unreadNotifications = notifications.filter(n => !n.read);
    const state = getStoredReadState();
    const now = new Date().toISOString();

    for (const n of unreadNotifications) {
      state[n.id] = { read: true, readAt: now };
    }
    setStoredReadState(state);

    return {
      success: true,
      count: unreadNotifications.length,
    };
  },

  /**
   * Get notification preferences. Falls back to local storage or defaults.
   */
  async getPreferences(): Promise<NotificationPreferences> {
    if (isNotificationApiEnabled()) {
      try {
        const response = await apiClient.get<NotificationPreferences>('/v1/notifications/preferences');
        return response.data;
      } catch {
        // Fall through to local fallback
      }
    }

    return getStoredPreferences() || getDefaultPreferences();
  },

  /**
   * Update notification preferences. Persists to local storage when API is unavailable.
   */
  async updatePreferences(preferences: NotificationPreferences): Promise<NotificationPreferences> {
    if (isNotificationApiEnabled()) {
      try {
        const response = await apiClient.put<NotificationPreferences>('/v1/notifications/preferences', preferences);
        return response.data;
      } catch {
        // Fall through to local fallback
      }
    }

    setStoredPreferences(preferences);
    return preferences;
  },

  /**
   * Subscribe to push notifications.
   */
  async subscribeToPush(subscription: PushSubscription): Promise<{ success: boolean; message: string }> {
    if (isNotificationApiEnabled()) {
      try {
        const response = await apiClient.post<{ success: boolean; message: string }>('/v1/notifications/subscribe', subscription);
        return response.data;
      } catch {
        // Fall through to local fallback
      }
    }

    return {
      success: false,
      message: 'Push notifications are not available while the notification backend is offline.',
    };
  },

  /**
   * Get notification statistics.
   */
  async getStats(): Promise<NotificationStats> {
    if (isNotificationApiEnabled()) {
      try {
        const response = await apiClient.get<NotificationStats>('/v1/notifications/stats');
        return response.data;
      } catch {
        // Fall through to local fallback
      }
    }

    const notifications = getLocalNotifications();

    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      byType: notifications.reduce((acc, n) => {
        acc[n.type] = (acc[n.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byCategory: notifications.reduce((acc, n) => {
        acc[n.category] = (acc[n.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  },
};

export default notificationService;
