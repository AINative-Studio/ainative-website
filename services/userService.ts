import apiClient from '@/lib/api-client';

/**
 * User profile interface
 */
export interface UserProfile {
  id: string;
  email: string;
  is_active: boolean;
  is_superuser?: boolean;
  full_name?: string;
  username?: string;
  email_verified?: boolean;
  created_at: string;
  role?: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  company?: string;
  location?: string;
}

/**
 * User preferences interface
 */
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  timezone?: string;
  email_notifications?: boolean;
  push_notifications?: boolean;
  marketing_emails?: boolean;
  security_alerts?: boolean;
  editor_settings?: {
    font_size?: number;
    tab_size?: number;
    theme?: string;
  };
}

/**
 * Profile picture response
 */
export interface ProfilePictureResponse {
  url: string;
  thumbnail_url?: string;
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
 * Service for managing user profile, preferences, and account operations
 */
export class UserService {
  /**
   * Get current user profile
   * Fetches the authenticated user's profile information
   */
  async getUserProfile(): Promise<UserProfile> {
    try {
      const response = await apiClient.get<ApiResponse<UserProfile>>('/v1/public/auth/me');

      if (!response.data.success && response.data.data) {
        // Handle case where backend doesn't use success wrapper
        return response.data.data;
      }

      if (!response.data.data) {
        // Direct response without wrapper
        return response.data as unknown as UserProfile;
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * Updates the authenticated user's profile information
   */
  async updateUserProfile(profileData: Partial<UserProfile>): Promise<OperationResult> {
    try {
      const response = await apiClient.put<ApiResponse<{ message: string }>>(
        '/v1/public/profile',
        profileData
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update profile');
      }

      return {
        success: true,
        message: response.data.message || 'Profile updated successfully'
      };
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Get user preferences
   * Fetches the authenticated user's preferences and settings
   */
  async getUserPreferences(): Promise<UserPreferences> {
    try {
      const response = await apiClient.get<ApiResponse<UserPreferences>>(
        '/v1/public/profile/preferences'
      );

      if (!response.data.success && response.data.data) {
        return response.data.data;
      }

      if (!response.data.data) {
        return response.data as unknown as UserPreferences;
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      throw error;
    }
  }

  /**
   * Update user preferences
   * Updates the authenticated user's preferences and settings
   */
  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<OperationResult> {
    try {
      const response = await apiClient.put<ApiResponse<{ message: string }>>(
        '/v1/public/profile/preferences',
        preferences
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update preferences');
      }

      return {
        success: true,
        message: response.data.message || 'Preferences updated successfully'
      };
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  /**
   * Get profile picture
   * Fetches the authenticated user's profile picture URL
   */
  async getProfilePicture(): Promise<ProfilePictureResponse> {
    try {
      const response = await apiClient.get<ApiResponse<ProfilePictureResponse>>(
        '/v1/public/profile/picture'
      );

      if (!response.data.success && response.data.data) {
        return response.data.data;
      }

      if (!response.data.data) {
        return response.data as unknown as ProfilePictureResponse;
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching profile picture:', error);
      throw error;
    }
  }

  /**
   * Upload profile picture
   * Uploads a new profile picture for the authenticated user
   */
  async uploadProfilePicture(file: File): Promise<OperationResult & { url?: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Create a custom fetch request for file upload
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const apiBaseUrl = typeof window !== 'undefined'
        ? process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
        : 'http://localhost:8000';

      const response = await fetch(`${apiBaseUrl}/v1/public/profile/picture`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to upload profile picture');
      }

      return {
        success: true,
        message: data.message || 'Profile picture uploaded successfully',
        url: data.data?.url
      };
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  }

  /**
   * Delete account
   * Permanently deletes the authenticated user's account
   * This action cannot be undone
   */
  async deleteAccount(confirmation?: { password?: string; reason?: string }): Promise<OperationResult> {
    try {
      const response = await apiClient.delete<ApiResponse<{ message: string }>>(
        '/v1/public/profile/delete'
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete account');
      }

      // Clear authentication token on successful account deletion
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
      }

      return {
        success: true,
        message: response.data.message || 'Account deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   * Tests authentication by attempting to fetch the user profile
   */
  async checkAuthentication(): Promise<boolean> {
    try {
      await this.getUserProfile();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const userService = new UserService();
