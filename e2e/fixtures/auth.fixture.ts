import { Page } from '@playwright/test';

/**
 * Authentication fixture for E2E tests
 * Handles user login, logout, and session management
 */

export interface AuthUser {
  email: string;
  password: string;
  name?: string;
}

export class AuthFixture {
  private static readonly TEST_USERS = {
    admin: {
      email: 'admin@ainative.com',
      password: 'Test123!@#',
      name: 'Admin User'
    },
    regular: {
      email: 'user@ainative.com',
      password: 'Test123!@#',
      name: 'Regular User'
    },
    guest: {
      email: 'guest@ainative.com',
      password: 'Test123!@#',
      name: 'Guest User'
    }
  };

  constructor(private page: Page) {}

  /**
   * Get test user credentials
   */
  static getTestUser(type: 'admin' | 'regular' | 'guest' = 'regular'): AuthUser {
    return this.TEST_USERS[type];
  }

  /**
   * Login to the application
   */
  async login(user?: AuthUser) {
    const credentials = user || AuthFixture.TEST_USERS.regular;

    // Navigate to login page
    await this.page.goto('/auth/login');

    // Fill in credentials
    await this.page.fill('[data-testid="email-input"], input[type="email"]', credentials.email);
    await this.page.fill('[data-testid="password-input"], input[type="password"]', credentials.password);

    // Submit form
    await this.page.click('[data-testid="login-button"], button[type="submit"]');

    // Wait for navigation to dashboard
    await this.page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Verify login success
    const isAuthenticated = await this.isAuthenticated();
    if (!isAuthenticated) {
      throw new Error('Login failed: User is not authenticated');
    }
  }

  /**
   * Logout from the application
   */
  async logout() {
    // Find and click logout button
    const logoutButton = this.page.locator('[data-testid="logout-button"], button:has-text("Logout"), button:has-text("Sign out")').first();
    await logoutButton.click();

    // Wait for redirect to login page
    await this.page.waitForURL(/\/(auth\/login|login|$)/, { timeout: 5000 });
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      // Check for auth token in cookies or localStorage
      const hasAuthToken = await this.page.evaluate(() => {
        const token = localStorage.getItem('authToken') ||
                     sessionStorage.getItem('authToken') ||
                     document.cookie.includes('auth_token');
        return !!token;
      });

      // Check if we're on a protected route
      const currentUrl = this.page.url();
      const isOnDashboard = currentUrl.includes('/dashboard');

      return hasAuthToken || isOnDashboard;
    } catch {
      return false;
    }
  }

  /**
   * Setup authenticated session without UI login
   * Useful for faster test setup
   */
  async setupAuthSession(user?: AuthUser) {
    const credentials = user || AuthFixture.TEST_USERS.regular;

    // Set auth token in localStorage
    await this.page.evaluate((email) => {
      // Mock auth token - replace with real token if needed
      const mockToken = btoa(JSON.stringify({ email, exp: Date.now() + 3600000 }));
      localStorage.setItem('authToken', mockToken);
      sessionStorage.setItem('user', JSON.stringify({ email }));
    }, credentials.email);
  }

  /**
   * Clear authentication state
   */
  async clearAuthState() {
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(';').forEach(c => {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });
    });
  }

  /**
   * Get current user information
   */
  async getCurrentUser() {
    return await this.page.evaluate(() => {
      const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    });
  }
}