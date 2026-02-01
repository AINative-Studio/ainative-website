/**
 * Stripe Callback Client Component Tests
 * Comprehensive tests for OAuth callback handling
 * Target: 85%+ coverage
 */

import { render, screen, waitFor } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import StripeCallbackClient from '../StripeCallbackClient';
import { stripeConnectService } from '@/services/stripeConnectService';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('@/services/stripeConnectService', () => ({
  stripeConnectService: {
    completeOAuthFlow: jest.fn(),
    handleOAuthError: jest.fn(),
    validateStateToken: jest.fn(),
  },
}));

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('StripeCallbackClient', () => {
  const mockPush = jest.fn();
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    });
  });

  describe('Success Flow', () => {
    it('should handle successful OAuth callback with valid code and state', async () => {
      const mockSearchParams = new URLSearchParams({
        code: 'auth-code-123',
        state: 'state-token-123',
      });

      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      mockLocalStorage.setItem('stripe_oauth_state', 'state-token-123');

      (stripeConnectService.validateStateToken as jest.Mock).mockReturnValue(true);
      (stripeConnectService.completeOAuthFlow as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Account linked successfully',
        redirect_url: '/developer/payouts',
      });

      render(<StripeCallbackClient />);

      // Should show loading state
      expect(screen.getByText(/connecting stripe/i)).toBeInTheDocument();

      // Wait for OAuth completion
      await waitFor(() => {
        expect(stripeConnectService.validateStateToken).toHaveBeenCalledWith(
          'state-token-123',
          'state-token-123'
        );
        expect(stripeConnectService.completeOAuthFlow).toHaveBeenCalledWith(
          'auth-code-123',
          'state-token-123'
        );
      });

      // Should show success message
      await waitFor(() => {
        expect(
          screen.getByText(/account linked successfully/i)
        ).toBeInTheDocument();
      });

      // Should clean up localStorage
      await waitFor(() => {
        expect(mockLocalStorage.getItem('stripe_oauth_state')).toBeNull();
      });

      // Should redirect to payouts page after 2 second delay
      await waitFor(
        () => {
          expect(mockPush).toHaveBeenCalledWith('/developer/payouts');
        },
        { timeout: 3000 }
      );
    });

    it('should redirect to default success page if no redirect_url provided', async () => {
      const mockSearchParams = new URLSearchParams({
        code: 'auth-code-123',
        state: 'state-token-123',
      });

      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      mockLocalStorage.setItem('stripe_oauth_state', 'state-token-123');

      (stripeConnectService.validateStateToken as jest.Mock).mockReturnValue(true);
      (stripeConnectService.completeOAuthFlow as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Account linked successfully',
      });

      render(<StripeCallbackClient />);

      await waitFor(
        () => {
          expect(mockPush).toHaveBeenCalledWith('/developer/payouts');
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Error Flow - OAuth Errors', () => {
    it('should handle access_denied error from Stripe', async () => {
      const mockSearchParams = new URLSearchParams({
        error: 'access_denied',
        error_description: 'User denied access',
      });

      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      (stripeConnectService.handleOAuthError as jest.Mock).mockReturnValue({
        success: false,
        message: 'You denied access to your Stripe account',
      });

      render(<StripeCallbackClient />);

      await waitFor(() => {
        expect(stripeConnectService.handleOAuthError).toHaveBeenCalledWith(
          'access_denied',
          'User denied access'
        );
      });

      expect(
        screen.getByText(/you denied access to your stripe account/i)
      ).toBeInTheDocument();
    });

    it('should handle server_error from Stripe', async () => {
      const mockSearchParams = new URLSearchParams({
        error: 'server_error',
      });

      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      (stripeConnectService.handleOAuthError as jest.Mock).mockReturnValue({
        success: false,
        message: 'Stripe server error. Please try again later',
      });

      render(<StripeCallbackClient />);

      await waitFor(() => {
        expect(
          screen.getByText(/stripe server error/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Error Flow - Missing Parameters', () => {
    it('should handle missing code parameter', async () => {
      const mockSearchParams = new URLSearchParams({
        state: 'state-token-123',
      });

      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      render(<StripeCallbackClient />);

      await waitFor(() => {
        expect(
          screen.getByText(/missing authorization code/i)
        ).toBeInTheDocument();
      });
    });

    it('should handle missing state parameter', async () => {
      const mockSearchParams = new URLSearchParams({
        code: 'auth-code-123',
      });

      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      render(<StripeCallbackClient />);

      await waitFor(() => {
        expect(
          screen.getByText(/missing state parameter/i)
        ).toBeInTheDocument();
      });
    });

    it('should handle missing both code and state', async () => {
      const mockSearchParams = new URLSearchParams({});

      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      render(<StripeCallbackClient />);

      await waitFor(() => {
        expect(
          screen.getByText(/invalid callback request/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Error Flow - CSRF Protection', () => {
    it('should reject mismatched state tokens', async () => {
      const mockSearchParams = new URLSearchParams({
        code: 'auth-code-123',
        state: 'state-token-123',
      });

      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      mockLocalStorage.setItem('stripe_oauth_state', 'different-state-token');

      (stripeConnectService.validateStateToken as jest.Mock).mockReturnValue(
        false
      );

      render(<StripeCallbackClient />);

      await waitFor(() => {
        expect(
          screen.getByText(/security validation failed/i)
        ).toBeInTheDocument();
      });

      // Should not call completeOAuthFlow
      expect(stripeConnectService.completeOAuthFlow).not.toHaveBeenCalled();
    });

    it('should reject when state not found in localStorage', async () => {
      const mockSearchParams = new URLSearchParams({
        code: 'auth-code-123',
        state: 'state-token-123',
      });

      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      // No stored state in localStorage

      (stripeConnectService.validateStateToken as jest.Mock).mockReturnValue(
        false
      );

      render(<StripeCallbackClient />);

      await waitFor(() => {
        expect(
          screen.getByText(/security validation failed/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Error Flow - API Failures', () => {
    it('should handle API failure during OAuth completion', async () => {
      const mockSearchParams = new URLSearchParams({
        code: 'auth-code-123',
        state: 'state-token-123',
      });

      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      mockLocalStorage.setItem('stripe_oauth_state', 'state-token-123');

      (stripeConnectService.validateStateToken as jest.Mock).mockReturnValue(true);
      (stripeConnectService.completeOAuthFlow as jest.Mock).mockResolvedValue({
        success: false,
        message: 'Invalid authorization code',
      });

      render(<StripeCallbackClient />);

      await waitFor(() => {
        expect(
          screen.getByText(/invalid authorization code/i)
        ).toBeInTheDocument();
      });
    });

    it('should handle network errors during OAuth completion', async () => {
      const mockSearchParams = new URLSearchParams({
        code: 'auth-code-123',
        state: 'state-token-123',
      });

      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      mockLocalStorage.setItem('stripe_oauth_state', 'state-token-123');

      (stripeConnectService.validateStateToken as jest.Mock).mockReturnValue(true);
      (stripeConnectService.completeOAuthFlow as jest.Mock).mockRejectedValue(
        new Error('Network timeout')
      );

      render(<StripeCallbackClient />);

      await waitFor(() => {
        expect(
          screen.getByText(/failed to complete stripe connection/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state during OAuth processing', async () => {
      const mockSearchParams = new URLSearchParams({
        code: 'auth-code-123',
        state: 'state-token-123',
      });

      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      mockLocalStorage.setItem('stripe_oauth_state', 'state-token-123');

      (stripeConnectService.validateStateToken as jest.Mock).mockReturnValue(true);
      (stripeConnectService.completeOAuthFlow as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<StripeCallbackClient />);

      expect(screen.getByText(/connecting stripe/i)).toBeInTheDocument();
      expect(screen.getByText(/please wait while we verify/i)).toBeInTheDocument();
    });

    it('should clear loading state after completion', async () => {
      const mockSearchParams = new URLSearchParams({
        code: 'auth-code-123',
        state: 'state-token-123',
      });

      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      mockLocalStorage.setItem('stripe_oauth_state', 'state-token-123');

      (stripeConnectService.validateStateToken as jest.Mock).mockReturnValue(true);
      (stripeConnectService.completeOAuthFlow as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Success',
      });

      render(<StripeCallbackClient />);

      await waitFor(() => {
        expect(screen.queryByText(/connecting stripe/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Retry Functionality', () => {
    it('should provide retry button on error', async () => {
      const mockSearchParams = new URLSearchParams({
        error: 'server_error',
      });

      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      (stripeConnectService.handleOAuthError as jest.Mock).mockReturnValue({
        success: false,
        message: 'Server error',
      });

      render(<StripeCallbackClient />);

      await waitFor(() => {
        expect(screen.getByText(/try again/i)).toBeInTheDocument();
      });
    });

    it('should provide link back to developer dashboard', async () => {
      const mockSearchParams = new URLSearchParams({
        error: 'access_denied',
      });

      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      (stripeConnectService.handleOAuthError as jest.Mock).mockReturnValue({
        success: false,
        message: 'Access denied',
      });

      render(<StripeCallbackClient />);

      await waitFor(() => {
        const backLink = screen.getByText(/back to dashboard/i);
        expect(backLink).toBeInTheDocument();
        expect(backLink.closest('a')).toHaveAttribute(
          'href',
          '/developer/payouts'
        );
      });
    });
  });

  describe('Cleanup', () => {
    it('should remove state from localStorage after successful OAuth', async () => {
      const mockSearchParams = new URLSearchParams({
        code: 'auth-code-123',
        state: 'state-token-123',
      });

      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      mockLocalStorage.setItem('stripe_oauth_state', 'state-token-123');

      (stripeConnectService.validateStateToken as jest.Mock).mockReturnValue(true);
      (stripeConnectService.completeOAuthFlow as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Success',
      });

      render(<StripeCallbackClient />);

      await waitFor(() => {
        expect(mockLocalStorage.getItem('stripe_oauth_state')).toBeNull();
      });
    });

    it('should remove state from localStorage after error', async () => {
      const mockSearchParams = new URLSearchParams({
        error: 'access_denied',
      });

      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      mockLocalStorage.setItem('stripe_oauth_state', 'state-token-123');

      (stripeConnectService.handleOAuthError as jest.Mock).mockReturnValue({
        success: false,
        message: 'Access denied',
      });

      render(<StripeCallbackClient />);

      await waitFor(() => {
        expect(mockLocalStorage.getItem('stripe_oauth_state')).toBeNull();
      });
    });
  });
});
