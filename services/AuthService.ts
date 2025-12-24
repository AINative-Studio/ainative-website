/**
 * Authentication Service
 * Handles user authentication, token management, and user profile operations
 */

import apiClient from '@/lib/api-client';

interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in?: number;
}

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  github_username?: string;
}

interface OAuthCallbackResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  user?: UserProfile;
}

class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  /**
   * Get the current access token from localStorage
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get the current refresh token from localStorage
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Store authentication tokens
   */
  setTokens(accessToken: string, refreshToken?: string): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem(this.TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  /**
   * Clear all authentication tokens
   */
  clearTokens(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getAccessToken() !== null;
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/api/v1/auth/login', {
      email,
      password,
    });

    if (response.data.access_token) {
      this.setTokens(response.data.access_token, response.data.refresh_token);
    }

    return response.data;
  }

  /**
   * Test login for development/fallback
   */
  async testLogin(_email: string, _password: string): Promise<LoginResponse> {
    // Mock response for testing
    const mockResponse: LoginResponse = {
      access_token: 'test_access_token_' + Date.now(),
      refresh_token: 'test_refresh_token_' + Date.now(),
      token_type: 'Bearer',
      expires_in: 3600,
    };

    this.setTokens(mockResponse.access_token, mockResponse.refresh_token);
    return mockResponse;
  }

  /**
   * Exchange OAuth authorization code for access tokens
   */
  async handleOAuthCallback(code: string, state?: string): Promise<OAuthCallbackResponse> {
    const response = await apiClient.post<OAuthCallbackResponse>('/api/v1/auth/github/callback', {
      code,
      state,
    });

    if (response.data.access_token) {
      this.setTokens(response.data.access_token, response.data.refresh_token);
    }

    return response.data;
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/api/v1/auth/me');
    return response.data;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/v1/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await apiClient.post<LoginResponse>('/api/v1/auth/refresh', {
        refresh_token: refreshToken,
      });

      if (response.data.access_token) {
        this.setTokens(response.data.access_token, response.data.refresh_token);
        return response.data.access_token;
      }

      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      return null;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
