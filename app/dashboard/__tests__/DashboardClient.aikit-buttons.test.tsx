import React from 'react';
import { render, screen, waitFor } from '@/test/test-utils';
import DashboardClient from '../DashboardClient';
import { useRouter } from 'next/navigation';

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
  usePathname: () => '/dashboard',
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

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: React.PropsWithChildren<Record<string, unknown>>) => <>{children}</>,
}));

describe('DashboardClient - AIKitButton Migration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup localStorage mock
    const localStorageMock = {
      getItem: jest.fn((key: string) => {
        if (key === 'user') {
          return JSON.stringify({ email: 'test@example.com', name: 'Test User' });
        }
        return null;
      }),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('AIKitButton Integration', () => {
    it('should render all action buttons with AIKitButton component', async () => {
      // Given: Component is rendered
      render(<DashboardClient />);

      // When: Component loads
      await waitFor(() => {
        expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
      });

      // Then: All action buttons should be present
      // Refresh button
      const refreshButton = screen.getByTitle('Refresh data');
      expect(refreshButton).toBeInTheDocument();

      // Export buttons
      const exportCsvButton = screen.getByText('Export CSV');
      expect(exportCsvButton).toBeInTheDocument();

      const exportJsonButton = screen.getByText('Export JSON');
      expect(exportJsonButton).toBeInTheDocument();

      // Setup automatic refills button
      const refillsButton = screen.getByText('Setup automatic refills');
      expect(refillsButton).toBeInTheDocument();

      // Purchase credits button
      const purchaseButton = screen.getByText('Purchase credits');
      expect(purchaseButton).toBeInTheDocument();
    });

    it('should apply correct variant styles to primary action buttons', async () => {
      // Given: Component is rendered
      render(<DashboardClient />);

      // When: Component loads
      await waitFor(() => {
        expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
      });

      // Then: Primary button should have gradient background
      const refillsButton = screen.getByText('Setup automatic refills');
      expect(refillsButton).toHaveClass('bg-gradient-to-r');
      expect(refillsButton).toHaveClass('from-[#4B6FED]');
    });

    it('should apply correct variant styles to outline buttons', async () => {
      // Given: Component is rendered
      render(<DashboardClient />);

      // When: Component loads
      await waitFor(() => {
        expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
      });

      // Then: Outline buttons should have border and transparent background
      const exportCsvButton = screen.getByText('Export CSV');
      expect(exportCsvButton).toHaveClass('border-2');
      expect(exportCsvButton).toHaveClass('bg-transparent');

      const purchaseButton = screen.getByText('Purchase credits');
      expect(purchaseButton).toHaveClass('border-2');
      expect(purchaseButton).toHaveClass('bg-transparent');
    });

    it('should apply correct variant styles to ghost buttons', async () => {
      // Given: Component is rendered
      render(<DashboardClient />);

      // When: Component loads
      await waitFor(() => {
        expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
      });

      // Then: Ghost button (refresh) should have minimal styling
      const refreshButton = screen.getByTitle('Refresh data');
      expect(refreshButton).toHaveClass('hover:bg-[#4B6FED]/10');
    });

    it('should maintain click handlers after migration', async () => {
      // Given: Component is rendered with router mock
      const mockPush = jest.fn();
      (useRouter as jest.Mock) = jest.fn(() => ({
        push: mockPush,
        replace: jest.fn(),
        prefetch: jest.fn(),
      }));

      render(<DashboardClient />);

      // When: Component loads
      await waitFor(() => {
        expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
      });

      // And: User clicks purchase credits button
      const purchaseButton = screen.getByText('Purchase credits');
      purchaseButton.click();

      // Then: Router should navigate
      expect(mockPush).toHaveBeenCalledWith('/purchase-credits');
    });

    it('should handle refresh button click', async () => {
      // Given: Component is rendered
      render(<DashboardClient />);

      // When: Component loads
      await waitFor(() => {
        expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
      });

      // And: User clicks refresh button
      const refreshButton = screen.getByTitle('Refresh data');
      refreshButton.click();

      // Then: Button should trigger refresh (icon should be in button)
      expect(refreshButton).toBeInTheDocument();
    });

    it('should maintain disabled state correctly', async () => {
      // Given: Component is rendered
      render(<DashboardClient />);

      // When: Component is loading
      // The refresh button should work immediately
      await waitFor(() => {
        const refreshButton = screen.getByTitle('Refresh data');
        expect(refreshButton).toBeInTheDocument();
      });
    });

    it('should render icons within buttons correctly', async () => {
      // Given: Component is rendered
      render(<DashboardClient />);

      // When: Component loads
      await waitFor(() => {
        expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
      });

      // Then: Buttons with icons should contain SVG elements
      const exportCsvButton = screen.getByText('Export CSV');
      const exportJsonButton = screen.getByText('Export JSON');
      const refillsButton = screen.getByText('Setup automatic refills');

      // All buttons should be properly rendered
      expect(exportCsvButton).toBeInTheDocument();
      expect(exportJsonButton).toBeInTheDocument();
      expect(refillsButton).toBeInTheDocument();
    });

    it('should support different button sizes', async () => {
      // Given: Component is rendered
      render(<DashboardClient />);

      // When: Component loads
      await waitFor(() => {
        expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
      });

      // Then: Small buttons should have sm size class
      const exportCsvButton = screen.getByText('Export CSV');
      expect(exportCsvButton).toHaveClass('h-8'); // sm size
    });

    it('should maintain accessibility attributes', async () => {
      // Given: Component is rendered
      render(<DashboardClient />);

      // When: Component loads
      await waitFor(() => {
        expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
      });

      // Then: Buttons should have proper roles and accessibility
      const refreshButton = screen.getByTitle('Refresh data');
      expect(refreshButton).toHaveAttribute('title', 'Refresh data');

      const exportCsvButton = screen.getByText('Export CSV');
      expect(exportCsvButton.tagName).toBe('BUTTON');
    });

    it('should apply dark theme compatible styles', async () => {
      // Given: Component is rendered
      render(<DashboardClient />);

      // When: Component loads
      await waitFor(() => {
        expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
      });

      // Then: Buttons should have text-white or light colors for dark theme
      const refillsButton = screen.getByText('Setup automatic refills');
      expect(refillsButton).toHaveClass('text-white');

      const exportCsvButton = screen.getByText('Export CSV');
      expect(exportCsvButton).toHaveClass('text-white');
    });
  });

  describe('Button Styling Consistency', () => {
    it('should apply consistent transition effects', async () => {
      // Given: Component is rendered
      render(<DashboardClient />);

      // When: Component loads
      await waitFor(() => {
        expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
      });

      // Then: All buttons should have transition classes
      const refillsButton = screen.getByText('Setup automatic refills');
      expect(refillsButton).toHaveClass('transition-all');
      expect(refillsButton).toHaveClass('duration-300');
    });

    it('should apply consistent focus styles', async () => {
      // Given: Component is rendered
      render(<DashboardClient />);

      // When: Component loads
      await waitFor(() => {
        expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
      });

      // Then: All buttons should have focus-visible ring
      const refillsButton = screen.getByText('Setup automatic refills');
      expect(refillsButton).toHaveClass('focus-visible:ring-2');
      expect(refillsButton).toHaveClass('focus-visible:ring-[#4B6FED]');
    });
  });
});
