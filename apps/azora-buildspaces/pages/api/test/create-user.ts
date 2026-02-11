import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

const isEnabled = process.env.ENABLE_TEST_API === 'true' || process.env.NODE_ENV !== 'production'
const tmpDir = path.join(process.cwd(), '.tmp')
const usersFile = path.join(tmpDir, 'test-users.json')

function ensureTmp() {
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isEnabled) {
    return res.status(404).json({ error: 'Test API endpoints are disabled' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' })
  }

  const { email, password, name } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' })
  }

  ensureTmp()

  let users: any[] = []
  try {
    if (fs.existsSync(usersFile)) {
      users = JSON.parse(fs.readFileSync(usersFile, 'utf8'))
    }
  } catch (e) {
    users = []
  }

  const user = { id: Date.now().toString(), email, name: name || '', createdAt: new Date().toISOString() }
  users.push(user)
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf8')

  res.status(201).json({ created: true, user })
}
