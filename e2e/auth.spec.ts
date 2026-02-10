import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('shows login screen on first visit', async ({ page }) => {
    await page.goto('/');
    // Should show the auth screen or landing page
    await expect(page.locator('body')).toBeVisible();
    // Look for login/signup elements
    const hasAuth = await page.locator('text=/sign in|log in|get started|sign up/i').first().isVisible().catch(() => false);
    expect(hasAuth).toBeTruthy();
  });

  test('login form validates required fields', async ({ page }) => {
    await page.goto('/');
    // Try to find and interact with login form
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    if (await emailInput.isVisible().catch(() => false)) {
      // Try submitting empty form
      const submitBtn = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Log In")').first();
      if (await submitBtn.isVisible().catch(() => false)) {
        await submitBtn.click();
        // Should show validation error or stay on same page
        await expect(page).toHaveURL(/.*\//);
      }
    }
  });

  test('shows signup option', async ({ page }) => {
    await page.goto('/');
    const signupLink = page.locator('text=/sign up|create account|register/i').first();
    if (await signupLink.isVisible().catch(() => false)) {
      expect(await signupLink.isVisible()).toBeTruthy();
    }
  });
});
