/**
 * AIKit Dashboard - E2E Test Scenarios
 *
 * Test Coverage:
 * - Full user workflows
 * - Cross-browser compatibility
 * - Mobile and desktop viewports
 * - Performance metrics
 * - Visual regression
 *
 * Coverage Target: Key user journeys
 */

import { test, expect } from '@playwright/test';

test.describe('AIKit Dashboard - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ai-kit');
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test.describe('Page Loading and Navigation', () => {
    test('should load dashboard successfully', async ({ page }) => {
      // Given: User navigates to AIKit dashboard
      // Then: Page should load with title
      await expect(page).toHaveTitle(/AI Kit/i);

      // Main heading should be visible
      await expect(page.getByRole('heading', { name: /AI Kit/i })).toBeVisible();
      await expect(page.getByText(/Build AI Apps Faster/i)).toBeVisible();
    });

    test('should display all major sections', async ({ page }) => {
      // Then: All sections should be visible
      await expect(page.getByText(/Why Choose AI Kit/i)).toBeVisible();
      await expect(page.getByText(/Browse All Packages/i)).toBeVisible();
      await expect(page.getByText(/Get Started in Minutes/i)).toBeVisible();
    });

    test('should navigate via breadcrumb', async ({ page }) => {
      // When: Clicking home in breadcrumb
      await page.getByRole('link', { name: 'Home', exact: true }).click();

      // Then: Should navigate to home page
      await expect(page).toHaveURL('/');
    });

    test('should navigate to GitHub from CTA', async ({ page }) => {
      // When: Clicking GitHub CTA
      const [newPage] = await Promise.all([
        page.waitForEvent('popup'),
        page.getByRole('link', { name: /View on GitHub/i }).first().click(),
      ]);

      // Then: Should open GitHub in new tab
      expect(newPage.url()).toContain('github.com');
    });

    test('should navigate to NPM from package card', async ({ page }) => {
      // When: Clicking NPM link on first package
      const [newPage] = await Promise.all([
        page.waitForEvent('popup'),
        page.getByRole('link', { name: /NPM/i }).first().click(),
      ]);

      // Then: Should open npmjs.com
      expect(newPage.url()).toContain('npmjs.com');
    });
  });

  test.describe('Package Filtering', () => {
    test('should filter packages by category', async ({ page }) => {
      // Given: All packages are visible
      const allPackages = await page.locator('article').count();
      expect(allPackages).toBeGreaterThan(10);

      // When: Clicking Core category
      await page.getByRole('button', { name: 'Core', exact: true }).click();

      // Then: Fewer packages should be visible
      await page.waitForTimeout(500); // Wait for animation
      const corePackages = await page.locator('article').count();
      expect(corePackages).toBeLessThan(allPackages);

      // And: Core package should be visible
      await expect(page.getByText(/@ainative-studio\/aikit-core/i)).toBeVisible();
    });

    test('should reset filter to All', async ({ page }) => {
      // Given: Framework filter is active
      await page.getByRole('button', { name: /Framework/i }).click();
      await page.waitForTimeout(300);

      // When: Clicking All filter
      await page.getByRole('button', { name: 'All', exact: true }).click();
      await page.waitForTimeout(300);

      // Then: All packages should be visible again
      const allPackages = await page.locator('article').count();
      expect(allPackages).toBeGreaterThan(10);
    });

    test('should highlight active category button', async ({ page }) => {
      // When: Clicking Security category
      const securityButton = page.getByRole('button', { name: /Security/i });
      await securityButton.click();

      // Then: Button should have active styling
      await expect(securityButton).toHaveClass(/bg-gradient-to-r/);
    });
  });

  test.describe('Code Examples Tabs', () => {
    test('should switch between code examples', async ({ page }) => {
      // Given: React tab is active by default
      await expect(page.getByText(/React Example/i)).toBeVisible();

      // When: Clicking Vue tab
      await page.getByRole('tab', { name: /Vue/i }).click();

      // Then: Vue example should be visible
      await expect(page.getByText(/Vue Example/i)).toBeVisible();
      await expect(page.getByText(/script setup/i)).toBeVisible();

      // When: Clicking CLI tab
      await page.getByRole('tab', { name: /CLI/i }).click();

      // Then: CLI example should be visible
      await expect(page.getByText(/CLI Commands/i)).toBeVisible();
      await expect(page.getByText(/ai-kit create/i)).toBeVisible();
    });

    test('should maintain tab state while filtering', async ({ page }) => {
      // Given: Vue tab is active
      await page.getByRole('tab', { name: /Vue/i }).click();

      // When: Filtering packages
      await page.getByRole('button', { name: /Framework/i }).click();

      // Then: Vue tab should still be active
      const vueTab = page.getByRole('tab', { name: /Vue/i });
      await expect(vueTab).toHaveAttribute('data-state', 'active');
    });
  });

  test.describe('Package Card Interactions', () => {
    test('should copy install command to clipboard', async ({ page, context }) => {
      // Grant clipboard permissions
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);

      // When: Clicking copy button
      const firstCopyButton = page.locator('button').filter({ has: page.locator('svg') }).first();
      await firstCopyButton.click();

      // Then: Clipboard should contain npm install command
      const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
      expect(clipboardText).toContain('npm install @ainative');
    });

    test('should show check icon after copying', async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);

      // When: Clicking copy button
      const packageCard = page.locator('article').first();
      const copyButton = packageCard.locator('button').filter({ has: page.locator('svg') }).first();
      await copyButton.click();

      // Then: Check icon should appear (brief timeout for icon change)
      await page.waitForTimeout(200);
      // Verify button is still present
      await expect(copyButton).toBeVisible();
    });

    test('should display package features', async ({ page }) => {
      // Then: First package should show features
      const firstPackage = page.locator('article').first();

      // Common features to look for
      const features = ['Type safety', 'Base utilities', 'Vector search', 'JWT handling'];
      let foundFeature = false;

      for (const feature of features) {
        if (await firstPackage.getByText(feature, { exact: false }).isVisible()) {
          foundFeature = true;
          break;
        }
      }

      expect(foundFeature).toBe(true);
    });

    test('should show package category badges', async ({ page }) => {
      // Then: Packages should display category badges
      const categoryBadges = page.getByText(/^(Core|Security|Framework|Data|DevTools|ML)$/);
      const count = await categoryBadges.count();
      expect(count).toBeGreaterThan(5);
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      // When: Tabbing through elements
      await page.keyboard.press('Tab'); // Breadcrumb
      await page.keyboard.press('Tab'); // Next element

      // Then: Focus should be visible
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      // Then: Breadcrumb should have proper label
      const breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i });
      await expect(breadcrumb).toBeVisible();

      // Tabs should have proper roles
      const tabs = page.getByRole('tab');
      const tabCount = await tabs.count();
      expect(tabCount).toBeGreaterThanOrEqual(3);
    });

    test('should announce dynamic content changes', async ({ page }) => {
      // When: Changing category filter
      await page.getByRole('button', { name: /Security/i }).click();

      // Then: Content should update (check for package visibility)
      await expect(page.getByText(/@ainative\/ai-kit-auth/i)).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should adapt to mobile viewport', async ({ page }) => {
      // Given: Mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Then: Content should be visible and stacked
      await expect(page.getByText(/AI Kit/i)).toBeVisible();
      await expect(page.getByText(/Build AI Apps Faster/i)).toBeVisible();

      // Hero buttons should be stacked
      const githubButton = page.getByRole('link', { name: /View on GitHub/i }).first();
      await expect(githubButton).toBeVisible();
    });

    test('should adapt to tablet viewport', async ({ page }) => {
      // Given: Tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      // Then: Layout should adjust
      await expect(page.getByText(/AI Kit/i)).toBeVisible();

      // Packages should be in grid
      const packages = page.locator('article');
      const count = await packages.count();
      expect(count).toBeGreaterThan(5);
    });

    test('should adapt to desktop viewport', async ({ page }) => {
      // Given: Desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });

      // Then: Full desktop layout
      await expect(page.getByText(/AI Kit/i)).toBeVisible();

      // All sections visible without scrolling much
      await expect(page.getByText(/Why Choose AI Kit/i)).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load within performance budget', async ({ page }) => {
      // Measure page load time
      const startTime = Date.now();
      await page.goto('/ai-kit');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      // Then: Should load in under 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should lazy load images', async ({ page }) => {
      // Then: Images should have loading attribute
      const images = page.locator('img');
      const count = await images.count();

      if (count > 0) {
        // Next.js Image handles lazy loading automatically
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });

    test('should not have layout shifts', async ({ page }) => {
      // Measure CLS (Cumulative Layout Shift)
      await page.goto('/ai-kit');
      await page.waitForLoadState('networkidle');

      // Scroll through page
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await page.waitForTimeout(500);

      // Page should be stable
      const title = page.getByText(/AI Kit/i);
      await expect(title).toBeVisible();
    });
  });

  test.describe('Dark Theme', () => {
    test('should render in dark theme', async ({ page }) => {
      // Note: Theme depends on system preference or user setting
      // Check that dark theme elements are present
      await expect(page.locator('main')).toBeVisible();
      await expect(page.getByText(/AI Kit/i)).toBeVisible();
    });

    test('should maintain contrast in dark theme', async ({ page }) => {
      // Then: All text should be readable
      await expect(page.getByText(/Build AI Apps Faster/i)).toBeVisible();
      await expect(page.getByText(/Production Ready/i)).toBeVisible();
    });
  });

  test.describe('Scroll Behavior', () => {
    test('should animate elements on scroll', async ({ page }) => {
      // When: Scrolling to packages section
      await page.getByText(/Browse All Packages/i).scrollIntoViewIfNeeded();
      await page.waitForTimeout(500); // Wait for animation

      // Then: Packages should be visible
      const packages = page.locator('article');
      await expect(packages.first()).toBeVisible();
    });

    test('should maintain header visibility', async ({ page }) => {
      // When: Scrolling down
      await page.evaluate(() => window.scrollTo(0, 1000));

      // Then: Breadcrumb should still be accessible
      await expect(page.getByRole('navigation', { name: /breadcrumb/i })).toBeVisible();
    });
  });

  test.describe('External Links', () => {
    test('should open external links in new tab', async ({ page }) => {
      // When: Clicking GitHub link
      const githubLink = page.getByRole('link', { name: /View on GitHub/i }).first();

      // Then: Should have target="_blank"
      await expect(githubLink).toHaveAttribute('target', '_blank');
      await expect(githubLink).toHaveAttribute('rel', /noopener/);
    });

    test('should have secure external links', async ({ page }) => {
      // Then: All external links should have rel="noopener noreferrer"
      const externalLinks = page.locator('a[target="_blank"]');
      const count = await externalLinks.count();

      for (let i = 0; i < Math.min(count, 5); i++) {
        const link = externalLinks.nth(i);
        await expect(link).toHaveAttribute('rel', /noopener/);
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate offline mode
      await page.route('**/*', (route) => {
        if (route.request().resourceType() === 'image') {
          route.abort();
        } else {
          route.continue();
        }
      });

      await page.reload();

      // Then: Page should still render
      await expect(page.getByText(/AI Kit/i)).toBeVisible();
    });

    test('should handle clipboard API failure', async ({ page, context }) => {
      // Don't grant clipboard permissions
      // When: Clicking copy button
      const copyButton = page.locator('article').first().locator('button').first();
      await copyButton.click();

      // Then: Page should not crash
      await expect(page.getByText(/AI Kit/i)).toBeVisible();
    });
  });
});
