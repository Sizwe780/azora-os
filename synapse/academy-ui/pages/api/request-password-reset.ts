import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"
import crypto from "crypto"

const usersPath = path.resolve(process.cwd(), "backend/ledger/users.json")
const resetPath = path.resolve(process.cwd(), "backend/ledger/password-resets.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
  const { email } = req.body
  if (!email) return res.status(400).json({ error: "Missing email" })
  let users: any[] = []
  try {
    if (fs.existsSync(usersPath)) users = JSON.parse(fs.readFileSync(usersPath, "utf8"))
  } catch {}
  if (!users.find(u => u.email === email)) return res.status(404).json({ error: "User not found" })
  const token = crypto.randomBytes(24).toString("hex")
  let resets: any[] = []
  try {
    if (fs.existsSync(resetPath)) resets = JSON.parse(fs.readFileSync(resetPath, "utf8"))
  } catch {}
  resets.push({ email, token, timestamp: Date.now() })
  fs.writeFileSync(resetPath, JSON.stringify(resets, null, 2), "utf8")
  // In production, send email here. For dev, just return the token.
  res.status(200).json({ ok: true, token })
}