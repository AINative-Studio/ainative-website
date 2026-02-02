import apiClient from '@/lib/api-client';

/**
 * User notification preference settings
 */
export interface NotificationPreference {
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  security_alerts: boolean;
}

/**
 * User communication settings
 */
export interface CommunicationSettings {
  preferred_language: string;
  timezone: string;
  email_frequency: 'immediate' | 'daily' | 'weekly';
}

/**
 * User profile data
 */
export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

/**
 * User statistics data
 */
export interface UserStats {
  total_credits: number;
  credits_used: number;
  projects_count: number;
  last_active: string;
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Standard operation result
 */
export interface OperationResult {
  success: boolean;
  message: string;
}

/**
 * Service for managing user settings, preferences, and profile data
 */
export class UserSettingsService {
  /**
   * Default notification preferences for fallback
   */
  private defaultNotificationPreferences: NotificationPreference = {
    email_notifications: true,
    push_notifications: true,
    marketing_emails: false,
    security_alerts: true,
  };

  /**
   * Get notification preferences
   * Returns default preferences if API fails to ensure page doesn't break
   */
  async getNotificationPreferences(): Promise<NotificationPreference> {
    try {
      const response = await apiClient.get<ApiResponse<NotificationPreference>>(
        '/api/v1/settings/notifications/preferences'
      );

      if (!response.data.success || !response.data.data) {
        console.warn('Notification preferences API returned empty, using defaults');
        return this.defaultNotificationPreferences;
      }

      return response.data.data;
    } catch (error) {
      console.warn('Error fetching notification preferences, using defaults:', error);
      return this.defaultNotificationPreferences;
    }
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    preferences: Partial<NotificationPreference>
  ): Promise<OperationResult> {
    try {
      const response = await apiClient.put<ApiResponse<{ message: string }>>(
        '/api/v1/settings/notifications/preferences',
        preferences
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update notification preferences');
      }

      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  /**
   * Default communication settings for fallback
   */
  private defaultCommunicationSettings: CommunicationSettings = {
    preferred_language: 'en',
    timezone: typeof window !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : 'UTC',
    email_frequency: 'daily',
  };

  /**
   * Get communication settings
   * Returns default settings if API fails to ensure page doesn't break
   */
  async getCommunicationSettings(): Promise<CommunicationSettings> {
    try {
      const response = await apiClient.get<ApiResponse<CommunicationSettings>>(
        '/api/v1/settings/communication'
      );

      if (!response.data.success || !response.data.data) {
        console.warn('Communication settings API returned empty, using defaults');
        return this.defaultCommunicationSettings;
      }

      return response.data.data;
    } catch (error) {
      console.warn('Error fetching communication settings, using defaults:', error);
      return this.defaultCommunicationSettings;
    }
  }

  /**
   * Update communication settings
   */
  async updateCommunicationSettings(
    settings: Partial<CommunicationSettings>
  ): Promise<OperationResult> {
    try {
      const response = await apiClient.put<ApiResponse<{ message: string }>>(
        '/api/v1/settings/communication',
        settings
      );

      if (!response.data.success) {
        return {
          success: false,
          message: response.data.message || 'Failed to update communication settings'
        };
      }

      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Error updating communication settings:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update communication settings. Please try again.'
      };
    }
  }

  /**
   * Default user profile for fallback
   */
  private defaultUserProfile: UserProfile = {
    name: 'User',
    email: '',
    avatar: undefined,
  };

  /**
   * Get user profile
   * Returns default profile if API fails to ensure page doesn't break
   */
  async getUserProfile(): Promise<UserProfile> {
    try {
      const response = await apiClient.get<ApiResponse<UserProfile>>('/api/v1/profile');

      if (!response.data.success || !response.data.data) {
        console.warn('User profile API returned empty, using defaults');
        return this.defaultUserProfile;
      }

      return response.data.data;
    } catch (error) {
      console.warn('Failed to fetch user profile, using defaults:', error);
      return this.defaultUserProfile;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    profileData: Partial<UserProfile>
  ): Promise<OperationResult> {
    try {
      const response = await apiClient.put<ApiResponse<{ message: string }>>(
        '/api/v1/profile',
        profileData
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update profile');
      }

      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Failed to update profile:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update profile. Please try again.'
      };
    }
  }

  /**
   * Get user profile statistics
   */
  async getUserStats(): Promise<UserStats | null> {
    try {
      const response = await apiClient.get<ApiResponse<UserStats>>('/api/v1/profile/stats');

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch user stats');
      }

      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      return null;
    }
  }
}

// Export singleton instance
export const userSettingsService = new UserSettingsService();
