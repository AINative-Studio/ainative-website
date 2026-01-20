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
<<<<<<< HEAD
    describe('Success Cases', () => {
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

      it('should handle different email formats correctly', async () => {
        // Given
        const emails = [
          'test@example.com',
          'user.name@domain.co.uk',
          'email+tag@example.org',
        ];

        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: async () => ({ message: 'Success', success: true }),
        });

        // When/Then
        for (const email of emails) {
          const result = await authService.requestPasswordReset(email);
          expect(result.success).toBe(true);
        }
      });
    });

    describe('Error Cases', () => {
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

      it('should throw error when API returns 500', async () => {
        // Given
        const email = 'user@example.com';

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ detail: 'Internal server error' }),
        });

        // When/Then
        await expect(authService.requestPasswordReset(email)).rejects.toThrow('Internal server error');
      });

      it('should throw error when network fails', async () => {
        // Given
        const email = 'user@example.com';
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        // When/Then
        await expect(authService.requestPasswordReset(email)).rejects.toThrow('Network error');
      });

      it('should handle missing error detail gracefully', async () => {
        // Given
        const email = 'user@example.com';

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({}),
        });

        // When/Then
        await expect(authService.requestPasswordReset(email)).rejects.toThrow('Password reset request failed');
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty email string', async () => {
        // Given
        const email = '';

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({ detail: 'Email is required' }),
        });

        // When/Then
        await expect(authService.requestPasswordReset(email)).rejects.toThrow('Email is required');
      });

      it('should handle malformed API response', async () => {
        // Given
        const email = 'user@example.com';

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => null,
        });

        // When
        const result = await authService.requestPasswordReset(email);

        // Then
        expect(result).toBeNull();
      });
=======
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
>>>>>>> f791dac (Implement password reset functionality)
    });
  });

  describe('resetPassword', () => {
<<<<<<< HEAD
    describe('Success Cases', () => {
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

      it('should handle complex passwords with special characters', async () => {
        // Given
        const token = 'valid-token';
        const passwords = [
          'P@ssw0rd!',
          'C0mpl3x#P@ss',
          'Str0ng$ecure&123',
        ];

        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: async () => ({ message: 'Success', success: true }),
        });

        // When/Then
        for (const password of passwords) {
          const result = await authService.resetPassword(token, password);
          expect(result.success).toBe(true);
        }
      });
    });

    describe('Error Cases', () => {
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

      it('should throw error when token is expired', async () => {
        // Given
        const token = 'expired-token';
        const newPassword = 'NewPassword123!';

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({ detail: 'Token has expired' }),
        });

        // When/Then
        await expect(authService.resetPassword(token, newPassword)).rejects.toThrow('Token has expired');
      });

      it('should throw error when password is too weak', async () => {
        // Given
        const token = 'valid-token';
        const weakPassword = '12345';

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({ detail: 'Password does not meet security requirements' }),
        });

        // When/Then
        await expect(authService.resetPassword(token, weakPassword)).rejects.toThrow('Password does not meet security requirements');
      });

      it('should throw error when API returns 500', async () => {
        // Given
        const token = 'valid-token';
        const newPassword = 'NewPassword123!';

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ detail: 'Internal server error' }),
        });

        // When/Then
        await expect(authService.resetPassword(token, newPassword)).rejects.toThrow('Internal server error');
      });

      it('should throw error when network fails', async () => {
        // Given
        const token = 'valid-token';
        const newPassword = 'NewPassword123!';
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        // When/Then
        await expect(authService.resetPassword(token, newPassword)).rejects.toThrow('Network error');
      });

      it('should handle missing error detail gracefully', async () => {
        // Given
        const token = 'valid-token';
        const newPassword = 'NewPassword123!';

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({}),
        });

        // When/Then
        await expect(authService.resetPassword(token, newPassword)).rejects.toThrow('Password reset failed');
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty token', async () => {
        // Given
        const token = '';
        const newPassword = 'NewPassword123!';

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({ detail: 'Token is required' }),
        });

        // When/Then
        await expect(authService.resetPassword(token, newPassword)).rejects.toThrow('Token is required');
      });

      it('should handle empty password', async () => {
        // Given
        const token = 'valid-token';
        const newPassword = '';

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({ detail: 'Password is required' }),
        });

        // When/Then
        await expect(authService.resetPassword(token, newPassword)).rejects.toThrow('Password is required');
      });

      it('should handle malformed API response', async () => {
        // Given
        const token = 'valid-token';
        const newPassword = 'NewPassword123!';

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => null,
        });

        // When
        const result = await authService.resetPassword(token, newPassword);

        // Then
        expect(result).toBeNull();
      });
    });

    describe('Security', () => {
      it('should not expose token in error messages', async () => {
        // Given
        const token = 'secret-token-123';
        const newPassword = 'NewPassword123!';

        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API error'));

        // When/Then
        try {
          await authService.resetPassword(token, newPassword);
        } catch (error) {
          expect((error as Error).message).not.toContain(token);
        }
      });

      it('should not expose password in error messages', async () => {
        // Given
        const token = 'valid-token';
        const newPassword = 'SecretPassword123!';

        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API error'));

        // When/Then
        try {
          await authService.resetPassword(token, newPassword);
        } catch (error) {
          expect((error as Error).message).not.toContain(newPassword);
        }
      });
=======
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
>>>>>>> f791dac (Implement password reset functionality)
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
<<<<<<< HEAD

    it('should handle failure at any step of the flow', async () => {
      // Given
      const email = 'nonexistent@example.com';

      // When - Request fails
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ detail: 'User not found' }),
      });

      // Then - Should fail at first step
      await expect(authService.requestPasswordReset(email)).rejects.toThrow('User not found');

      // Verify that no further calls were made
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
=======
>>>>>>> f791dac (Implement password reset functionality)
  });
});
