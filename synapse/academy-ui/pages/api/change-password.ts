import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"
import crypto from "crypto"
import cookie from "cookie"

const usersPath = path.resolve(process.cwd(), "backend/ledger/users.json")
function hash(pw: string) {
  return crypto.createHash("sha256").update(pw).digest("hex")
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
  const cookies = cookie.parse(req.headers.cookie || "")
  const email = cookies.email
  const { oldPassword, newPassword } = req.body
  if (!email || !oldPassword || !newPassword) return res.status(400).json({ error: "Missing fields" })
  let users: any[] = []
  try {
    if (fs.existsSync(usersPath)) users = JSON.parse(fs.readFileSync(usersPath, "utf8"))
    const idx = users.findIndex(u => u.email === email)
    if (idx === -1) return res.status(404).json({ error: "User not found" })
    if (users[idx].password !== hash(oldPassword)) return res.status(401).json({ error: "Incorrect password" })
    users[idx].password = hash(newPassword)
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), "utf8")
  } catch {}
  res.status(200).json({ ok: true })
}