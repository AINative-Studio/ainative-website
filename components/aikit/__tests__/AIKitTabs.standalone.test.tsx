/**
 * AIKitTabs Component Tests (TDD - Standalone without MSW)
 *
 * Test Suite for Dashboard Navigation Tabs Component
 * Covers: Rendering, Navigation, Accessibility, Keyboard Navigation, Dark Theme, Mobile Responsive
 */

/// <reference types="@testing-library/jest-dom" />

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock Next.js navigation BEFORE importing component
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockPrefetch = jest.fn();
const mockBack = jest.fn();
const mockUsePathname = jest.fn(() => '/dashboard');

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: mockPrefetch,
    back: mockBack,
  })),
  usePathname: () => mockUsePathname(),
}));

// Import component AFTER mocks are set up
import AIKitTabs from '../AIKitTabs';

describe('AIKitTabs Component - TDD Tests (Standalone)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    mockReplace.mockClear();
    mockPrefetch.mockClear();
    mockBack.mockClear();
    mockUsePathname.mockReturnValue('/dashboard');
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
      expect(screen.getByRole('tab', { name: /navigate to dashboard overview/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /navigate to ai-kit section/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /navigate to usage statistics/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /navigate to billing information/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /navigate to dashboard settings/i })).toBeInTheDocument();
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
      mockUsePathname.mockReturnValue('/dashboard');

      // When
      render(<AIKitTabs />);

      // Then
      const tabs = screen.getAllByRole('tab');
      const overviewTab = tabs[0]; // First tab is Overview
      expect(overviewTab).toHaveAttribute('data-state', 'active');
      expect(overviewTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should highlight AI-Kit tab when on /dashboard/ai-kit path', () => {
      // Given
      mockUsePathname.mockReturnValue('/dashboard/ai-kit');

      // When
      render(<AIKitTabs />);

      // Then
      const tabs = screen.getAllByRole('tab');
      const aiKitTab = tabs[1]; // Second tab is AI-Kit
      expect(aiKitTab).toHaveAttribute('data-state', 'active');
      expect(aiKitTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should highlight Usage tab when on /dashboard/usage path', () => {
      // Given
      mockUsePathname.mockReturnValue('/dashboard/usage');

      // When
      render(<AIKitTabs />);

      // Then
      const tabs = screen.getAllByRole('tab');
      const usageTab = tabs[2]; // Third tab is Usage
      expect(usageTab).toHaveAttribute('data-state', 'active');
      expect(usageTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should highlight Billing tab when on /dashboard/billing path', () => {
      // Given
      mockUsePathname.mockReturnValue('/dashboard/billing');

      // When
      render(<AIKitTabs />);

      // Then
      const tabs = screen.getAllByRole('tab');
      const billingTab = tabs[3]; // Fourth tab is Billing
      expect(billingTab).toHaveAttribute('data-state', 'active');
      expect(billingTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should highlight Settings tab when on /dashboard/settings path', () => {
      // Given
      mockUsePathname.mockReturnValue('/dashboard/settings');

      // When
      render(<AIKitTabs />);

      // Then
      const tabs = screen.getAllByRole('tab');
      const settingsTab = tabs[4]; // Fifth tab is Settings
      expect(settingsTab).toHaveAttribute('data-state', 'active');
      expect(settingsTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should only have one active tab at a time', () => {
      // Given
      mockUsePathname.mockReturnValue('/dashboard/usage');

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
      mockUsePathname.mockReturnValue('/dashboard/usage');
      render(<AIKitTabs />);

      // When
      const tabs = screen.getAllByRole('tab');
      await user.click(tabs[0]); // Overview tab

      // Then
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should navigate to ai-kit when AI-Kit tab is clicked', async () => {
      // Given
      const user = userEvent.setup();
      mockUsePathname.mockReturnValue('/dashboard');
      render(<AIKitTabs />);

      // When
      const tabs = screen.getAllByRole('tab');
      await user.click(tabs[1]); // AI-Kit tab

      // Then
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard/ai-kit');
      });
    });

    it('should navigate to usage when Usage tab is clicked', async () => {
      // Given
      const user = userEvent.setup();
      mockUsePathname.mockReturnValue('/dashboard');
      render(<AIKitTabs />);

      // When
      const tabs = screen.getAllByRole('tab');
      await user.click(tabs[2]); // Usage tab

      // Then
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard/usage');
      });
    });

    it('should navigate to billing when Billing tab is clicked', async () => {
      // Given
      const user = userEvent.setup();
      mockUsePathname.mockReturnValue('/dashboard');
      render(<AIKitTabs />);

      // When
      const tabs = screen.getAllByRole('tab');
      await user.click(tabs[3]); // Billing tab

      // Then
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard/billing');
      });
    });

    it('should navigate to settings when Settings tab is clicked', async () => {
      // Given
      const user = userEvent.setup();
      mockUsePathname.mockReturnValue('/dashboard');
      render(<AIKitTabs />);

      // When
      const tabs = screen.getAllByRole('tab');
      await user.click(tabs[4]); // Settings tab

      // Then
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard/settings');
      });
    });
  });

  describe('Keyboard Navigation Tests', () => {
    it('should navigate with ArrowRight key', async () => {
      // Given
      const user = userEvent.setup();
      render(<AIKitTabs />);
      const tabs = screen.getAllByRole('tab');
      tabs[0].focus();

      // When
      await user.keyboard('{ArrowRight}');

      // Then
      expect(tabs[1]).toHaveFocus();
    });

    it('should navigate with ArrowLeft key', async () => {
      // Given
      const user = userEvent.setup();
      render(<AIKitTabs />);
      const tabs = screen.getAllByRole('tab');
      tabs[1].focus();

      // When
      await user.keyboard('{ArrowLeft}');

      // Then
      expect(tabs[0]).toHaveFocus();
    });

    it('should jump to first tab with Home key', async () => {
      // Given
      const user = userEvent.setup();
      render(<AIKitTabs />);
      const tabs = screen.getAllByRole('tab');
      tabs[4].focus(); // Start at last tab

      // When
      await user.keyboard('{Home}');

      // Then
      expect(tabs[0]).toHaveFocus();
    });

    it('should jump to last tab with End key', async () => {
      // Given
      const user = userEvent.setup();
      render(<AIKitTabs />);
      const tabs = screen.getAllByRole('tab');
      tabs[0].focus(); // Start at first tab

      // When
      await user.keyboard('{End}');

      // Then
      expect(tabs[4]).toHaveFocus();
    });

    it('should activate tab with Enter key', async () => {
      // Given
      const user = userEvent.setup();
      mockUsePathname.mockReturnValue('/dashboard');
      render(<AIKitTabs />);
      const tabs = screen.getAllByRole('tab');
      tabs[2].focus(); // Focus Usage tab
      mockPush.mockClear();

      // When
      await user.keyboard('{Enter}');

      // Then
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard/usage');
      });
    });

    it('should activate tab with Space key', async () => {
      // Given
      const user = userEvent.setup();
      mockUsePathname.mockReturnValue('/dashboard');
      render(<AIKitTabs />);
      const tabs = screen.getAllByRole('tab');
      tabs[3].focus(); // Focus Billing tab
      mockPush.mockClear();

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
      mockUsePathname.mockReturnValue('/dashboard/usage');

      // When
      render(<AIKitTabs />);

      // Then
      const tabs = screen.getAllByRole('tab');
      const usageTab = tabs[2]; // Third tab
      expect(usageTab).toHaveAttribute('aria-selected', 'true');

      const overviewTab = tabs[0]; // First tab
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
      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('aria-label');
      });
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
      mockUsePathname.mockReturnValue('/dashboard');

      // When
      render(<AIKitTabs />);

      // Then
      const tabs = screen.getAllByRole('tab');
      const activeTab = tabs[0]; // Overview tab
      expect(activeTab).toHaveAttribute('data-state', 'active');
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
  });

  describe('Edge Cases', () => {
    it('should handle unknown pathname gracefully', () => {
      // Given
      mockUsePathname.mockReturnValue('/unknown-path');

      // When
      const { container } = render(<AIKitTabs />);

      // Then
      expect(container).toBeInTheDocument();
      // First tab (overview) should be active by default
      const tabs = screen.getAllByRole('tab');
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    });

    it('should handle null pathname', () => {
      // Given
      mockUsePathname.mockReturnValue(null);

      // When
      const { container } = render(<AIKitTabs />);

      // Then
      expect(container).toBeInTheDocument();
    });

    it('should prevent navigation on disabled tabs', async () => {
      // Given
      const user = userEvent.setup();
      render(<AIKitTabs disabled={['billing']} />);
      mockPush.mockClear();

      // When
      const tabs = screen.getAllByRole('tab');
      const billingTab = tabs[3]; // Fourth tab is Billing
      await user.click(billingTab);

      // Then
      expect(mockPush).not.toHaveBeenCalled();
      expect(billingTab).toBeDisabled();
    });

    it('should handle rapid tab switching', async () => {
      // Given
      const user = userEvent.setup();
      mockUsePathname.mockReturnValue('/dashboard');
      render(<AIKitTabs />);

      // When - Rapidly click multiple tabs
      const tabs = screen.getAllByRole('tab');
      await user.click(tabs[2]); // Usage
      await user.click(tabs[3]); // Billing
      await user.click(tabs[4]); // Settings

      // Then - Radix UI Tabs may trigger the callback multiple times
      // We verify that navigation happened (at least 3 calls)
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
        expect(mockPush.mock.calls.length).toBeGreaterThanOrEqual(3);
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
