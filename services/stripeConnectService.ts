/**
 * Stripe Connect Service
 * Handles Stripe Connect OAuth flow and account linking for developer payouts
 */

import apiClient from '@/lib/api-client';

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Standard operation result
 */
export interface OperationResult {
  success: boolean;
  message: string;
}

// ============================================================================
// Stripe Connect Interfaces
// ============================================================================

/**
 * Stripe Connect account status
 */
export type StripeAccountStatus =
  | 'pending'
  | 'active'
  | 'restricted'
  | 'disabled'
  | 'rejected';

/**
 * Stripe Connect account details
 */
export interface StripeConnectAccount {
  id: string;
  account_id: string;
  user_id: string;
  status: StripeAccountStatus;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  country: string;
  currency: string;
  created_at: string;
  updated_at: string;
  requirements?: {
    currently_due: string[];
    eventually_due: string[];
    past_due: string[];
  };
}

/**
 * OAuth authorization parameters
 */
export interface OAuthAuthorizationParams {
  client_id: string;
  state: string;
  redirect_uri: string;
  scope?: string;
  suggested_capabilities?: string[];
}

/**
 * OAuth callback parameters
 */
export interface OAuthCallbackParams {
  code: string;
  state: string;
  error?: string;
  error_description?: string;
}

/**
 * Account linking result
 */
export interface AccountLinkingResult {
  success: boolean;
  message: string;
  account?: StripeConnectAccount;
  redirect_url?: string;
}

// ============================================================================
// Stripe Connect Service Class
// ============================================================================

/**
 * Stripe Connect Service
 * Manages Stripe Connect OAuth flow and account operations
 */
export class StripeConnectService {
  private readonly basePath = '/api/v1/stripe-connect';

  // ==========================================================================
  // OAuth Flow Methods
  // ==========================================================================

  /**
   * Get OAuth authorization URL to start Stripe Connect flow
   * @param redirectUri - Callback URL after authorization
   * @param state - CSRF protection state token
   */
  async getAuthorizationUrl(
    redirectUri: string,
    state: string
  ): Promise<string> {
    try {
      const response = await apiClient.post<ApiResponse<{ url: string }>>(
        `${this.basePath}/authorize`,
        {
          redirect_uri: redirectUri,
          state,
        }
      );

      if (!response.data.success || !response.data.data?.url) {
        throw new Error(
          response.data.message || 'Failed to get authorization URL'
        );
      }

      return response.data.data.url;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to get authorization URL';
      console.error('Error getting authorization URL:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Complete OAuth flow by exchanging code for account
   * @param code - OAuth authorization code from Stripe
   * @param state - CSRF protection state token (must match initial request)
   */
  async completeOAuthFlow(
    code: string,
    state: string
  ): Promise<AccountLinkingResult> {
    try {
      const response = await apiClient.post<
        ApiResponse<{
          account: StripeConnectAccount;
          redirect_url?: string;
        }>
      >(`${this.basePath}/callback`, {
        code,
        state,
      });

      if (!response.data.success) {
        return {
          success: false,
          message: response.data.message || 'Failed to link Stripe account',
        };
      }

      const { account, redirect_url } = response.data.data;

      return {
        success: true,
        message: 'Stripe account linked successfully',
        account,
        redirect_url,
      };
    } catch (error: unknown) {
      console.error('Error completing OAuth flow:', error);

      let errorMessage = 'Failed to link Stripe account. Please try again.';

      if (error && typeof error === 'object') {
        if ('response' in error) {
          const axiosError = error as {
            response?: { data?: { message?: string } };
          };
          errorMessage = axiosError?.response?.data?.message || errorMessage;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
      }

      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Handle OAuth error callback
   * @param error - Error code from Stripe
   * @param errorDescription - Detailed error description
   */
  handleOAuthError(error: string, errorDescription?: string): OperationResult {
    console.error('Stripe OAuth error:', { error, errorDescription });

    const errorMessages: Record<string, string> = {
      access_denied: 'You denied access to your Stripe account',
      invalid_request: 'Invalid authorization request',
      invalid_scope: 'Invalid permission scope requested',
      server_error: 'Stripe server error. Please try again later',
      temporarily_unavailable: 'Stripe is temporarily unavailable',
    };

    return {
      success: false,
      message:
        errorMessages[error] ||
        errorDescription ||
        'Failed to connect Stripe account',
    };
  }

  // ==========================================================================
  // Account Management Methods
  // ==========================================================================

  /**
   * Get current user's Stripe Connect account
   */
  async getConnectAccount(): Promise<StripeConnectAccount | null> {
    try {
      const response = await apiClient.get<
        ApiResponse<{ account: StripeConnectAccount }>
      >(`${this.basePath}/account`);

      if (!response.data.success || !response.data.data?.account) {
        return null;
      }

      return response.data.data.account;
    } catch (error) {
      console.error('Failed to fetch Stripe Connect account:', error);
      return null;
    }
  }

  /**
   * Disconnect Stripe Connect account
   */
  async disconnectAccount(): Promise<OperationResult> {
    try {
      const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(
        `${this.basePath}/account`
      );

      if (!response.data.success) {
        return {
          success: false,
          message:
            response.data.message || 'Failed to disconnect Stripe account',
        };
      }

      return {
        success: true,
        message: 'Stripe account disconnected successfully',
      };
    } catch (error: unknown) {
      console.error('Error disconnecting Stripe account:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to disconnect Stripe account';

      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Get account onboarding link for incomplete accounts
   */
  async getOnboardingLink(): Promise<string | null> {
    try {
      const response = await apiClient.post<ApiResponse<{ url: string }>>(
        `${this.basePath}/onboarding-link`
      );

      if (!response.data.success || !response.data.data?.url) {
        return null;
      }

      return response.data.data.url;
    } catch (error) {
      console.error('Failed to get onboarding link:', error);
      return null;
    }
  }

  /**
   * Refresh account to get latest status from Stripe
   */
  async refreshAccount(): Promise<StripeConnectAccount | null> {
    try {
      const response = await apiClient.post<
        ApiResponse<{ account: StripeConnectAccount }>
      >(`${this.basePath}/refresh`);

      if (!response.data.success || !response.data.data?.account) {
        return null;
      }

      return response.data.data.account;
    } catch (error) {
      console.error('Failed to refresh account:', error);
      return null;
    }
  }

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  /**
   * Get account status display text
   * @param status - Stripe account status
   */
  getStatusDisplayText(status: StripeAccountStatus): string {
    const statusMap: Record<StripeAccountStatus, string> = {
      pending: 'Pending Verification',
      active: 'Active',
      restricted: 'Restricted',
      disabled: 'Disabled',
      rejected: 'Rejected',
    };

    return statusMap[status] || status;
  }

  /**
   * Get account status color class for UI
   * @param status - Stripe account status
   */
  getStatusColorClass(status: StripeAccountStatus): string {
    const colorMap: Record<StripeAccountStatus, string> = {
      pending: 'text-yellow-600 bg-yellow-50',
      active: 'text-green-600 bg-green-50',
      restricted: 'text-orange-600 bg-orange-50',
      disabled: 'text-red-600 bg-red-50',
      rejected: 'text-red-600 bg-red-50',
    };

    return colorMap[status] || 'text-gray-600 bg-gray-50';
  }

  /**
   * Check if account is fully onboarded
   * @param account - Stripe Connect account
   */
  isAccountFullyOnboarded(account: StripeConnectAccount): boolean {
    return (
      account.details_submitted &&
      account.charges_enabled &&
      account.payouts_enabled &&
      account.status === 'active'
    );
  }

  /**
   * Generate CSRF state token for OAuth flow
   * Should be stored in session/cookie and validated on callback
   */
  generateStateToken(): string {
    // Generate a random state token for CSRF protection
    // In production, this should use crypto.randomBytes
    const array = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    }
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
      ''
    );
  }

  /**
   * Validate state token against stored value
   * @param receivedState - State from OAuth callback
   * @param storedState - State stored before OAuth flow
   */
  validateStateToken(receivedState: string, storedState: string): boolean {
    if (!receivedState || !storedState) {
      return false;
    }
    return receivedState === storedState;
  }
}

// Export singleton instance
export const stripeConnectService = new StripeConnectService();
