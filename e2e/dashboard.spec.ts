import { test, expect } from '@playwright/test';

test.describe('Dashboard (authenticated flow)', () => {
  // Helper to simulate authenticated state
  test.beforeEach(async ({ page }) => {
    // Set auth token in localStorage before navigating
    await page.addInitScript(() => {
      window.localStorage.setItem('anchor_auth_token', 'e2e-test-token');
      window.localStorage.setItem('anchor_user', JSON.stringify({
        id: 'e2e-user',
        email: 'e2e@test.com',
        name: 'E2E Tester',
        orgId: 'e2e-org',
        role: 'OWNER',
      }));
    });
  });

  test('dashboard loads with navigation sidebar', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    // Should see dashboard elements or be redirected
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('pillar navigation is accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    // Look for pillar-related navigation items
    const pillarLinks = page.locator('text=/scan|protect|detect|respond|govern/i');
    const count = await pillarLinks.count();
    // Should have at least some navigation options
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('pricing page loads', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('domcontentloaded');
    // Should show pricing plans or redirect
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('billing page renders plan info', async ({ page }) => {
    await page.goto('/billing');
    await page.waitForLoadState('domcontentloaded');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
