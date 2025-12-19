import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display the main heading', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');

    // Check for main navigation elements
    await expect(page.locator('header')).toBeVisible();
    await expect(page.getByRole('link', { name: /ai kit/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /pricing/i })).toBeVisible();
  });

  test('should navigate to AI Kit page', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /ai kit/i }).first().click();

    await expect(page).toHaveURL(/.*ai-kit/);
  });

  test('should navigate to Pricing page', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /pricing/i }).first().click();

    await expect(page).toHaveURL(/.*pricing/);
  });

  test('should have footer', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('footer')).toBeVisible();
  });
});
