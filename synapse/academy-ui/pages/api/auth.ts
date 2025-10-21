import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"
import crypto from "crypto"

const usersPath = path.resolve(process.cwd(), "backend/ledger/users.json")

function hash(pw: string) {
  return crypto.createHash("sha256").update(pw).digest("hex")
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  let users: any[] = []
  try {
    if (fs.existsSync(usersPath)) users = JSON.parse(fs.readFileSync(usersPath, "utf8"))
  } catch {}
  if (req.method === "POST") {
    const { email, password, action } = req.body
    if (!email || !password) return res.status(400).json({ error: "Missing fields" })
    if (action === "register") {
      if (users.find(u => u.email === email)) return res.status(409).json({ error: "Exists" })
      users.push({ email, password: hash(password), role: "student" })
      fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), "utf8")
      return res.status(200).json({ ok: true })
    }
    if (action === "login") {
      const user = users.find(u => u.email === email && u.password === hash(password))
      if (!user) return res.status(401).json({ error: "Invalid" })
      return res.status(200).json({ ok: true, role: user.role })
    }
  }
  res.status(405).json({ error: "Method not allowed" })
}