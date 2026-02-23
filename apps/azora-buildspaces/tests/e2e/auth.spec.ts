import { test, expect } from '@playwright/test'

test.describe('Auth flows', () => {
  test('signup and login with email', async ({ page, baseURL }) => {
    await page.goto('/auth/signup')
    await expect(page).toHaveURL(/auth\/signup/)

    // try to fill and submit a signup form (form ids may vary)
    const uniqueEmail = `test+${Date.now()}@example.com`
    await page.fill('input[name="email"]', uniqueEmail)
    await page.fill('input[name="password"]', 'Test1234!')
    await page.fill('input[name="confirmPassword"]', 'Test1234!')
    // make sure terms checkbox exists and click it if present
    const terms = page.locator('input[type=checkbox][name=acceptTerms]')
    if (await terms.count()) {
      await terms.check()
    }
    await page.click('button[type="submit"]')

    // assume app navigates to dashboard or shows success
    await expect(page.locator('text=Welcome')).toBeVisible({ timeout: 10000 })

    // after signing up we should be able to log out and then log back in
    // (logout button selector may vary)
    if (await page.locator('button:has-text("Logout")').count()) {
      await page.click('button:has-text("Logout")')
    }

    await page.goto('/auth/login')
    await page.fill('input[name="email"]', uniqueEmail)
    await page.fill('input[name="password"]', 'Test1234!')
    await page.click('button[type="submit"]')
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

  test('shows validation errors on bad signup inputs', async ({ page }) => {
    await page.goto('/auth/signup')
    // leave fields empty and submit
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Name is required')).toBeVisible()

    // fill mismatched passwords
    await page.fill('input[name="name"]', 'Foo')
    await page.fill('input[name="email"]', 'foo@example.com')
    await page.fill('input[name="password"]', 'abc12345')
    await page.fill('input[name="confirmPassword"]', 'different')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Passwords do not match')).toBeVisible()
  })

  test('cannot register twice with same email', async ({ page }) => {
    const email = `dup${Date.now()}@example.com`
    await page.goto('/auth/signup')
    await page.fill('input[name="name"]', 'Dup')
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="password"]', 'Test1234!')
    await page.fill('input[name="confirmPassword"]', 'Test1234!')
    const terms = page.locator('input[type=checkbox][name=acceptTerms]')
    if (await terms.count()) await terms.check()
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Welcome')).toBeVisible({ timeout: 10000 })
    // logout then attempt signup again
    if (await page.locator('button:has-text("Logout")').count()) {
      await page.click('button:has-text("Logout")')
    }
    await page.goto('/auth/signup')
    await page.fill('input[name="name"]', 'Dup2')
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="password"]', 'Test1234!')
    await page.fill('input[name="confirmPassword"]', 'Test1234!')
    if (await terms.count()) await terms.check()
    await page.click('button[type="submit"]')
    await expect(page.locator('text=User already exists')).toBeVisible()
  })
})
