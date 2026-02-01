import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';
import AdminHeader from '../AdminHeader';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
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

describe('AdminHeader', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    mockLocalStorage.clear();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (usePathname as jest.Mock).mockReturnValue('/admin');
    mockPush.mockClear();
  });

  describe('Rendering', () => {
    it('should render header with user info', () => {
      mockLocalStorage.setItem('user', JSON.stringify({
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'ADMIN'
      }));

      render(<AdminHeader />);

      expect(screen.getByText('Admin User')).toBeInTheDocument();
      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    });

    it('should render breadcrumbs for current route', () => {
      (usePathname as jest.Mock).mockReturnValue('/admin/users');

      render(<AdminHeader />);

      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<AdminHeader />);

      const searchInput = screen.getByPlaceholderText('Search...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should render notifications icon', () => {
      render(<AdminHeader />);

      expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
    });

    it('should render user menu button', () => {
      mockLocalStorage.setItem('user', JSON.stringify({
        email: 'admin@example.com',
        name: 'Admin User'
      }));

      render(<AdminHeader />);

      const menuButton = screen.getByLabelText('User menu');
      expect(menuButton).toBeInTheDocument();
    });
  });

  describe('Breadcrumbs', () => {
    it('should show only Admin for root admin route', () => {
      (usePathname as jest.Mock).mockReturnValue('/admin');

      render(<AdminHeader />);

      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });

    it('should show breadcrumbs for nested routes', () => {
      (usePathname as jest.Mock).mockReturnValue('/admin/monitoring');

      render(<AdminHeader />);

      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Monitoring')).toBeInTheDocument();
    });

    it('should capitalize breadcrumb segments', () => {
      (usePathname as jest.Mock).mockReturnValue('/admin/analytics-verify');

      render(<AdminHeader />);

      expect(screen.getByText('Analytics Verify')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should update search input on change', () => {
      render(<AdminHeader />);

      const searchInput = screen.getByPlaceholderText('Search...') as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'test query' } });

      expect(searchInput.value).toBe('test query');
    });

    it('should have proper ARIA label on search input', () => {
      render(<AdminHeader />);

      const searchInput = screen.getByLabelText('Search');
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('User Menu', () => {
    it('should show user menu when clicked', () => {
      mockLocalStorage.setItem('user', JSON.stringify({
        email: 'admin@example.com',
        name: 'Admin User'
      }));

      render(<AdminHeader />);

      const menuButton = screen.getByLabelText('User menu');
      fireEvent.click(menuButton);

      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('should handle logout', async () => {
      mockLocalStorage.setItem('user', JSON.stringify({
        email: 'admin@example.com',
        name: 'Admin User'
      }));

      render(<AdminHeader />);

      const menuButton = screen.getByLabelText('User menu');
      fireEvent.click(menuButton);

      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(mockLocalStorage.getItem('user')).toBeNull();
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('should navigate to profile', () => {
      mockLocalStorage.setItem('user', JSON.stringify({
        email: 'admin@example.com',
        name: 'Admin User'
      }));

      render(<AdminHeader />);

      const menuButton = screen.getByLabelText('User menu');
      fireEvent.click(menuButton);

      const profileButton = screen.getByText('Profile');
      fireEvent.click(profileButton);

      expect(mockPush).toHaveBeenCalledWith('/dashboard/settings');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      mockLocalStorage.setItem('user', JSON.stringify({
        email: 'admin@example.com',
        name: 'Admin User'
      }));

      render(<AdminHeader />);

      expect(screen.getByLabelText('Search')).toBeInTheDocument();
      expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
      expect(screen.getByLabelText('User menu')).toBeInTheDocument();
    });

    it('should have proper navigation landmarks', () => {
      render(<AdminHeader />);

      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      mockLocalStorage.setItem('user', JSON.stringify({
        email: 'admin@example.com',
        name: 'Admin User'
      }));

      render(<AdminHeader />);

      const menuButton = screen.getByLabelText('User menu');
      expect(menuButton).toHaveAttribute('type', 'button');
    });
  });

  describe('User Info Display', () => {
    it('should handle user without name', () => {
      mockLocalStorage.setItem('user', JSON.stringify({
        email: 'admin@example.com'
      }));

      render(<AdminHeader />);

      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    });

    it('should handle user without email', () => {
      mockLocalStorage.setItem('user', JSON.stringify({
        name: 'Admin User'
      }));

      render(<AdminHeader />);

      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    it('should handle no user data', () => {
      render(<AdminHeader />);

      expect(screen.getByLabelText('User menu')).toBeInTheDocument();
    });
  });

  describe('Notifications', () => {
    it('should show notification badge when there are notifications', () => {
      render(<AdminHeader notificationCount={5} />);

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should not show notification badge when count is 0', () => {
      render(<AdminHeader notificationCount={0} />);

      const notificationButton = screen.getByLabelText('Notifications');
      expect(notificationButton.querySelector('.bg-red-500')).not.toBeInTheDocument();
    });
  });
});
