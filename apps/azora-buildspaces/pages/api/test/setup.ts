import type { NextApiRequest, NextApiResponse } from 'next'

const isEnabled = process.env.ENABLE_TEST_API === 'true' || process.env.NODE_ENV !== 'production'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isEnabled) {
    return res.status(404).json({ error: 'Test API endpoints are disabled' })
  }

  // Simple readiness endpoint for Playwright globalSetup
  res.status(200).json({ ok: true, timestamp: Date.now() })
}
