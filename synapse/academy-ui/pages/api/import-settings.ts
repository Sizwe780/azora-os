import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"
import cookie from "cookie"

const settingsPath = path.resolve(process.cwd(), "backend/ledger/user-settings.json")

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
  const cookies = cookie.parse(req.headers.cookie || "")
  const email = cookies.email
  const { settings } = req.body
  if (!email || !settings) return res.status(400).json({ error: "Missing fields" })
  let allSettings: any[] = []
  try {
    if (fs.existsSync(settingsPath)) allSettings = JSON.parse(fs.readFileSync(settingsPath, "utf8"))
    let idx = allSettings.findIndex(s => s.email === email)
    if (idx === -1) allSettings.push({ ...settings, email })
    else allSettings[idx] = { ...settings, email }
    fs.writeFileSync(settingsPath, JSON.stringify(allSettings, null, 2), "utf8")
  } catch {}
  res.status(200).json({ ok: true })
}