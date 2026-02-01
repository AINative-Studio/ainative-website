import { render, screen, fireEvent } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '../AdminSidebar';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('AdminSidebar', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    (usePathname as jest.Mock).mockReturnValue('/admin');
  });

  describe('Rendering', () => {
    it('should render sidebar with all admin menu items', () => {
      mockLocalStorage.setItem('user', JSON.stringify({ role: 'ADMIN' }));

      render(<AdminSidebar />);

      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Monitoring')).toBeInTheDocument();
      expect(screen.getByText('Audit Logs')).toBeInTheDocument();
    });

    it('should render analytics menu item for SUPERUSER only', () => {
      mockLocalStorage.setItem('user', JSON.stringify({ role: 'SUPERUSER' }));

      render(<AdminSidebar />);

      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    it('should not render analytics menu item for ADMIN', () => {
      mockLocalStorage.setItem('user', JSON.stringify({ role: 'ADMIN' }));

      render(<AdminSidebar />);

      expect(screen.queryByText('Analytics')).not.toBeInTheDocument();
    });

    it('should highlight active route', () => {
      mockLocalStorage.setItem('user', JSON.stringify({ role: 'ADMIN' }));
      (usePathname as jest.Mock).mockReturnValue('/admin/users');

      render(<AdminSidebar />);

      const usersLink = screen.getByText('Users').closest('a');
      expect(usersLink).toHaveClass('bg-blue-600/20');
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should render mobile toggle button', () => {
      mockLocalStorage.setItem('user', JSON.stringify({ role: 'ADMIN' }));

      render(<AdminSidebar />);

      const toggleButton = screen.getByLabelText('Toggle sidebar');
      expect(toggleButton).toBeInTheDocument();
    });

    it('should toggle sidebar on mobile', () => {
      mockLocalStorage.setItem('user', JSON.stringify({ role: 'ADMIN' }));

      render(<AdminSidebar />);

      const toggleButton = screen.getByLabelText('Toggle sidebar');
      const sidebar = screen.getByRole('navigation');

      // Initially collapsed on mobile
      expect(sidebar).toHaveClass('translate-x-0');

      // Click to toggle
      fireEvent.click(toggleButton);

      // Should remain visible after toggle
      expect(sidebar).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      mockLocalStorage.setItem('user', JSON.stringify({ role: 'ADMIN' }));

      render(<AdminSidebar />);

      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Admin navigation');
      expect(screen.getByLabelText('Toggle sidebar')).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      mockLocalStorage.setItem('user', JSON.stringify({ role: 'ADMIN' }));

      render(<AdminSidebar />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Admin');
    });

    it('should support keyboard navigation', () => {
      mockLocalStorage.setItem('user', JSON.stringify({ role: 'ADMIN' }));

      render(<AdminSidebar />);

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAttribute('href');
      });
    });
  });

  describe('Role-Based Rendering', () => {
    it('should handle user with is_superuser flag', () => {
      mockLocalStorage.setItem('user', JSON.stringify({ role: 'ADMIN', is_superuser: true }));

      render(<AdminSidebar />);

      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    it('should handle user with roles array', () => {
      mockLocalStorage.setItem('user', JSON.stringify({ roles: ['SUPERUSER'] }));

      render(<AdminSidebar />);

      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    it('should render correctly when no user is logged in', () => {
      render(<AdminSidebar />);

      // Should still render basic structure but not superuser items
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.queryByText('Analytics')).not.toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('should have correct href for all menu items', () => {
      mockLocalStorage.setItem('user', JSON.stringify({ role: 'SUPERUSER' }));

      render(<AdminSidebar />);

      expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/admin');
      expect(screen.getByText('Users').closest('a')).toHaveAttribute('href', '/admin/users');
      expect(screen.getByText('Monitoring').closest('a')).toHaveAttribute('href', '/admin/monitoring');
      expect(screen.getByText('Audit Logs').closest('a')).toHaveAttribute('href', '/admin/audit');
      expect(screen.getByText('Analytics').closest('a')).toHaveAttribute('href', '/admin/analytics-verify');
    });
  });
});
