import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"

const prefsPath = path.resolve(process.cwd(), "backend/exports/admin-notification-preferences.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    let prefs = { email: true, slack: false, sms: false }
    try {
      if (fs.existsSync(prefsPath)) {
        prefs = JSON.parse(fs.readFileSync(prefsPath, "utf8"))
      }
    } catch {}
    return res.status(200).json(prefs)
  }
  if (req.method === "POST") {
    fs.writeFileSync(prefsPath, JSON.stringify(req.body, null, 2), "utf8")
    return res.status(200).json({ ok: true })
  }
  res.status(405).json({ error: "Method not allowed" })
}