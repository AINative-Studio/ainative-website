import { test, expect } from '@playwright/test';

test.describe('Pricing Page', () => {
  test('should display pricing heading', async ({ page }) => {
    await page.goto('/pricing');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should display pricing plans', async ({ page }) => {
    await page.goto('/pricing');

    // Check for common pricing elements
    await expect(page.getByText(/free/i).first()).toBeVisible();
    await expect(page.getByText(/pro/i).first()).toBeVisible();
  });

  test('should have call-to-action buttons', async ({ page }) => {
    await page.goto('/pricing');

    // Should have at least one CTA button
    const ctaButtons = page.getByRole('button').or(page.getByRole('link', { name: /get started|try|subscribe|buy/i }));
    await expect(ctaButtons.first()).toBeVisible();
  });

  test('should navigate back to home', async ({ page }) => {
    await page.goto('/pricing');

    // Click logo or home link
    const homeLinks = page.getByRole('link').filter({ has: page.locator('[href="/"]') });
    if (await homeLinks.count() > 0) {
      await homeLinks.first().click();
      await expect(page).toHaveURL('/');
    }
  });
});
