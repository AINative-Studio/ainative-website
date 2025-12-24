/**
 * User Settings Service Tests
 * Comprehensive tests for user profile and settings management
 */

import apiClient from '@/lib/api-client';

// Mock apiClient
jest.mock('@/lib/api-client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

import type { UserSettingsService as UserSettingsServiceType } from '../userSettingsService';

describe('UserSettingsService', () => {
  let userSettingsService: UserSettingsServiceType;

  const mockNotificationPreferences = {
    email_notifications: true,
    push_notifications: false,
    marketing_emails: true,
    security_alerts: true,
  };

  const mockCommunicationSettings = {
    preferred_language: 'en',
    timezone: 'America/New_York',
    email_frequency: 'daily' as const,
  };

  const mockUserProfile = {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://example.com/avatar.jpg',
  };

  const mockUserStats = {
    total_credits: 10000,
    credits_used: 3500,
    projects_count: 12,
    last_active: '2025-01-15T12:00:00Z',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const { UserSettingsService } = await import('../userSettingsService');
    userSettingsService = new UserSettingsService();
  });

  describe('getNotificationPreferences()', () => {
    it('should fetch notification preferences successfully', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: mockNotificationPreferences,
        },
      });

      const result = await userSettingsService.getNotificationPreferences();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/v1/settings/notifications/preferences');
      expect(result).toEqual(mockNotificationPreferences);
    });

    it('should throw error when fetch fails', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: false,
          message: 'Unauthorized',
          data: null,
        },
      });

      await expect(userSettingsService.getNotificationPreferences()).rejects.toThrow('Unauthorized');
    });

    it('should handle network errors', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Network Error'));

      await expect(userSettingsService.getNotificationPreferences()).rejects.toThrow('Network Error');
    });
  });

  describe('updateNotificationPreferences()', () => {
    it('should update notification preferences successfully', async () => {
      mockedApiClient.put.mockResolvedValue({
        data: {
          success: true,
          message: 'Preferences updated',
          data: { message: 'Preferences updated' },
        },
      });

      const result = await userSettingsService.updateNotificationPreferences({
        email_notifications: false,
      });

      expect(mockedApiClient.put).toHaveBeenCalledWith(
        '/api/v1/settings/notifications/preferences',
        { email_notifications: false }
      );
      expect(result.success).toBe(true);
    });

    it('should throw error when update fails', async () => {
      mockedApiClient.put.mockResolvedValue({
        data: {
          success: false,
          message: 'Update failed',
          data: null,
        },
      });

      await expect(
        userSettingsService.updateNotificationPreferences({ email_notifications: false })
      ).rejects.toThrow('Update failed');
    });

    it('should update multiple preferences at once', async () => {
      mockedApiClient.put.mockResolvedValue({
        data: {
          success: true,
          message: 'Updated',
          data: { message: 'Updated' },
        },
      });

      const updates = {
        email_notifications: false,
        push_notifications: true,
        marketing_emails: false,
      };

      const result = await userSettingsService.updateNotificationPreferences(updates);

      expect(mockedApiClient.put).toHaveBeenCalledWith(
        '/api/v1/settings/notifications/preferences',
        updates
      );
      expect(result.success).toBe(true);
    });
  });

  describe('getCommunicationSettings()', () => {
    it('should fetch communication settings successfully', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: mockCommunicationSettings,
        },
      });

      const result = await userSettingsService.getCommunicationSettings();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/v1/settings/communication');
      expect(result).toEqual(mockCommunicationSettings);
    });

    it('should throw error when fetch fails', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: false,
          message: 'Settings not found',
          data: null,
        },
      });

      await expect(userSettingsService.getCommunicationSettings()).rejects.toThrow('Settings not found');
    });
  });

  describe('updateCommunicationSettings()', () => {
    it('should update communication settings successfully', async () => {
      mockedApiClient.put.mockResolvedValue({
        data: {
          success: true,
          message: 'Settings updated',
          data: { message: 'Settings updated' },
        },
      });

      const result = await userSettingsService.updateCommunicationSettings({
        timezone: 'America/Los_Angeles',
      });

      expect(mockedApiClient.put).toHaveBeenCalledWith(
        '/api/v1/settings/communication',
        { timezone: 'America/Los_Angeles' }
      );
      expect(result.success).toBe(true);
    });

    it('should return failure result when update fails', async () => {
      mockedApiClient.put.mockResolvedValue({
        data: {
          success: false,
          message: 'Invalid timezone',
          data: null,
        },
      });

      const result = await userSettingsService.updateCommunicationSettings({
        timezone: 'Invalid/Zone',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid timezone');
    });

    it('should handle network errors gracefully', async () => {
      mockedApiClient.put.mockRejectedValue(new Error('Connection timeout'));

      const result = await userSettingsService.updateCommunicationSettings({
        timezone: 'America/New_York',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Connection timeout');
    });

    it('should update email frequency', async () => {
      mockedApiClient.put.mockResolvedValue({
        data: {
          success: true,
          message: 'Updated',
          data: { message: 'Updated' },
        },
      });

      await userSettingsService.updateCommunicationSettings({
        email_frequency: 'weekly',
      });

      expect(mockedApiClient.put).toHaveBeenCalledWith(
        '/api/v1/settings/communication',
        { email_frequency: 'weekly' }
      );
    });
  });

  describe('getUserProfile()', () => {
    it('should fetch user profile successfully', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: mockUserProfile,
        },
      });

      const result = await userSettingsService.getUserProfile();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/v1/profile');
      expect(result).toEqual(mockUserProfile);
    });

    it('should return null when fetch fails', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Error'));

      const result = await userSettingsService.getUserProfile();

      expect(result).toBeNull();
    });

    it('should return null when API returns unsuccessful', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: false,
          message: 'Not found',
          data: null,
        },
      });

      const result = await userSettingsService.getUserProfile();

      expect(result).toBeNull();
    });
  });

  describe('updateUserProfile()', () => {
    it('should update user profile successfully', async () => {
      mockedApiClient.put.mockResolvedValue({
        data: {
          success: true,
          message: 'Profile updated',
          data: { message: 'Profile updated' },
        },
      });

      const result = await userSettingsService.updateUserProfile({
        name: 'Jane Doe',
      });

      expect(mockedApiClient.put).toHaveBeenCalledWith('/api/v1/profile', { name: 'Jane Doe' });
      expect(result.success).toBe(true);
    });

    it('should return failure when update fails', async () => {
      mockedApiClient.put.mockResolvedValue({
        data: {
          success: false,
          message: 'Email already taken',
          data: null,
        },
      });

      const result = await userSettingsService.updateUserProfile({
        email: 'taken@example.com',
      });

      expect(result.success).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      mockedApiClient.put.mockRejectedValue(new Error('Server error'));

      const result = await userSettingsService.updateUserProfile({ name: 'Test' });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Server error');
    });

    it('should update avatar', async () => {
      mockedApiClient.put.mockResolvedValue({
        data: {
          success: true,
          message: 'Updated',
          data: { message: 'Updated' },
        },
      });

      await userSettingsService.updateUserProfile({
        avatar: 'https://example.com/new-avatar.jpg',
      });

      expect(mockedApiClient.put).toHaveBeenCalledWith('/api/v1/profile', {
        avatar: 'https://example.com/new-avatar.jpg',
      });
    });
  });

  describe('getUserStats()', () => {
    it('should fetch user stats successfully', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          message: 'Success',
          data: mockUserStats,
        },
      });

      const result = await userSettingsService.getUserStats();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/v1/profile/stats');
      expect(result).toEqual(mockUserStats);
    });

    it('should return null when fetch fails', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Error'));

      const result = await userSettingsService.getUserStats();

      expect(result).toBeNull();
    });

    it('should return null when API returns unsuccessful', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: false,
          message: 'Stats unavailable',
          data: null,
        },
      });

      const result = await userSettingsService.getUserStats();

      expect(result).toBeNull();
    });
  });

  describe('Error Logging', () => {
    it('should log errors for notification preferences fetch failures', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockedApiClient.get.mockRejectedValue(new Error('Network Error'));

      try {
        await userSettingsService.getNotificationPreferences();
      } catch {
        // Expected to throw
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching notification preferences:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });

    it('should log errors for profile update failures', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockedApiClient.put.mockRejectedValue(new Error('Server Error'));

      await userSettingsService.updateUserProfile({ name: 'Test' });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to update profile:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });

  describe('Singleton Export', () => {
    it('should export a singleton instance', async () => {
      const { userSettingsService } = await import('../userSettingsService');
      expect(userSettingsService).toBeDefined();
      expect(typeof userSettingsService.getUserProfile).toBe('function');
    });
  });
});
