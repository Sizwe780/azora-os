import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

const isEnabled = process.env.ENABLE_TEST_API === 'true' || process.env.NODE_ENV !== 'production'
const tmpDir = path.join(process.cwd(), '.tmp')
const usersFile = path.join(tmpDir, 'test-users.json')

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isEnabled) {
    return res.status(404).json({ error: 'Test API endpoints are disabled' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' })
  }

  try {
    if (fs.existsSync(usersFile)) fs.unlinkSync(usersFile)
  } catch (e) {
    // ignore
  }

  res.status(200).json({ cleaned: true })
}
