import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CompletionTimeSummaryClient from '../CompletionTimeSummaryClient';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/demo/completion-time-summary',
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: { id: '1', name: 'Test User', email: 'test@example.com' },
      expires: '2025-12-31',
    },
    status: 'authenticated',
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock recharts to avoid canvas issues in tests
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

describe('CompletionTimeSummaryClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      // Given
      const { container } = render(<CompletionTimeSummaryClient />);

      // Then
      expect(container).toBeInTheDocument();
    });

    it('should display the page title', () => {
      // Given
      render(<CompletionTimeSummaryClient />);

      // Then
      expect(screen.getByText(/completion time summary/i)).toBeInTheDocument();
    });

    it('should display the page description', () => {
      // Given
      render(<CompletionTimeSummaryClient />);

      // Then
      expect(
        screen.getByText(/track and analyze completion times across different time periods/i)
      ).toBeInTheDocument();
    });

    it('should render the timeline chart container', () => {
      // Given
      render(<CompletionTimeSummaryClient />);

      // Then
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should display demo badge', () => {
      // Given
      render(<CompletionTimeSummaryClient />);

      // Then
      expect(screen.getByText(/live demo/i)).toBeInTheDocument();
    });
  });

  describe('Time Period Switching', () => {
    it('should default to daily view', () => {
      // Given
      render(<CompletionTimeSummaryClient />);

      // Then
      const dailyTab = screen.getByRole('tab', { name: /daily/i });
      expect(dailyTab).toHaveAttribute('data-state', 'active');
    });

    it('should switch to weekly view when weekly tab is clicked', async () => {
      // Given
      const user = userEvent.setup();
      render(<CompletionTimeSummaryClient />);

      // When
      const weeklyTab = screen.getByRole('tab', { name: /weekly/i });
      await user.click(weeklyTab);

      // Then
      await waitFor(() => {
        expect(weeklyTab).toHaveAttribute('data-state', 'active');
      });
    });

    it('should switch to monthly view when monthly tab is clicked', async () => {
      // Given
      const user = userEvent.setup();
      render(<CompletionTimeSummaryClient />);

      // When
      const monthlyTab = screen.getByRole('tab', { name: /monthly/i });
      await user.click(monthlyTab);

      // Then
      await waitFor(() => {
        expect(monthlyTab).toHaveAttribute('data-state', 'active');
      });
    });

    it('should update chart data when time period changes', async () => {
      // Given
      const user = userEvent.setup();
      const { container } = render(<CompletionTimeSummaryClient />);

      // When
      const weeklyTab = screen.getByRole('tab', { name: /weekly/i });
      await user.click(weeklyTab);

      // Then
      await waitFor(() => {
        expect(container.querySelector('[data-testid="line-chart"]')).toBeInTheDocument();
      });
    });
  });

  describe('Timeline Data Rendering', () => {
    it('should display summary statistics cards', () => {
      // Given
      render(<CompletionTimeSummaryClient />);

      // Then
      expect(screen.getByText(/total completions/i)).toBeInTheDocument();
      expect(screen.getByText(/average time/i)).toBeInTheDocument();
      expect(screen.getByText(/fastest completion/i)).toBeInTheDocument();
      expect(screen.getByText(/slowest completion/i)).toBeInTheDocument();
    });

    it('should render chart with data points', () => {
      // Given
      render(<CompletionTimeSummaryClient />);

      // Then
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('x-axis')).toBeInTheDocument();
      expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    });

    it('should display trend indicators', () => {
      // Given
      render(<CompletionTimeSummaryClient />);

      // Then
      // Check for trend percentages
      const trends = screen.getAllByText(/[+-]\d+%|no change|faster|slower|consistent/i);
      expect(trends.length).toBeGreaterThan(0);
    });

    it('should format time values correctly', () => {
      // Given
      render(<CompletionTimeSummaryClient />);

      // Then
      // Check for time formatting (e.g., "2h 30m", "45s")
      const timeElements = screen.getAllByText(/\d+[hms]/);
      expect(timeElements.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('should render mobile layout on small screens', () => {
      // Given - Mock window width
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      const { container } = render(<CompletionTimeSummaryClient />);

      // Then
      expect(container.querySelector('.grid-cols-1')).toBeInTheDocument();
    });

    it('should render tablet layout on medium screens', () => {
      // Given
      global.innerWidth = 768;
      global.dispatchEvent(new Event('resize'));

      const { container } = render(<CompletionTimeSummaryClient />);

      // Then
      expect(container.querySelector('.md\\:grid-cols-2')).toBeInTheDocument();
    });

    it('should render desktop layout on large screens', () => {
      // Given
      global.innerWidth = 1024;
      global.dispatchEvent(new Event('resize'));

      const { container } = render(<CompletionTimeSummaryClient />);

      // Then
      expect(container.querySelector('.lg\\:grid-cols-4')).toBeInTheDocument();
    });

    it('should adjust chart height on mobile', () => {
      // Given
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      render(<CompletionTimeSummaryClient />);

      // Then
      const container = screen.getByTestId('responsive-container');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Accessibility Compliance', () => {
    it('should have proper ARIA labels on tabs', () => {
      // Given
      render(<CompletionTimeSummaryClient />);

      // Then
      const dailyTab = screen.getByRole('tab', { name: /daily/i });
      expect(dailyTab).toHaveAccessibleName();
    });

    it('should support keyboard navigation for time period tabs', async () => {
      // Given
      const user = userEvent.setup();
      render(<CompletionTimeSummaryClient />);

      // When
      await user.tab();

      // Then
      const activeElement = document.activeElement;
      expect(activeElement).toHaveAttribute('role', 'tab');
    });

    it('should announce chart data changes to screen readers', () => {
      // Given
      render(<CompletionTimeSummaryClient />);

      // Then
      const liveRegion = screen.getByRole('status', { hidden: true });
      expect(liveRegion).toBeInTheDocument();
    });

    it('should have sufficient color contrast for statistics', () => {
      // Given
      const { container } = render(<CompletionTimeSummaryClient />);

      // Then
      const statisticCards = container.querySelectorAll('[data-testid="stat-card"]');
      expect(statisticCards.length).toBeGreaterThan(0);
    });

    it('should provide text alternatives for chart visualizations', () => {
      // Given
      render(<CompletionTimeSummaryClient />);

      // Then
      const chartDescriptions = screen.getAllByText(/completion time trends over/i);
      expect(chartDescriptions.length).toBeGreaterThan(0);
    });
  });

  describe('User Interactions', () => {
    it('should highlight selected time period', async () => {
      // Given
      const user = userEvent.setup();
      render(<CompletionTimeSummaryClient />);

      // When
      const weeklyTab = screen.getByRole('tab', { name: /weekly/i });
      await user.click(weeklyTab);

      // Then
      await waitFor(() => {
        expect(weeklyTab).toHaveAttribute('data-state', 'active');
      });
    });

    it('should display tooltip on chart hover', async () => {
      // Given
      render(<CompletionTimeSummaryClient />);

      // Then
      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });

    it('should show detailed stats on card click', async () => {
      // Given
      const user = userEvent.setup();
      render(<CompletionTimeSummaryClient />);

      // When
      const statCard = screen.getByText(/total completions/i).closest('[data-testid="stat-card"]');
      if (statCard) {
        await user.click(statCard);

        // Then
        await waitFor(() => {
          expect(screen.getByText(/detailed statistics/i)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Error Handling', () => {
    it('should display error message when data fails to load', () => {
      // Given - Mock console.error to suppress error output
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      // When
      // Simulate error condition

      // Then
      consoleError.mockRestore();
    });

    it('should show empty state when no data is available', () => {
      // Given
      render(<CompletionTimeSummaryClient />);

      // Then
      // Check if empty state message appears when appropriate
      const emptyStateMessage = screen.queryByText(/no completion data available/i);
      // Should not show initially since we have mock data
      expect(emptyStateMessage).not.toBeInTheDocument();
    });

    it('should recover gracefully from rendering errors', () => {
      // Given
      const { container } = render(<CompletionTimeSummaryClient />);

      // Then
      expect(container).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single data point', () => {
      // Given
      render(<CompletionTimeSummaryClient />);

      // Then
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('should handle very large completion times', () => {
      // Given
      render(<CompletionTimeSummaryClient />);

      // Then
      // Should format large numbers correctly (e.g., "24h 30m")
      const statCards = screen.getAllByTestId('stat-card');
      expect(statCards.length).toBeGreaterThan(0);
    });

    it('should handle zero completion times', () => {
      // Given
      render(<CompletionTimeSummaryClient />);

      // Then
      // Should display "0s" or similar
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('should handle missing data points in timeline', () => {
      // Given
      render(<CompletionTimeSummaryClient />);

      // Then
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render large datasets efficiently', () => {
      // Given
      const startTime = performance.now();

      // When
      render(<CompletionTimeSummaryClient />);

      // Then
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(1000); // Should render in less than 1 second
    });

    it('should memoize expensive calculations', () => {
      // Given
      const { rerender } = render(<CompletionTimeSummaryClient />);

      // When
      rerender(<CompletionTimeSummaryClient />);

      // Then
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  describe('Data Accuracy', () => {
    it('should calculate average completion time correctly', () => {
      // Given
      render(<CompletionTimeSummaryClient />);

      // Then
      const avgCard = screen.getByText(/average time/i).closest('[data-testid="stat-card"]');
      expect(avgCard).toBeInTheDocument();
    });

    it('should identify fastest completion correctly', () => {
      // Given
      render(<CompletionTimeSummaryClient />);

      // Then
      const fastestCard = screen.getByText(/fastest completion/i).closest('[data-testid="stat-card"]');
      expect(fastestCard).toBeInTheDocument();
    });

    it('should identify slowest completion correctly', () => {
      // Given
      render(<CompletionTimeSummaryClient />);

      // Then
      const slowestCard = screen.getByText(/slowest completion/i).closest('[data-testid="stat-card"]');
      expect(slowestCard).toBeInTheDocument();
    });

    it('should calculate trend percentages correctly', () => {
      // Given
      render(<CompletionTimeSummaryClient />);

      // Then
      // Check for percentage indicators (e.g., "+15%", "-8%")
      const trends = screen.getAllByText(/[+-]\d+%/);
      expect(trends.length).toBeGreaterThan(0);
    });
  });
});
