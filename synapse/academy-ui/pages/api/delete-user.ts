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
    users = users.filter(u => u.email !== email)
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), "utf8")
  } catch {}
  res.setHeader("Set-Cookie", cookie.serialize("email", "", { path: "/", maxAge: 0 }))
  res.status(200).json({ ok: true })
}