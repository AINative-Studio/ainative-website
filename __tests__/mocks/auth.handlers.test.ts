/**
 * Unit tests for Auth MSW Handlers
 * Ensures mock handlers behave correctly
 */
import { server, http, HttpResponse } from '@/mocks/server';
import { AuthFactory } from '@/mocks';
import { resetAuthState, setAuthState } from '@/mocks/handlers/auth.handlers';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.ainative.studio';

describe('Auth Handlers', () => {
  afterEach(() => {
    resetAuthState();
  });

  describe('POST /v1/public/auth/login', () => {
    it('returns success response for valid credentials', async () => {
      const response = await fetch(`${BASE_URL}/v1/public/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          username: 'test@example.com',
          password: 'password123',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('access_token');
      expect(data).toHaveProperty('user');
      expect(data.user.email).toBe('test@example.com');
    });

    it('returns 401 for wrong password', async () => {
      const response = await fetch(`${BASE_URL}/v1/public/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          username: 'test@example.com',
          password: 'wrongpassword',
        }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.detail).toContain('Incorrect');
    });
  });

  describe('POST /v1/public/auth/register', () => {
    it('creates new user successfully', async () => {
      const response = await fetch(`${BASE_URL}/v1/public/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'newuser@example.com',
          password: 'password123',
          full_name: 'New User',
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toHaveProperty('access_token');
      expect(data.email).toBe('newuser@example.com');
    });

    it('returns 400 for duplicate email', async () => {
      const response = await fetch(`${BASE_URL}/v1/public/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'existing@example.com',
          password: 'password123',
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.detail).toContain('already registered');
    });
  });

  describe('GET /v1/auth/me', () => {
    it('returns user profile when authenticated', async () => {
      const mockToken = 'valid_token_123';
      const mockUser = AuthFactory.createUserProfile();
      setAuthState(mockToken, mockUser);

      const response = await fetch(`${BASE_URL}/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${mockToken}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.email).toBe(mockUser.email);
    });

    it('returns 401 without token', async () => {
      const response = await fetch(`${BASE_URL}/v1/auth/me`);

      expect(response.status).toBe(401);
    });

    it('returns 401 with invalid token', async () => {
      setAuthState('valid_token_123');

      const response = await fetch(`${BASE_URL}/v1/auth/me`, {
        headers: {
          'Authorization': 'Bearer invalid_token',
        },
      });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /v1/auth/logout', () => {
    it('clears auth state', async () => {
      setAuthState('token_123');

      const response = await fetch(`${BASE_URL}/v1/auth/logout`, {
        method: 'POST',
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.message).toContain('Logged out');
    });
  });

  describe('GET /v1/public/auth/verify-email', () => {
    it('verifies email with valid token', async () => {
      const response = await fetch(
        `${BASE_URL}/v1/public/auth/verify-email?token=valid_token_123`
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.message).toContain('verified');
    });

    it('returns 400 for invalid token', async () => {
      const response = await fetch(
        `${BASE_URL}/v1/public/auth/verify-email?token=invalid-token`
      );

      expect(response.status).toBe(400);
    });
  });

  describe('POST /v1/public/auth/github/callback', () => {
    it('handles GitHub OAuth successfully', async () => {
      const response = await fetch(`${BASE_URL}/v1/public/auth/github/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'valid_github_code',
          redirect_uri: 'http://localhost:3000/login/callback',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('access_token');
      expect(data.user).toHaveProperty('github_username');
    });

    it('returns 400 for invalid code', async () => {
      const response = await fetch(`${BASE_URL}/v1/public/auth/github/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'invalid-code',
        }),
      });

      expect(response.status).toBe(400);
    });
  });
});
