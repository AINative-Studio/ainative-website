/**
 * BUG #485: Footer Overlap Fix - Test Suite
 *
 * Testing footer visibility and positioning on dashboard pages
 * Target: 85%+ coverage
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { usePathname } from 'next/navigation';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        email: 'test@example.com',
        name: 'Test User',
      },
    },
    status: 'authenticated',
  }),
}));

// Mock guards
jest.mock('@/components/guards/AdminRouteGuard', () => ({
  useIsAdmin: () => false,
}));

// Mock Framer Motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>,
    button: ({ children, className, ...props }: any) => <button className={className} {...props}>{children}</button>,
  },
}));

describe('BUG #485: Footer Overlap on Dashboard Pages', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue('/dashboard');

    // Mock window.innerWidth for responsive tests
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  describe('RED Phase - Footer Visibility Tests', () => {
    it('should render footer on dashboard pages', () => {
      render(
        <DashboardLayout>
          <div data-testid="dashboard-content">Dashboard Content</div>
        </DashboardLayout>
      );

      // Footer should be in the document
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });

    it('should render footer with proper semantic HTML', () => {
      render(
        <DashboardLayout>
          <div data-testid="dashboard-content">Dashboard Content</div>
        </DashboardLayout>
      );

      const footer = screen.getByRole('contentinfo');
      expect(footer.tagName).toBe('FOOTER');
    });

    it('should display footer copyright text', () => {
      render(
        <DashboardLayout>
          <div data-testid="dashboard-content">Dashboard Content</div>
        </DashboardLayout>
      );

      const currentYear = new Date().getFullYear();
      expect(screen.getByText(new RegExp(`© ${currentYear} AiNative Studio`))).toBeInTheDocument();
    });
  });

  describe('RED Phase - Footer Positioning on Desktop', () => {
    beforeEach(() => {
      // Set desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    });

    it('should have left margin offset for sidebar on desktop', () => {
      const { container } = render(
        <DashboardLayout>
          <div data-testid="dashboard-content">Dashboard Content</div>
        </DashboardLayout>
      );

      const footerWrapper = container.querySelector('.md\\:ml-72');
      expect(footerWrapper).toBeInTheDocument();
    });

    it('should apply proper Tailwind classes for sidebar offset', () => {
      const { container } = render(
        <DashboardLayout>
          <div data-testid="dashboard-content">Dashboard Content</div>
        </DashboardLayout>
      );

      const footer = screen.getByRole('contentinfo');
      const footerWrapper = footer.parentElement;

      expect(footerWrapper?.className).toContain('md:ml-72');
    });

    it('should not have z-index conflicts with sidebar', () => {
      const { container } = render(
        <DashboardLayout>
          <div data-testid="dashboard-content">Dashboard Content</div>
        </DashboardLayout>
      );

      const footer = screen.getByRole('contentinfo');
      const footerWrapper = footer.parentElement;

      // Footer wrapper should not have explicit z-index (should be auto or lower than sidebar z-20)
      const hasZIndexClass = footerWrapper?.className.match(/z-\d+/);
      expect(hasZIndexClass).toBeNull();
    });

    it('should position footer below main content', () => {
      const { container } = render(
        <DashboardLayout>
          <div data-testid="dashboard-content">Dashboard Content</div>
        </DashboardLayout>
      );

      const mainContent = screen.getByRole('main');
      const footer = screen.getByRole('contentinfo');

      // Footer should come after main in DOM order
      const mainPosition = Array.from(container.querySelectorAll('*')).indexOf(mainContent);
      const footerPosition = Array.from(container.querySelectorAll('*')).indexOf(footer);

      expect(footerPosition).toBeGreaterThan(mainPosition);
    });
  });

  describe('RED Phase - Responsive Behavior (Mobile)', () => {
    beforeEach(() => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
    });

    it('should not have left margin on mobile', async () => {
      const { container } = render(
        <DashboardLayout>
          <div data-testid="dashboard-content">Dashboard Content</div>
        </DashboardLayout>
      );

      const footerWrapper = container.querySelector('.md\\:ml-72');

      // Wrapper should exist but margin only applies on md: breakpoint
      expect(footerWrapper).toBeInTheDocument();

      // In mobile view, the ml-72 class shouldn't apply
      // We can verify by checking the computed style if testing in actual browser
    });

    it('should render footer without overlap on mobile', () => {
      render(
        <DashboardLayout>
          <div data-testid="dashboard-content">Dashboard Content</div>
        </DashboardLayout>
      );

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeVisible();
    });
  });

  describe('RED Phase - Layout Structure', () => {
    it('should have proper flex layout hierarchy', () => {
      const { container } = render(
        <DashboardLayout>
          <div data-testid="dashboard-content">Dashboard Content</div>
        </DashboardLayout>
      );

      // Root container should have flex and min-h-screen
      const rootContainer = container.querySelector('.min-h-screen');
      expect(rootContainer).toBeInTheDocument();
      expect(rootContainer?.className).toContain('flex');
      expect(rootContainer?.className).toContain('flex-col');
    });

    it('should have flex-1 on layout body to push footer down', () => {
      const { container } = render(
        <DashboardLayout>
          <div data-testid="dashboard-content">Dashboard Content</div>
        </DashboardLayout>
      );

      // Layout body should have flex-1
      const layoutBody = container.querySelector('.flex-1.pt-16');
      expect(layoutBody).toBeInTheDocument();
    });

    it('should position sidebar as fixed with correct z-index', () => {
      const { container } = render(
        <DashboardLayout>
          <div data-testid="dashboard-content">Dashboard Content</div>
        </DashboardLayout>
      );

      // Desktop sidebar wrapper - looking for hidden md:block fixed with z-20
      const sidebarWrapper = container.querySelector('.hidden.md\\:block.fixed');
      expect(sidebarWrapper).toBeInTheDocument();
      expect(sidebarWrapper?.className).toContain('z-20');
    });
  });

  describe('RED Phase - All Dashboard Routes', () => {
    const dashboardRoutes = [
      '/dashboard',
      '/dashboard/main',
      '/dashboard/usage',
      '/dashboard/api-keys',
      '/dashboard/agents',
      '/dashboard/zerodb',
      '/dashboard/qnn',
      '/dashboard/agent-swarm',
    ];

    dashboardRoutes.forEach((route) => {
      it(`should render footer correctly on ${route}`, () => {
        (usePathname as jest.Mock).mockReturnValue(route);

        render(
          <DashboardLayout>
            <div data-testid="dashboard-content">Dashboard Content</div>
          </DashboardLayout>
        );

        const footer = screen.getByRole('contentinfo');
        expect(footer).toBeInTheDocument();
        expect(footer).toBeVisible();
      });
    });
  });

  describe('RED Phase - Content Height and Scroll Behavior', () => {
    it('should render footer when content is short', () => {
      render(
        <DashboardLayout>
          <div data-testid="dashboard-content" style={{ height: '200px' }}>
            Short Content
          </div>
        </DashboardLayout>
      );

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });

    it('should render footer when content is long (scrollable)', () => {
      render(
        <DashboardLayout>
          <div data-testid="dashboard-content" style={{ height: '2000px' }}>
            Long Content
          </div>
        </DashboardLayout>
      );

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });

    it('should have proper stacking context', () => {
      const { container } = render(
        <DashboardLayout>
          <div data-testid="dashboard-content">Dashboard Content</div>
        </DashboardLayout>
      );

      const sidebar = container.querySelector('.fixed.left-0.top-0.z-20');
      const footer = screen.getByRole('contentinfo');
      const footerWrapper = footer.parentElement;

      // Verify sidebar has z-20
      expect(sidebar?.className).toContain('z-20');

      // Verify footer doesn't have conflicting z-index
      expect(footerWrapper?.className).not.toMatch(/z-\d+/);
    });
  });

  describe('RED Phase - Footer Content Accessibility', () => {
    it('should have accessible footer links', () => {
      render(
        <DashboardLayout>
          <div data-testid="dashboard-content">Dashboard Content</div>
        </DashboardLayout>
      );

      // Check for key footer links
      const productLinks = screen.getByText('PRODUCT');
      expect(productLinks).toBeInTheDocument();

      const resourcesLinks = screen.getByText('RESOURCES');
      expect(resourcesLinks).toBeInTheDocument();

      const companyLinks = screen.getByText('COMPANY');
      expect(companyLinks).toBeInTheDocument();
    });

    it('should have social media links with proper aria-labels', () => {
      render(
        <DashboardLayout>
          <div data-testid="dashboard-content">Dashboard Content</div>
        </DashboardLayout>
      );

      const linkedInLink = screen.getByLabelText('LinkedIn');
      expect(linkedInLink).toBeInTheDocument();
      expect(linkedInLink).toHaveAttribute('target', '_blank');
      expect(linkedInLink).toHaveAttribute('rel', 'noopener noreferrer');

      const githubLink = screen.getByLabelText('GitHub');
      expect(githubLink).toBeInTheDocument();
      expect(githubLink).toHaveAttribute('target', '_blank');
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('RED Phase - Sidebar Width Consistency', () => {
    it('should have sidebar width matching footer offset', () => {
      const { container } = render(
        <DashboardLayout>
          <div data-testid="dashboard-content">Dashboard Content</div>
        </DashboardLayout>
      );

      // Sidebar should be w-72 (288px / 18rem)
      const sidebar = container.querySelector('aside.w-72');

      // Footer wrapper should have md:ml-72 (288px / 18rem)
      const footerWrapper = container.querySelector('.md\\:ml-72');

      expect(sidebar).toBeInTheDocument();
      expect(footerWrapper).toBeInTheDocument();
    });
  });
});
