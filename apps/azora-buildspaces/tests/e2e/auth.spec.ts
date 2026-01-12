import { test, expect } from '@playwright/test'

test.describe('Auth flows', () => {
  test('signup and login with email', async ({ page, baseURL }) => {
    await page.goto('/auth/signup')
    await expect(page).toHaveURL(/auth\/signup/)

    // try to fill and submit a signup form (form ids may vary)
    await page.fill('input[name="email"]', `test+${Date.now()}@example.com`)
    await page.fill('input[name="password"]', 'Test1234!')
    await page.click('button[type="submit"]')

    // assume app navigates to dashboard or shows success
    await expect(page.locator('text=Welcome')).toBeVisible({ timeout: 10000 })
  })

  test('oauth providers present (skipped if not configured)', async ({ page }) => {
    await page.goto('/auth/login')
    const githubConfigured = !!process.env.GITHUB_ID
    const googleConfigured = !!process.env.GOOGLE_CLIENT_ID

    if (!githubConfigured && !googleConfigured) test.skip('No OAuth providers configured')

    if (githubConfigured) {
      await expect(page.locator('button:has-text("Sign in with GitHub")')).toBeVisible()
    }

    if (googleConfigured) {
      await expect(page.locator('button:has-text("Sign in with Google")')).toBeVisible()
    }
  })
})
