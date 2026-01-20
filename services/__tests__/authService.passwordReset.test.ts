/**
 * Password Reset Functionality Tests
 * Tests for requestPasswordReset and resetPassword methods
 * Following TDD/BDD approach with Given/When/Then structure
 *
 * Refs #427 - Password Reset Implementation
 */

import { authService } from '../authService';

describe('AuthService - Password Reset', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('requestPasswordReset', () => {
    it('should successfully request password reset with valid email', async () => {
      // Given
      const email = 'user@example.com';
      const expectedResponse = {
        message: 'Password reset email sent successfully',
        success: true,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => expectedResponse,
      });

      // When
      const result = await authService.requestPasswordReset(email);

      // Then
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/public/auth/forgot-password'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        })
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when API returns 404 for non-existent email', async () => {
      // Given
      const email = 'nonexistent@example.com';
      const errorResponse = {
        detail: 'User not found',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => errorResponse,
      });

      // When/Then
      await expect(authService.requestPasswordReset(email)).rejects.toThrow('User not found');
    });

    it('should throw error when network fails', async () => {
      // Given
      const email = 'user@example.com';
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      // When/Then
      await expect(authService.requestPasswordReset(email)).rejects.toThrow('Network error');
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password with valid token and new password', async () => {
      // Given
      const token = 'valid-reset-token-123';
      const newPassword = 'NewSecurePassword123!';
      const expectedResponse = {
        message: 'Password reset successful',
        success: true,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => expectedResponse,
      });

      // When
      const result = await authService.resetPassword(token, newPassword);

      // Then
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/public/auth/reset-password'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, new_password: newPassword }),
        })
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when token is invalid', async () => {
      // Given
      const token = 'invalid-token';
      const newPassword = 'NewPassword123!';
      const errorResponse = {
        detail: 'Invalid or expired reset token',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => errorResponse,
      });

      // When/Then
      await expect(authService.resetPassword(token, newPassword)).rejects.toThrow('Invalid or expired reset token');
    });

    it('should throw error when network fails', async () => {
      // Given
      const token = 'valid-token';
      const newPassword = 'NewPassword123!';
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      // When/Then
      await expect(authService.resetPassword(token, newPassword)).rejects.toThrow('Network error');
    });
  });

  describe('Integration - Full Password Reset Flow', () => {
    it('should complete full reset flow from request to password change', async () => {
      // Given
      const email = 'user@example.com';
      const resetToken = 'generated-token-123';
      const newPassword = 'NewSecurePassword123!';

      // When - Step 1: Request password reset
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Email sent', success: true }),
      });

      const requestResult = await authService.requestPasswordReset(email);

      // Then - Step 1: Verify email request succeeded
      expect(requestResult.success).toBe(true);

      // When - Step 2: Reset password with token
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Password reset', success: true }),
      });

      const resetResult = await authService.resetPassword(resetToken, newPassword);

      // Then - Step 2: Verify password reset succeeded
      expect(resetResult.success).toBe(true);
    });
  });
});
