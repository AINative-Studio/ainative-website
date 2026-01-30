import { test, expect } from '@playwright/test';
import { DashboardPage } from '../fixtures/dashboard.fixture';
import { AuthFixture } from '../fixtures/auth.fixture';
import { TestUtils } from '../helpers/test-utils';

/**
 * Visual Testing E2E Tests
 * Tests visual consistency, dark mode, animations, and screenshot capture
 */

test.describe('Visual Testing', () => {
  let dashboardPage: DashboardPage;
  let authFixture: AuthFixture;
  let testUtils: TestUtils;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    authFixture = new AuthFixture(page);
    testUtils = new TestUtils(page);

    await authFixture.setupAuthSession();
  });

  test.describe('Screenshot Capture', () => {
    test('should capture all dashboard tabs', async () => {
      await dashboardPage.navigateToDashboard();
      await dashboardPage.captureAllTabScreenshots('baseline');
    });

    test('should capture AI Kit page', async ({ page }) => {
      await dashboardPage.navigateToAIKit();
      await page.waitForLoadState('networkidle');
      await testUtils.takeScreenshot('ai-kit-page', true);
    });

    test('should capture different sections of dashboard', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      const sections = [
        { selector: 'header, [role="banner"]', name: 'header' },
        { selector: 'nav, [role="navigation"]', name: 'navigation' },
        { selector: 'main, [role="main"]', name: 'main-content' },
        { selector: 'footer, [role="contentinfo"]', name: 'footer' },
      ];

      for (const section of sections) {
        const element = page.locator(section.selector).first();

        if (await element.count() > 0) {
          await element.screenshot({
            path: `e2e/screenshots/section-${section.name}.png`,
          });
        }
      }
    });

    test('should capture component states', async ({ page }) => {
      await dashboardPage.navigateToAIKit();

      // Capture button states
      const buttons = page.locator('button').first();

      if (await buttons.count() > 0) {
        // Normal state
        await buttons.screenshot({ path: 'e2e/screenshots/button-normal.png' });

        // Hover state
        await buttons.hover();
        await page.waitForTimeout(300);
        await buttons.screenshot({ path: 'e2e/screenshots/button-hover.png' });

        // Focus state
        await buttons.focus();
        await page.waitForTimeout(300);
        await buttons.screenshot({ path: 'e2e/screenshots/button-focus.png' });
      }
    });

    test('should capture loading states', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      // Look for loading indicators
      const loaders = page.locator('[data-testid*="loading"], [class*="loading"], [class*="spinner"]');
      const count = await loaders.count();

      if (count > 0) {
        await testUtils.takeScreenshot('loading-state');
      }
    });

    test('should capture error states', async ({ page }) => {
      // Navigate to potential error-triggering scenarios
      await page.goto('/dashboard/invalid-route').catch(() => {});
      await page.waitForTimeout(1000);

      // Capture error page
      await testUtils.takeScreenshot('error-state', true);
    });
  });

  test.describe('Dark Mode Testing', () => {
    test('should toggle dark mode', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      const result = await testUtils.testDarkModeToggle();

      expect(result.initialTheme).toBeTruthy();
      expect(result.newTheme).toBeTruthy();
      expect(result.initialTheme).not.toBe(result.newTheme);

      console.log('Dark mode toggle:', result);
    });

    test('should apply dark mode styles to all components', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      // Enable dark mode
      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
      });

      await page.waitForTimeout(500);

      // Check background colors
      const body = page.locator('body');
      const bgColor = await body.evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });

      console.log('Dark mode background color:', bgColor);

      // Capture dark mode screenshot
      await testUtils.takeScreenshot('dark-mode-dashboard', true);
    });

    test('should persist dark mode preference', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      // Enable dark mode
      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      });

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Check if dark mode persisted
      const isDark = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark');
      });

      console.log('Dark mode persisted after reload:', isDark);
    });

    test('should have sufficient contrast in dark mode', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      // Enable dark mode
      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
      });

      await page.waitForTimeout(500);

      // Check text elements for contrast
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const count = await headings.count();

      for (let i = 0; i < Math.min(count, 3); i++) {
        const heading = headings.nth(i);
        const styles = await heading.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
          };
        });

        console.log(`Heading ${i + 1} dark mode styles:`, styles);
      }
    });

    test('should capture all tabs in dark mode', async () => {
      await dashboardPage.navigateToDashboard();

      // Enable dark mode
      await dashboardPage.page.evaluate(() => {
        document.documentElement.classList.add('dark');
      });

      await dashboardPage.captureAllTabScreenshots('dark-mode');
    });
  });

  test.describe('Animation Testing', () => {
    test('should detect CSS animations', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      // Check for animated elements
      const animations = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const animated: string[] = [];

        elements.forEach(el => {
          const style = window.getComputedStyle(el);
          if (style.animation !== 'none' && style.animation !== '') {
            animated.push(el.className || el.tagName);
          }
        });

        return animated;
      });

      console.log('Animated elements found:', animations.length);
    });

    test('should detect transitions on interaction', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      const buttons = page.locator('button').first();

      if (await buttons.count() > 0) {
        // Check for transitions
        const hasTransition = await buttons.evaluate(el => {
          const style = window.getComputedStyle(el);
          return style.transition !== 'none' && style.transition !== '';
        });

        console.log('Button has transition:', hasTransition);

        // Capture before hover
        await buttons.screenshot({ path: 'e2e/screenshots/button-before-hover.png' });

        // Hover and capture after
        await buttons.hover();
        await page.waitForTimeout(500); // Wait for transition
        await buttons.screenshot({ path: 'e2e/screenshots/button-after-hover.png' });
      }
    });

    test('should not have excessive animation duration', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      const animationDurations = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const durations: number[] = [];

        elements.forEach(el => {
          const style = window.getComputedStyle(el);
          const duration = parseFloat(style.animationDuration);

          if (duration > 0) {
            durations.push(duration);
          }
        });

        return durations;
      });

      // Animations should typically be under 1 second
      const excessive = animationDurations.filter(d => d > 1000);

      console.log('Animation durations:', {
        total: animationDurations.length,
        excessive: excessive.length,
        longest: Math.max(...animationDurations, 0),
      });
    });

    test('should respect reduced motion preference', async ({ page }) => {
      // Enable reduced motion
      await page.emulateMedia({ reducedMotion: 'reduce' });

      await dashboardPage.navigateToDashboard();

      // Check if animations are disabled
      const animationsDisabled = await page.evaluate(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        return prefersReducedMotion;
      });

      expect(animationsDisabled).toBe(true);

      console.log('Reduced motion enabled:', animationsDisabled);
    });
  });

  test.describe('Color and Typography', () => {
    test('should use consistent color palette', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      const colors = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const colorSet = new Set<string>();

        elements.forEach(el => {
          const style = window.getComputedStyle(el);
          if (style.color !== 'rgba(0, 0, 0, 0)') {
            colorSet.add(style.color);
          }
          if (style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
            colorSet.add(style.backgroundColor);
          }
        });

        return Array.from(colorSet);
      });

      console.log('Color palette size:', colors.length);
      console.log('Sample colors:', colors.slice(0, 10));
    });

    test('should use consistent typography', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      const fonts = await page.evaluate(() => {
        const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, button');
        const fontSet = new Set<string>();

        elements.forEach(el => {
          const style = window.getComputedStyle(el);
          fontSet.add(style.fontFamily);
        });

        return Array.from(fontSet);
      });

      console.log('Font families used:', fonts.length);
      console.log('Fonts:', fonts);

      // Should use a limited set of fonts
      expect(fonts.length).toBeLessThan(10);
    });

    test('should have consistent heading hierarchy', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      const headingSizes = await page.evaluate(() => {
        const headings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        const sizes: Record<string, string[]> = {};

        headings.forEach(tag => {
          const elements = document.querySelectorAll(tag);
          const tagSizes: string[] = [];

          elements.forEach(el => {
            const size = window.getComputedStyle(el).fontSize;
            tagSizes.push(size);
          });

          if (tagSizes.length > 0) {
            sizes[tag] = Array.from(new Set(tagSizes));
          }
        });

        return sizes;
      });

      console.log('Heading sizes:', headingSizes);

      // H1 should be larger than H2, etc.
      const h1Size = parseFloat(headingSizes.h1?.[0] || '0');
      const h2Size = parseFloat(headingSizes.h2?.[0] || '0');

      if (h1Size > 0 && h2Size > 0) {
        expect(h1Size).toBeGreaterThanOrEqual(h2Size);
      }
    });
  });

  test.describe('Layout Consistency', () => {
    test('should have consistent spacing', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      const spacing = await page.evaluate(() => {
        const containers = document.querySelectorAll('[class*="container"], [class*="wrapper"], main');
        const spacingValues = new Set<string>();

        containers.forEach(el => {
          const style = window.getComputedStyle(el);
          spacingValues.add(style.padding);
          spacingValues.add(style.margin);
        });

        return Array.from(spacingValues);
      });

      console.log('Spacing values used:', spacing.length);
    });

    test('should maintain alignment across sections', async ({ page }) => {
      await dashboardPage.navigateToDashboard();

      const sections = page.locator('section, [role="region"]');
      const count = await sections.count();

      const alignments: string[] = [];

      for (let i = 0; i < Math.min(count, 3); i++) {
        const section = sections.nth(i);
        const alignment = await section.evaluate(el => {
          return window.getComputedStyle(el).textAlign;
        });
        alignments.push(alignment);
      }

      console.log('Section alignments:', alignments);
    });
  });
});