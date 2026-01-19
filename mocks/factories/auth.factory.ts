import type { LoginResponse, UserProfile } from '@/services/AuthService';

export class AuthFactory {
  static createUserProfile(overrides?: Partial<UserProfile>): UserProfile {
    return {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      preferred_name: 'Tester',
      full_name: 'Test User',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser',
      github_username: 'testuser',
      roles: ['user'],
      ...overrides,
    };
  }

  static createLoginResponse(overrides?: Partial<LoginResponse>): LoginResponse {
    return {
      access_token: 'mock_access_token_' + Date.now(),
      refresh_token: 'mock_refresh_token_' + Date.now(),
      token_type: 'Bearer',
      expires_in: 3600,
      user_id: 'user-123',
      email: 'test@example.com',
      user: AuthFactory.createUserProfile(),
      ...overrides,
    };
  }

  static createAuthenticatedUser(email: string = 'test@example.com', name: string = 'Test User'): UserProfile {
    return AuthFactory.createUserProfile({
      email,
      name,
      preferred_name: name.split(' ')[0],
      full_name: name,
    });
  }

  static createAdminUser(): UserProfile {
    return AuthFactory.createUserProfile({
      id: 'admin-123',
      email: 'admin@ainative.studio',
      name: 'Admin User',
      roles: ['admin', 'user'],
    });
  }

  static createOAuthResponse(provider: 'github' = 'github'): LoginResponse {
    return {
      ...AuthFactory.createLoginResponse(),
      user: AuthFactory.createUserProfile({ github_username: 'oauth_user' }),
    };
  }
}
