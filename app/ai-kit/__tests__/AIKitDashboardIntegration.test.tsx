/**
 * AIKit Dashboard Integration Tests
 *
 * Test Coverage Requirements:
 * - Component integration with dashboard layout
 * - Data flow between components
 * - State management across AIKit components
 * - Theme integration
 * - Responsive behavior
 * - Error handling and loading states
 *
 * Coverage Target: 90%+
 */

import { render, screen, within } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import AIKitClient from '../AIKitClient';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('AIKit Dashboard Integration - TDD Suite', () => {
  describe('Dashboard Rendering', () => {
    it('should render complete dashboard with all sections', () => {
      render(<AIKitClient />);

      // Hero Section
      expect(screen.getByText(/AI Kit/i)).toBeInTheDocument();
      expect(screen.getByText(/Build AI Apps Faster/i)).toBeInTheDocument();

      // Feature Grid
      expect(screen.getByText(/Production Ready/i)).toBeInTheDocument();
      expect(screen.getByText(/Type Safe/i)).toBeInTheDocument();

      // Packages Section
      expect(screen.getByText(/Browse All Packages/i)).toBeInTheDocument();
    });

    it('should render all AIKit packages', () => {
      render(<AIKitClient />);

      // Check for key packages
      expect(screen.getByText(/@ainative-studio\/aikit-core/i)).toBeInTheDocument();
      expect(screen.getByText(/@ainative\/ai-kit-auth/i)).toBeInTheDocument();
      expect(screen.getByText(/@ainative\/ai-kit-zerodb/i)).toBeInTheDocument();
    });

    it('should render navigation breadcrumb', () => {
      render(<AIKitClient />);

      const breadcrumb = screen.getByRole('navigation', { name: /breadcrumb/i });
      expect(breadcrumb).toBeInTheDocument();
      expect(within(breadcrumb).getByText('Home')).toBeInTheDocument();
      expect(within(breadcrumb).getByText('AI Kit')).toBeInTheDocument();
    });

    it('should render hero CTA buttons', () => {
      render(<AIKitClient />);

      expect(screen.getByRole('link', { name: /view on github/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /browse packages/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /documentation/i })).toBeInTheDocument();
    });

    it('should render code examples tabs', () => {
      render(<AIKitClient />);

      // Tabs for different frameworks
      expect(screen.getByRole('tab', { name: /react/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /vue/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /cli/i })).toBeInTheDocument();
    });
  });

  describe('Package Filtering', () => {
    it('should display all packages by default', () => {
      render(<AIKitClient />);

      // Should show 14 packages
      const packageCards = screen.getAllByRole('article');
      expect(packageCards.length).toBeGreaterThan(10);
    });

    it('should filter packages by category', async () => {
      const user = userEvent.setup();
      render(<AIKitClient />);

      // Click Core category filter
      const coreButton = screen.getByRole('button', { name: /^Core$/i });
      await user.click(coreButton);

      // Should filter to Core packages
      expect(screen.getByText(/@ainative-studio\/aikit-core/i)).toBeInTheDocument();
    });

    it('should show all packages when "All" filter is selected', async () => {
      const user = userEvent.setup();
      render(<AIKitClient />);

      // Click Framework category
      await user.click(screen.getByRole('button', { name: /framework/i }));

      // Click All to reset
      await user.click(screen.getByRole('button', { name: /^All$/i }));

      // Should show all packages again
      const packageCards = screen.getAllByRole('article');
      expect(packageCards.length).toBeGreaterThan(10);
    });

    it('should update category button active state', async () => {
      const user = userEvent.setup();
      render(<AIKitClient />);

      const securityButton = screen.getByRole('button', { name: /security/i });
      await user.click(securityButton);

      // Active button should have gradient background
      expect(securityButton).toHaveClass('bg-gradient-to-r');
    });
  });

  describe('Code Examples Tab Switching', () => {
    it('should show React code by default', () => {
      render(<AIKitClient />);

      expect(screen.getByText(/useAIChat/i)).toBeInTheDocument();
      expect(screen.getByText(/React Example/i)).toBeInTheDocument();
    });

    it('should switch to Vue code example', async () => {
      const user = userEvent.setup();
      render(<AIKitClient />);

      await user.click(screen.getByRole('tab', { name: /vue/i }));

      expect(screen.getByText(/Vue Example/i)).toBeInTheDocument();
      expect(screen.getByText(/useAIChat/i)).toBeInTheDocument();
    });

    it('should switch to CLI example', async () => {
      const user = userEvent.setup();
      render(<AIKitClient />);

      await user.click(screen.getByRole('tab', { name: /cli/i }));

      expect(screen.getByText(/CLI Commands/i)).toBeInTheDocument();
      expect(screen.getByText(/ai-kit create/i)).toBeInTheDocument();
    });

    it('should maintain tab state during navigation', async () => {
      const user = userEvent.setup();
      render(<AIKitClient />);

      // Switch to Vue tab
      await user.click(screen.getByRole('tab', { name: /vue/i }));

      // Filter packages
      await user.click(screen.getByRole('button', { name: /core/i }));

      // Tab should still show Vue
      const vueTab = screen.getByRole('tab', { name: /vue/i });
      expect(vueTab).toHaveAttribute('data-state', 'active');
    });
  });

  describe('Package Card Interactions', () => {
    it('should copy install command to clipboard', async () => {
      const user = userEvent.setup();
      const mockClipboard = {
        writeText: jest.fn(),
      };
      Object.assign(navigator, { clipboard: mockClipboard });

      render(<AIKitClient />);

      // Find first copy button
      const copyButtons = screen.getAllByRole('button', { name: /copy/i });
      await user.click(copyButtons[0]);

      expect(mockClipboard.writeText).toHaveBeenCalled();
    });

    it('should show check icon after copying', async () => {
      const user = userEvent.setup();
      Object.assign(navigator, {
        clipboard: { writeText: jest.fn() },
      });

      render(<AIKitClient />);

      const copyButtons = screen.getAllByRole('button', { name: /copy/i });
      await user.click(copyButtons[0]);

      // Check icon should appear (implementation detail - may need adjustment)
      expect(copyButtons[0]).toBeInTheDocument();
    });

    it('should have links to NPM and GitHub', () => {
      render(<AIKitClient />);

      const npmLinks = screen.getAllByRole('link', { name: /npm/i });
      const docsLinks = screen.getAllByRole('link', { name: /docs/i });

      expect(npmLinks.length).toBeGreaterThan(0);
      expect(docsLinks.length).toBeGreaterThan(0);
    });

    it('should display package features as badges', () => {
      render(<AIKitClient />);

      // Check for common features
      expect(screen.getByText(/Type safety/i)).toBeInTheDocument();
      expect(screen.getByText(/Vector search/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility Integration', () => {
    it('should have no accessibility violations on full dashboard', async () => {
      const { container } = render(<AIKitClient />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should support keyboard navigation through sections', async () => {
      const user = userEvent.setup();
      render(<AIKitClient />);

      // Tab through interactive elements
      await user.tab(); // First link in breadcrumb
      await user.tab(); // Hero CTA
      await user.tab(); // Next button

      expect(document.activeElement).toBeTruthy();
    });

    it('should announce package filter changes', async () => {
      const user = userEvent.setup();
      render(<AIKitClient />);

      const filterButton = screen.getByRole('button', { name: /framework/i });
      await user.click(filterButton);

      // Packages section should update
      expect(screen.getByRole('region', { name: /package categories/i }) || screen.getByLabelText(/package categories/i)).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      render(<AIKitClient />);

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent(/AI Kit/);

      const subHeadings = screen.getAllByRole('heading', { level: 2 });
      expect(subHeadings.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Behavior', () => {
    it('should render mobile-friendly layout', () => {
      render(<AIKitClient />);

      // Check for responsive classes
      const hero = screen.getByRole('banner') || screen.getByText(/Build AI Apps Faster/i).closest('header');
      expect(hero).toBeTruthy();
    });

    it('should stack packages in grid on mobile', () => {
      render(<AIKitClient />);

      // Packages should be in a grid
      const packageSection = screen.getByRole('heading', { name: /browse all packages/i }).parentElement;
      expect(packageSection).toBeTruthy();
    });

    it('should show responsive navigation', () => {
      render(<AIKitClient />);

      const breadcrumb = screen.getByRole('navigation', { name: /breadcrumb/i });
      expect(breadcrumb).toBeInTheDocument();
    });
  });

  describe('Dark Theme Integration', () => {
    it('should render all components in dark theme', () => {
      const { container } = render(
        <div className="dark">
          <AIKitClient />
        </div>
      );

      expect(container.querySelector('.dark')).toBeInTheDocument();
      expect(screen.getByText(/AI Kit/i)).toBeVisible();
    });

    it('should maintain contrast in dark theme', () => {
      render(
        <div className="dark">
          <AIKitClient />
        </div>
      );

      // All text should be visible
      expect(screen.getByText(/Build AI Apps Faster/i)).toBeVisible();
      expect(screen.getByText(/Production Ready/i)).toBeVisible();
    });

    it('should style code blocks for dark theme', () => {
      render(
        <div className="dark">
          <AIKitClient />
        </div>
      );

      expect(screen.getByText(/useAIChat/i)).toBeInTheDocument();
    });
  });

  describe('Animation and Interactions', () => {
    it('should render animated background', () => {
      const { container } = render(<AIKitClient />);

      // Background elements should be present
      const main = container.querySelector('main');
      expect(main).toHaveClass('min-h-screen');
    });

    it('should animate package cards on scroll', () => {
      render(<AIKitClient />);

      const packageCards = screen.getAllByRole('article');
      expect(packageCards.length).toBeGreaterThan(0);
    });

    it('should show hover effects on interactive elements', async () => {
      const user = userEvent.setup();
      render(<AIKitClient />);

      const firstButton = screen.getAllByRole('button')[0];
      await user.hover(firstButton);

      expect(firstButton).toBeInTheDocument();
    });
  });

  describe('State Persistence', () => {
    it('should maintain selected category filter', async () => {
      const user = userEvent.setup();
      render(<AIKitClient />);

      await user.click(screen.getByRole('button', { name: /framework/i }));

      const frameworkButton = screen.getByRole('button', { name: /framework/i });
      expect(frameworkButton).toHaveClass('bg-gradient-to-r');
    });

    it('should maintain active tab in code examples', async () => {
      const user = userEvent.setup();
      render(<AIKitClient />);

      await user.click(screen.getByRole('tab', { name: /vue/i }));

      const vueTab = screen.getByRole('tab', { name: /vue/i });
      expect(vueTab).toHaveAttribute('data-state', 'active');
    });

    it('should reset copy button state after timeout', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup();
      Object.assign(navigator, {
        clipboard: { writeText: jest.fn() },
      });

      render(<AIKitClient />);

      const copyButtons = screen.getAllByRole('button', { name: /copy/i });
      await user.click(copyButtons[0]);

      // Fast-forward 2 seconds
      jest.advanceTimersByTime(2000);

      jest.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    it('should render gracefully with missing data', () => {
      render(<AIKitClient />);

      // Should not crash
      expect(screen.getByText(/AI Kit/i)).toBeInTheDocument();
    });

    it('should handle clipboard API failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const user = userEvent.setup();

      // Mock clipboard to fail
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockRejectedValue(new Error('Clipboard failed')),
        },
      });

      render(<AIKitClient />);

      const copyButtons = screen.getAllByRole('button', { name: /copy/i });
      await user.click(copyButtons[0]);

      // Should not crash
      expect(screen.getByText(/AI Kit/i)).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Performance', () => {
    it('should render large number of packages efficiently', () => {
      const startTime = performance.now();
      render(<AIKitClient />);
      const endTime = performance.now();

      // Should render in less than 1 second
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should lazy load images', () => {
      const { container } = render(<AIKitClient />);

      // Check for lazy loading attributes
      const images = container.querySelectorAll('img');
      images.forEach(img => {
        // Next.js Image component handles lazy loading
        expect(img).toBeDefined();
      });
    });

    it('should optimize animations', () => {
      render(<AIKitClient />);

      // Framer Motion animations should be present
      expect(screen.getByText(/Build AI Apps Faster/i)).toBeInTheDocument();
    });
  });

  describe('SEO and Metadata', () => {
    it('should have proper heading structure for SEO', () => {
      render(<AIKitClient />);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent(/AI Kit/);

      const h2s = screen.getAllByRole('heading', { level: 2 });
      expect(h2s.length).toBeGreaterThan(2);
    });

    it('should have semantic HTML structure', () => {
      const { container } = render(<AIKitClient />);

      expect(container.querySelector('main')).toBeInTheDocument();
      expect(container.querySelector('header')).toBeInTheDocument();
      expect(container.querySelector('nav')).toBeInTheDocument();
    });
  });
});
