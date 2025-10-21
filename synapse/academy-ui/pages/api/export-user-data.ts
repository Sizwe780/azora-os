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
  const user = users.find(u => u.email === email)
  if (!user) return res.status(404).json({ error: "User not found" })
  res.setHeader("Content-Type", "application/json")
  res.setHeader("Content-Disposition", `attachment; filename=user-data-${email}.json`)
  res.status(200).send(JSON.stringify(user, null, 2))
}