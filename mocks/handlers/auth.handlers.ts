/**
 * Authentication MSW Handlers
 * Mock all authentication-related API endpoints
 */
import { http, HttpResponse } from 'msw';
import { AuthFactory } from '../factories';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.ainative.studio';

// In-memory store for session data during tests
let currentAccessToken: string | null = null;
let currentRefreshToken: string | null = null;
let currentUser: ReturnType<typeof AuthFactory.createUserProfile> | null = null;

export const authHandlers = [
  // POST /v1/public/auth/login - Login with email and password
  http.post(`${BASE_URL}/v1/public/auth/login`, async ({ request }) => {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const username = params.get('username');
    const password = params.get('password');

    // Simulate authentication failure
    if (password === 'wrongpassword') {
      return HttpResponse.json(
        { detail: 'Incorrect username or password' },
        { status: 401 }
      );
    }

    // Simulate successful login
    const loginResponse = AuthFactory.createLoginResponse({
      user: AuthFactory.createAuthenticatedUser(username || 'test@example.com'),
    });

    currentAccessToken = loginResponse.access_token;
    currentRefreshToken = loginResponse.refresh_token || null;
    currentUser = loginResponse.user || null;

    return HttpResponse.json(loginResponse, { status: 200 });
  }),

  // POST /v1/public/auth/register - Register new user
  http.post(`${BASE_URL}/v1/public/auth/register`, async ({ request }) => {
    const body = await request.json();
    const { email, password, full_name } = body as {
      email: string;
      password: string;
      full_name?: string;
    };

    // Simulate duplicate email
    if (email === 'existing@example.com') {
      return HttpResponse.json(
        { detail: 'Email already registered' },
        { status: 400 }
      );
    }

    // Simulate successful registration
    const loginResponse = AuthFactory.createLoginResponse({
      email,
      user: AuthFactory.createAuthenticatedUser(email, full_name || 'New User'),
    });

    currentAccessToken = loginResponse.access_token;
    currentUser = loginResponse.user || null;

    return HttpResponse.json(loginResponse, { status: 201 });
  }),

  // GET /v1/auth/me - Get current user profile
  http.get(`${BASE_URL}/v1/auth/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ detail: 'Not authenticated' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // Check if token matches current session
    if (token !== currentAccessToken) {
      return HttpResponse.json({ detail: 'Invalid token' }, { status: 401 });
    }

    return HttpResponse.json(currentUser || AuthFactory.createUserProfile(), {
      status: 200,
    });
  }),

  // POST /v1/auth/logout - Logout user
  http.post(`${BASE_URL}/v1/auth/logout`, () => {
    currentAccessToken = null;
    currentRefreshToken = null;
    currentUser = null;

    return HttpResponse.json({ message: 'Logged out successfully' }, { status: 200 });
  }),

  // POST /v1/public/auth/refresh - Refresh access token
  http.post(`${BASE_URL}/v1/public/auth/refresh`, async ({ request }) => {
    const body = await request.json();
    const { refresh_token } = body as { refresh_token: string };

    // Simulate invalid refresh token
    if (refresh_token !== currentRefreshToken) {
      return HttpResponse.json(
        { detail: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Generate new tokens
    const loginResponse = AuthFactory.createLoginResponse({
      user: currentUser || undefined,
    });

    currentAccessToken = loginResponse.access_token;
    currentRefreshToken = loginResponse.refresh_token || null;

    return HttpResponse.json(loginResponse, { status: 200 });
  }),

  // GET /v1/public/auth/verify-email - Verify email with token
  http.get(`${BASE_URL}/v1/public/auth/verify-email`, ({ request }) => {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token || token === 'invalid-token') {
      return HttpResponse.json(
        { detail: 'Invalid verification token' },
        { status: 400 }
      );
    }

    return HttpResponse.json(
      { message: 'Email verified successfully' },
      { status: 200 }
    );
  }),

  // POST /v1/public/auth/github/callback - GitHub OAuth callback
  http.post(`${BASE_URL}/v1/public/auth/github/callback`, async ({ request }) => {
    const body = await request.json();
    const { code } = body as { code: string; state?: string; redirect_uri?: string };

    // Simulate invalid OAuth code
    if (code === 'invalid-code') {
      return HttpResponse.json(
        { detail: 'Invalid authorization code' },
        { status: 400 }
      );
    }

    // Simulate successful GitHub OAuth
    const loginResponse = AuthFactory.createOAuthResponse('github');

    currentAccessToken = loginResponse.access_token;
    currentRefreshToken = loginResponse.refresh_token || null;
    currentUser = loginResponse.user || null;

    return HttpResponse.json(loginResponse, { status: 200 });
  }),
];

// Helper function to reset auth state between tests
export const resetAuthState = () => {
  currentAccessToken = null;
  currentRefreshToken = null;
  currentUser = null;
};

// Helper function to set authenticated state for tests
export const setAuthState = (token: string, user?: ReturnType<typeof AuthFactory.createUserProfile>) => {
  currentAccessToken = token;
  currentUser = user || AuthFactory.createUserProfile();
};
