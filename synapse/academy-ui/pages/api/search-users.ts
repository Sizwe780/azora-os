import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"
import cookie from "cookie"

const usersPath = path.resolve(process.cwd(), "backend/ledger/users.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = cookie.parse(req.headers.cookie || "")
  const email = cookies.email
  let users: any[] = []
  try {
    if (fs.existsSync(usersPath)) users = JSON.parse(fs.readFileSync(usersPath, "utf8"))
  } catch {}
  const admin = users.find(u => u.email === email)
  if (!admin || admin.role !== "admin") return res.status(403).json({ error: "Forbidden" })
  const { q } = req.query
  if (!q) return res.status(200).json([])
  const results = users.filter(u =>
    u.email.includes(q as string) ||
    (u.name && u.name.toLowerCase().includes((q as string).toLowerCase()))
  )
  res.status(200).json(results)
}