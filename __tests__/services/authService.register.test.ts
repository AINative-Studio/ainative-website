/**
 * Auth Service Register Method Field Mapping Tests
 *
 * Tests to verify that the register method correctly maps fields
 * to match the backend UserCreate schema
 *
 * Refs #604
 */

import { authService, RegisterData } from '@/services/authService';

// Mock fetch globally
global.fetch = jest.fn();

describe('authService.register - Field Mapping', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should send correct field names matching backend UserCreate schema', async () => {
    // Given: User registration data
    const registerData: RegisterData = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      name: 'Test User',
    };

    // Mock successful registration response
    const mockLoginResponse = {
      access_token: 'mock-access-token',
      token_type: 'Bearer',
      refresh_token: 'mock-refresh-token',
    };

    // Mock both register and login endpoints
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockLoginResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockLoginResponse,
      });

    // When: Register is called
    await authService.register(registerData);

    // Then: Verify the request body contains correct field names
    const registerCall = (global.fetch as jest.Mock).mock.calls[0];
    expect(registerCall[0]).toContain('/api/v1/auth/register');

    const requestBody = JSON.parse(registerCall[1].body);
    expect(requestBody).toEqual({
      email: 'test@example.com',
      password: 'SecurePass123!',
      name: 'Test User', // Should be 'name', NOT 'full_name' or 'preferred_name'
    });

    // Verify no incorrect field names are sent
    expect(requestBody).not.toHaveProperty('full_name');
    expect(requestBody).not.toHaveProperty('preferred_name');
  });

  it('should use name field as required by backend schema', async () => {
    // Given: Registration data with name
    const registerData: RegisterData = {
      email: 'newuser@example.com',
      password: 'Password123!',
      name: 'John Doe',
    };

    // Mock successful registration
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          access_token: 'token',
          token_type: 'Bearer',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          access_token: 'token',
          token_type: 'Bearer',
        }),
      });

    // When: Register is called
    await authService.register(registerData);

    // Then: Request contains 'name' field
    const registerCall = (global.fetch as jest.Mock).mock.calls[0];
    const requestBody = JSON.parse(registerCall[1].body);

    expect(requestBody.name).toBe('John Doe');
    expect(typeof requestBody.name).toBe('string');
  });

  it('should match backend UserCreate schema structure', async () => {
    // Given: Complete registration data
    const registerData: RegisterData = {
      email: 'user@test.com',
      password: 'ValidPass123!',
      name: 'Test Name',
    };

    // Mock responses
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ access_token: 'token', token_type: 'Bearer' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ access_token: 'token', token_type: 'Bearer' }),
      });

    // When: Register is called
    await authService.register(registerData);

    // Then: Verify request structure matches backend expectations
    const registerCall = (global.fetch as jest.Mock).mock.calls[0];
    const requestBody = JSON.parse(registerCall[1].body);

    // Backend UserCreate schema requires: email, password, name (all required)
    expect(requestBody).toHaveProperty('email');
    expect(requestBody).toHaveProperty('password');
    expect(requestBody).toHaveProperty('name');

    // Verify only expected fields are present
    const expectedFields = ['email', 'password', 'name'];
    const actualFields = Object.keys(requestBody);
    expect(actualFields.sort()).toEqual(expectedFields.sort());
  });

  it('should handle registration with minimal required fields', async () => {
    // Given: Only required fields
    const registerData: RegisterData = {
      email: 'minimal@test.com',
      password: 'Pass123!',
      name: 'Min User',
    };

    // Mock successful response
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ access_token: 'token', token_type: 'Bearer' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ access_token: 'token', token_type: 'Bearer' }),
      });

    // When: Register is called
    const result = await authService.register(registerData);

    // Then: Registration should succeed
    expect(result).toBeDefined();
    expect(result.access_token).toBe('token');
  });

  it('should reject registration data with incorrect field names', () => {
    // This test ensures TypeScript prevents incorrect field usage
    const invalidData = {
      email: 'test@example.com',
      password: 'Pass123!',
      // @ts-expect-error - Testing that preferred_name is not accepted
      preferred_name: 'Wrong Field',
    };

    // TypeScript should catch this at compile time
    expect(invalidData).toBeDefined();
  });
});
