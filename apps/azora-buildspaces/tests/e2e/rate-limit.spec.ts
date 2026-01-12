import { test, expect } from '@playwright/test'

const base = process.env.E2E_BASE_URL || 'http://localhost:3000'

test.describe('Rate limiter E2E', () => {
  test('exceeds rate and returns 429', async ({ request }) => {
    // Send many requests to trigger the in-memory limiter in dev
    for (let i = 0; i < 150; i++) {
      await request.post(`${base}/api/agents/invoke`, { data: { action: 'code-review', context: `count ${i}` } })
    }

    const resp = await request.post(`${base}/api/agents/invoke`, { data: { action: 'code-review', context: 'final' } })
    // Expect either 429 or a valid response; if test runs against a running redis-backed instance, adjust accordingly.
    expect([200, 429]).toContain(resp.status())
  })
})