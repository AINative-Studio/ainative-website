import apiClient from '@/lib/api-client';

/**
 * User notification preference settings
 * Matches backend schema from /v1/settings/notifications/preferences
 * Refs #532
 */
export interface NotificationPreference {
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  security_alerts: boolean;
  ai_suggestions?: boolean;
  system_updates?: boolean;
}

/**
 * User communication settings
 * Matches backend schema from /v1/settings/communication
 * Refs #532
 */
export interface CommunicationSettings {
  preferred_language: string;
  timezone: string;
  email_frequency: 'immediate' | 'daily' | 'weekly';
  slack_notifications?: boolean;
  teams_notifications?: boolean;
  discord_notifications?: boolean;
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
   * Get notification preferences
   */
  async getNotificationPreferences(): Promise<NotificationPreference> {
    try {
      const response = await apiClient.get<ApiResponse<NotificationPreference>>(
        '/v1/settings/notifications/preferences'
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch notification preferences');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
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
        '/v1/settings/notifications/preferences',
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
   * Get communication settings
   */
  async getCommunicationSettings(): Promise<CommunicationSettings> {
    try {
      const response = await apiClient.get<ApiResponse<CommunicationSettings>>(
        '/v1/settings/communication'
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch communication settings');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching communication settings:', error);
      throw error;
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
        '/v1/settings/communication',
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
   * Get user profile
   */
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const response = await apiClient.get<ApiResponse<UserProfile>>('/v1/profiles/me');

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch user profile');
      }

      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    profileData: Partial<UserProfile>
  ): Promise<OperationResult> {
    try {
      const response = await apiClient.patch<ApiResponse<{ message: string }>>(
        '/v1/profiles/me',
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
   * Refs #532 - Fixed endpoint to match backend
   */
  async getUserStats(): Promise<UserStats | null> {
    try {
      const response = await apiClient.get<ApiResponse<UserStats>>('/v1/profiles/stats');

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
