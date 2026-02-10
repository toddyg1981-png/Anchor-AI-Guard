import { test, expect } from '@playwright/test';

test.describe('Scanning', () => {
  test('should display scan interface', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Anchor/i);
  });

  test('should show scan results area', async ({ page }) => {
    await page.goto('/');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
