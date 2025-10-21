import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"
import cookie from "cookie"

const notifPath = path.resolve(process.cwd(), "backend/ledger/notifications.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = cookie.parse(req.headers.cookie || "")
  const email = cookies.email
  let notifications: any[] = []
  try {
    if (fs.existsSync(notifPath)) notifications = JSON.parse(fs.readFileSync(notifPath, "utf8"))
  } catch {}
  if (req.method === "POST") {
    const { message } = req.body
    if (!email || !message) return res.status(400).json({ error: "Missing fields" })
    notifications.push({ email, message, timestamp: Date.now(), read: false })
    fs.writeFileSync(notifPath, JSON.stringify(notifications, null, 2), "utf8")
    return res.status(200).json({ ok: true })
  }
  if (req.method === "GET") {
    const userNotifs = notifications.filter(n => n.email === email)
    return res.status(200).json(userNotifs)
  }
  if (req.method === "PATCH") {
    const { id } = req.body
    const idx = notifications.findIndex(n => n.email === email && n.timestamp === id)
    if (idx !== -1) notifications[idx].read = true
    fs.writeFileSync(notifPath, JSON.stringify(notifications, null, 2), "utf8")
    return res.status(200).json({ ok: true })
  }
  res.status(405).json({ error: "Method not allowed" })
}