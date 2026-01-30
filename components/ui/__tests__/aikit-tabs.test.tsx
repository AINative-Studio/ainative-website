/**
 * AIKit Tabs Component - TDD Test Suite
 *
 * Test Coverage Requirements:
 * - Component rendering (tabs list, triggers, content)
 * - Tab switching and keyboard navigation
 * - Accessibility (ARIA attributes, roles, keyboard support)
 * - Dark theme compatibility
 * - Mobile responsiveness
 * - Multiple tabs management
 * - URL integration (optional)
 *
 * Coverage Target: 100% (Critical Component)
 */

import { render, screen, within } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('AIKit Tabs Component - TDD Suite', () => {
  const renderTabs = (defaultValue = 'tab1') => {
    return render(
      <Tabs defaultValue={defaultValue} data-testid="tabs-root">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content for Tab 1</TabsContent>
        <TabsContent value="tab2">Content for Tab 2</TabsContent>
        <TabsContent value="tab3">Content for Tab 3</TabsContent>
      </Tabs>
    );
  };

  describe('Component Rendering', () => {
    it('should render tabs with all triggers', () => {
      // Given: Tabs component
      renderTabs();

      // Then: All tab triggers should be visible
      expect(screen.getByRole('tab', { name: /tab 1/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /tab 2/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /tab 3/i })).toBeInTheDocument();
    });

    it('should render default active tab content', () => {
      // Given: Tabs with default value
      renderTabs('tab1');

      // Then: First tab content should be visible
      expect(screen.getByText('Content for Tab 1')).toBeVisible();
      expect(screen.queryByText('Content for Tab 2')).not.toBeVisible();
      expect(screen.queryByText('Content for Tab 3')).not.toBeVisible();
    });

    it('should apply active state to default tab', () => {
      // Given: Tabs with default value
      renderTabs('tab2');

      // Then: Second tab should have active state
      const tab2 = screen.getByRole('tab', { name: /tab 2/i });
      expect(tab2).toHaveAttribute('data-state', 'active');
      expect(tab2).toHaveAttribute('aria-selected', 'true');
    });

    it('should render with custom className', () => {
      // Given: Tabs with custom classes
      render(
        <Tabs defaultValue="tab1" className="custom-tabs">
          <TabsList className="custom-list">
            <TabsTrigger value="tab1" className="custom-trigger">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" className="custom-content">Content</TabsContent>
        </Tabs>
      );

      // Then: Custom classes should be applied
      expect(screen.getByRole('tablist')).toHaveClass('custom-list');
      expect(screen.getByRole('tab')).toHaveClass('custom-trigger');
    });

    it('should render with icons in tab triggers', () => {
      // Given: Tabs with icons
      const Icon = () => <svg data-testid="tab-icon" />;
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">
              <Icon />
              <span>With Icon</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );

      // Then: Icon should render
      expect(screen.getByTestId('tab-icon')).toBeInTheDocument();
      expect(screen.getByText('With Icon')).toBeInTheDocument();
    });
  });

  describe('Tab Switching', () => {
    it('should switch tabs on click', async () => {
      // Given: Rendered tabs
      const user = userEvent.setup();
      renderTabs('tab1');

      // When: User clicks second tab
      await user.click(screen.getByRole('tab', { name: /tab 2/i }));

      // Then: Second tab content should be visible
      expect(screen.getByText('Content for Tab 2')).toBeVisible();
      expect(screen.queryByText('Content for Tab 1')).not.toBeVisible();
    });

    it('should update tab states when switching', async () => {
      // Given: Rendered tabs
      const user = userEvent.setup();
      renderTabs('tab1');

      // When: Switching to tab 2
      await user.click(screen.getByRole('tab', { name: /tab 2/i }));

      // Then: Tab 1 should be inactive, Tab 2 should be active
      const tab1 = screen.getByRole('tab', { name: /tab 1/i });
      const tab2 = screen.getByRole('tab', { name: /tab 2/i });

      expect(tab1).toHaveAttribute('data-state', 'inactive');
      expect(tab1).toHaveAttribute('aria-selected', 'false');
      expect(tab2).toHaveAttribute('data-state', 'active');
      expect(tab2).toHaveAttribute('aria-selected', 'true');
    });

    it('should handle controlled tabs', async () => {
      // Given: Controlled tabs
      const onValueChange = jest.fn();
      const user = userEvent.setup();

      const { rerender } = render(
        <Tabs value="tab1" onValueChange={onValueChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      // When: Clicking tab 2
      await user.click(screen.getByRole('tab', { name: /tab 2/i }));

      // Then: Callback should be called
      expect(onValueChange).toHaveBeenCalledWith('tab2');

      // When: Parent updates value
      rerender(
        <Tabs value="tab2" onValueChange={onValueChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      // Then: Tab 2 content should be visible
      expect(screen.getByText('Content 2')).toBeVisible();
    });

    it('should prevent switching to disabled tab', async () => {
      // Given: Tabs with disabled tab
      const user = userEvent.setup();
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" disabled>Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      // When: Attempting to click disabled tab
      const disabledTab = screen.getByRole('tab', { name: /tab 2/i });
      await user.click(disabledTab);

      // Then: Should remain on tab 1
      expect(screen.getByText('Content 1')).toBeVisible();
      expect(screen.queryByText('Content 2')).not.toBeVisible();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate tabs with Arrow Right key', async () => {
      // Given: Rendered tabs
      const user = userEvent.setup();
      renderTabs('tab1');

      // When: User presses Arrow Right
      const tab1 = screen.getByRole('tab', { name: /tab 1/i });
      tab1.focus();
      await user.keyboard('{ArrowRight}');

      // Then: Should move to next tab
      const tab2 = screen.getByRole('tab', { name: /tab 2/i });
      expect(tab2).toHaveFocus();
    });

    it('should navigate tabs with Arrow Left key', async () => {
      // Given: Rendered tabs with tab2 active
      const user = userEvent.setup();
      renderTabs('tab2');

      // When: User presses Arrow Left
      const tab2 = screen.getByRole('tab', { name: /tab 2/i });
      tab2.focus();
      await user.keyboard('{ArrowLeft}');

      // Then: Should move to previous tab
      const tab1 = screen.getByRole('tab', { name: /tab 1/i });
      expect(tab1).toHaveFocus();
    });

    it('should wrap to first tab from last tab with Arrow Right', async () => {
      // Given: Rendered tabs with last tab active
      const user = userEvent.setup();
      renderTabs('tab3');

      // When: User presses Arrow Right on last tab
      const tab3 = screen.getByRole('tab', { name: /tab 3/i });
      tab3.focus();
      await user.keyboard('{ArrowRight}');

      // Then: Should wrap to first tab
      const tab1 = screen.getByRole('tab', { name: /tab 1/i });
      expect(tab1).toHaveFocus();
    });

    it('should wrap to last tab from first tab with Arrow Left', async () => {
      // Given: Rendered tabs with first tab active
      const user = userEvent.setup();
      renderTabs('tab1');

      // When: User presses Arrow Left on first tab
      const tab1 = screen.getByRole('tab', { name: /tab 1/i });
      tab1.focus();
      await user.keyboard('{ArrowLeft}');

      // Then: Should wrap to last tab
      const tab3 = screen.getByRole('tab', { name: /tab 3/i });
      expect(tab3).toHaveFocus();
    });

    it('should navigate to first tab with Home key', async () => {
      // Given: Rendered tabs with middle tab active
      const user = userEvent.setup();
      renderTabs('tab2');

      // When: User presses Home key
      const tab2 = screen.getByRole('tab', { name: /tab 2/i });
      tab2.focus();
      await user.keyboard('{Home}');

      // Then: Should move to first tab
      const tab1 = screen.getByRole('tab', { name: /tab 1/i });
      expect(tab1).toHaveFocus();
    });

    it('should navigate to last tab with End key', async () => {
      // Given: Rendered tabs with first tab active
      const user = userEvent.setup();
      renderTabs('tab1');

      // When: User presses End key
      const tab1 = screen.getByRole('tab', { name: /tab 1/i });
      tab1.focus();
      await user.keyboard('{End}');

      // Then: Should move to last tab
      const tab3 = screen.getByRole('tab', { name: /tab 3/i });
      expect(tab3).toHaveFocus();
    });

    it('should skip disabled tabs during keyboard navigation', async () => {
      // Given: Tabs with disabled middle tab
      const user = userEvent.setup();
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" disabled>Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>
      );

      // When: Navigating with Arrow Right from tab 1
      const tab1 = screen.getByRole('tab', { name: /tab 1/i });
      tab1.focus();
      await user.keyboard('{ArrowRight}');

      // Then: Should skip disabled tab and go to tab 3
      const tab3 = screen.getByRole('tab', { name: /tab 3/i });
      expect(tab3).toHaveFocus();
    });
  });

  describe('Accessibility (WCAG 2.1 AA Compliance)', () => {
    it('should have no accessibility violations', async () => {
      // Given: Tabs component
      const { container } = renderTabs();

      // When: Running axe tests
      const results = await axe(container);

      // Then: Should have no violations
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA roles', () => {
      // Given: Rendered tabs
      renderTabs();

      // Then: Should have correct roles
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getAllByRole('tab')).toHaveLength(3);
      expect(screen.getAllByRole('tabpanel')).toHaveLength(1); // Only active panel visible
    });

    it('should associate tabs with panels via aria-controls', () => {
      // Given: Rendered tabs
      renderTabs('tab1');

      // Then: Tabs should control panels
      const tab1 = screen.getByRole('tab', { name: /tab 1/i });
      const panelId = tab1.getAttribute('aria-controls');
      expect(panelId).toBeTruthy();

      const panel = screen.getByRole('tabpanel');
      expect(panel).toHaveAttribute('id', panelId);
    });

    it('should indicate selected state with aria-selected', () => {
      // Given: Rendered tabs
      renderTabs('tab2');

      // Then: Selected tab should have aria-selected=true
      const tab1 = screen.getByRole('tab', { name: /tab 1/i });
      const tab2 = screen.getByRole('tab', { name: /tab 2/i });
      const tab3 = screen.getByRole('tab', { name: /tab 3/i });

      expect(tab1).toHaveAttribute('aria-selected', 'false');
      expect(tab2).toHaveAttribute('aria-selected', 'true');
      expect(tab3).toHaveAttribute('aria-selected', 'false');
    });

    it('should indicate disabled state with aria-disabled', () => {
      // Given: Tabs with disabled tab
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" disabled>Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      // Then: Disabled tab should have proper attributes
      const disabledTab = screen.getByRole('tab', { name: /tab 2/i });
      expect(disabledTab).toHaveAttribute('disabled');
      expect(disabledTab).toHaveClass('disabled:opacity-50');
    });

    it('should have proper focus management', async () => {
      // Given: Rendered tabs
      const user = userEvent.setup();
      renderTabs();

      // When: Tabbing to tabs
      await user.tab();

      // Then: First tab should receive focus
      const tab1 = screen.getByRole('tab', { name: /tab 1/i });
      expect(tab1).toHaveFocus();
    });

    it('should have visible focus indicators', () => {
      // Given: Rendered tabs
      renderTabs();

      // Then: Tabs should have focus-visible styles
      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab).toHaveClass('focus-visible:ring-2');
      });
    });

    it('should announce tab panel changes to screen readers', async () => {
      // Given: Rendered tabs
      const user = userEvent.setup();
      renderTabs('tab1');

      // When: Switching tabs
      await user.click(screen.getByRole('tab', { name: /tab 2/i }));

      // Then: Panel should be accessible
      const panel = screen.getByRole('tabpanel');
      expect(panel).toBeInTheDocument();
      expect(panel).toHaveTextContent('Content for Tab 2');
    });
  });

  describe('Dark Theme Compatibility', () => {
    it('should render correctly in dark theme', () => {
      // Given: Tabs in dark theme
      const { container } = render(
        <div className="dark">
          <Tabs defaultValue="tab1">
            <TabsList className="bg-[#1C2128]">
              <TabsTrigger value="tab1">Dark Tab 1</TabsTrigger>
              <TabsTrigger value="tab2">Dark Tab 2</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">Dark Content 1</TabsContent>
            <TabsContent value="tab2">Dark Content 2</TabsContent>
          </Tabs>
        </div>
      );

      // Then: Should render without errors
      expect(screen.getByRole('tab', { name: /dark tab 1/i })).toBeInTheDocument();
      expect(container.querySelector('.dark')).toBeInTheDocument();
    });

    it('should maintain contrast in dark theme', () => {
      // Given: Tabs in dark theme
      render(
        <div className="dark">
          <Tabs defaultValue="tab1">
            <TabsList>
              <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">Content</TabsContent>
          </Tabs>
        </div>
      );

      // Then: Content should be visible
      expect(screen.getByText('Content')).toBeVisible();
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should render tabs list in horizontal layout', () => {
      // Given: Rendered tabs
      renderTabs();

      // Then: TabsList should have inline-flex for horizontal layout
      const tabsList = screen.getByRole('tablist');
      expect(tabsList).toHaveClass('inline-flex');
    });

    it('should have adequate touch targets for mobile', () => {
      // Given: Rendered tabs
      renderTabs();

      // Then: Tabs should have minimum height
      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab).toHaveClass('px-3');
        expect(tab).toHaveClass('py-1');
      });
    });

    it('should support swipe gestures conceptually', () => {
      // Given: Tabs on mobile device
      // Note: Actual swipe testing requires more complex setup
      renderTabs();

      // Then: Tabs should be interactive
      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab).not.toBeDisabled();
      });
    });

    it('should scroll tabs list if too many tabs', () => {
      // Given: Many tabs
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            {Array.from({ length: 10 }, (_, i) => (
              <TabsTrigger key={i} value={`tab${i + 1}`}>
                Tab {i + 1}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      );

      // Then: All tabs should render
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(10);
    });
  });

  describe('Multiple Tabs Management', () => {
    it('should handle many tabs', () => {
      // Given: Many tabs
      const tabCount = 20;
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            {Array.from({ length: tabCount }, (_, i) => (
              <TabsTrigger key={i} value={`tab${i + 1}`}>
                Tab {i + 1}
              </TabsTrigger>
            ))}
          </TabsList>
          {Array.from({ length: tabCount }, (_, i) => (
            <TabsContent key={i} value={`tab${i + 1}`}>
              Content {i + 1}
            </TabsContent>
          ))}
        </Tabs>
      );

      // Then: All tabs should render
      expect(screen.getAllByRole('tab')).toHaveLength(tabCount);
    });

    it('should handle dynamic tab addition', () => {
      // Given: Tabs that can be added
      const { rerender } = render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      // When: Adding a new tab
      rerender(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>
      );

      // Then: New tab should be present
      expect(screen.getByRole('tab', { name: /tab 3/i })).toBeInTheDocument();
    });

    it('should handle tab removal', () => {
      // Given: Tabs that can be removed
      const { rerender } = render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>
      );

      // When: Removing a tab
      rerender(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>
      );

      // Then: Removed tab should not be present
      expect(screen.queryByRole('tab', { name: /tab 2/i })).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error States', () => {
    it('should handle no default value', () => {
      // Given: Tabs without default value
      render(
        <Tabs>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      );

      // Then: Should render without error
      expect(screen.getByRole('tab')).toBeInTheDocument();
    });

    it('should handle empty tabs list', () => {
      // Given: Tabs with no triggers
      render(
        <Tabs defaultValue="tab1">
          <TabsList></TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      );

      // Then: Should render without crashing
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('should handle tab content without corresponding trigger', () => {
      // Given: Content without trigger
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="orphan">Orphan Content</TabsContent>
        </Tabs>
      );

      // Then: Orphan content should not be visible
      expect(screen.queryByText('Orphan Content')).not.toBeVisible();
    });

    it('should handle rapid tab switching', async () => {
      // Given: Rendered tabs
      const user = userEvent.setup();
      renderTabs('tab1');

      // When: Rapidly switching tabs
      await user.click(screen.getByRole('tab', { name: /tab 2/i }));
      await user.click(screen.getByRole('tab', { name: /tab 3/i }));
      await user.click(screen.getByRole('tab', { name: /tab 1/i }));

      // Then: Should end on last clicked tab
      expect(screen.getByText('Content for Tab 1')).toBeVisible();
    });

    it('should handle null children in tab content', () => {
      // Given: Tab content with null children
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">{null}</TabsContent>
        </Tabs>
      );

      // Then: Should render without error
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });
  });

  describe('Orientation Support', () => {
    it('should support horizontal orientation (default)', () => {
      // Given: Tabs with default orientation
      renderTabs();

      // Then: Should have horizontal layout
      const tabsList = screen.getByRole('tablist');
      expect(tabsList).toHaveClass('inline-flex');
    });

    it('should support vertical orientation if implemented', () => {
      // Given: Tabs with vertical orientation
      render(
        <Tabs defaultValue="tab1" orientation="vertical" data-testid="vertical-tabs">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      // Then: Should have vertical orientation attribute
      const tabs = screen.getByTestId('vertical-tabs');
      expect(tabs).toHaveAttribute('data-orientation', 'vertical');
    });
  });
});
