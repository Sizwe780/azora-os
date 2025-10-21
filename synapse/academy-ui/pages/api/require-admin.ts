import type { NextApiRequest, NextApiResponse } from "next"
import cookie from "cookie"
import path from "path"
import fs from "fs"

const usersPath = path.resolve(process.cwd(), "backend/ledger/users.json")

export default function requireAdmin(req: NextApiRequest, res: NextApiResponse, next: Function) {
  const cookies = cookie.parse(req.headers.cookie || "")
  const email = cookies.email
  let users: any[] = []
  try {
    if (fs.existsSync(usersPath)) users = JSON.parse(fs.readFileSync(usersPath, "utf8"))
  } catch {}
  const user = users.find(u => u.email === email)
  if (!user || user.role !== "admin") return res.status(403).json({ error: "Forbidden" })
  next()
}