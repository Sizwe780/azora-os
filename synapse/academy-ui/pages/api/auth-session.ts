import type { NextApiRequest, NextApiResponse } from "next"
import cookie from "cookie"
import path from "path"
import fs from "fs"

const usersPath = path.resolve(process.cwd(), "backend/ledger/users.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const cookies = cookie.parse(req.headers.cookie || "")
    const email = cookies.email
    let users: any[] = []
    try {
      if (fs.existsSync(usersPath)) users = JSON.parse(fs.readFileSync(usersPath, "utf8"))
    } catch {}
    const user = users.find(u => u.email === email)
    if (!user) return res.status(401).json({})
    return res.status(200).json(user)
  }
  if (req.method === "POST") {
    const { email } = req.body
    res.setHeader("Set-Cookie", cookie.serialize("email", email, { path: "/", httpOnly: false }))
    return res.status(200).json({ ok: true })
  }
  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", cookie.serialize("email", "", { path: "/", maxAge: 0 }))
    return res.status(200).json({ ok: true })
  }
  res.status(405).json({ error: "Method not allowed" })
}