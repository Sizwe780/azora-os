import { test, expect } from '@playwright/test'

// verify the plugin tool registry endpoint

test.describe('Plugin Tools API', () => {
  test('GET /api/tools returns a list including design_to_code', async ({ request, baseURL }) => {
    const res = await request.get(`${baseURL}/api/tools`)
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(Array.isArray(body)).toBe(true)
    const names = body.map((t: any) => t.name)
    expect(names).toContain('design_to_code')
  })
})
