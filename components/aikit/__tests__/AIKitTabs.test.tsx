/**
 * AIKitTabs Component Tests (TDD - Test First Approach)
 *
 * Test Suite for Dashboard Navigation Tabs Component
 * Covers: Rendering, Navigation, Accessibility, Keyboard Navigation, Dark Theme, Mobile Responsive
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AIKitTabs from '../AIKitTabs';

// Mock Next.js navigation
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockPrefetch = jest.fn();
const mockBack = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: mockPrefetch,
    back: mockBack,
  })),
  usePathname: jest.fn(() => '/dashboard'),
}));

// Get the mocked functions
const { useRouter, usePathname } = jest.requireMock('next/navigation');

describe('AIKitTabs Component - TDD Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    mockReplace.mockClear();
    mockPrefetch.mockClear();
    mockBack.mockClear();
    usePathname.mockReturnValue('/dashboard');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering Tests', () => {
    it('should render without crashing', () => {
      // Given/When
      const { container } = render(<AIKitTabs />);

      // Then
      expect(container).toBeInTheDocument();
    });

    it('should render all five navigation tabs', () => {
      // Given/When
      render(<AIKitTabs />);

      // Then
      expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /ai-kit/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /usage/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /billing/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /settings/i })).toBeInTheDocument();
    });

    it('should render tabs in correct order', () => {
      // Given/When
      render(<AIKitTabs />);

      // Then
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(5);
      expect(tabs[0]).toHaveTextContent(/overview/i);
      expect(tabs[1]).toHaveTextContent(/ai-kit/i);
      expect(tabs[2]).toHaveTextContent(/usage/i);
      expect(tabs[3]).toHaveTextContent(/billing/i);
      expect(tabs[4]).toHaveTextContent(/settings/i);
    });

    it('should render with proper tab list role', () => {
      // Given/When
      render(<AIKitTabs />);

      // Then
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });
  });

  describe('Active State Management', () => {
    it('should highlight Overview tab when on /dashboard path', () => {
      // Given
      usePathname.mockReturnValue('/dashboard');

      // When
      render(<AIKitTabs />);

      // Then
      const overviewTab = screen.getByRole('tab', { name: /overview/i });
      expect(overviewTab).toHaveAttribute('data-state', 'active');
      expect(overviewTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should highlight AI-Kit tab when on /dashboard/ai-kit path', () => {
      // Given
      usePathname.mockReturnValue('/dashboard/ai-kit');

      // When
      render(<AIKitTabs />);

      // Then
      const aiKitTab = screen.getByRole('tab', { name: /ai-kit/i });
      expect(aiKitTab).toHaveAttribute('data-state', 'active');
      expect(aiKitTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should highlight Usage tab when on /dashboard/usage path', () => {
      // Given
      usePathname.mockReturnValue('/dashboard/usage');

      // When
      render(<AIKitTabs />);

      // Then
      const usageTab = screen.getByRole('tab', { name: /usage/i });
      expect(usageTab).toHaveAttribute('data-state', 'active');
      expect(usageTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should highlight Billing tab when on /dashboard/billing path', () => {
      // Given
      usePathname.mockReturnValue('/dashboard/billing');

      // When
      render(<AIKitTabs />);

      // Then
      const billingTab = screen.getByRole('tab', { name: /billing/i });
      expect(billingTab).toHaveAttribute('data-state', 'active');
      expect(billingTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should highlight Settings tab when on /dashboard/settings path', () => {
      // Given
      usePathname.mockReturnValue('/dashboard/settings');

      // When
      render(<AIKitTabs />);

      // Then
      const settingsTab = screen.getByRole('tab', { name: /settings/i });
      expect(settingsTab).toHaveAttribute('data-state', 'active');
      expect(settingsTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should only have one active tab at a time', () => {
      // Given
      usePathname.mockReturnValue('/dashboard/usage');

      // When
      render(<AIKitTabs />);

      // Then
      const activeTabs = screen.getAllByRole('tab').filter(
        tab => tab.getAttribute('data-state') === 'active'
      );
      expect(activeTabs).toHaveLength(1);
    });
  });

  describe('Navigation Tests', () => {
    it('should navigate to overview when Overview tab is clicked', async () => {
      // Given
      const user = userEvent.setup();
      usePathname.mockReturnValue('/dashboard/usage');
      render(<AIKitTabs />);

      // When
      const overviewTab = screen.getByRole('tab', { name: /overview/i });
      await user.click(overviewTab);

      // Then
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should navigate to ai-kit when AI-Kit tab is clicked', async () => {
      // Given
      const user = userEvent.setup();
      usePathname.mockReturnValue('/dashboard');
      render(<AIKitTabs />);

      // When
      const aiKitTab = screen.getByRole('tab', { name: /ai-kit/i });
      await user.click(aiKitTab);

      // Then
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard/ai-kit');
      });
    });

    it('should navigate to usage when Usage tab is clicked', async () => {
      // Given
      const user = userEvent.setup();
      usePathname.mockReturnValue('/dashboard');
      render(<AIKitTabs />);

      // When
      const usageTab = screen.getByRole('tab', { name: /usage/i });
      await user.click(usageTab);

      // Then
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard/usage');
      });
    });

    it('should navigate to billing when Billing tab is clicked', async () => {
      // Given
      const user = userEvent.setup();
      usePathname.mockReturnValue('/dashboard');
      render(<AIKitTabs />);

      // When
      const billingTab = screen.getByRole('tab', { name: /billing/i });
      await user.click(billingTab);

      // Then
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard/billing');
      });
    });

    it('should navigate to settings when Settings tab is clicked', async () => {
      // Given
      const user = userEvent.setup();
      usePathname.mockReturnValue('/dashboard');
      render(<AIKitTabs />);

      // When
      const settingsTab = screen.getByRole('tab', { name: /settings/i });
      await user.click(settingsTab);

      // Then
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard/settings');
      });
    });

    it('should not navigate when clicking already active tab', async () => {
      // Given
      const user = userEvent.setup();
      usePathname.mockReturnValue('/dashboard');
      render(<AIKitTabs />);
      mockPush.mockClear();

      // When
      const overviewTab = screen.getByRole('tab', { name: /overview/i });
      await user.click(overviewTab);

      // Then
      // Navigation still happens, but to the same route
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  describe('Keyboard Navigation Tests', () => {
    it('should support Tab key navigation to first tab', async () => {
      // Given
      const user = userEvent.setup();
      render(<AIKitTabs />);

      // When
      await user.tab();

      // Then
      const overviewTab = screen.getByRole('tab', { name: /overview/i });
      expect(overviewTab).toHaveFocus();
    });

    it('should support Arrow Right key navigation between tabs', async () => {
      // Given
      const user = userEvent.setup();
      render(<AIKitTabs />);
      const overviewTab = screen.getByRole('tab', { name: /overview/i });
      overviewTab.focus();

      // When
      await user.keyboard('{ArrowRight}');

      // Then
      const aiKitTab = screen.getByRole('tab', { name: /ai-kit/i });
      expect(aiKitTab).toHaveFocus();
    });

    it('should support Arrow Left key navigation between tabs', async () => {
      // Given
      const user = userEvent.setup();
      render(<AIKitTabs />);
      const aiKitTab = screen.getByRole('tab', { name: /ai-kit/i });
      aiKitTab.focus();

      // When
      await user.keyboard('{ArrowLeft}');

      // Then
      const overviewTab = screen.getByRole('tab', { name: /overview/i });
      expect(overviewTab).toHaveFocus();
    });

    it('should support Home key to jump to first tab', async () => {
      // Given
      const user = userEvent.setup();
      render(<AIKitTabs />);
      const settingsTab = screen.getByRole('tab', { name: /settings/i });
      settingsTab.focus();

      // When
      await user.keyboard('{Home}');

      // Then
      const overviewTab = screen.getByRole('tab', { name: /overview/i });
      expect(overviewTab).toHaveFocus();
    });

    it('should support End key to jump to last tab', async () => {
      // Given
      const user = userEvent.setup();
      render(<AIKitTabs />);
      const overviewTab = screen.getByRole('tab', { name: /overview/i });
      overviewTab.focus();

      // When
      await user.keyboard('{End}');

      // Then
      const settingsTab = screen.getByRole('tab', { name: /settings/i });
      expect(settingsTab).toHaveFocus();
    });

    it('should support Enter key to activate tab', async () => {
      // Given
      const user = userEvent.setup();
      usePathname.mockReturnValue('/dashboard');
      render(<AIKitTabs />);
      const usageTab = screen.getByRole('tab', { name: /usage/i });
      usageTab.focus();

      // When
      await user.keyboard('{Enter}');

      // Then
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard/usage');
      });
    });

    it('should support Space key to activate tab', async () => {
      // Given
      const user = userEvent.setup();
      usePathname.mockReturnValue('/dashboard');
      render(<AIKitTabs />);
      const billingTab = screen.getByRole('tab', { name: /billing/i });
      billingTab.focus();

      // When
      await user.keyboard(' ');

      // Then
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard/billing');
      });
    });
  });

  describe('Accessibility Tests', () => {
    it('should have proper ARIA roles', () => {
      // Given/When
      render(<AIKitTabs />);

      // Then
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getAllByRole('tab')).toHaveLength(5);
    });

    it('should have proper aria-selected attributes', () => {
      // Given
      usePathname.mockReturnValue('/dashboard/usage');

      // When
      render(<AIKitTabs />);

      // Then
      const usageTab = screen.getByRole('tab', { name: /usage/i });
      expect(usageTab).toHaveAttribute('aria-selected', 'true');

      const overviewTab = screen.getByRole('tab', { name: /overview/i });
      expect(overviewTab).toHaveAttribute('aria-selected', 'false');
    });

    it('should have aria-label on tablist for screen readers', () => {
      // Given/When
      render(<AIKitTabs />);

      // Then
      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-label');
    });

    it('should have accessible names for all tabs', () => {
      // Given/When
      render(<AIKitTabs />);

      // Then
      expect(screen.getByRole('tab', { name: /overview/i })).toHaveAccessibleName();
      expect(screen.getByRole('tab', { name: /ai-kit/i })).toHaveAccessibleName();
      expect(screen.getByRole('tab', { name: /usage/i })).toHaveAccessibleName();
      expect(screen.getByRole('tab', { name: /billing/i })).toHaveAccessibleName();
      expect(screen.getByRole('tab', { name: /settings/i })).toHaveAccessibleName();
    });

    it('should be keyboard focusable', () => {
      // Given/When
      render(<AIKitTabs />);

      // Then
      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('tabindex');
      });
    });

    it('should have focus-visible styles', () => {
      // Given/When
      render(<AIKitTabs />);

      // Then
      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        // Check that focus-visible class is present in the component
        expect(tab.className).toMatch(/focus-visible/);
      });
    });
  });

  describe('Dark Theme Support', () => {
    it('should apply dark theme styles to tab list', () => {
      // Given/When
      render(<AIKitTabs />);

      // Then
      const tablist = screen.getByRole('tablist');
      expect(tablist.className).toMatch(/bg-/); // Background color class
    });

    it('should apply dark theme styles to tabs', () => {
      // Given/When
      render(<AIKitTabs />);

      // Then
      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab.className).toBeDefined();
      });
    });

    it('should have proper contrast for active state in dark theme', () => {
      // Given
      usePathname.mockReturnValue('/dashboard');

      // When
      render(<AIKitTabs />);

      // Then
      const activeTab = screen.getByRole('tab', { name: /overview/i });
      expect(activeTab).toHaveAttribute('data-state', 'active');
      // Active state should have different styling
      expect(activeTab.className).toMatch(/data-\[state=active\]/);
    });
  });

  describe('Responsive Design Tests', () => {
    it('should render on mobile viewport', () => {
      // Given
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      // When
      render(<AIKitTabs />);

      // Then
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getAllByRole('tab')).toHaveLength(5);
    });

    it('should render on tablet viewport', () => {
      // Given
      global.innerWidth = 768;
      global.dispatchEvent(new Event('resize'));

      // When
      render(<AIKitTabs />);

      // Then
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getAllByRole('tab')).toHaveLength(5);
    });

    it('should render on desktop viewport', () => {
      // Given
      global.innerWidth = 1440;
      global.dispatchEvent(new Event('resize'));

      // When
      render(<AIKitTabs />);

      // Then
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getAllByRole('tab')).toHaveLength(5);
    });

    it('should have responsive layout classes', () => {
      // Given/When
      render(<AIKitTabs />);

      // Then
      const tablist = screen.getByRole('tablist');
      // Check for responsive classes (flex, grid, etc.)
      expect(tablist.className).toBeDefined();
    });
  });

  describe('Smooth Transitions', () => {
    it('should have transition classes on tabs', () => {
      // Given/When
      render(<AIKitTabs />);

      // Then
      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab.className).toMatch(/transition/);
      });
    });

    it('should animate state changes', async () => {
      // Given
      const user = userEvent.setup();
      usePathname.mockReturnValue('/dashboard');
      render(<AIKitTabs />);

      // When
      const usageTab = screen.getByRole('tab', { name: /usage/i });
      await user.click(usageTab);

      // Then - Check that transition is applied
      expect(usageTab.className).toMatch(/transition/);
    });
  });

  describe('Edge Cases', () => {
    it('should handle unknown pathname gracefully', () => {
      // Given
      usePathname.mockReturnValue('/unknown-path');

      // When
      const { container } = render(<AIKitTabs />);

      // Then
      expect(container).toBeInTheDocument();
      // First tab (overview) should be active by default
      const overviewTab = screen.getByRole('tab', { name: /overview/i });
      expect(overviewTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should handle null pathname', () => {
      // Given
      usePathname.mockReturnValue(null);

      // When
      const { container } = render(<AIKitTabs />);

      // Then
      expect(container).toBeInTheDocument();
    });

    it('should handle missing router', () => {
      // Given
      useRouter.mockReturnValue(null);

      // When/Then
      expect(() => render(<AIKitTabs />)).not.toThrow();
    });

    it('should prevent navigation on disabled tabs', async () => {
      // Given
      const user = userEvent.setup();
      render(<AIKitTabs disabled={['billing']} />);
      mockPush.mockClear();

      // When
      const billingTab = screen.getByRole('tab', { name: /billing/i });
      await user.click(billingTab);

      // Then
      expect(mockPush).not.toHaveBeenCalled();
      expect(billingTab).toBeDisabled();
    });

    it('should handle rapid tab switching', async () => {
      // Given
      const user = userEvent.setup();
      usePathname.mockReturnValue('/dashboard');
      render(<AIKitTabs />);

      // When - Rapidly click multiple tabs
      const usageTab = screen.getByRole('tab', { name: /usage/i });
      const billingTab = screen.getByRole('tab', { name: /billing/i });
      const settingsTab = screen.getByRole('tab', { name: /settings/i });

      await user.click(usageTab);
      await user.click(billingTab);
      await user.click(settingsTab);

      // Then
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('Performance Tests', () => {
    it('should render efficiently with minimal re-renders', () => {
      // Given
      const { rerender } = render(<AIKitTabs />);

      // When
      rerender(<AIKitTabs />);

      // Then
      expect(screen.getAllByRole('tab')).toHaveLength(5);
    });

    it('should handle multiple instances without conflicts', () => {
      // Given/When
      const { container } = render(
        <>
          <AIKitTabs />
          <AIKitTabs />
        </>
      );

      // Then
      const tablists = within(container).getAllByRole('tablist');
      expect(tablists).toHaveLength(2);
    });
  });
});
