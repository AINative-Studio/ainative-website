/**
 * Stripe Connect Service Tests
 * Comprehensive tests for Stripe Connect OAuth flow and account management
 * Target: 85%+ coverage
 */

import apiClient from '@/lib/api-client';

// Mock apiClient
jest.mock('@/lib/api-client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

import type {
  StripeConnectService as StripeConnectServiceType,
  StripeConnectAccount,
} from '../stripeConnectService';

describe('StripeConnectService', () => {
  let stripeConnectService: StripeConnectServiceType;

  const mockAccount: StripeConnectAccount = {
    id: 'acc-123',
    account_id: 'acct_stripe123',
    user_id: 'user-456',
    status: 'active',
    charges_enabled: true,
    payouts_enabled: true,
    details_submitted: true,
    country: 'US',
    currency: 'USD',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
    requirements: {
      currently_due: [],
      eventually_due: [],
      past_due: [],
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const { StripeConnectService } = await import('../stripeConnectService');
    stripeConnectService = new StripeConnectService();
  });

  describe('OAuth Flow Methods', () => {
    describe('getAuthorizationUrl()', () => {
      it('should get authorization URL successfully', async () => {
        const mockUrl = 'https://connect.stripe.com/oauth/authorize?client_id=xyz';
        mockedApiClient.post.mockResolvedValue({
          data: {
            success: true,
            message: 'Success',
            data: { url: mockUrl },
          },
        });

        const result = await stripeConnectService.getAuthorizationUrl(
          'https://example.com/callback',
          'state-token-123'
        );

        expect(mockedApiClient.post).toHaveBeenCalledWith(
          '/api/v1/stripe-connect/authorize',
          {
            redirect_uri: 'https://example.com/callback',
            state: 'state-token-123',
          }
        );
        expect(result).toBe(mockUrl);
      });

      it('should throw error when authorization URL is not returned', async () => {
        mockedApiClient.post.mockResolvedValue({
          data: {
            success: false,
            message: 'Failed to generate URL',
            data: null,
          },
        });

        await expect(
          stripeConnectService.getAuthorizationUrl(
            'https://example.com/callback',
            'state-token-123'
          )
        ).rejects.toThrow('Failed to generate URL');
      });

      it('should handle network errors', async () => {
        mockedApiClient.post.mockRejectedValue(new Error('Network Error'));

        await expect(
          stripeConnectService.getAuthorizationUrl(
            'https://example.com/callback',
            'state-token-123'
          )
        ).rejects.toThrow('Network Error');
      });
    });

    describe('completeOAuthFlow()', () => {
      it('should complete OAuth flow successfully', async () => {
        mockedApiClient.post.mockResolvedValue({
          data: {
            success: true,
            message: 'Account linked',
            data: {
              account: mockAccount,
              redirect_url: '/developer/payouts',
            },
          },
        });

        const result = await stripeConnectService.completeOAuthFlow(
          'auth-code-123',
          'state-token-123'
        );

        expect(mockedApiClient.post).toHaveBeenCalledWith(
          '/api/v1/stripe-connect/callback',
          {
            code: 'auth-code-123',
            state: 'state-token-123',
          }
        );
        expect(result.success).toBe(true);
        expect(result.account).toEqual(mockAccount);
        expect(result.redirect_url).toBe('/developer/payouts');
      });

      it('should return failure when OAuth flow fails', async () => {
        mockedApiClient.post.mockResolvedValue({
          data: {
            success: false,
            message: 'Invalid authorization code',
            data: null,
          },
        });

        const result = await stripeConnectService.completeOAuthFlow(
          'invalid-code',
          'state-token-123'
        );

        expect(result.success).toBe(false);
        expect(result.message).toBe('Invalid authorization code');
      });

      it('should handle axios errors with response', async () => {
        mockedApiClient.post.mockRejectedValue({
          response: {
            data: {
              message: 'State mismatch - CSRF protection',
            },
          },
        });

        const result = await stripeConnectService.completeOAuthFlow(
          'auth-code-123',
          'wrong-state'
        );

        expect(result.success).toBe(false);
        expect(result.message).toBe('State mismatch - CSRF protection');
      });

      it('should handle generic errors', async () => {
        mockedApiClient.post.mockRejectedValue(new Error('Connection timeout'));

        const result = await stripeConnectService.completeOAuthFlow(
          'auth-code-123',
          'state-token-123'
        );

        expect(result.success).toBe(false);
        expect(result.message).toBe('Connection timeout');
      });

      it('should handle non-Error thrown values', async () => {
        mockedApiClient.post.mockRejectedValue('Unknown error');

        const result = await stripeConnectService.completeOAuthFlow(
          'auth-code-123',
          'state-token-123'
        );

        expect(result.success).toBe(false);
        expect(result.message).toContain('Failed to link Stripe account');
      });
    });

    describe('handleOAuthError()', () => {
      it('should handle access_denied error', () => {
        const result = stripeConnectService.handleOAuthError('access_denied');

        expect(result.success).toBe(false);
        expect(result.message).toBe('You denied access to your Stripe account');
      });

      it('should handle invalid_request error', () => {
        const result = stripeConnectService.handleOAuthError('invalid_request');

        expect(result.success).toBe(false);
        expect(result.message).toBe('Invalid authorization request');
      });

      it('should handle server_error', () => {
        const result = stripeConnectService.handleOAuthError('server_error');

        expect(result.success).toBe(false);
        expect(result.message).toBe('Stripe server error. Please try again later');
      });

      it('should use error description for unknown errors', () => {
        const result = stripeConnectService.handleOAuthError(
          'unknown_error',
          'Custom error description'
        );

        expect(result.success).toBe(false);
        expect(result.message).toBe('Custom error description');
      });

      it('should use default message for unknown errors without description', () => {
        const result = stripeConnectService.handleOAuthError('unknown_error');

        expect(result.success).toBe(false);
        expect(result.message).toBe('Failed to connect Stripe account');
      });
    });
  });

  describe('Account Management Methods', () => {
    describe('getConnectAccount()', () => {
      it('should fetch Stripe Connect account successfully', async () => {
        mockedApiClient.get.mockResolvedValue({
          data: {
            success: true,
            message: 'Success',
            data: { account: mockAccount },
          },
        });

        const result = await stripeConnectService.getConnectAccount();

        expect(mockedApiClient.get).toHaveBeenCalledWith(
          '/api/v1/stripe-connect/account'
        );
        expect(result).toEqual(mockAccount);
      });

      it('should return null when no account exists', async () => {
        mockedApiClient.get.mockResolvedValue({
          data: {
            success: false,
            message: 'No account found',
            data: null,
          },
        });

        const result = await stripeConnectService.getConnectAccount();

        expect(result).toBeNull();
      });

      it('should return null on error', async () => {
        mockedApiClient.get.mockRejectedValue(new Error('Network Error'));

        const result = await stripeConnectService.getConnectAccount();

        expect(result).toBeNull();
      });
    });

    describe('disconnectAccount()', () => {
      it('should disconnect account successfully', async () => {
        mockedApiClient.delete.mockResolvedValue({
          data: {
            success: true,
            message: 'Disconnected',
            data: { success: true },
          },
        });

        const result = await stripeConnectService.disconnectAccount();

        expect(mockedApiClient.delete).toHaveBeenCalledWith(
          '/api/v1/stripe-connect/account'
        );
        expect(result.success).toBe(true);
        expect(result.message).toBe('Stripe account disconnected successfully');
      });

      it('should return failure when disconnect fails', async () => {
        mockedApiClient.delete.mockResolvedValue({
          data: {
            success: false,
            message: 'Cannot disconnect active account',
            data: null,
          },
        });

        const result = await stripeConnectService.disconnectAccount();

        expect(result.success).toBe(false);
        expect(result.message).toBe('Cannot disconnect active account');
      });

      it('should handle errors', async () => {
        mockedApiClient.delete.mockRejectedValue(
          new Error('Failed to disconnect')
        );

        const result = await stripeConnectService.disconnectAccount();

        expect(result.success).toBe(false);
        expect(result.message).toBe('Failed to disconnect');
      });
    });

    describe('getOnboardingLink()', () => {
      it('should get onboarding link successfully', async () => {
        const mockUrl = 'https://connect.stripe.com/setup/onboarding/xyz';
        mockedApiClient.post.mockResolvedValue({
          data: {
            success: true,
            message: 'Success',
            data: { url: mockUrl },
          },
        });

        const result = await stripeConnectService.getOnboardingLink();

        expect(mockedApiClient.post).toHaveBeenCalledWith(
          '/api/v1/stripe-connect/onboarding-link'
        );
        expect(result).toBe(mockUrl);
      });

      it('should return null when link generation fails', async () => {
        mockedApiClient.post.mockResolvedValue({
          data: {
            success: false,
            message: 'Failed',
            data: null,
          },
        });

        const result = await stripeConnectService.getOnboardingLink();

        expect(result).toBeNull();
      });

      it('should return null on error', async () => {
        mockedApiClient.post.mockRejectedValue(new Error('Error'));

        const result = await stripeConnectService.getOnboardingLink();

        expect(result).toBeNull();
      });
    });

    describe('refreshAccount()', () => {
      it('should refresh account successfully', async () => {
        mockedApiClient.post.mockResolvedValue({
          data: {
            success: true,
            message: 'Refreshed',
            data: { account: mockAccount },
          },
        });

        const result = await stripeConnectService.refreshAccount();

        expect(mockedApiClient.post).toHaveBeenCalledWith(
          '/api/v1/stripe-connect/refresh'
        );
        expect(result).toEqual(mockAccount);
      });

      it('should return null when refresh fails', async () => {
        mockedApiClient.post.mockResolvedValue({
          data: {
            success: false,
            message: 'Failed',
            data: null,
          },
        });

        const result = await stripeConnectService.refreshAccount();

        expect(result).toBeNull();
      });

      it('should return null on error', async () => {
        mockedApiClient.post.mockRejectedValue(new Error('Error'));

        const result = await stripeConnectService.refreshAccount();

        expect(result).toBeNull();
      });
    });
  });

  describe('Utility Methods', () => {
    describe('getStatusDisplayText()', () => {
      it('should return correct display text for account status', () => {
        expect(stripeConnectService.getStatusDisplayText('pending')).toBe(
          'Pending Verification'
        );
        expect(stripeConnectService.getStatusDisplayText('active')).toBe('Active');
        expect(stripeConnectService.getStatusDisplayText('restricted')).toBe(
          'Restricted'
        );
        expect(stripeConnectService.getStatusDisplayText('disabled')).toBe(
          'Disabled'
        );
        expect(stripeConnectService.getStatusDisplayText('rejected')).toBe(
          'Rejected'
        );
      });

      it('should return raw status for unknown status', () => {
        expect(
          stripeConnectService.getStatusDisplayText('unknown' as any)
        ).toBe('unknown');
      });
    });

    describe('getStatusColorClass()', () => {
      it('should return correct color classes', () => {
        expect(stripeConnectService.getStatusColorClass('pending')).toContain(
          'yellow'
        );
        expect(stripeConnectService.getStatusColorClass('active')).toContain(
          'green'
        );
        expect(stripeConnectService.getStatusColorClass('restricted')).toContain(
          'orange'
        );
        expect(stripeConnectService.getStatusColorClass('disabled')).toContain(
          'red'
        );
        expect(stripeConnectService.getStatusColorClass('rejected')).toContain(
          'red'
        );
      });

      it('should return default color for unknown status', () => {
        expect(
          stripeConnectService.getStatusColorClass('unknown' as any)
        ).toContain('gray');
      });
    });

    describe('isAccountFullyOnboarded()', () => {
      it('should return true for fully onboarded account', () => {
        const result = stripeConnectService.isAccountFullyOnboarded(mockAccount);

        expect(result).toBe(true);
      });

      it('should return false when details not submitted', () => {
        const incompleteAccount = {
          ...mockAccount,
          details_submitted: false,
        };

        const result =
          stripeConnectService.isAccountFullyOnboarded(incompleteAccount);

        expect(result).toBe(false);
      });

      it('should return false when charges not enabled', () => {
        const incompleteAccount = {
          ...mockAccount,
          charges_enabled: false,
        };

        const result =
          stripeConnectService.isAccountFullyOnboarded(incompleteAccount);

        expect(result).toBe(false);
      });

      it('should return false when payouts not enabled', () => {
        const incompleteAccount = {
          ...mockAccount,
          payouts_enabled: false,
        };

        const result =
          stripeConnectService.isAccountFullyOnboarded(incompleteAccount);

        expect(result).toBe(false);
      });

      it('should return false when status is not active', () => {
        const incompleteAccount = {
          ...mockAccount,
          status: 'pending' as const,
        };

        const result =
          stripeConnectService.isAccountFullyOnboarded(incompleteAccount);

        expect(result).toBe(false);
      });
    });

    describe('generateStateToken()', () => {
      it('should generate a state token', () => {
        const token = stripeConnectService.generateStateToken();

        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.length).toBeGreaterThan(0);
      });

      it('should generate unique tokens', () => {
        const token1 = stripeConnectService.generateStateToken();
        const token2 = stripeConnectService.generateStateToken();

        expect(token1).not.toBe(token2);
      });
    });

    describe('validateStateToken()', () => {
      it('should return true for matching tokens', () => {
        const result = stripeConnectService.validateStateToken(
          'token-123',
          'token-123'
        );

        expect(result).toBe(true);
      });

      it('should return false for non-matching tokens', () => {
        const result = stripeConnectService.validateStateToken(
          'token-123',
          'token-456'
        );

        expect(result).toBe(false);
      });

      it('should return false for empty received state', () => {
        const result = stripeConnectService.validateStateToken('', 'token-123');

        expect(result).toBe(false);
      });

      it('should return false for empty stored state', () => {
        const result = stripeConnectService.validateStateToken('token-123', '');

        expect(result).toBe(false);
      });

      it('should return false for both empty', () => {
        const result = stripeConnectService.validateStateToken('', '');

        expect(result).toBe(false);
      });
    });
  });

  describe('Singleton Export', () => {
    it('should export a singleton instance', async () => {
      const { stripeConnectService } = await import('../stripeConnectService');
      expect(stripeConnectService).toBeDefined();
      expect(typeof stripeConnectService.getConnectAccount).toBe('function');
      expect(typeof stripeConnectService.completeOAuthFlow).toBe('function');
    });
  });
});
