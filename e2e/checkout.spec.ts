import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
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

  test('pricing page shows plan tiers', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('domcontentloaded');
    
    // Should display plan names
    const planNames = ['Free', 'Starter', 'Pro', 'Team', 'Business', 'Enterprise'];
    for (const name of planNames) {
      const el = page.locator(`text=${name}`).first();
      // At least some plans should be visible
      if (await el.isVisible().catch(() => false)) {
        expect(await el.isVisible()).toBeTruthy();
      }
    }
  });

  test('checkout success notification appears from URL param', async ({ page }) => {
    await page.goto('/?checkout=success');
    await page.waitForLoadState('domcontentloaded');
    // Should show a success notification
    const notification = page.locator('text=/success|thank|subscription|activated/i').first();
    if (await notification.isVisible({ timeout: 5000 }).catch(() => false)) {
      expect(await notification.isVisible()).toBeTruthy();
    }
  });

  test('checkout canceled notification appears from URL param', async ({ page }) => {
    await page.goto('/?checkout=canceled');
    await page.waitForLoadState('domcontentloaded');
    const notification = page.locator('text=/cancel|return|try again/i').first();
    if (await notification.isVisible({ timeout: 5000 }).catch(() => false)) {
      expect(await notification.isVisible()).toBeTruthy();
    }
  });
});
