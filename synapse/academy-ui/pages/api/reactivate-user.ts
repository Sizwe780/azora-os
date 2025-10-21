import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"
import cookie from "cookie"

const usersPath = path.resolve(process.cwd(), "backend/ledger/users.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
  const cookies = cookie.parse(req.headers.cookie || "")
  const adminEmail = cookies.email
  const { email } = req.body
  if (!email) return res.status(400).json({ error: "Missing email" })
  let users: any[] = []
  try {
    if (fs.existsSync(usersPath)) users = JSON.parse(fs.readFileSync(usersPath, "utf8"))
    const admin = users.find(u => u.email === adminEmail)
    if (!admin || admin.role !== "admin") return res.status(403).json({ error: "Forbidden" })
    const idx = users.findIndex(u => u.email === email)
    if (idx === -1) return res.status(404).json({ error: "User not found" })
    users[idx].deactivated = false
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), "utf8")
  } catch {}
  res.status(200).json({ ok: true })
}