import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"
import cookie from "cookie"

const settingsPath = path.resolve(process.cwd(), "backend/ledger/notification-settings.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = cookie.parse(req.headers.cookie || "")
  const email = cookies.email
  let settings: any[] = []
  try {
    if (fs.existsSync(settingsPath)) settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"))
  } catch {}
  if (req.method === "GET") {
    const userSettings = settings.find(s => s.email === email) || { email, enabled: true }
    return res.status(200).json(userSettings)
  }
  if (req.method === "POST") {
    const { enabled } = req.body
    let idx = settings.findIndex(s => s.email === email)
    if (idx === -1) settings.push({ email, enabled })
    else settings[idx].enabled = enabled
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), "utf8")
    return res.status(200).json({ ok: true })
  }
  res.status(405).json({ error: "Method not allowed" })
}