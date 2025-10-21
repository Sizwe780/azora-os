import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"
import cookie from "cookie"

const notifPath = path.resolve(process.cwd(), "backend/ledger/notifications.json")
const usersPath = path.resolve(process.cwd(), "backend/ledger/users.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
  const cookies = cookie.parse(req.headers.cookie || "")
  const adminEmail = cookies.email
  const { message } = req.body
  if (!message) return res.status(400).json({ error: "Missing message" })
  let users: any[] = []
  try {
    if (fs.existsSync(usersPath)) users = JSON.parse(fs.readFileSync(usersPath, "utf8"))
    const admin = users.find(u => u.email === adminEmail)
    if (!admin || admin.role !== "admin") return res.status(403).json({ error: "Forbidden" })
  } catch {}
  let notifications: any[] = []
  try {
    if (fs.existsSync(notifPath)) notifications = JSON.parse(fs.readFileSync(notifPath, "utf8"))
  } catch {}
  users.forEach(u => {
    notifications.push({ email: u.email, message, timestamp: Date.now(), read: false })
  })
  fs.writeFileSync(notifPath, JSON.stringify(notifications, null, 2), "utf8")
  res.status(200).json({ ok: true })
}