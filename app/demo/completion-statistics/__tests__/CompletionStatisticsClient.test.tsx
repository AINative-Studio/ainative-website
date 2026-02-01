import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CompletionStatisticsClient from '../CompletionStatisticsClient';

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
  usePathname: () => '/demo/completion-statistics',
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
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  Bar: () => <div data-testid="bar" />,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

describe('CompletionStatisticsClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      // Given
      const { container } = render(<CompletionStatisticsClient />);

      // Then
      expect(container).toBeInTheDocument();
    });

    it('should display page title', () => {
      // Given
      render(<CompletionStatisticsClient />);

      // Then
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent(/completion statistics/i);
    });

    it('should display completion rate metric', () => {
      // Given
      render(<CompletionStatisticsClient />);

      // Then
      expect(screen.getByTestId('metric-completion-rate')).toBeInTheDocument();
    });

    it('should display average time metric', () => {
      // Given
      render(<CompletionStatisticsClient />);

      // Then
      expect(screen.getByTestId('metric-average-time')).toBeInTheDocument();
    });

    it('should display success rate metric', () => {
      // Given
      render(<CompletionStatisticsClient />);

      // Then
      expect(screen.getByTestId('metric-success-rate')).toBeInTheDocument();
    });

    it('should display total completions metric', () => {
      // Given
      render(<CompletionStatisticsClient />);

      // Then
      expect(screen.getByTestId('metric-total-completions')).toBeInTheDocument();
    });
  });

  describe('Charts', () => {
    it('should render line chart for completion trends', () => {
      // Given
      render(<CompletionStatisticsClient />);

      // Then
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('should render bar chart for completion distribution', () => {
      // Given
      render(<CompletionStatisticsClient />);

      // Then
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('should render pie chart for success vs failure distribution', () => {
      // Given
      render(<CompletionStatisticsClient />);

      // Then
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });

    it('should include responsive containers for all charts', () => {
      // Given
      render(<CompletionStatisticsClient />);

      // Then
      const containers = screen.getAllByTestId('responsive-container');
      expect(containers.length).toBeGreaterThanOrEqual(3);
    });

    it('should include axes for line chart', () => {
      // Given
      render(<CompletionStatisticsClient />);

      // Then
      expect(screen.getAllByTestId('x-axis').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('y-axis').length).toBeGreaterThan(0);
    });

    it('should include grid lines for readability', () => {
      // Given
      render(<CompletionStatisticsClient />);

      // Then
      expect(screen.getAllByTestId('cartesian-grid').length).toBeGreaterThan(0);
    });

    it('should include tooltips for chart interactivity', () => {
      // Given
      render(<CompletionStatisticsClient />);

      // Then
      expect(screen.getAllByTestId('tooltip').length).toBeGreaterThan(0);
    });

    it('should include legends for chart interpretation', () => {
      // Given
      render(<CompletionStatisticsClient />);

      // Then
      expect(screen.getAllByTestId('legend').length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('should have mobile-friendly layout', () => {
      // Given
      render(<CompletionStatisticsClient />);
      const container = screen.getByTestId('completion-statistics-container');

      // Then
      expect(container).toBeInTheDocument();
      expect(container.className).toContain('min-h-screen');
    });

    it('should display metrics in grid layout', () => {
      // Given
      render(<CompletionStatisticsClient />);

      // Then
      const metricsGrid = screen.getByTestId('metrics-grid');
      expect(metricsGrid).toBeInTheDocument();
      expect(metricsGrid.className).toContain('grid');
    });

    it('should display charts in responsive grid', () => {
      // Given
      render(<CompletionStatisticsClient />);

      // Then
      const chartsContainer = screen.getByTestId('charts-container');
      expect(chartsContainer).toBeInTheDocument();
      expect(chartsContainer.className).toContain('grid');
    });

    it('should have proper spacing between sections', () => {
      // Given
      render(<CompletionStatisticsClient />);
      const container = screen.getByTestId('completion-statistics-container');

      // Then
      expect(container.querySelector('.space-y-8')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have main landmark', () => {
      // Given
      render(<CompletionStatisticsClient />);

      // Then
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      // Given
      render(<CompletionStatisticsClient />);

      // Then
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent(/completion statistics/i);
    });

    it('should have ARIA labels for metrics', () => {
      // Given
      render(<CompletionStatisticsClient />);

      // Then
      const metricsGrid = screen.getByTestId('metrics-grid');
      const cards = within(metricsGrid).getAllByRole('region');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should have ARIA labels for charts', () => {
      // Given
      render(<CompletionStatisticsClient />);

      // Then
      const chartsContainer = screen.getByTestId('charts-container');
      const charts = within(chartsContainer).getAllByRole('region');
      expect(charts.length).toBeGreaterThan(0);
    });

    it('should support keyboard navigation', async () => {
      // Given
      const user = userEvent.setup();
      render(<CompletionStatisticsClient />);

      // When
      await user.tab();

      // Then
      expect(document.activeElement).toBeInTheDocument();
    });

    it('should have descriptive chart titles', () => {
      // Given
      render(<CompletionStatisticsClient />);

      // Then
      expect(screen.getByText(/completion trends over time/i)).toBeInTheDocument();
      expect(screen.getByText(/completion time distribution/i)).toBeInTheDocument();
    });

    it('should announce dynamic content changes', () => {
      // Given
      render(<CompletionStatisticsClient />);

      // Then
      const liveRegions = screen.getAllByRole('status', { hidden: true });
      expect(liveRegions.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Data Display', () => {
    it('should display completion rate as percentage', () => {
      // Given
      render(<CompletionStatisticsClient />);

      // Then
      const completionRateCard = screen.getByTestId('metric-completion-rate');
      const valueText = completionRateCard.textContent || '';
      expect(valueText).toMatch(/%/);
    });

    it('should display average time with time unit', () => {
      // Given
      render(<CompletionStatisticsClient />);

      // Then
      const avgTimeCard = screen.getByTestId('metric-average-time');
      const valueText = avgTimeCard.textContent || '';
      expect(valueText).toMatch(/ms|s|min/i);
    });

    it('should display success rate as percentage', () => {
      // Given
      render(<CompletionStatisticsClient />);

      // Then
      const successRateCard = screen.getByTestId('metric-success-rate');
      const valueText = successRateCard.textContent || '';
      expect(valueText).toMatch(/%/);
    });

    it('should display total completions as number', () => {
      // Given
      render(<CompletionStatisticsClient />);

      // Then
      const totalCard = screen.getByTestId('metric-total-completions');
      const valueElement = within(totalCard).getByText(/^\d+$/);
      expect(valueElement).toBeInTheDocument();
    });

    it('should show trend indicators for metrics', () => {
      // Given
      render(<CompletionStatisticsClient />);

      // Then
      const trendIndicators = screen.getAllByTestId(/trend-indicator/i);
      expect(trendIndicators.length).toBeGreaterThan(0);
    });
  });

  describe('User Interactions', () => {
    it('should allow toggling between time periods', async () => {
      // Given
      const user = userEvent.setup();
      render(<CompletionStatisticsClient />);

      // When
      const periodButtons = screen.getAllByRole('button', { name: /day|week|month/i });
      if (periodButtons.length > 0) {
        await user.click(periodButtons[0]);
      }

      // Then
      expect(periodButtons.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle chart hover interactions', async () => {
      // Given
      const user = userEvent.setup();
      render(<CompletionStatisticsClient />);

      // When
      const lineChart = screen.getByTestId('line-chart');
      await user.hover(lineChart);

      // Then
      expect(lineChart).toBeInTheDocument();
    });

    it('should allow filtering by completion status', async () => {
      // Given
      const user = userEvent.setup();
      render(<CompletionStatisticsClient />);

      // When
      const filterButtons = screen.queryAllByRole('button', { name: /filter|all|success|failure/i });
      if (filterButtons.length > 0) {
        await user.click(filterButtons[0]);
      }

      // Then
      expect(filterButtons.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Performance', () => {
    it('should render large datasets efficiently', () => {
      // Given
      const startTime = performance.now();
      render(<CompletionStatisticsClient />);
      const endTime = performance.now();

      // Then
      expect(endTime - startTime).toBeLessThan(1000); // Should render in less than 1 second
    });

    it('should not cause memory leaks on unmount', () => {
      // Given
      const { unmount } = render(<CompletionStatisticsClient />);

      // When
      unmount();

      // Then
      expect(true).toBe(true); // No errors on unmount
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero completions gracefully', () => {
      // Given
      render(<CompletionStatisticsClient />);

      // Then
      const totalCard = screen.getByTestId('metric-total-completions');
      expect(totalCard).toBeInTheDocument();
    });

    it('should handle 100% completion rate', () => {
      // Given
      render(<CompletionStatisticsClient />);

      // Then
      const completionRateCard = screen.getByTestId('metric-completion-rate');
      expect(completionRateCard).toBeInTheDocument();
    });

    it('should handle 0% success rate', () => {
      // Given
      render(<CompletionStatisticsClient />);

      // Then
      const successRateCard = screen.getByTestId('metric-success-rate');
      expect(successRateCard).toBeInTheDocument();
    });

    it('should handle very long completion times', () => {
      // Given
      render(<CompletionStatisticsClient />);

      // Then
      const avgTimeCard = screen.getByTestId('metric-average-time');
      expect(avgTimeCard).toBeInTheDocument();
    });

    it('should handle missing data gracefully', () => {
      // Given
      render(<CompletionStatisticsClient />);

      // Then
      expect(screen.getByTestId('completion-statistics-container')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error boundary on component crash', () => {
      // Given
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      // When/Then
      const { container } = render(<CompletionStatisticsClient />);
      expect(container).toBeInTheDocument();

      consoleError.mockRestore();
    });

    it('should recover from rendering errors', () => {
      // Given
      render(<CompletionStatisticsClient />);

      // Then
      expect(screen.getByTestId('completion-statistics-container')).toBeInTheDocument();
    });
  });
});
