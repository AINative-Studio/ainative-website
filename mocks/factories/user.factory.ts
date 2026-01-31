/**
 * Mock data factory for user-related entities
 */

import type { UserProfile, UserPreferences } from '@/services/userService';

export class UserFactory {
  static createUserProfile(overrides?: Partial<UserProfile>): UserProfile {
    return {
      id: 'user-123',
      email: 'test@example.com',
      is_active: true,
      is_superuser: false,
      full_name: 'Test User',
      username: 'testuser',
      email_verified: true,
      created_at: new Date().toISOString(),
      role: 'user',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser',
      ...overrides,
    };
  }

  static createUserPreferences(overrides?: Partial<UserPreferences>): UserPreferences {
    return {
      theme: 'system',
      language: 'en',
      timezone: 'America/Los_Angeles',
      email_notifications: true,
      push_notifications: false,
      marketing_emails: true,
      security_alerts: true,
      editor_settings: {
        font_size: 14,
        tab_size: 2,
        theme: 'monokai',
      },
      ...overrides,
    };
  }

  static createUserList(count: number = 5): UserProfile[] {
    const users: UserProfile[] = [];
    for (let i = 0; i < count; i++) {
      users.push(UserFactory.createUserProfile({
        id: 'user-' + (i + 1),
        email: 'user' + (i + 1) + '@example.com',
        full_name: 'Test User ' + (i + 1),
        username: 'testuser' + (i + 1),
      }));
    }
    return users;
  }

  static createSuperUser(): UserProfile {
    return UserFactory.createUserProfile({
      id: 'superuser-1',
      email: 'admin@ainative.studio',
      is_superuser: true,
      full_name: 'Super Admin',
      username: 'superadmin',
      role: 'admin',
    });
  }

  static createUnverifiedUser(): UserProfile {
    return UserFactory.createUserProfile({
      email_verified: false,
      is_active: true,
    });
  }

  static createInactiveUser(): UserProfile {
    return UserFactory.createUserProfile({
      is_active: false,
      email_verified: true,
    });
  }
}
