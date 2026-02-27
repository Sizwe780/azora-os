import { test, expect } from '@playwright/test'

const base = process.env.E2E_BASE_URL || 'http://localhost:3000'

test.describe('Phoenix Resume', () => {
  test.skip(!process.env.FIREBASE_SERVICE_ACCOUNT_JSON, 'Requires Firestore credentials')

  test('rehydrates reasoning trace after hard refresh', async ({ page }) => {
    await page.goto(`${base}/workspace?room=command-desk`)

    const input = page.locator('textarea')
    await expect(input).toBeVisible({ timeout: 10000 })
    await input.fill('Phoenix resume test')
    await input.press('Enter')

    await expect(page.locator('text=Starting')).toBeVisible({ timeout: 20000 })

    await page.reload()

    await expect(page.locator('text=Starting')).toBeVisible({ timeout: 20000 })
    await expect(page.locator('[data-testid="sync-dot"]')).toBeVisible({ timeout: 10000 })
  })
})