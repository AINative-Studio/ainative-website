/**
 * Unified User Type Definitions
 *
 * Single source of truth for user-related types across the application.
 * Consolidates UserProfile definitions from authService, userService, and userSettingsService.
 *
 * Refs #601
 */

/**
 * Core user profile interface
 * Contains all user profile fields from across the application
 */
export interface UserProfile {
  // Core identification fields (required)
  id: string;
  email: string;

  // Account status fields
  is_active: boolean;
  is_superuser?: boolean;
  is_verified?: boolean;
  email_verified?: boolean;

  // Name fields (supporting multiple naming conventions)
  name?: string;
  full_name?: string;
  preferred_name?: string;
  username?: string;

  // Avatar/Profile picture fields
  avatar?: string;
  avatar_url?: string;

  // Additional profile information
  bio?: string;
  phone?: string;
  company?: string;
  location?: string;
  website?: string;

  // OAuth/Social login fields
  github_username?: string;

  // Role and permissions
  role?: string;
  roles?: string[];

  // Timestamps
  created_at?: string;
}

/**
 * User preferences interface
 * Settings and customization options for user experience
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
 * Profile picture response from API
 */
export interface ProfilePictureResponse {
  url: string;
  thumbnail_url?: string;
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
 * Helper type for creating new users (omit system-generated fields)
 */
export type CreateUserProfile = Omit<UserProfile, 'id' | 'created_at' | 'is_active'>;

/**
 * Helper type for updating user profiles (all fields optional except id)
 */
export type UpdateUserProfile = Partial<Omit<UserProfile, 'id'>> & { id: string };

/**
 * Minimal user info for display purposes (cards, lists, etc.)
 */
export interface UserDisplayInfo {
  id: string;
  name?: string;
  email: string;
  avatar?: string;
  avatar_url?: string;
}

/**
 * Type guard to check if a value is a valid UserProfile
 */
export function isUserProfile(value: unknown): value is UserProfile {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const profile = value as UserProfile;
  return typeof profile.id === 'string' && typeof profile.email === 'string';
}

/**
 * Get display name from user profile (handles multiple name field variations)
 */
export function getUserDisplayName(user: UserProfile): string {
  return user.preferred_name || user.full_name || user.name || user.username || user.email.split('@')[0];
}

/**
 * Get avatar URL from user profile (handles multiple avatar field variations)
 */
export function getUserAvatar(user: UserProfile): string | undefined {
  return user.avatar_url || user.avatar;
}
