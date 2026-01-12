import { test, expect } from '@playwright/test'

// These E2E tests assume the dev server is running at http://localhost:3000
const base = process.env.E2E_BASE_URL || 'http://localhost:3000'

test.describe('Agents E2E', () => {
  test('POST /api/agents/invoke returns constitutional verdict', async ({ request }) => {
    const resp = await request.post(`${base}/api/agents/invoke`, {
      data: { action: 'code-review', context: 'Please review my code' }
    })
    expect(resp.ok()).toBeTruthy()
    const json = await resp.json()
    expect(json.constitutionalVerdict).toBeDefined()
    expect(typeof json.constitutionalVerdict.allowed).toBe('boolean')
  })
})
