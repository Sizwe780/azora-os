import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"
import cookie from "cookie"

const notifPath = path.resolve(process.cwd(), "backend/ledger/notifications.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
  const cookies = cookie.parse(req.headers.cookie || "")
  const email = cookies.email
  const { id } = req.body
  if (!email || !id) return res.status(400).json({ error: "Missing fields" })
  let notifications: any[] = []
  try {
    if (fs.existsSync(notifPath)) notifications = JSON.parse(fs.readFileSync(notifPath, "utf8"))
    notifications = notifications.filter(n => !(n.email === email && n.timestamp === id))
    fs.writeFileSync(notifPath, JSON.stringify(notifications, null, 2), "utf8")
  } catch {}
  res.status(200).json({ ok: true })
}