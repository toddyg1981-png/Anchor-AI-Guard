import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Sign In, text=Log In, text=Get Started').first()).toBeVisible();
  });

  test('should show auth options', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Anchor/i);
  });
});
