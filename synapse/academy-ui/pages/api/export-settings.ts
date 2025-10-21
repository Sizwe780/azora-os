import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"
import cookie from "cookie"

const settingsPath = path.resolve(process.cwd(), "backend/ledger/user-settings.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = cookie.parse(req.headers.cookie || "")
  const email = cookies.email
  let settings: any[] = []
  try {
    if (fs.existsSync(settingsPath)) settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"))
  } catch {}
  const userSettings = settings.find(s => s.email === email)
  if (!userSettings) return res.status(404).json({ error: "No settings found" })
  res.setHeader("Content-Type", "application/json")
  res.setHeader("Content-Disposition", `attachment; filename=settings-${email}.json`)
  res.status(200).send(JSON.stringify(userSettings, null, 2))
}