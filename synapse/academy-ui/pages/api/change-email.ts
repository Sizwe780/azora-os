import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"
import cookie from "cookie"

const usersPath = path.resolve(process.cwd(), "backend/ledger/users.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
  const cookies = cookie.parse(req.headers.cookie || "")
  const oldEmail = cookies.email
  const { newEmail } = req.body
  if (!oldEmail || !newEmail) return res.status(400).json({ error: "Missing email" })
  let users: any[] = []
  try {
    if (fs.existsSync(usersPath)) users = JSON.parse(fs.readFileSync(usersPath, "utf8"))
    const idx = users.findIndex(u => u.email === oldEmail)
    if (idx === -1) return res.status(404).json({ error: "User not found" })
    if (users.find(u => u.email === newEmail)) return res.status(409).json({ error: "Email already in use" })
    users[idx].email = newEmail
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), "utf8")
    res.setHeader("Set-Cookie", cookie.serialize("email", newEmail, { path: "/", httpOnly: false }))
  } catch {}
  res.status(200).json({ ok: true })
}