import apiClient from '@/lib/api-client';
import { appConfig } from '@/lib/config/app';
import { setAuthToken, setAuthUser, clearAuthData } from '@/utils/authCookies';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  preferred_name?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in?: number;
  user_id?: string;
  email?: string;
  user?: {
    id: string;
    email: string;
    preferred_name?: string;
    roles?: string[];
  };
}

export interface LoginResponse extends AuthResponse {}

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

export class AuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = appConfig.api.baseUrl;
  }

  /**
   * Login user with email and password
   * Uses URLSearchParams for form data as required by the API
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const formData = new URLSearchParams();
      formData.append('username', email); // API expects 'username', not 'email'
      formData.append('password', password);
      formData.append('grant_type', 'password'); // OAuth2 requires this field

      const fullURL = `${this.baseUrl}/v1/public/auth/login`;

      const response = await fetch(fullURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
        credentials: 'include', // Include cookies for CORS requests
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();

      // Store tokens in localStorage AND cookies for cross-subdomain SSO
      if (data.access_token) {
        // Set token in cookie and localStorage for SSO
        setAuthToken(data.access_token);

        // Fetch user info with role from /auth/me endpoint
        try {
          const userInfoResponse = await fetch(`${this.baseUrl}/v1/public/auth/me`, {
            headers: {
              'Authorization': `Bearer ${data.access_token}`,
            },
          });

          if (userInfoResponse.ok) {
            const userInfo = await userInfoResponse.json();
            // Set user in cookie and localStorage for SSO
            setAuthUser(userInfo);
          }
        } catch (e) {
          // Silent: failed to fetch user info
        }
      }
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }
      if (data.user_info || data.user) {
        // Set user in cookie and localStorage for SSO
        setAuthUser(data.user_info || data.user);
      }

      return data;
    } catch (error) {
      // Rethrow for caller to handle
      throw error;
    }
  }

  /**
   * Admin auto-login - DEPRECATED for security reasons
   */
  async adminAutoLogin(): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Test login method using the test-auth endpoint
   */
  async testLogin(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/test-auth/test-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Test login failed');
      }

      const data = await response.json();

      // Store tokens in cookie and localStorage for SSO
      if (data.access_token) {
        setAuthToken(data.access_token);
      }

      return data;
    } catch (error) {
      // Rethrow for caller to handle
      throw error;
    }
  }

  /**
   * Register new user using the proper public auth endpoint
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/public/auth/register`, {
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
      // Rethrow for caller to handle
      throw error;
    }
  }

  /**
   * Verify email address with token from verification email
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/public/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Email verification failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Rethrow for caller to handle
      throw error;
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<UserProfile> {
    try {
      const response = await apiClient.get<UserProfile>('/v1/public/auth/me');
      return response.data;
    } catch (error) {
      // Rethrow for caller to handle
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post<AuthResponse>('/v1/public/auth/refresh', {
        refresh_token: refreshToken,
      });

      const data = response.data;
      if (data.access_token) {
        // Set token in cookie and localStorage for SSO
        setAuthToken(data.access_token);
      }

      return data;
    } catch (error) {
      // Rethrow for caller to handle
      throw error;
    }
  }

  /**
   * Logout user and clear tokens (including cross-subdomain SSO cookies)
   */
  async logout(): Promise<void> {
    try {
      // Try to call logout endpoint if available
      try {
        await apiClient.post('/v1/public/auth/logout');
      } catch {
        // If logout endpoint fails, still clear local tokens
      }
    } finally {
      // Clear all auth data (cookies and localStorage) for SSO logout
      clearAuthData();
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('access_token');
    return !!token;
  }

  /**
   * Handle OAuth callback and exchange code for tokens
   */
  async handleOAuthCallback(code: string, state?: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/public/auth/oauth/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, state }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'OAuth callback failed');
      }

      const data = await response.json();

      if (data.access_token) {
        setAuthToken(data.access_token);
      }
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }
      if (data.user) {
        setAuthUser(data.user);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get GitHub OAuth authorization URL
   */
  getGitHubAuthUrl(returnTo?: string): string {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '';
    const redirectUri = `${typeof window !== 'undefined' ? window.location.origin : ''}/login/callback`;
    const state = returnTo ? btoa(JSON.stringify({ returnTo })) : '';

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'user:email',
      ...(state && { state }),
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  /**
   * Request password reset email
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/public/auth/password-reset/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to request password reset');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/public/auth/password-reset/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to reset password');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<void> {
    try {
      await apiClient.delete('/v1/public/auth/account');
      // Clear local storage after successful deletion
      await this.logout();
    } catch (error) {
      // Rethrow for caller to handle
      throw error;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
