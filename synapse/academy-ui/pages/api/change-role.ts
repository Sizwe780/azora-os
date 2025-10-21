import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"

const usersPath = path.resolve(process.cwd(), "backend/ledger/users.json")
const historyPath = path.resolve(process.cwd(), "backend/ledger/role-history.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
  const { email, role } = req.body
  if (!email || !role) return res.status(400).json({ error: "Missing fields" })
  let users: any[] = []
  try {
    if (fs.existsSync(usersPath)) users = JSON.parse(fs.readFileSync(usersPath, "utf8"))
    const idx = users.findIndex(u => u.email === email)
    if (idx === -1) return res.status(404).json({ error: "User not found" })
    users[idx].role = role
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), "utf8")
  } catch {}
  let history: any[] = []
  try {
    if (fs.existsSync(historyPath)) history = JSON.parse(fs.readFileSync(historyPath, "utf8"))
  } catch {}
  history.push({ email, newRole: role, timestamp: Date.now() })
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), "utf8")
  res.status(200).json({ ok: true })
}