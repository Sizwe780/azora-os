import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"
import crypto from "crypto"

const usersPath = path.resolve(process.cwd(), "backend/ledger/users.json")
const resetPath = path.resolve(process.cwd(), "backend/ledger/password-resets.json")

function hash(pw: string) {
  return crypto.createHash("sha256").update(pw).digest("hex")
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
  const { email, token, newPassword } = req.body
  if (!email || !token || !newPassword) return res.status(400).json({ error: "Missing fields" })
  let resets: any[] = []
  try {
    if (fs.existsSync(resetPath)) resets = JSON.parse(fs.readFileSync(resetPath, "utf8"))
  } catch {}
  const reset = resets.find(r => r.email === email && r.token === token)
  if (!reset) return res.status(400).json({ error: "Invalid token" })
  let users: any[] = []
  try {
    if (fs.existsSync(usersPath)) users = JSON.parse(fs.readFileSync(usersPath, "utf8"))
    const idx = users.findIndex(u => u.email === email)
    if (idx === -1) return res.status(404).json({ error: "User not found" })
    users[idx].password = hash(newPassword)
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), "utf8")
    // Remove used token
    resets = resets.filter(r => !(r.email === email && r.token === token))
    fs.writeFileSync(resetPath, JSON.stringify(resets, null, 2), "utf8")
  } catch {}
  res.status(200).json({ ok: true })
}