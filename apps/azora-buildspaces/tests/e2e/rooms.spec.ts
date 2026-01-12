import { test, expect } from '@playwright/test'

test.describe('Room smoke tests', () => {
  test('Code Chamber loads and editor is visible', async ({ page }) => {
    await page.goto('/features/code-chamber')
    await expect(page.locator('[data-testid="monaco-editor"]')).toBeVisible({ timeout: 10000 })
  })

  test('Spec Chamber loads and create spec works', async ({ page }) => {
    await page.goto('/features/spec-chamber')
    await expect(page.locator('text=Create Spec')).toBeVisible({ timeout: 10000 })
  })
})
