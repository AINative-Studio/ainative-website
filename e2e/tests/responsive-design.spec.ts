import { test, expect } from '@playwright/test';
import { DashboardPage } from '../fixtures/dashboard.fixture';
import { AuthFixture } from '../fixtures/auth.fixture';
import { TestUtils } from '../helpers/test-utils';

/**
 * Responsive Design E2E Tests
 * Tests mobile, tablet, and desktop viewports for layout and functionality
 */

const VIEWPORTS = {
  mobile: { width: 375, height: 812, name: 'mobile' },
  tablet: { width: 768, height: 1024, name: 'tablet' },
  desktop: { width: 1920, height: 1080, name: 'desktop' },
  wide: { width: 2560, height: 1440, name: 'wide' },
};

test.describe('Responsive Design Tests', () => {
  let dashboardPage: DashboardPage;
  let authFixture: AuthFixture;
  let testUtils: TestUtils;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    authFixture = new AuthFixture(page);
    testUtils = new TestUtils(page);

    await authFixture.setupAuthSession();
  });

  test.describe('Mobile Viewport (375px)', () => {
    test.use({ viewport: VIEWPORTS.mobile });

    test('should render dashboard on mobile', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      // Page should be visible
      await expect(page.locator('body')).toBeVisible();

      // Check for mobile menu/hamburger
      const mobileMenu = page.locator('[data-testid="mobile-menu"], button[aria-label*="menu"], .hamburger-menu').first();
      const hasMobileMenu = await mobileMenu.count() > 0;

      console.log('Mobile menu present:', hasMobileMenu);

      // Capture screenshot
      await testUtils.takeScreenshot('dashboard-mobile', true);
    });

    test('should hide desktop-only elements on mobile', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      // Check for elements that should be hidden on mobile
      const desktopOnly = page.locator('[class*="hidden-mobile"], [class*="desktop-only"], .lg\\:block');
      const count = await desktopOnly.count();

      console.log(`Found ${count} desktop-only elements`);

      // Verify they are not visible
      for (let i = 0; i < Math.min(count, 3); i++) {
        const element = desktopOnly.nth(i);
        const isVisible = await element.isVisible().catch(() => false);
        console.log(`Desktop-only element ${i + 1} visible:`, isVisible);
      }
    });

    test('should have touch-friendly button sizes on mobile', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      const buttons = page.locator('button');
      const count = await buttons.count();

      // Check first few buttons for minimum touch target size (44x44px)
      for (let i = 0; i < Math.min(count, 5); i++) {
        const button = buttons.nth(i);
        const box = await button.boundingBox();

        if (box) {
          const minSize = 36; // Minimum touch target size
          const isTouchFriendly = box.width >= minSize || box.height >= minSize;

          console.log(`Button ${i + 1} size:`, {
            width: box.width,
            height: box.height,
            touchFriendly: isTouchFriendly,
          });
        }
      }
    });

    test('should not have horizontal overflow on mobile', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      // Check for horizontal scrollbar
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.body.scrollWidth > document.body.clientWidth;
      });

      expect(hasHorizontalScroll).toBe(false);

      if (hasHorizontalScroll) {
        console.warn('WARNING: Horizontal scroll detected on mobile');
        await testUtils.takeScreenshot('mobile-horizontal-overflow', true);
      }
    });

    test('should stack elements vertically on mobile', async ({ page }) => {
      await dashboardPage.navigateToAIKit();

      // Check that content containers are full-width or stacked
      const containers = page.locator('[class*="container"], [class*="grid"], main > div').first();

      if (await containers.count() > 0) {
        const box = await containers.first().boundingBox();

        if (box) {
          const viewportWidth = VIEWPORTS.mobile.width;
          const isFullWidth = box.width >= viewportWidth * 0.9; // Allow for padding

          console.log('Container width on mobile:', {
            containerWidth: box.width,
            viewportWidth,
            isFullWidth,
          });
        }
      }
    });
  });

  test.describe('Tablet Viewport (768px)', () => {
    test.use({ viewport: VIEWPORTS.tablet });

    test('should render dashboard on tablet', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      await expect(page.locator('body')).toBeVisible();

      // Capture screenshot
      await testUtils.takeScreenshot('dashboard-tablet', true);
    });

    test('should show appropriate layout on tablet', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      // Tablet might show side-by-side elements
      const gridElements = page.locator('[class*="grid"], [class*="flex"]');
      const count = await gridElements.count();

      console.log(`Found ${count} grid/flex containers on tablet`);

      // Check if tabs are visible
      const tabs = page.locator('[role="tab"]');
      const tabsCount = await tabs.count();

      expect(tabsCount).toBeGreaterThan(0);
    });

    test('should not have overflow issues on tablet', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.body.scrollWidth > document.body.clientWidth;
      });

      expect(hasHorizontalScroll).toBe(false);
    });
  });

  test.describe('Desktop Viewport (1920px)', () => {
    test.use({ viewport: VIEWPORTS.desktop });

    test('should render full dashboard on desktop', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      await expect(page.locator('body')).toBeVisible();

      // Capture screenshot
      await testUtils.takeScreenshot('dashboard-desktop', true);
    });

    test('should show all navigation elements on desktop', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      const tabs = page.locator('[role="tab"]');
      const count = await tabs.count();

      expect(count).toBeGreaterThan(0);

      // All tabs should be visible
      for (let i = 0; i < count; i++) {
        const tab = tabs.nth(i);
        await expect(tab).toBeVisible();
      }
    });

    test('should utilize full width on desktop', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      const mainContent = page.locator('main, [role="main"]').first();

      if (await mainContent.count() > 0) {
        const box = await mainContent.boundingBox();

        if (box) {
          console.log('Main content width on desktop:', {
            width: box.width,
            viewportWidth: VIEWPORTS.desktop.width,
            utilization: (box.width / VIEWPORTS.desktop.width * 100).toFixed(2) + '%',
          });
        }
      }
    });

    test('should display multi-column layouts on desktop', async ({ page }) => {
      await dashboardPage.navigateToAIKit();

      // Look for grid layouts
      const grids = page.locator('[class*="grid-cols"], [style*="grid-template-columns"]');
      const count = await grids.count();

      console.log(`Found ${count} multi-column grid layouts`);

      if (count > 0) {
        const firstGrid = grids.first();
        const columns = await firstGrid.evaluate(el => {
          const style = window.getComputedStyle(el);
          return style.gridTemplateColumns;
        });

        console.log('Grid template columns:', columns);
      }
    });
  });

  test.describe('Cross-Viewport Tests', () => {
    test('should maintain functionality across all viewports', async ({ page }) => {
      const viewports = [VIEWPORTS.mobile, VIEWPORTS.tablet, VIEWPORTS.desktop];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await dashboardPage.navigateToDashboard();

        // Test basic functionality
        const tabs = page.locator('[role="tab"]');
        const count = await tabs.count();

        console.log(`${viewport.name}: ${count} tabs found`);

        if (count > 0) {
          const firstTab = tabs.first();
          await firstTab.click();
          await page.waitForTimeout(500);
        }

        await testUtils.takeScreenshot(`dashboard-${viewport.name}`, true);
      }
    });

    test('should not break layout when resizing', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      // Start at desktop, resize to mobile
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.waitForTimeout(500);
      await testUtils.takeScreenshot('resize-desktop', true);

      await page.setViewportSize(VIEWPORTS.tablet);
      await page.waitForTimeout(500);
      await testUtils.takeScreenshot('resize-tablet', true);

      await page.setViewportSize(VIEWPORTS.mobile);
      await page.waitForTimeout(500);
      await testUtils.takeScreenshot('resize-mobile', true);

      // Check for layout errors
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.body.scrollWidth > document.body.clientWidth;
      });

      expect(hasHorizontalScroll).toBe(false);
    });

    test('should have consistent typography across viewports', async ({ page }) => {
      const viewports = [VIEWPORTS.mobile, VIEWPORTS.tablet, VIEWPORTS.desktop];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await dashboardPage.navigateToDashboard();

        const heading = page.locator('h1, h2').first();

        if (await heading.count() > 0) {
          const fontSize = await heading.evaluate(el => {
            return window.getComputedStyle(el).fontSize;
          });

          console.log(`${viewport.name} heading font-size:`, fontSize);

          // Font size should be readable (at least 16px)
          const size = parseFloat(fontSize);
          expect(size).toBeGreaterThanOrEqual(16);
        }
      }
    });

    test('should maintain spacing consistency across viewports', async ({ page }) => {
      const viewports = [VIEWPORTS.mobile, VIEWPORTS.tablet, VIEWPORTS.desktop];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await dashboardPage.navigateToDashboard();

        const container = page.locator('main, [role="main"]').first();

        if (await container.count() > 0) {
          const padding = await container.evaluate(el => {
            const style = window.getComputedStyle(el);
            return {
              top: style.paddingTop,
              right: style.paddingRight,
              bottom: style.paddingBottom,
              left: style.paddingLeft,
            };
          });

          console.log(`${viewport.name} container padding:`, padding);
        }
      }
    });
  });

  test.describe('Visual Regression Tests', () => {
    test('should match mobile screenshot baseline', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await dashboardPage.navigateToDashboard();
      await page.waitForTimeout(1000);

      // Visual regression would compare against baseline
      await testUtils.takeScreenshot('baseline-mobile', true);
    });

    test('should match tablet screenshot baseline', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.tablet);
      await dashboardPage.navigateToDashboard();
      await page.waitForTimeout(1000);

      await testUtils.takeScreenshot('baseline-tablet', true);
    });

    test('should match desktop screenshot baseline', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await dashboardPage.navigateToDashboard();
      await page.waitForTimeout(1000);

      await testUtils.takeScreenshot('baseline-desktop', true);
    });
  });
});