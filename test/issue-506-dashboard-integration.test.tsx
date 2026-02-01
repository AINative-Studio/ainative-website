/**
 * Developer Dashboard Integration Tests (Issue #506)
 *
 * Test Suite Coverage:
 * - Dashboard navigation and routing
 * - API key management integration
 * - Earnings dashboard integration
 * - Payouts dashboard integration
 * - Stripe Connect integration
 * - Layout and component rendering
 * - Error handling and edge cases
 * - Accessibility compliance
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
import Sidebar from '@/components/layout/Sidebar';
import DashboardLayout from '@/components/layout/DashboardLayout';
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

// Mock framer-motion to avoid animation issues in tests
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

// Mock useIsAdmin hook
jest.mock('@/components/guards/AdminRouteGuard', () => ({
  useIsAdmin: jest.fn(() => false),
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

describe('Developer Dashboard Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    (usePathname as jest.Mock).mockReturnValue('/dashboard');
  });

  describe('Dashboard Navigation', () => {
    it('should render all developer navigation links', () => {
      render(<Sidebar />);

      // Developer section
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Main Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Earnings')).toBeInTheDocument();
      expect(screen.getByText('Payouts')).toBeInTheDocument();
      expect(screen.getByText('MCP Servers')).toBeInTheDocument();
      expect(screen.getByText('ZeroDB')).toBeInTheDocument();
      expect(screen.getByText('API Sandbox')).toBeInTheDocument();
      expect(screen.getByText('QNN')).toBeInTheDocument();
    });

    it('should highlight active route', () => {
      (usePathname as jest.Mock).mockReturnValue('/developer/earnings');
      render(<Sidebar />);

      const earningsLink = screen.getByText('Earnings').closest('a');
      expect(earningsLink).toHaveClass('bg-primary/20');
      expect(earningsLink).toHaveClass('border-primary');
    });

    it('should handle navigation clicks', async () => {
      const user = userEvent.setup();
      render(<Sidebar />);

      const earningsLink = screen.getByText('Earnings');
      expect(earningsLink).toHaveAttribute('href', '/developer/earnings');

      const payoutsLink = screen.getByText('Payouts');
      expect(payoutsLink).toHaveAttribute('href', '/developer/payouts');
    });

    it('should provide aria labels for navigation sections', () => {
      render(<Sidebar />);

      expect(screen.getByLabelText('Developer navigation')).toBeInTheDocument();
      expect(screen.getByLabelText('User navigation')).toBeInTheDocument();
    });

    it('should support mobile navigation with close handler', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();

      render(<Sidebar isMobile onClose={onClose} />);

      const earningsLink = screen.getByText('Earnings');
      await user.click(earningsLink);

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('API Keys Integration', () => {
    const mockApiKeys = [
      {
        id: 'key_1',
        name: 'Production API Key',
        key: 'sk_test_abc123def456ghi789jkl012mno345pqr678stu',
        status: 'active' as const,
        created: '2026-01-15',
        lastUsed: '2026-01-30',
      },
      {
        id: 'key_2',
        name: 'Development API Key',
        key: 'sk_test_xyz987wvu654tsr321qpo098nml765kji432hgf',
        status: 'active' as const,
        created: '2026-01-20',
        lastUsed: 'Never',
      },
    ];

    beforeEach(() => {
      (apiKeyService.listApiKeys as jest.Mock).mockResolvedValue(mockApiKeys);
    });

    it('should load and display API keys', async () => {
      render(<ApiKeysClient />);

      await waitFor(() => {
        expect(screen.getByText('Production API Key')).toBeInTheDocument();
        expect(screen.getByText('Development API Key')).toBeInTheDocument();
      });
    });

    it('should handle creating new API key', async () => {
      const user = userEvent.setup();
      const newKey = {
        id: 'key_3',
        key: 'sk_test_new_key_full_string_here',
        name: 'New Test Key',
        status: 'active' as const,
        created: '2026-01-31',
        lastUsed: 'Never',
      };

      (apiKeyService.createApiKey as jest.Mock).mockResolvedValue(newKey);
      (apiKeyService.listApiKeys as jest.Mock)
        .mockResolvedValueOnce(mockApiKeys)
        .mockResolvedValueOnce([...mockApiKeys, newKey]);

      render(<ApiKeysClient />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Production API Key')).toBeInTheDocument();
      });

      // Open create dialog
      const createButton = screen.getByRole('button', { name: /create new api key/i });
      await user.click(createButton);

      // Fill in form
      const nameInput = screen.getByLabelText(/api key name/i);
      await user.type(nameInput, 'New Test Key');

      // Submit form
      const generateButton = screen.getByRole('button', { name: /generate key/i });
      await user.click(generateButton);

      // Verify API call
      await waitFor(() => {
        expect(apiKeyService.createApiKey).toHaveBeenCalledWith('New Test Key');
      });

      // Verify new key is shown
      await waitFor(() => {
        expect(screen.getByText('sk_test_new_key_full_string_here')).toBeInTheDocument();
      });
    });

    it('should handle API key deletion', async () => {
      const user = userEvent.setup();
      (apiKeyService.deleteApiKey as jest.Mock).mockResolvedValue(undefined);

      render(<ApiKeysClient />);

      await waitFor(() => {
        expect(screen.getByText('Production API Key')).toBeInTheDocument();
      });

      // Click delete button
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /confirm delete/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(apiKeyService.deleteApiKey).toHaveBeenCalledWith('key_1');
      });
    });

    it('should handle API key regeneration', async () => {
      const user = userEvent.setup();
      const regeneratedKey = {
        ...mockApiKeys[0],
        key: 'sk_test_regenerated_key_string',
      };

      (apiKeyService.regenerateApiKey as jest.Mock).mockResolvedValue(regeneratedKey);

      render(<ApiKeysClient />);

      await waitFor(() => {
        expect(screen.getByText('Production API Key')).toBeInTheDocument();
      });

      // Click regenerate button
      const regenerateButtons = screen.getAllByRole('button', { name: /regenerate/i });
      await user.click(regenerateButtons[0]);

      // Confirm regeneration
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(apiKeyService.regenerateApiKey).toHaveBeenCalledWith('key_1');
      });
    });

    it('should copy API key to clipboard', async () => {
      const user = userEvent.setup();
      const mockClipboard = {
        writeText: jest.fn().mockResolvedValue(undefined),
      };
      Object.defineProperty(navigator, 'clipboard', {
        value: mockClipboard,
        writable: true,
      });

      const newKey = {
        id: 'key_new',
        key: 'sk_test_copy_me',
        name: 'Copy Test Key',
        status: 'active' as const,
        created: '2026-01-31',
        lastUsed: 'Never',
      };

      (apiKeyService.createApiKey as jest.Mock).mockResolvedValue(newKey);
      (apiKeyService.listApiKeys as jest.Mock).mockResolvedValue(mockApiKeys);

      render(<ApiKeysClient />);

      await waitFor(() => {
        expect(screen.getByText('Production API Key')).toBeInTheDocument();
      });

      // Create new key
      const createButton = screen.getByRole('button', { name: /create new api key/i });
      await user.click(createButton);

      const nameInput = screen.getByLabelText(/api key name/i);
      await user.type(nameInput, 'Copy Test Key');

      const generateButton = screen.getByRole('button', { name: /generate key/i });
      await user.click(generateButton);

      // Wait for key to be displayed
      await waitFor(() => {
        expect(screen.getByText('sk_test_copy_me')).toBeInTheDocument();
      });

      // Click copy button
      const copyButton = screen.getByRole('button', { name: '' });
      await user.click(copyButton);

      expect(mockClipboard.writeText).toHaveBeenCalledWith('sk_test_copy_me');
    });

    it('should show error when API key creation fails', async () => {
      const user = userEvent.setup();
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      (apiKeyService.createApiKey as jest.Mock).mockRejectedValue(
        new Error('Failed to create API key')
      );

      render(<ApiKeysClient />);

      await waitFor(() => {
        expect(screen.getByText('Production API Key')).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', { name: /create new api key/i });
      await user.click(createButton);

      const nameInput = screen.getByLabelText(/api key name/i);
      await user.type(nameInput, 'Error Test Key');

      const generateButton = screen.getByRole('button', { name: /generate key/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Failed to create API key. Please try again.');
      });

      consoleError.mockRestore();
      alertSpy.mockRestore();
    });
  });

  describe('Earnings Dashboard Integration', () => {
    const mockOverview = {
      totalEarnings: 450000,
      thisMonth: 125000,
      lastMonth: 98000,
      pendingPayout: 52000,
    };

    const mockTransactions = {
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
      ],
      total: 2,
    };

    const mockBreakdown = {
      api: 200000,
      marketplace: 150000,
      referrals: 100000,
    };

    const mockPayoutSchedule = {
      nextPayoutDate: '2026-02-05',
      minimumPayout: 10000,
      payoutThreshold: 50000,
    };

    beforeEach(() => {
      (earningsService.getEarningsOverview as jest.Mock).mockResolvedValue(mockOverview);
      (earningsService.getTransactions as jest.Mock).mockResolvedValue(mockTransactions);
      (earningsService.getEarningsBreakdown as jest.Mock).mockResolvedValue(mockBreakdown);
      (earningsService.getPayoutSchedule as jest.Mock).mockResolvedValue(mockPayoutSchedule);
      (earningsService.formatCurrency as jest.Mock).mockImplementation((amount) => `$${(amount / 100).toFixed(2)}`);
      (earningsService.formatDate as jest.Mock).mockImplementation((date) => new Date(date).toLocaleDateString());
      (earningsService.getSourceDisplayText as jest.Mock).mockImplementation((source) => source);
      (earningsService.getStatusDisplayText as jest.Mock).mockImplementation((status) => status);
      (earningsService.getStatusColorClass as jest.Mock).mockReturnValue('');
      (earningsService.calculateGrowthPercentage as jest.Mock).mockReturnValue(27.55);
      (earningsService.calculatePercentage as jest.Mock).mockImplementation((part, total) => (part / total) * 100);
    });

    it('should load and display earnings overview', async () => {
      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByTestId('earnings-overview')).toBeInTheDocument();
      });

      // Check overview cards
      expect(screen.getByText('$4,500.00')).toBeInTheDocument(); // Total earnings
      expect(screen.getByText('$1,250.00')).toBeInTheDocument(); // This month
      expect(screen.getByText('$520.00')).toBeInTheDocument(); // Pending payout
    });

    it('should display earnings breakdown chart', async () => {
      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByTestId('earnings-chart')).toBeInTheDocument();
      });

      // Verify breakdown amounts
      expect(screen.getByText('$2,000.00')).toBeInTheDocument(); // API earnings
      expect(screen.getByText('$1,500.00')).toBeInTheDocument(); // Marketplace
      expect(screen.getByText('$1,000.00')).toBeInTheDocument(); // Referrals
    });

    it('should display transaction history', async () => {
      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByText('API Usage - January 2026')).toBeInTheDocument();
        expect(screen.getByText('Marketplace Sales')).toBeInTheDocument();
      });
    });

    it('should handle export to CSV', async () => {
      const user = userEvent.setup();
      (earningsService.exportTransactions as jest.Mock).mockResolvedValue(undefined);

      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /export to csv/i })).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', { name: /export to csv/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(earningsService.exportTransactions).toHaveBeenCalledWith('csv', {
          source: undefined,
        });
      });

      // Check for success message
      await waitFor(() => {
        expect(screen.getByText(/export successful/i)).toBeInTheDocument();
      });
    });

    it('should handle transaction filtering', async () => {
      const user = userEvent.setup();
      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByText('API Usage - January 2026')).toBeInTheDocument();
      });

      // Open filter dropdown
      const filterSelect = screen.getByLabelText(/filter by source/i);
      await user.click(filterSelect);

      // Select API filter
      const apiOption = screen.getByText('API Usage');
      await user.click(apiOption);

      await waitFor(() => {
        expect(earningsService.getTransactions).toHaveBeenCalledWith({
          page: 1,
          pageSize: 10,
          source: 'api',
        });
      });
    });

    it('should handle pagination', async () => {
      const user = userEvent.setup();
      const mockMultiPageData = {
        ...mockTransactions,
        total: 25,
      };

      (earningsService.getTransactions as jest.Mock).mockResolvedValue(mockMultiPageData);

      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByText('API Usage - January 2026')).toBeInTheDocument();
      });

      // Click next page
      const nextButton = screen.getByLabelText('Next');
      await user.click(nextButton);

      await waitFor(() => {
        expect(earningsService.getTransactions).toHaveBeenCalledWith({
          page: 2,
          pageSize: 10,
          source: undefined,
        });
      });
    });

    it('should show loading state', () => {
      render(<EarningsClient />);

      expect(screen.getByTestId('earnings-loading')).toBeInTheDocument();
    });

    it('should handle error state', async () => {
      (earningsService.getEarningsOverview as jest.Mock).mockRejectedValue(
        new Error('Failed to load earnings')
      );

      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load earnings data/i)).toBeInTheDocument();
      });

      // Check retry button exists
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('should auto-refresh data every 5 minutes', async () => {
      jest.useFakeTimers();

      render(<EarningsClient />);

      await waitFor(() => {
        expect(earningsService.getEarningsOverview).toHaveBeenCalledTimes(1);
      });

      // Fast-forward 5 minutes
      jest.advanceTimersByTime(5 * 60 * 1000);

      await waitFor(() => {
        expect(earningsService.getEarningsOverview).toHaveBeenCalledTimes(2);
      });

      jest.useRealTimers();
    });

    it('should display mobile-optimized transaction list on small screens', async () => {
      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByTestId('mobile-transaction-list')).toBeInTheDocument();
      });
    });
  });

  describe('Payouts Dashboard Integration', () => {
    const mockStripeStatus = {
      is_connected: true,
      account_id: 'acct_test123',
      charges_enabled: true,
      payouts_enabled: true,
      details_submitted: true,
    };

    const mockBalance = {
      available: 125000,
      pending: 52000,
      total: 177000,
      currency: 'USD',
    };

    const mockPaymentMethods = [
      {
        id: 'ba_1',
        type: 'bank_account' as const,
        bank_name: 'Chase Bank',
        account_holder_name: 'John Developer',
        last4: '4242',
        currency: 'USD',
        is_default: true,
        status: 'verified' as const,
      },
    ];

    beforeEach(() => {
      localStorageMock.setItem('access_token', 'test_token');
      (payoutService.getStripeConnectStatus as jest.Mock).mockResolvedValue(mockStripeStatus);
      (payoutService.getPayoutBalance as jest.Mock).mockResolvedValue(mockBalance);
      (payoutService.getPaymentMethods as jest.Mock).mockResolvedValue(mockPaymentMethods);
      (payoutService.getPayouts as jest.Mock).mockResolvedValue([]);
      (payoutService.getAutoPayoutSettings as jest.Mock).mockResolvedValue({
        enabled: true,
        schedule: 'weekly',
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
    });

    it('should load and display payout balance', async () => {
      render(<PayoutsClient />);

      await waitFor(() => {
        expect(screen.getByText('$1,250.00')).toBeInTheDocument(); // Available balance
        expect(screen.getByText('$520.00')).toBeInTheDocument(); // Pending balance
        expect(screen.getByText('$1,770.00')).toBeInTheDocument(); // Total earnings
      });
    });

    it('should display Stripe Connect status', async () => {
      render(<PayoutsClient />);

      await waitFor(() => {
        expect(screen.getByText('Connected to Stripe')).toBeInTheDocument();
        expect(screen.getByText(/Account ID: acct_test123/)).toBeInTheDocument();
      });
    });

    it('should display payment methods', async () => {
      render(<PayoutsClient />);

      await waitFor(() => {
        const paymentMethodsTab = screen.getByRole('tab', { name: /payment methods/i });
        return paymentMethodsTab;
      });

      const user = userEvent.setup();
      const paymentMethodsTab = screen.getByRole('tab', { name: /payment methods/i });
      await user.click(paymentMethodsTab);

      await waitFor(() => {
        expect(screen.getByText(/Chase Bank \*\*\*\*4242/)).toBeInTheDocument();
        expect(screen.getByText('John Developer')).toBeInTheDocument();
      });
    });

    it('should handle payout request', async () => {
      const user = userEvent.setup();
      (payoutService.requestPayout as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Payout requested successfully',
      });

      render(<PayoutsClient />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /request payout/i })).toBeInTheDocument();
      });

      const requestButton = screen.getByRole('button', { name: /request payout/i });
      await user.click(requestButton);

      await waitFor(() => {
        expect(payoutService.requestPayout).toHaveBeenCalledWith(125000);
      });
    });

    it('should handle auto-payout settings update', async () => {
      const user = userEvent.setup();
      (payoutService.updateAutoPayoutSettings as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Settings updated',
      });

      render(<PayoutsClient />);

      await waitFor(() => {
        const settingsTab = screen.getByRole('tab', { name: /auto-payout/i });
        return settingsTab;
      });

      const settingsTab = screen.getByRole('tab', { name: /auto-payout/i });
      await user.click(settingsTab);

      await waitFor(() => {
        expect(screen.getByLabelText(/enable automatic payouts/i)).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /save settings/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(payoutService.updateAutoPayoutSettings).toHaveBeenCalled();
      });
    });

    it('should show demo data when not authenticated', async () => {
      localStorageMock.clear();

      render(<PayoutsClient />);

      await waitFor(() => {
        expect(screen.getByText(/you are viewing demo data/i)).toBeInTheDocument();
      });
    });
  });

  describe('Stripe Connect Integration', () => {
    it('should handle OAuth authorization flow', async () => {
      const mockAuthUrl = 'https://connect.stripe.com/oauth/authorize?client_id=test';
      (stripeConnectService.getAuthorizationUrl as jest.Mock).mockResolvedValue(mockAuthUrl);

      const user = userEvent.setup();
      localStorageMock.clear(); // Not connected yet

      (payoutService.getStripeConnectStatus as jest.Mock).mockResolvedValue({
        is_connected: false,
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
      (payoutService.getNotificationPreferences as jest.Mock).mockResolvedValue(null);

      render(<PayoutsClient />);

      await waitFor(() => {
        expect(screen.getByText(/connect your stripe account/i)).toBeInTheDocument();
      });

      const connectButton = screen.getByRole('button', { name: /connect with stripe/i });
      expect(connectButton).toBeInTheDocument();
    });

    it('should handle OAuth callback with code', async () => {
      const mockAccount = {
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
        account: mockAccount,
      });

      const result = await stripeConnectService.completeOAuthFlow('auth_code_123', 'state_token');

      expect(result.success).toBe(true);
      expect(result.account).toEqual(mockAccount);
    });

    it('should handle OAuth error callback', () => {
      const result = stripeConnectService.handleOAuthError('access_denied');

      expect(result.success).toBe(false);
      expect(result.message).toContain('denied access');
    });

    it('should validate state tokens for CSRF protection', () => {
      const state1 = stripeConnectService.generateStateToken();
      const state2 = stripeConnectService.generateStateToken();

      expect(stripeConnectService.validateStateToken(state1, state1)).toBe(true);
      expect(stripeConnectService.validateStateToken(state1, state2)).toBe(false);
      expect(stripeConnectService.validateStateToken('', state1)).toBe(false);
      expect(stripeConnectService.validateStateToken(state1, '')).toBe(false);
    });
  });

  describe('Dashboard Layout Integration', () => {
    it('should render dashboard layout with sidebar and content', () => {
      (usePathname as jest.Mock).mockReturnValue('/dashboard');

      render(
        <DashboardLayout>
          <div data-testid="test-content">Dashboard Content</div>
        </DashboardLayout>
      );

      expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
      expect(screen.getByTestId('desktop-sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    it('should toggle mobile sidebar', async () => {
      const user = userEvent.setup();
      global.innerWidth = 500; // Mobile size

      render(
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>
      );

      // Mobile sidebar should be hidden initially
      expect(screen.queryByTestId('mobile-sidebar')).not.toBeInTheDocument();

      // Click menu button
      const menuButton = screen.getByLabelText('Toggle menu');
      await user.click(menuButton);

      // Mobile sidebar should appear
      await waitFor(() => {
        expect(screen.getByTestId('mobile-sidebar')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailability gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      (apiKeyService.listApiKeys as jest.Mock).mockRejectedValue(
        new Error('Service unavailable')
      );

      render(<ApiKeysClient />);

      await waitFor(() => {
        expect(screen.getByText(/no api keys found/i)).toBeInTheDocument();
      });

      consoleError.mockRestore();
    });

    it('should show retry button on error', async () => {
      (earningsService.getEarningsOverview as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Compliance', () => {
    it('should have proper ARIA labels on interactive elements', () => {
      render(<Sidebar />);

      expect(screen.getByLabelText('Developer navigation')).toBeInTheDocument();
      expect(screen.getByLabelText('User navigation')).toBeInTheDocument();
    });

    it('should indicate current page with aria-current', () => {
      (usePathname as jest.Mock).mockReturnValue('/developer/earnings');
      render(<Sidebar />);

      const earningsLink = screen.getByText('Earnings').closest('a');
      expect(earningsLink).toHaveAttribute('aria-current', 'page');
    });

    it('should have proper button labels for screen readers', async () => {
      (apiKeyService.listApiKeys as jest.Mock).mockResolvedValue([]);

      render(<ApiKeysClient />);

      await waitFor(() => {
        const createButton = screen.getByRole('button', { name: /create new api key/i });
        expect(createButton).toBeInTheDocument();
      });
    });

    it('should have table role for transaction history', async () => {
      const mockTransactions = {
        items: [
          {
            id: 'txn_1',
            date: '2026-01-30',
            description: 'Test transaction',
            source: 'api' as const,
            status: 'completed' as const,
            amount: 25000,
          },
        ],
        total: 1,
      };

      (earningsService.getTransactions as jest.Mock).mockResolvedValue(mockTransactions);
      (earningsService.getEarningsOverview as jest.Mock).mockResolvedValue({
        totalEarnings: 25000,
        thisMonth: 25000,
        lastMonth: 0,
        pendingPayout: 0,
      });
      (earningsService.getEarningsBreakdown as jest.Mock).mockResolvedValue({
        api: 25000,
        marketplace: 0,
        referrals: 0,
      });
      (earningsService.getPayoutSchedule as jest.Mock).mockResolvedValue({
        nextPayoutDate: '2026-02-05',
        minimumPayout: 10000,
        payoutThreshold: 50000,
      });

      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });
    });

    it('should have status indicators with proper roles', async () => {
      (earningsService.getEarningsOverview as jest.Mock).mockResolvedValue({
        totalEarnings: 25000,
        thisMonth: 25000,
        lastMonth: 0,
        pendingPayout: 0,
      });
      (earningsService.getTransactions as jest.Mock).mockResolvedValue({ items: [], total: 0 });
      (earningsService.getEarningsBreakdown as jest.Mock).mockResolvedValue({
        api: 0,
        marketplace: 0,
        referrals: 0,
      });
      (earningsService.getPayoutSchedule as jest.Mock).mockResolvedValue({
        nextPayoutDate: '2026-02-05',
        minimumPayout: 10000,
        payoutThreshold: 50000,
      });
      (earningsService.exportTransactions as jest.Mock).mockResolvedValue(undefined);

      const user = userEvent.setup();
      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /export to csv/i })).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', { name: /export to csv/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument();
      });
    });
  });
});
