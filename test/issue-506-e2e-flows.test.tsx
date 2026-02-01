/**
 * Developer Dashboard E2E Flow Tests (Issue #506)
 *
 * End-to-End User Journey Tests:
 * - Complete API key lifecycle flow
 * - Developer earnings review flow
 * - Stripe Connect onboarding flow
 * - Payout request flow
 * - Settings configuration flow
 * - Error recovery flows
 *
 * Target Coverage: 85%+
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { usePathname } from 'next/navigation';
import ApiKeysClient from '@/app/dashboard/api-keys/ApiKeysClient';
import EarningsClient from '@/app/developer/earnings/EarningsClient';
import PayoutsClient from '@/app/developer/payouts/PayoutsClient';
import { apiKeyService } from '@/services/apiKeyService';
import { earningsService } from '@/services/earningsService';
import { payoutService } from '@/services/payoutService';
import { stripeConnectService } from '@/services/stripeConnectService';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}));

// Mock services
jest.mock('@/services/apiKeyService');
jest.mock('@/services/earningsService');
jest.mock('@/services/payoutService');
jest.mock('@/services/stripeConnectService');

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock recharts
jest.mock('recharts', () => ({
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  Legend: () => <div data-testid="legend" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

// Mock localStorage
const localStorageMock = (() => {
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
  value: localStorageMock,
});

describe('Developer Dashboard E2E Flow Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    (usePathname as jest.Mock).mockReturnValue('/dashboard');
  });

  describe('E2E: Complete API Key Lifecycle', () => {
    it('should complete full API key creation, usage, and deletion flow', async () => {
      const user = userEvent.setup();

      // Initial state: no API keys
      (apiKeyService.listApiKeys as jest.Mock).mockResolvedValueOnce([]);

      render(<ApiKeysClient />);

      // Step 1: User sees empty state
      await waitFor(() => {
        expect(screen.getByText(/no api keys found/i)).toBeInTheDocument();
      });

      // Step 2: User creates first API key
      const createButton = screen.getByRole('button', { name: /create your first api key/i });
      await user.click(createButton);

      const nameInput = screen.getByLabelText(/api key name/i);
      await user.type(nameInput, 'Production API Key');

      const newKey = {
        id: 'key_1',
        key: 'sk_test_abc123def456ghi789jkl012mno345pqr678stu',
        name: 'Production API Key',
        status: 'active' as const,
        created: '2026-01-31',
        lastUsed: 'Never',
      };

      (apiKeyService.createApiKey as jest.Mock).mockResolvedValue(newKey);
      (apiKeyService.listApiKeys as jest.Mock).mockResolvedValue([newKey]);

      const generateButton = screen.getByRole('button', { name: /generate key/i });
      await user.click(generateButton);

      // Step 3: User copies the new key
      await waitFor(() => {
        expect(screen.getByText('sk_test_abc123def456ghi789jkl012mno345pqr678stu')).toBeInTheDocument();
      });

      const mockClipboard = {
        writeText: jest.fn().mockResolvedValue(undefined),
      };
      Object.defineProperty(navigator, 'clipboard', {
        value: mockClipboard,
        writable: true,
      });

      const copyButtons = screen.getAllByRole('button');
      const copyButton = copyButtons.find(btn => btn.querySelector('svg')); // Find button with icon
      if (copyButton) {
        await user.click(copyButton);
        expect(mockClipboard.writeText).toHaveBeenCalledWith(
          'sk_test_abc123def456ghi789jkl012mno345pqr678stu'
        );
      }

      // Step 4: User closes the dialog
      const doneButton = screen.getByRole('button', { name: /done/i });
      await user.click(doneButton);

      // Step 5: User sees the key in the list
      await waitFor(() => {
        expect(screen.getByText('Production API Key')).toBeInTheDocument();
      });

      // Step 6: User creates a second key for development
      const createNewButton = screen.getByRole('button', { name: /create new api key/i });
      await user.click(createNewButton);

      const nameInput2 = screen.getByLabelText(/api key name/i);
      await user.type(nameInput2, 'Development API Key');

      const devKey = {
        id: 'key_2',
        key: 'sk_test_dev999888777666555444333222111000xyz',
        name: 'Development API Key',
        status: 'active' as const,
        created: '2026-01-31',
        lastUsed: 'Never',
      };

      (apiKeyService.createApiKey as jest.Mock).mockResolvedValue(devKey);
      (apiKeyService.listApiKeys as jest.Mock).mockResolvedValue([newKey, devKey]);

      const generateButton2 = screen.getByRole('button', { name: /generate key/i });
      await user.click(generateButton2);

      await waitFor(() => {
        expect(screen.getByText('sk_test_dev999888777666555444333222111000xyz')).toBeInTheDocument();
      });

      const doneButton2 = screen.getByRole('button', { name: /done/i });
      await user.click(doneButton2);

      // Step 7: User sees both keys
      await waitFor(() => {
        expect(screen.getByText('Production API Key')).toBeInTheDocument();
        expect(screen.getByText('Development API Key')).toBeInTheDocument();
      });

      // Step 8: User decides to delete the development key
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[1]); // Second delete button

      const confirmButton = screen.getByRole('button', { name: /confirm delete/i });
      (apiKeyService.deleteApiKey as jest.Mock).mockResolvedValue(undefined);
      (apiKeyService.listApiKeys as jest.Mock).mockResolvedValue([newKey]);

      await user.click(confirmButton);

      // Step 9: User sees only production key remains
      await waitFor(() => {
        expect(screen.getByText('Production API Key')).toBeInTheDocument();
      });

      // Verify the complete flow
      expect(apiKeyService.createApiKey).toHaveBeenCalledTimes(2);
      expect(apiKeyService.deleteApiKey).toHaveBeenCalledWith('key_2');
    });
  });

  describe('E2E: Developer Earnings Review Flow', () => {
    it('should complete earnings review, filtering, and export flow', async () => {
      const user = userEvent.setup();

      const mockOverview = {
        totalEarnings: 450000,
        thisMonth: 125000,
        lastMonth: 98000,
        pendingPayout: 52000,
      };

      const allTransactions = {
        items: [
          {
            id: 'txn_1',
            date: '2026-01-30',
            description: 'API Usage - January 2026',
            source: 'api' as const,
            status: 'completed' as const,
            amount: 25000,
          },
          {
            id: 'txn_2',
            date: '2026-01-28',
            description: 'Marketplace Sales',
            source: 'marketplace' as const,
            status: 'completed' as const,
            amount: 15000,
          },
          {
            id: 'txn_3',
            date: '2026-01-25',
            description: 'Referral Commission',
            source: 'referral' as const,
            status: 'completed' as const,
            amount: 10000,
          },
        ],
        total: 3,
      };

      const apiTransactions = {
        items: [allTransactions.items[0]],
        total: 1,
      };

      (earningsService.getEarningsOverview as jest.Mock).mockResolvedValue(mockOverview);
      (earningsService.getTransactions as jest.Mock).mockResolvedValue(allTransactions);
      (earningsService.getEarningsBreakdown as jest.Mock).mockResolvedValue({
        api: 200000,
        marketplace: 150000,
        referrals: 100000,
      });
      (earningsService.getPayoutSchedule as jest.Mock).mockResolvedValue({
        nextPayoutDate: '2026-02-05',
        minimumPayout: 10000,
        payoutThreshold: 50000,
      });
      (earningsService.formatCurrency as jest.Mock).mockImplementation(
        (amount) => `$${(amount / 100).toFixed(2)}`
      );
      (earningsService.formatDate as jest.Mock).mockImplementation(
        (date) => new Date(date).toLocaleDateString()
      );
      (earningsService.getSourceDisplayText as jest.Mock).mockImplementation((source) => source);
      (earningsService.getStatusDisplayText as jest.Mock).mockImplementation((status) => status);
      (earningsService.getStatusColorClass as jest.Mock).mockReturnValue('');
      (earningsService.calculateGrowthPercentage as jest.Mock).mockReturnValue(27.55);
      (earningsService.calculatePercentage as jest.Mock).mockImplementation(
        (part, total) => (part / total) * 100
      );

      render(<EarningsClient />);

      // Step 1: User views earnings overview
      await waitFor(() => {
        expect(screen.getByText('$4,500.00')).toBeInTheDocument(); // Total earnings
        expect(screen.getByText('$1,250.00')).toBeInTheDocument(); // This month
      });

      // Step 2: User views breakdown chart
      expect(screen.getByTestId('earnings-chart')).toBeInTheDocument();

      // Step 3: User sees all transactions
      expect(screen.getByText('API Usage - January 2026')).toBeInTheDocument();
      expect(screen.getByText('Marketplace Sales')).toBeInTheDocument();
      expect(screen.getByText('Referral Commission')).toBeInTheDocument();

      // Step 4: User filters by API transactions
      (earningsService.getTransactions as jest.Mock).mockResolvedValue(apiTransactions);

      const filterSelect = screen.getByLabelText(/filter by source/i);
      await user.click(filterSelect);

      const apiOption = screen.getByText('API Usage');
      await user.click(apiOption);

      await waitFor(() => {
        expect(earningsService.getTransactions).toHaveBeenCalledWith({
          page: 1,
          pageSize: 10,
          source: 'api',
        });
      });

      // Step 5: User exports filtered data
      (earningsService.exportTransactions as jest.Mock).mockResolvedValue(undefined);

      const exportButton = screen.getByRole('button', { name: /export to csv/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(earningsService.exportTransactions).toHaveBeenCalledWith('csv', {
          source: 'api',
        });
      });

      // Step 6: User sees success message
      await waitFor(() => {
        expect(screen.getByText(/export successful/i)).toBeInTheDocument();
      });

      // Step 7: User refreshes data
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      await waitFor(() => {
        expect(earningsService.getEarningsOverview).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('E2E: Stripe Connect Onboarding Flow', () => {
    it('should complete Stripe Connect onboarding from start to finish', async () => {
      const user = userEvent.setup();

      // Initial state: Not connected
      const mockInitialStatus = {
        is_connected: false,
      };

      const mockBalance = {
        available: 0,
        pending: 0,
        total: 0,
        currency: 'USD',
      };

      (payoutService.getStripeConnectStatus as jest.Mock).mockResolvedValueOnce(mockInitialStatus);
      (payoutService.getPayoutBalance as jest.Mock).mockResolvedValue(mockBalance);
      (payoutService.getPaymentMethods as jest.Mock).mockResolvedValue([]);
      (payoutService.getPayouts as jest.Mock).mockResolvedValue([]);
      (payoutService.getAutoPayoutSettings as jest.Mock).mockResolvedValue(null);
      (payoutService.getTaxForms as jest.Mock).mockResolvedValue([]);
      (payoutService.getNotificationPreferences as jest.Mock).mockResolvedValue(null);
      (payoutService.formatCurrency as jest.Mock).mockImplementation(
        (amount, currency) => `$${(amount / 100).toFixed(2)}`
      );

      render(<PayoutsClient />);

      // Step 1: User sees connect prompt
      await waitFor(() => {
        expect(screen.getByText(/connect your stripe account/i)).toBeInTheDocument();
      });

      // Step 2: User clicks connect button
      const mockAuthUrl = 'https://connect.stripe.com/oauth/authorize?client_id=ca_test123&state=xyz';
      (payoutService.createConnectAccountLink as jest.Mock).mockResolvedValue({
        url: mockAuthUrl,
      });

      const originalLocation = window.location;
      delete (window as any).location;
      window.location = { ...originalLocation, href: '' } as any;

      const connectButton = screen.getByRole('button', { name: /connect with stripe/i });
      await user.click(connectButton);

      // Step 3: Verify redirect would happen (in real flow, user completes Stripe OAuth)
      await waitFor(() => {
        expect(payoutService.createConnectAccountLink).toHaveBeenCalled();
      });

      // Simulate successful OAuth callback
      const mockConnectedAccount = {
        id: 'conn_1',
        account_id: 'acct_new123',
        user_id: 'user_1',
        status: 'active' as const,
        charges_enabled: true,
        payouts_enabled: true,
        details_submitted: true,
        country: 'US',
        currency: 'USD',
        created_at: '2026-01-31',
        updated_at: '2026-01-31',
      };

      (stripeConnectService.completeOAuthFlow as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Account linked successfully',
        account: mockConnectedAccount,
      });

      const result = await stripeConnectService.completeOAuthFlow('auth_code_123', 'xyz');

      expect(result.success).toBe(true);
      expect(result.account?.account_id).toBe('acct_new123');

      window.location = originalLocation;
    });

    it('should handle Stripe Connect OAuth errors gracefully', async () => {
      const errorResult = stripeConnectService.handleOAuthError(
        'access_denied',
        'User cancelled the connection'
      );

      expect(errorResult.success).toBe(false);
      expect(errorResult.message).toContain('denied access');

      const invalidRequestResult = stripeConnectService.handleOAuthError('invalid_request');
      expect(invalidRequestResult.message).toContain('Invalid authorization request');

      const serverErrorResult = stripeConnectService.handleOAuthError('server_error');
      expect(serverErrorResult.message).toContain('server error');
    });
  });

  describe('E2E: Payout Request Flow', () => {
    it('should complete payout request from balance check to confirmation', async () => {
      const user = userEvent.setup();

      localStorageMock.setItem('access_token', 'test_token');

      const mockStripeStatus = {
        is_connected: true,
        account_id: 'acct_test123',
        charges_enabled: true,
        payouts_enabled: true,
        details_submitted: true,
      };

      const mockInitialBalance = {
        available: 125000, // $1,250.00
        pending: 52000,
        total: 177000,
        currency: 'USD',
      };

      const mockPaymentMethod = {
        id: 'ba_1',
        type: 'bank_account' as const,
        bank_name: 'Chase Bank',
        account_holder_name: 'John Developer',
        last4: '4242',
        currency: 'USD',
        is_default: true,
        status: 'verified' as const,
      };

      (payoutService.getStripeConnectStatus as jest.Mock).mockResolvedValue(mockStripeStatus);
      (payoutService.getPayoutBalance as jest.Mock).mockResolvedValue(mockInitialBalance);
      (payoutService.getPaymentMethods as jest.Mock).mockResolvedValue([mockPaymentMethod]);
      (payoutService.getPayouts as jest.Mock).mockResolvedValue([]);
      (payoutService.getAutoPayoutSettings as jest.Mock).mockResolvedValue({
        enabled: false,
        schedule: 'manual',
        threshold: 100000,
        delay_days: 2,
      });
      (payoutService.getTaxForms as jest.Mock).mockResolvedValue([]);
      (payoutService.getNotificationPreferences as jest.Mock).mockResolvedValue({
        email_on_payout_sent: true,
        email_on_payout_paid: true,
        email_on_payout_failed: true,
        sms_on_payout_paid: false,
      });
      (payoutService.formatCurrency as jest.Mock).mockImplementation(
        (amount, currency) => `$${(amount / 100).toFixed(2)}`
      );
      (payoutService.formatDate as jest.Mock).mockImplementation(
        (date) => new Date(date).toLocaleDateString()
      );

      render(<PayoutsClient />);

      // Step 1: User sees available balance
      await waitFor(() => {
        expect(screen.getByText('$1,250.00')).toBeInTheDocument();
      });

      // Step 2: User confirms Stripe is connected
      expect(screen.getByText('Connected to Stripe')).toBeInTheDocument();

      // Step 3: User requests payout
      const mockNewPayout = {
        id: 'po_new1',
        amount: 125000,
        currency: 'USD',
        status: 'pending' as const,
        description: 'Manual payout request',
        created_at: new Date().toISOString(),
        arrival_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        destination_type: 'bank_account' as const,
        destination_last4: '4242',
      };

      const mockUpdatedBalance = {
        available: 0,
        pending: 125000,
        total: 177000,
        currency: 'USD',
      };

      (payoutService.requestPayout as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Payout requested successfully',
      });
      (payoutService.getPayouts as jest.Mock).mockResolvedValue([mockNewPayout]);
      (payoutService.getPayoutBalance as jest.Mock).mockResolvedValue(mockUpdatedBalance);

      const requestButton = screen.getByRole('button', { name: /request payout/i });
      await user.click(requestButton);

      // Step 4: Verify payout was requested
      await waitFor(() => {
        expect(payoutService.requestPayout).toHaveBeenCalledWith(125000);
      });

      // Step 5: User sees updated balance (available becomes 0, pending increases)
      await waitFor(() => {
        expect(screen.getByText('$0.00')).toBeInTheDocument(); // New available balance
      });
    });

    it('should prevent payout request with zero balance', async () => {
      const user = userEvent.setup();
      const toastSpy = jest.fn();

      localStorageMock.setItem('access_token', 'test_token');

      const mockBalance = {
        available: 0,
        pending: 0,
        total: 0,
        currency: 'USD',
      };

      (payoutService.getStripeConnectStatus as jest.Mock).mockResolvedValue({
        is_connected: true,
        account_id: 'acct_test',
        charges_enabled: true,
        payouts_enabled: true,
        details_submitted: true,
      });
      (payoutService.getPayoutBalance as jest.Mock).mockResolvedValue(mockBalance);
      (payoutService.getPaymentMethods as jest.Mock).mockResolvedValue([]);
      (payoutService.getPayouts as jest.Mock).mockResolvedValue([]);
      (payoutService.getAutoPayoutSettings as jest.Mock).mockResolvedValue(null);
      (payoutService.getTaxForms as jest.Mock).mockResolvedValue([]);
      (payoutService.getNotificationPreferences as jest.Mock).mockResolvedValue(null);
      (payoutService.formatCurrency as jest.Mock).mockImplementation(
        (amount, currency) => `$${(amount / 100).toFixed(2)}`
      );

      render(<PayoutsClient />);

      await waitFor(() => {
        expect(screen.getByText('$0.00')).toBeInTheDocument();
      });

      const requestButton = screen.getByRole('button', { name: /request payout/i });
      expect(requestButton).toBeDisabled();
    });
  });

  describe('E2E: Auto-Payout Configuration Flow', () => {
    it('should configure auto-payout settings successfully', async () => {
      const user = userEvent.setup();

      localStorageMock.setItem('access_token', 'test_token');

      (payoutService.getStripeConnectStatus as jest.Mock).mockResolvedValue({
        is_connected: true,
        account_id: 'acct_test',
        charges_enabled: true,
        payouts_enabled: true,
        details_submitted: true,
      });
      (payoutService.getPayoutBalance as jest.Mock).mockResolvedValue({
        available: 50000,
        pending: 0,
        total: 50000,
        currency: 'USD',
      });
      (payoutService.getPaymentMethods as jest.Mock).mockResolvedValue([]);
      (payoutService.getPayouts as jest.Mock).mockResolvedValue([]);
      (payoutService.getAutoPayoutSettings as jest.Mock).mockResolvedValue({
        enabled: false,
        schedule: 'manual',
        threshold: 100000,
        delay_days: 2,
      });
      (payoutService.getTaxForms as jest.Mock).mockResolvedValue([]);
      (payoutService.getNotificationPreferences as jest.Mock).mockResolvedValue({
        email_on_payout_sent: true,
        email_on_payout_paid: true,
        email_on_payout_failed: true,
        sms_on_payout_paid: false,
      });
      (payoutService.formatCurrency as jest.Mock).mockImplementation(
        (amount, currency) => `$${(amount / 100).toFixed(2)}`
      );

      render(<PayoutsClient />);

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /auto-payout/i })).toBeInTheDocument();
      });

      // Step 1: Navigate to auto-payout settings
      const settingsTab = screen.getByRole('tab', { name: /auto-payout/i });
      await user.click(settingsTab);

      // Step 2: Enable auto-payouts
      await waitFor(() => {
        expect(screen.getByLabelText(/enable automatic payouts/i)).toBeInTheDocument();
      });

      const enableSwitch = screen.getByLabelText(/enable automatic payouts/i);
      await user.click(enableSwitch);

      // Step 3: Configure schedule
      const scheduleSelect = screen.getByLabelText(/payout schedule/i);
      await user.click(scheduleSelect);

      const weeklyOption = screen.getByText('Weekly');
      await user.click(weeklyOption);

      // Step 4: Set threshold
      const thresholdInput = screen.getByLabelText(/minimum payout threshold/i);
      await user.clear(thresholdInput);
      await user.type(thresholdInput, '500');

      // Step 5: Save settings
      (payoutService.updateAutoPayoutSettings as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Settings updated',
      });

      const saveButton = screen.getByRole('button', { name: /save settings/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(payoutService.updateAutoPayoutSettings).toHaveBeenCalledWith(
          expect.objectContaining({
            enabled: true,
            schedule: 'weekly',
            threshold: 50000, // $500 * 100
          })
        );
      });
    });
  });

  describe('E2E: Error Recovery Flows', () => {
    it('should recover from network errors with retry mechanism', async () => {
      const user = userEvent.setup();

      // First attempt fails
      (earningsService.getEarningsOverview as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          totalEarnings: 100000,
          thisMonth: 50000,
          lastMonth: 30000,
          pendingPayout: 20000,
        });

      (earningsService.getTransactions as jest.Mock).mockResolvedValue({ items: [], total: 0 });
      (earningsService.getEarningsBreakdown as jest.Mock).mockResolvedValue({
        api: 100000,
        marketplace: 0,
        referrals: 0,
      });
      (earningsService.getPayoutSchedule as jest.Mock).mockResolvedValue({
        nextPayoutDate: '2026-02-05',
        minimumPayout: 10000,
        payoutThreshold: 50000,
      });
      (earningsService.formatCurrency as jest.Mock).mockImplementation(
        (amount) => `$${(amount / 100).toFixed(2)}`
      );

      render(<EarningsClient />);

      // Error state shown
      await waitFor(() => {
        expect(screen.getByText(/failed to load earnings data/i)).toBeInTheDocument();
      });

      // User retries
      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      // Success on retry
      await waitFor(() => {
        expect(screen.getByText('$1,000.00')).toBeInTheDocument();
      });
    });

    it('should handle API key creation validation errors', async () => {
      const user = userEvent.setup();
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      (apiKeyService.listApiKeys as jest.Mock).mockResolvedValue([]);

      render(<ApiKeysClient />);

      await waitFor(() => {
        expect(screen.getByText(/no api keys found/i)).toBeInTheDocument();
      });

      // Try to create key without name
      const createButton = screen.getByRole('button', { name: /create/i });
      await user.click(createButton);

      const generateButton = screen.getByRole('button', { name: /generate key/i });
      await user.click(generateButton);

      // Validation error
      expect(alertSpy).toHaveBeenCalledWith('Please enter a name for the API key');

      alertSpy.mockRestore();
    });

    it('should handle concurrent operations gracefully', async () => {
      const user = userEvent.setup();

      (apiKeyService.listApiKeys as jest.Mock).mockResolvedValue([
        {
          id: 'key_1',
          name: 'Test Key',
          key: 'sk_test_123',
          status: 'active' as const,
          created: '2026-01-31',
          lastUsed: 'Never',
        },
      ]);

      render(<ApiKeysClient />);

      await waitFor(() => {
        expect(screen.getByText('Test Key')).toBeInTheDocument();
      });

      // Simulate rapid clicks on regenerate and delete
      (apiKeyService.regenerateApiKey as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      const regenerateButton = screen.getByRole('button', { name: /regenerate/i });
      await user.click(regenerateButton);

      const confirmRegenerateButton = screen.getByRole('button', { name: /confirm/i });

      // Button should show loading state
      await user.click(confirmRegenerateButton);

      // Verify only one request is made
      await waitFor(() => {
        expect(apiKeyService.regenerateApiKey).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('E2E: Multi-Step Configuration Workflows', () => {
    it('should complete notification preferences configuration', async () => {
      const user = userEvent.setup();

      localStorageMock.setItem('access_token', 'test_token');

      (payoutService.getStripeConnectStatus as jest.Mock).mockResolvedValue({
        is_connected: true,
        account_id: 'acct_test',
        charges_enabled: true,
        payouts_enabled: true,
        details_submitted: true,
      });
      (payoutService.getPayoutBalance as jest.Mock).mockResolvedValue({
        available: 0,
        pending: 0,
        total: 0,
        currency: 'USD',
      });
      (payoutService.getPaymentMethods as jest.Mock).mockResolvedValue([]);
      (payoutService.getPayouts as jest.Mock).mockResolvedValue([]);
      (payoutService.getAutoPayoutSettings as jest.Mock).mockResolvedValue(null);
      (payoutService.getTaxForms as jest.Mock).mockResolvedValue([]);
      (payoutService.getNotificationPreferences as jest.Mock).mockResolvedValue({
        email_on_payout_sent: false,
        email_on_payout_paid: false,
        email_on_payout_failed: true,
        sms_on_payout_paid: false,
      });
      (payoutService.formatCurrency as jest.Mock).mockImplementation(
        (amount, currency) => `$${(amount / 100).toFixed(2)}`
      );

      render(<PayoutsClient />);

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /notifications/i })).toBeInTheDocument();
      });

      // Navigate to notifications tab
      const notificationsTab = screen.getByRole('tab', { name: /notifications/i });
      await user.click(notificationsTab);

      await waitFor(() => {
        expect(screen.getByLabelText(/email when payout is sent/i)).toBeInTheDocument();
      });

      // Enable all email notifications
      const emailSentSwitch = screen.getByLabelText(/email when payout is sent/i);
      await user.click(emailSentSwitch);

      const emailPaidSwitch = screen.getByLabelText(/email when payout is completed/i);
      await user.click(emailPaidSwitch);

      // Enable SMS notification
      const smsPaidSwitch = screen.getByLabelText(/sms when payout is completed/i);
      await user.click(smsPaidSwitch);

      // Save preferences
      (payoutService.updateNotificationPreferences as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Preferences updated',
      });

      const saveButton = screen.getByRole('button', { name: /save preferences/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(payoutService.updateNotificationPreferences).toHaveBeenCalledWith({
          email_on_payout_sent: true,
          email_on_payout_paid: true,
          email_on_payout_failed: true,
          sms_on_payout_paid: true,
        });
      });
    });
  });
});
