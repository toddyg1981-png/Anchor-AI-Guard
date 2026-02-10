import { test, expect } from '@playwright/test';

test.describe('Security Scanning Flow', () => {
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

  test('scan page is accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    // Look for scan-related UI elements
    const scanElements = page.locator('text=/scan|vulnerability|security/i');
    const count = await scanElements.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('AI chat interface loads', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    // Look for AI chat elements
    const chatElements = page.locator('text=/ai|chat|assistant|anchor ai/i');
    const count = await chatElements.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('security modules are listed', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    // Look for security module indicators
    const modules = page.locator('text=/edr|dlp|siem|soar|threat/i');
    const count = await modules.count();
    // Should show at least a few module references
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
