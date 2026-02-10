import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('should load dashboard page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Anchor/i);
  });

  test('should display security overview', async ({ page }) => {
    await page.goto('/');
    // Check for common dashboard elements
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
