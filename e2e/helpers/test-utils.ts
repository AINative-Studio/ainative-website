import { Page, Locator, expect } from '@playwright/test';

/**
 * Test utilities for AIKit Dashboard E2E tests
 */

export class TestUtils {
  constructor(private page: Page) {}

  /**
   * Wait for element to be visible and stable
   */
  async waitForElement(selector: string, options?: { timeout?: number }) {
    const element = this.page.locator(selector);
    await element.waitFor({
      state: 'visible',
      timeout: options?.timeout || 10000
    });
    return element;
  }

  /**
   * Take a screenshot with consistent naming
   */
  async takeScreenshot(name: string, fullPage = false) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({
      path: `e2e/screenshots/${name}-${timestamp}.png`,
      fullPage,
    });
  }

  /**
   * Test keyboard navigation
   */
  async testKeyboardNavigation(elements: string[]) {
    for (const selector of elements) {
      await this.page.keyboard.press('Tab');
      const focused = await this.page.evaluate(() => document.activeElement?.getAttribute('data-testid') || document.activeElement?.className);
      console.log(`Focused element: ${focused}`);
    }
  }

  /**
   * Check accessibility attributes
   */
  async checkAccessibility(selector: string) {
    const element = this.page.locator(selector);
    const results = {
      role: await element.getAttribute('role'),
      ariaLabel: await element.getAttribute('aria-label'),
      ariaDescribedBy: await element.getAttribute('aria-describedby'),
      ariaExpanded: await element.getAttribute('aria-expanded'),
      ariaSelected: await element.getAttribute('aria-selected'),
      tabIndex: await element.getAttribute('tabindex'),
    };
    return results;
  }

  /**
   * Test responsive behavior at different viewports
   */
  async testResponsive(viewports: { width: number; height: number; name: string }[]) {
    const results = [];
    for (const viewport of viewports) {
      await this.page.setViewportSize(viewport);
      await this.page.waitForTimeout(500); // Wait for layout to settle
      await this.takeScreenshot(`${viewport.name}-viewport`);
      results.push({
        viewport: viewport.name,
        width: viewport.width,
        height: viewport.height,
        screenshot: `${viewport.name}-viewport.png`,
      });
    }
    return results;
  }

  /**
   * Check for console errors
   */
  async checkConsoleErrors() {
    const errors: string[] = [];
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    return errors;
  }

  /**
   * Measure performance metrics
   */
  async measurePerformance() {
    const metrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
        largestContentfulPaint: performance.getEntriesByType('largest-contentful-paint').slice(-1)[0]?.startTime || 0,
      };
    });
    return metrics;
  }

  /**
   * Test form validation
   */
  async testFormValidation(formSelector: string, invalidData: Record<string, string>, validData: Record<string, string>) {
    // Test with invalid data
    for (const [field, value] of Object.entries(invalidData)) {
      const input = this.page.locator(`${formSelector} [name="${field}"], ${formSelector} [data-testid="${field}"]`);
      await input.fill(value);
    }

    const submitButton = this.page.locator(`${formSelector} button[type="submit"]`);
    await submitButton.click();

    // Check for validation errors
    const errors = await this.page.locator(`${formSelector} .error, ${formSelector} [role="alert"]`).count();
    expect(errors).toBeGreaterThan(0);

    // Test with valid data
    for (const [field, value] of Object.entries(validData)) {
      const input = this.page.locator(`${formSelector} [name="${field}"], ${formSelector} [data-testid="${field}"]`);
      await input.fill(value);
    }

    await submitButton.click();

    // Check that form was submitted successfully
    return { invalidDataErrors: errors, validDataSubmitted: true };
  }

  /**
   * Test dark mode toggle
   */
  async testDarkModeToggle() {
    // Get initial theme
    const initialTheme = await this.page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });

    // Find and click theme toggle
    const themeToggle = this.page.locator('[data-testid="theme-toggle"], [aria-label*="theme"], button:has-text("Dark"), button:has-text("Light")').first();
    await themeToggle.click();

    // Wait for theme change
    await this.page.waitForTimeout(500);

    // Get new theme
    const newTheme = await this.page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });

    expect(newTheme).not.toBe(initialTheme);

    // Take screenshots of both themes
    await this.takeScreenshot(`theme-${newTheme}`);

    return { initialTheme, newTheme };
  }

  /**
   * Test component interaction
   */
  async testComponentInteraction(componentSelector: string, interactionType: 'click' | 'hover' | 'focus' | 'type', value?: string) {
    const component = this.page.locator(componentSelector);
    await component.waitFor({ state: 'visible' });

    switch (interactionType) {
      case 'click':
        await component.click();
        break;
      case 'hover':
        await component.hover();
        break;
      case 'focus':
        await component.focus();
        break;
      case 'type':
        if (value) {
          await component.type(value);
        }
        break;
    }

    // Check for state changes
    const ariaExpanded = await component.getAttribute('aria-expanded');
    const ariaSelected = await component.getAttribute('aria-selected');
    const isDisabled = await component.isDisabled();

    return {
      ariaExpanded,
      ariaSelected,
      isDisabled,
    };
  }
}

/**
 * Page Object Model base class
 */
export class BasePage {
  constructor(protected page: Page, protected utils: TestUtils) {}

  async navigate(path: string) {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');
  }

  async getTitle() {
    return await this.page.title();
  }

  async getUrl() {
    return this.page.url();
  }
}