import { test, expect } from '@playwright/test';
import { DashboardPage } from '../fixtures/dashboard.fixture';
import { AuthFixture } from '../fixtures/auth.fixture';

/**
 * Dashboard Navigation E2E Tests
 * Tests tab switching, URL updates, and browser navigation
 */

test.describe('Dashboard Navigation', () => {
  let dashboardPage: DashboardPage;
  let authFixture: AuthFixture;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    authFixture = new AuthFixture(page);

    // Setup auth session (skip login UI for faster tests)
    await authFixture.setupAuthSession();
    await dashboardPage.navigateToDashboard();
  });

  test('should display all dashboard tabs', async () => {
    const tabs = await dashboardPage.getTabs();

    expect(tabs.length).toBeGreaterThan(0);
    console.log('Available tabs:', tabs);
  });

  test('should switch between tabs successfully', async ({ page }) => {
    // Test switching to each tab
    const tabs = ['overview', 'ai-kit', 'usage', 'billing', 'settings'] as const;

    for (const tab of tabs) {
      const success = await dashboardPage.switchTab(tab);
      expect(success).toBe(true);

      const activeTab = await dashboardPage.getActiveTab();
      expect(activeTab?.toLowerCase()).toContain(tab.replace('-', ' '));

      // Wait for content to load
      await page.waitForTimeout(500);
    }
  });

  test('should update URL when switching tabs', async () => {
    const result = await dashboardPage.verifyTabURLUpdate('ai-kit');

    expect(result.urlChanged || result.containsTabName).toBe(true);
    console.log('URL Navigation:', result);
  });

  test('should support browser back/forward navigation', async () => {
    const result = await dashboardPage.testBrowserNavigation();

    expect(result.history.length).toBeGreaterThan(0);
    console.log('Browser Navigation:', result);

    // At least one of back or forward should work
    expect(result.backWorked || result.forwardWorked).toBe(true);
  });

  test('should maintain tab state on page reload', async ({ page }) => {
    // Switch to a specific tab
    await dashboardPage.switchTab('ai-kit');
    const urlBeforeReload = page.url();

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    const urlAfterReload = page.url();
    expect(urlAfterReload).toBe(urlBeforeReload);
  });

  test('should support keyboard navigation between tabs', async () => {
    const results = await dashboardPage.testTabKeyboardNavigation();

    expect(results.length).toBeGreaterThan(0);
    console.log('Keyboard Navigation Results:', results);
  });

  test('should highlight active tab visually', async ({ page }) => {
    await dashboardPage.switchTab('ai-kit');

    const activeTab = page.locator('[role="tab"][aria-selected="true"]');
    await expect(activeTab).toBeVisible();

    // Check for visual indicators (class, style, etc.)
    const classes = await activeTab.getAttribute('class');
    const dataState = await activeTab.getAttribute('data-state');

    expect(classes || dataState).toBeTruthy();
    console.log('Active tab styling:', { classes, dataState });
  });

  test('should handle rapid tab switching', async () => {
    const tabs = ['overview', 'ai-kit', 'usage', 'billing', 'settings'] as const;

    // Rapidly switch tabs
    for (let i = 0; i < 3; i++) {
      for (const tab of tabs) {
        await dashboardPage.switchTab(tab);
      }
    }

    // Should end on last tab without errors
    const activeTab = await dashboardPage.getActiveTab();
    expect(activeTab).toBeTruthy();
  });

  test('should navigate to AI Kit page directly', async ({ page }) => {
    await dashboardPage.navigateToAIKit();
    await page.waitForLoadState('networkidle');

    const url = page.url();
    expect(url).toContain('ai-kit');

    // Page should be fully loaded
    await expect(page.locator('h1, h2')).toBeVisible();
  });

  test('should have accessible tab navigation', async ({ page }) => {
    const tabs = page.locator('[role="tab"]');
    const count = await tabs.count();

    for (let i = 0; i < count; i++) {
      const tab = tabs.nth(i);

      // Check ARIA attributes
      const role = await tab.getAttribute('role');
      const ariaSelected = await tab.getAttribute('aria-selected');
      const ariaControls = await tab.getAttribute('aria-controls');

      expect(role).toBe('tab');
      expect(ariaSelected).toBeTruthy();
    }
  });
});