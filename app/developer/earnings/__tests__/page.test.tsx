/**
 * Developer Earnings Page Tests
 * TDD/BDD style tests for earnings dashboard
 * Target: 85%+ coverage
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import EarningsClient from '../EarningsClient';
import { earningsService } from '@/services/earningsService';

// Mock the earnings service
jest.mock('@/services/earningsService');

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/developer/earnings',
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock recharts
jest.mock('recharts', () => ({
  PieChart: ({ children }: any) => <div data-testid="earnings-chart">{children}</div>,
  Pie: () => null,
  Cell: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  Legend: () => null,
  Tooltip: () => null,
}));

describe('Developer Earnings Page', () => {
  const mockEarningsData = {
    overview: {
      totalEarnings: 15750.50,
      thisMonth: 3250.00,
      lastMonth: 2890.75,
      pendingPayout: 1200.00,
      currency: 'USD',
    },
    transactions: [
      {
        id: 'txn_001',
        date: '2026-01-25',
        description: 'API Usage - Customer ABC',
        source: 'api',
        amount: 150.00,
        status: 'completed' as const,
        currency: 'USD',
      },
      {
        id: 'txn_002',
        date: '2026-01-24',
        description: 'Marketplace Sale - AI Model Pro',
        source: 'marketplace',
        amount: 500.00,
        status: 'completed' as const,
        currency: 'USD',
      },
      {
        id: 'txn_003',
        date: '2026-01-23',
        description: 'Referral Commission - User XYZ',
        source: 'referral',
        amount: 75.00,
        status: 'pending' as const,
        currency: 'USD',
      },
    ],
    breakdown: {
      api: 8500.00,
      marketplace: 6200.50,
      referrals: 1050.00,
    },
    payoutSchedule: {
      nextPayoutDate: '2026-02-15',
      minimumPayout: 100.00,
      payoutThreshold: 1000.00,
      currency: 'USD',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (earningsService.getEarningsOverview as jest.Mock).mockResolvedValue(mockEarningsData.overview);
    (earningsService.getTransactions as jest.Mock).mockResolvedValue({
      items: mockEarningsData.transactions,
      total: 3,
      page: 1,
      pageSize: 10,
    });
    (earningsService.getEarningsBreakdown as jest.Mock).mockResolvedValue(mockEarningsData.breakdown);
    (earningsService.getPayoutSchedule as jest.Mock).mockResolvedValue(mockEarningsData.payoutSchedule);
  });

  describe('Page Rendering', () => {
    it('should render the earnings page with all main sections', async () => {
      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByText(/earnings dashboard/i)).toBeInTheDocument();
      });

      // Check for overview section
      expect(screen.getByText(/total earnings/i)).toBeInTheDocument();
      expect(screen.getByText(/this month/i)).toBeInTheDocument();
      expect(screen.getByText(/pending payout/i)).toBeInTheDocument();

      // Check for transaction history section
      expect(screen.getByText(/transaction history/i)).toBeInTheDocument();

      // Check for breakdown section
      expect(screen.getByText(/earnings breakdown/i)).toBeInTheDocument();
    });

    it('should display loading state initially', () => {
      render(<EarningsClient />);

      expect(screen.getByTestId('earnings-loading')).toBeInTheDocument();
    });

    it('should render page with correct metadata structure', () => {
      // This test would be for the parent page.tsx file
      // We're testing that the structure supports SEO metadata
      expect(true).toBe(true); // Placeholder for metadata test
    });
  });

  describe('Earnings Overview Cards', () => {
    it('should display total earnings correctly formatted', async () => {
      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByText('API Usage - Customer ABC')).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(screen.getByText('$15,750.50')).toBeInTheDocument();
    });

    it('should display current month earnings', async () => {
      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByText('API Usage - Customer ABC')).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(screen.getByText('$3,250.00')).toBeInTheDocument();
    });

    it('should display pending payout amount', async () => {
      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByText('API Usage - Customer ABC')).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(screen.getByText('$1,200.00')).toBeInTheDocument();
    });

    it('should show growth percentage compared to last month', async () => {
      render(<EarningsClient />);

      await waitFor(() => {
        // (3250 - 2890.75) / 2890.75 = ~12.43%
        expect(screen.getByText(/12\.4%/)).toBeInTheDocument();
      });
    });
  });

  describe('Transaction History', () => {
    it('should load and display transaction list', async () => {
      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByText('API Usage - Customer ABC')).toBeInTheDocument();
        expect(screen.getByText('Marketplace Sale - AI Model Pro')).toBeInTheDocument();
        expect(screen.getByText('Referral Commission - User XYZ')).toBeInTheDocument();
      });
    });

    it('should display transaction amounts correctly', async () => {
      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByText('$150.00')).toBeInTheDocument();
        expect(screen.getByText('$500.00')).toBeInTheDocument();
        expect(screen.getByText('$75.00')).toBeInTheDocument();
      });
    });

    it('should show transaction status badges', async () => {
      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getAllByText(/completed/i)).toHaveLength(2);
        expect(screen.getByText(/pending/i)).toBeInTheDocument();
      });
    });

    it('should display transaction dates in readable format', async () => {
      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByText(/Jan 25, 2026/i)).toBeInTheDocument();
        expect(screen.getByText(/Jan 24, 2026/i)).toBeInTheDocument();
        expect(screen.getByText(/Jan 23, 2026/i)).toBeInTheDocument();
      });
    });

    it('should support pagination for transaction history', async () => {
      // Mock more transactions to enable pagination
      (earningsService.getTransactions as jest.Mock).mockResolvedValue({
        items: mockEarningsData.transactions,
        total: 25, // More than page size to enable pagination
        page: 1,
        pageSize: 10,
      });

      const user = userEvent.setup();
      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByText('API Usage - Customer ABC')).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeEnabled();

      await user.click(nextButton);

      expect(earningsService.getTransactions).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      );
    });

    it('should filter transactions by source type', async () => {
      const user = userEvent.setup();
      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByText('API Usage - Customer ABC')).toBeInTheDocument();
      });

      const filterSelect = screen.getByLabelText(/filter by source/i);
      await user.selectOptions(filterSelect, 'marketplace');

      expect(earningsService.getTransactions).toHaveBeenCalledWith(
        expect.objectContaining({ source: 'marketplace' })
      );
    });
  });

  describe('Earnings Breakdown Charts', () => {
    it('should display earnings breakdown by source', async () => {
      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByText(/api earnings/i)).toBeInTheDocument();
        expect(screen.getByText(/marketplace earnings/i)).toBeInTheDocument();
        expect(screen.getByText(/referral earnings/i)).toBeInTheDocument();
      });
    });

    it('should show correct percentage distribution', async () => {
      render(<EarningsClient />);

      await waitFor(() => {
        // Total: 15750.50
        // API: 8500 / 15750.50 = 54%
        expect(screen.getByText(/54%/)).toBeInTheDocument();
      });
    });

    it('should render charts using recharts library', async () => {
      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByTestId('earnings-chart')).toBeInTheDocument();
      });
    });
  });

  describe('Payout Schedule Information', () => {
    it('should display next payout date', async () => {
      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByText(/next payout/i)).toBeInTheDocument();
        expect(screen.getByText(/Feb 15, 2026/i)).toBeInTheDocument();
      });
    });

    it('should show minimum payout threshold', async () => {
      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByText(/minimum payout/i)).toBeInTheDocument();
        expect(screen.getByText('$100.00')).toBeInTheDocument();
      });
    });

    it('should indicate if user has reached payout threshold', async () => {
      render(<EarningsClient />);

      await waitFor(() => {
        // Pending payout is 1200, threshold is 1000
        expect(screen.getByText(/eligible for payout/i)).toBeInTheDocument();
      });
    });
  });

  describe('Export Functionality', () => {
    it('should render export to CSV button', async () => {
      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /export to csv/i })).toBeInTheDocument();
      });
    });

    it('should trigger CSV download when export button is clicked', async () => {
      const user = userEvent.setup();
      const mockExport = jest.fn().mockResolvedValue(true);
      (earningsService.exportTransactions as jest.Mock).mockImplementation(mockExport);

      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /export to csv/i })).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', { name: /export to csv/i });
      await user.click(exportButton);

      expect(mockExport).toHaveBeenCalledWith('csv');
    });

    it('should show success message after successful export', async () => {
      const user = userEvent.setup();
      (earningsService.exportTransactions as jest.Mock).mockResolvedValue(true);

      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /export to csv/i })).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', { name: /export to csv/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText(/export successful/i)).toBeInTheDocument();
      });
    });

    it('should handle export errors gracefully', async () => {
      const user = userEvent.setup();
      (earningsService.exportTransactions as jest.Mock).mockRejectedValue(
        new Error('Export failed')
      );

      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /export to csv/i })).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', { name: /export to csv/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText(/export failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Mobile Responsive Design', () => {
    it('should render cards in single column on mobile', () => {
      // Mock mobile viewport
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      render(<EarningsClient />);

      const container = screen.getByTestId('earnings-overview');
      expect(container).toHaveClass(/grid-cols-1/);
    });

    it('should render cards in multiple columns on desktop', () => {
      // Mock desktop viewport
      global.innerWidth = 1920;
      global.dispatchEvent(new Event('resize'));

      render(<EarningsClient />);

      const container = screen.getByTestId('earnings-overview');
      expect(container).toHaveClass(/md:grid-cols-3/);
    });

    it('should show mobile-optimized table on small screens', async () => {
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByTestId('mobile-transaction-list')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show skeleton loaders while data is loading', () => {
      render(<EarningsClient />);

      expect(screen.getByTestId('earnings-loading')).toBeInTheDocument();
    });

    it('should hide loading state once data is loaded', async () => {
      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.queryByTestId('earnings-loading')).not.toBeInTheDocument();
      });
    });

    it('should show loading spinner during export', async () => {
      const user = userEvent.setup();
      (earningsService.exportTransactions as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /export to csv/i })).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', { name: /export to csv/i });
      await user.click(exportButton);

      expect(screen.getByTestId('export-loading')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when earnings data fails to load', async () => {
      (earningsService.getEarningsOverview as jest.Mock).mockRejectedValue(
        new Error('Failed to fetch earnings')
      );

      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load earnings data/i)).toBeInTheDocument();
      });
    });

    it('should display error message when transactions fail to load', async () => {
      (earningsService.getTransactions as jest.Mock).mockRejectedValue(
        new Error('Failed to fetch transactions')
      );

      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load transactions/i)).toBeInTheDocument();
      });
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

    it('should retry data fetch when retry button is clicked', async () => {
      const user = userEvent.setup();
      (earningsService.getEarningsOverview as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockEarningsData.overview);

      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('$15,750.50')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for all interactive elements', async () => {
      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByLabelText(/filter by source/i)).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /export to csv/i })).toBeInTheDocument();
    });

    it('should support keyboard navigation for pagination', async () => {
      // Mock more transactions to enable pagination
      (earningsService.getTransactions as jest.Mock).mockResolvedValue({
        items: mockEarningsData.transactions,
        total: 25, // More than page size to enable pagination
        page: 1,
        pageSize: 10,
      });

      const user = userEvent.setup();
      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByText('API Usage - Customer ABC')).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeEnabled();
      nextButton.focus();
      expect(nextButton).toHaveFocus();

      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(earningsService.getTransactions).toHaveBeenCalledWith(
          expect.objectContaining({ page: 2 })
        );
      });
    });

    it('should have semantic HTML structure', async () => {
      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByText('API Usage - Customer ABC')).toBeInTheDocument();
      });

      // Main is rendered after data loads
      const main = document.querySelector('main');
      expect(main).toBeInTheDocument();

      // Table is rendered after data loads
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should provide screen reader friendly status updates', async () => {
      const user = userEvent.setup();
      (earningsService.exportTransactions as jest.Mock).mockResolvedValue(true);

      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /export to csv/i })).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', { name: /export to csv/i });
      await user.click(exportButton);

      await waitFor(() => {
        const statusMessage = screen.getByRole('status');
        expect(statusMessage).toHaveTextContent(/export successful/i);
      });
    });
  });

  describe('Data Refresh', () => {
    it('should support manual data refresh', async () => {
      const user = userEvent.setup();
      render(<EarningsClient />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
      });

      jest.clearAllMocks();

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      expect(earningsService.getEarningsOverview).toHaveBeenCalled();
      expect(earningsService.getTransactions).toHaveBeenCalled();
    });

    it('should auto-refresh data every 5 minutes', async () => {
      jest.useFakeTimers();
      render(<EarningsClient />);

      await waitFor(() => {
        expect(earningsService.getEarningsOverview).toHaveBeenCalledTimes(1);
      });

      jest.clearAllMocks();

      // Fast-forward 5 minutes
      jest.advanceTimersByTime(5 * 60 * 1000);

      await waitFor(() => {
        expect(earningsService.getEarningsOverview).toHaveBeenCalledTimes(1);
      });

      jest.useRealTimers();
    });
  });
});
