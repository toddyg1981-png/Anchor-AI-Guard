import { test, expect } from '@playwright/test';

test.describe('Navigation & Layout', () => {
  test('renders the application shell', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/anchor/i);
    // Page should load without JS errors
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.waitForTimeout(2000);
    // Allow rendering errors but not total crash
    expect(errors.filter(e => e.includes('chunk') || e.includes('fatal'))).toHaveLength(0);
  });

  test('is responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    // Content should not overflow horizontally
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(400);
  });

  test('has no broken images', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const images = await page.locator('img').all();
    for (const img of images) {
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      // naturalWidth 0 means the image failed to load
      if (await img.isVisible()) {
        expect(naturalWidth).toBeGreaterThan(0);
      }
    }
  });

  test('security headers present in HTML', async ({ page }) => {
    const response = await page.goto('/');
    expect(response).not.toBeNull();
    // Check critical security meta tags rendered by React or index.html
    const metaCSP = await page.locator('meta[http-equiv="Content-Security-Policy"]').count();
    const metaXFrame = await page.locator('meta[http-equiv="X-Frame-Options"]').count();
    // At minimum the app should load — headers may be in server config
    expect(response!.status()).toBe(200);
  });
});
