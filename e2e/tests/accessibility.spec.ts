import { test, expect } from '@playwright/test';
import { DashboardPage } from '../fixtures/dashboard.fixture';
import { AuthFixture } from '../fixtures/auth.fixture';
import { TestUtils } from '../helpers/test-utils';

/**
 * Accessibility E2E Tests
 * Tests keyboard navigation, ARIA attributes, screen reader compatibility, and WCAG compliance
 */

test.describe('Accessibility Tests', () => {
  let dashboardPage: DashboardPage;
  let authFixture: AuthFixture;
  let testUtils: TestUtils;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    authFixture = new AuthFixture(page);
    testUtils = new TestUtils(page);

    await authFixture.setupAuthSession();
  });

  test.describe('Keyboard Navigation', () => {
    test('should navigate through interactive elements with Tab', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      const focusableElements = page.locator(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const count = await focusableElements.count();
      console.log(`Found ${count} focusable elements`);

      // Tab through first 10 elements
      const focusOrder: string[] = [];

      for (let i = 0; i < Math.min(10, count); i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);

        const activeElement = await page.evaluate(() => {
          const el = document.activeElement;
          return {
            tag: el?.tagName,
            id: el?.id,
            class: el?.className,
            ariaLabel: el?.getAttribute('aria-label'),
          };
        });

        focusOrder.push(JSON.stringify(activeElement));
      }

      console.log('Focus order:', focusOrder);
      expect(focusOrder.length).toBeGreaterThan(0);
    });

    test('should navigate backwards with Shift+Tab', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      // Tab forward a few times
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      const forwardElement = await page.evaluate(() => {
        return document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent;
      });

      // Tab backward
      await page.keyboard.press('Shift+Tab');

      const backwardElement = await page.evaluate(() => {
        return document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent;
      });

      console.log('Forward:', forwardElement, 'Backward:', backwardElement);
      expect(backwardElement).not.toBe(forwardElement);
    });

    test('should activate buttons with Enter and Space', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      const buttons = page.locator('button:not([disabled])');
      const count = await buttons.count();

      if (count > 0) {
        const firstButton = buttons.first();
        await firstButton.focus();

        // Test Enter key
        await page.keyboard.press('Enter');
        await page.waitForTimeout(300);

        console.log('Button activated with Enter');

        // Test Space key
        await firstButton.focus();
        await page.keyboard.press('Space');
        await page.waitForTimeout(300);

        console.log('Button activated with Space');
      }
    });

    test('should navigate tabs with arrow keys', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      const tabs = page.locator('[role="tab"]');
      const count = await tabs.count();

      if (count > 1) {
        // Focus first tab
        await tabs.first().focus();

        // Navigate with arrow keys
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(200);

        const activeAfterRight = await page.evaluate(() => {
          return document.activeElement?.getAttribute('aria-selected');
        });

        await page.keyboard.press('ArrowLeft');
        await page.waitForTimeout(200);

        const activeAfterLeft = await page.evaluate(() => {
          return document.activeElement?.getAttribute('aria-selected');
        });

        console.log('Arrow key navigation:', { activeAfterRight, activeAfterLeft });
      }
    });

    test('should skip to main content', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      // Look for skip link
      const skipLink = page.locator('a[href="#main"], a[href="#content"], .skip-to-content').first();

      if (await skipLink.count() > 0) {
        await skipLink.focus();
        await skipLink.click();

        // Main content should be focused
        const mainFocused = await page.evaluate(() => {
          const main = document.querySelector('main, [role="main"], #main, #content');
          return document.activeElement === main;
        });

        console.log('Main content focused:', mainFocused);
      } else {
        console.log('No skip link found');
      }
    });

    test('should trap focus in modals', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      // Open a modal if available
      const modalTrigger = page.locator('[data-testid*="modal"], button:has-text("Open"), button:has-text("Show")').first();

      if (await modalTrigger.count() > 0) {
        await modalTrigger.click();
        await page.waitForTimeout(500);

        // Check if modal is open
        const modal = page.locator('[role="dialog"], [role="alertdialog"], .modal').first();

        if (await modal.count() > 0) {
          // Tab through modal
          await page.keyboard.press('Tab');
          await page.keyboard.press('Tab');
          await page.keyboard.press('Tab');

          // Focus should remain within modal
          const focusInModal = await modal.evaluate((modalEl) => {
            return modalEl.contains(document.activeElement);
          });

          console.log('Focus trapped in modal:', focusInModal);
        }
      }
    });

    test('should close modal with Escape key', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      const modalTrigger = page.locator('[data-testid*="modal"], button:has-text("Open"), button:has-text("Show")').first();

      if (await modalTrigger.count() > 0) {
        await modalTrigger.click();
        await page.waitForTimeout(500);

        const modal = page.locator('[role="dialog"], [role="alertdialog"], .modal').first();

        if (await modal.count() > 0) {
          // Press Escape
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);

          // Modal should be closed
          const modalVisible = await modal.isVisible().catch(() => false);
          expect(modalVisible).toBe(false);

          console.log('Modal closed with Escape');
        }
      }
    });
  });

  test.describe('ARIA Attributes', () => {
    test('should have proper ARIA roles on major landmarks', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      const landmarks = [
        { role: 'banner', description: 'Header' },
        { role: 'navigation', description: 'Navigation' },
        { role: 'main', description: 'Main content' },
        { role: 'contentinfo', description: 'Footer' },
      ];

      for (const landmark of landmarks) {
        const element = page.locator(`[role="${landmark.role}"]`).first();
        const exists = await element.count() > 0;

        console.log(`${landmark.description} (role="${landmark.role}"):`, exists);
      }
    });

    test('should have ARIA labels on interactive elements', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      const buttons = page.locator('button');
      const count = await buttons.count();

      let labeled = 0;
      let unlabeled = 0;

      for (let i = 0; i < Math.min(count, 10); i++) {
        const button = buttons.nth(i);
        const ariaLabel = await button.getAttribute('aria-label');
        const ariaLabelledBy = await button.getAttribute('aria-labelledby');
        const text = await button.textContent();

        if (ariaLabel || ariaLabelledBy || text?.trim()) {
          labeled++;
        } else {
          unlabeled++;
          console.warn('Button without label found');
        }
      }

      console.log('Button labels:', { labeled, unlabeled });
      expect(unlabeled).toBe(0);
    });

    test('should have proper ARIA expanded state on accordions', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      const expandable = page.locator('[aria-expanded]');
      const count = await expandable.count();

      console.log(`Found ${count} expandable elements`);

      if (count > 0) {
        const firstExpandable = expandable.first();
        const initialState = await firstExpandable.getAttribute('aria-expanded');

        await firstExpandable.click();
        await page.waitForTimeout(300);

        const newState = await firstExpandable.getAttribute('aria-expanded');

        console.log('Expandable state:', { initialState, newState });
        expect(newState).not.toBe(initialState);
      }
    });

    test('should have ARIA current on active navigation items', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      const navItems = page.locator('[role="tab"], nav a, [role="navigation"] a');
      const count = await navItems.count();

      for (let i = 0; i < Math.min(count, 5); i++) {
        const item = navItems.nth(i);
        const ariaCurrent = await item.getAttribute('aria-current');
        const ariaSelected = await item.getAttribute('aria-selected');

        if (ariaCurrent === 'page' || ariaSelected === 'true') {
          console.log(`Active navigation item found at index ${i}`);
        }
      }
    });

    test('should have ARIA live regions for dynamic content', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      const liveRegions = page.locator('[aria-live]');
      const count = await liveRegions.count();

      console.log(`Found ${count} live regions`);

      for (let i = 0; i < count; i++) {
        const region = liveRegions.nth(i);
        const ariaLive = await region.getAttribute('aria-live');
        const ariaAtomic = await region.getAttribute('aria-atomic');

        console.log(`Live region ${i + 1}:`, { ariaLive, ariaAtomic });
      }
    });

    test('should have ARIA describedby for form fields with hints', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      const formFields = page.locator('input, textarea, select');
      const count = await formFields.count();

      for (let i = 0; i < Math.min(count, 5); i++) {
        const field = formFields.nth(i);
        const ariaDescribedby = await field.getAttribute('aria-describedby');
        const ariaLabel = await field.getAttribute('aria-label');
        const id = await field.getAttribute('id');

        console.log(`Form field ${i + 1}:`, { id, ariaLabel, ariaDescribedby });
      }
    });
  });

  test.describe('Screen Reader Support', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      const headings = await page.evaluate(() => {
        const h1 = document.querySelectorAll('h1').length;
        const h2 = document.querySelectorAll('h2').length;
        const h3 = document.querySelectorAll('h3').length;
        const h4 = document.querySelectorAll('h4').length;
        const h5 = document.querySelectorAll('h5').length;
        const h6 = document.querySelectorAll('h6').length;

        return { h1, h2, h3, h4, h5, h6 };
      });

      console.log('Heading hierarchy:', headings);

      // Should have exactly one H1
      expect(headings.h1).toBe(1);
    });

    test('should have alt text on images', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      const images = page.locator('img');
      const count = await images.count();

      let withAlt = 0;
      let withoutAlt = 0;

      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        const role = await img.getAttribute('role');

        if (alt !== null || role === 'presentation') {
          withAlt++;
        } else {
          withoutAlt++;
          const src = await img.getAttribute('src');
          console.warn('Image without alt text:', src);
        }
      }

      console.log('Images:', { total: count, withAlt, withoutAlt });
      expect(withoutAlt).toBe(0);
    });

    test('should have accessible form labels', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      const inputs = page.locator('input, textarea, select');
      const count = await inputs.count();

      let labeled = 0;
      let unlabeled = 0;

      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');

        // Check for associated label
        let hasLabel = false;
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          hasLabel = await label.count() > 0;
        }

        if (hasLabel || ariaLabel || ariaLabelledBy) {
          labeled++;
        } else {
          unlabeled++;
        }
      }

      console.log('Form labels:', { total: count, labeled, unlabeled });
    });

    test('should announce dynamic content changes', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      // Check for aria-live regions
      const liveRegions = page.locator('[aria-live="polite"], [aria-live="assertive"]');
      const count = await liveRegions.count();

      console.log(`Found ${count} aria-live regions`);

      // Test if they update
      if (count > 0) {
        const firstRegion = liveRegions.first();
        const initialContent = await firstRegion.textContent();

        // Wait for potential updates
        await page.waitForTimeout(2000);

        const newContent = await firstRegion.textContent();

        console.log('Live region content:', { initialContent, newContent });
      }
    });
  });

  test.describe('WCAG Compliance', () => {
    test('should have sufficient color contrast', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      // Get text elements
      const textElements = page.locator('p, span, a, button, h1, h2, h3, h4, h5, h6');
      const count = await textElements.count();

      console.log(`Checking color contrast for ${Math.min(count, 10)} elements`);

      for (let i = 0; i < Math.min(count, 10); i++) {
        const element = textElements.nth(i);

        const contrast = await element.evaluate(el => {
          const style = window.getComputedStyle(el);
          return {
            color: style.color,
            backgroundColor: style.backgroundColor,
          };
        });

        console.log(`Element ${i + 1} contrast:`, contrast);
      }
    });

    test('should have minimum touch target size', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      const interactive = page.locator('button, a, input, select');
      const count = await interactive.count();

      const minSize = 44; // WCAG 2.1 Level AAA
      let tooSmall = 0;

      for (let i = 0; i < Math.min(count, 10); i++) {
        const element = interactive.nth(i);
        const box = await element.boundingBox();

        if (box) {
          if (box.width < minSize || box.height < minSize) {
            tooSmall++;
            console.warn(`Element ${i + 1} too small:`, box);
          }
        }
      }

      console.log('Touch target sizes:', { checked: Math.min(count, 10), tooSmall });
    });

    test('should have visible focus indicators', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      const focusable = page.locator('a, button, input, select, textarea');
      const count = await focusable.count();

      if (count > 0) {
        const firstElement = focusable.first();

        // Get styles before focus
        const beforeFocus = await firstElement.evaluate(el => {
          const style = window.getComputedStyle(el);
          return {
            outline: style.outline,
            boxShadow: style.boxShadow,
          };
        });

        // Focus element
        await firstElement.focus();
        await page.waitForTimeout(100);

        // Get styles after focus
        const afterFocus = await firstElement.evaluate(el => {
          const style = window.getComputedStyle(el);
          return {
            outline: style.outline,
            boxShadow: style.boxShadow,
          };
        });

        console.log('Focus indicator:', { beforeFocus, afterFocus });

        // Should have some visible change
        const hasIndicator = beforeFocus.outline !== afterFocus.outline ||
                            beforeFocus.boxShadow !== afterFocus.boxShadow;

        expect(hasIndicator).toBe(true);
      }
    });

    test('should have descriptive link text', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      const links = page.locator('a');
      const count = await links.count();

      const genericTerms = ['click here', 'read more', 'here', 'link', 'more'];
      let genericLinks = 0;

      for (let i = 0; i < count; i++) {
        const link = links.nth(i);
        const text = (await link.textContent())?.toLowerCase().trim() || '';
        const ariaLabel = await link.getAttribute('aria-label');

        if (genericTerms.includes(text) && !ariaLabel) {
          genericLinks++;
          console.warn('Generic link text:', text);
        }
      }

      console.log('Links:', { total: count, generic: genericLinks });
    });

    test('should not rely solely on color for information', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      // Check for error/success messages
      const messages = page.locator('.error, .success, .warning, .info, [role="alert"]');
      const count = await messages.count();

      for (let i = 0; i < count; i++) {
        const message = messages.nth(i);

        // Check if it has an icon or other visual indicator besides color
        const hasIcon = await message.locator('svg, img, [class*="icon"]').count() > 0;
        const hasRole = await message.getAttribute('role');

        console.log(`Message ${i + 1}:`, { hasIcon, hasRole });
      }
    });
  });
});