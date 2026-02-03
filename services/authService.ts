/**
 * Authentication Service
 * Handles user authentication, token management, and user profile operations
 * Compatible with AINative API and cross-subdomain SSO
 */

import { setAuthToken, setAuthUser, clearAuthData, getAuthToken } from '@/utils/authCookies';

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in?: number;
  user_id?: string;
  email?: string;
  user?: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  preferred_name?: string;
  full_name?: string;
  avatar_url?: string;
  github_username?: string;
  roles?: string[];
}

export interface RegisterData {
  email: string;
  password: string;
  preferred_name?: string;
}

class AuthService {
  private readonly baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.ainative.studio';
  }

  /**
   * Get the current access token
   */
  getAccessToken(): string | null {
    return getAuthToken();
  }

  /**
   * Get the current refresh token from localStorage
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh_token');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getAccessToken() !== null;
  }

  /**
   * Login with email and password
   * Uses URLSearchParams for form data as required by the OAuth2 API
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // OAuth2 style form data
      const formData = new URLSearchParams();
      formData.append('username', email); // API expects 'username', not 'email'
      formData.append('password', password);
      formData.append('grant_type', 'password');

      const fullURL = `${this.baseURL}/v1/public/auth/login`;

      console.log('Auth Debug: Making login request to:', fullURL);

      const response = await fetch(fullURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data: LoginResponse = await response.json();

      // Store tokens in localStorage AND cookies for cross-subdomain SSO
      if (data.access_token) {
        setAuthToken(data.access_token);

        // Fetch user info from /auth/me endpoint
        try {
          const userInfoResponse = await fetch(`${this.baseURL}/v1/auth/auth/me`, {
            headers: {
              'Authorization': `Bearer ${data.access_token}`,
            },
          });

          if (userInfoResponse.ok) {
            const userInfo = await userInfoResponse.json();
            setAuthUser(userInfo);
            console.log('User info fetched and stored:', userInfo);
          }
        } catch (e) {
          console.error('Failed to fetch user info:', e);
        }
      }

      if (data.refresh_token && typeof window !== 'undefined') {
        localStorage.setItem('refresh_token', data.refresh_token);
      }

      if (data.user) {
        setAuthUser(data.user as unknown as Record<string, unknown>);
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Register new user
   */
  async register(userData: RegisterData): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseURL}/v1/public/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          full_name: userData.preferred_name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || 'Registration failed');
      }

      // Registration successful, now log them in
      return await this.login(userData.email, userData.password);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Exchange OAuth authorization code for access tokens
   */
  async handleOAuthCallback(code: string, state?: string | null): Promise<LoginResponse> {
    try {
      const redirectUri = typeof window !== 'undefined'
        ? `${window.location.origin}/login/callback`
        : '';

      const response = await fetch(`${this.baseURL}/v1/public/auth/github/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          state,
          redirect_uri: redirectUri,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'GitHub authentication failed');
      }

      const data: LoginResponse = await response.json();

      if (data.access_token) {
        setAuthToken(data.access_token);
        if (data.refresh_token && typeof window !== 'undefined') {
          localStorage.setItem('refresh_token', data.refresh_token);
        }
      }

      return data;
    } catch (error) {
      console.error('GitHub OAuth exchange error:', error);
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const token = this.getAccessToken();
      if (!token) return null;

      const response = await fetch(`${this.baseURL}/v1/auth/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Logout user and clear tokens (including cross-subdomain SSO cookies)
   */
  async logout(): Promise<void> {
    try {
      const token = this.getAccessToken();
      if (token) {
        await fetch(`${this.baseURL}/v1/auth/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.warn('Logout endpoint failed, clearing local tokens:', error);
    } finally {
      clearAuthData();
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
      const response = await fetch(`${this.baseURL}/v1/public/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        clearAuthData();
        return null;
      }

      const data: LoginResponse = await response.json();

      if (data.access_token) {
        setAuthToken(data.access_token);
        if (data.refresh_token && typeof window !== 'undefined') {
          localStorage.setItem('refresh_token', data.refresh_token);
        }
        return data.access_token;
      }

      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAuthData();
      return null;
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseURL}/v1/public/auth/verify-email?token=${encodeURIComponent(token)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || 'Email verification failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  /**
   * Get GitHub OAuth authorization URL
   */
  getGitHubAuthUrl(returnTo?: string): string {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || 'Ov23li0zGXukHTHcQNrP';
    const redirectUri = typeof window !== 'undefined'
      ? `${window.location.origin}/login/callback`
      : '';

    let stateParam = '';
    if (returnTo) {
      // Encode return URL in state parameter for cross-subdomain SSO
      const stateObj = { returnTo };
      const stateJson = JSON.stringify(stateObj);
      const stateB64 = btoa(stateJson).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      stateParam = `&state=${stateB64}`;
    }

    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user,user:email${stateParam}`;
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
