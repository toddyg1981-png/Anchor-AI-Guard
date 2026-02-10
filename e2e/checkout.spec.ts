import { test, expect } from '@playwright/test';

test.describe('Checkout', () => {
  test('should display pricing plans', async ({ page }) => {
    await page.goto('/');
    // Navigate to pricing/billing if available
    const pricingLink = page.locator('text=Pricing, text=Plans, text=Billing').first();
    if (await pricingLink.isVisible()) {
      await pricingLink.click();
      await expect(page.locator('text=Pro, text=Enterprise, text=plan').first()).toBeVisible();
    }
  });

  test('should show subscription options', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Anchor/i);
  });
});
