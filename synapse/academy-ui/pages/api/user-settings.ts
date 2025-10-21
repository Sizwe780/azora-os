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
  if (req.method === "GET") {
    const userSettings = settings.find(s => s.email === email) || { email, notificationEnabled: true }
    return res.status(200).json(userSettings)
  }
  if (req.method === "POST") {
    const { notificationEnabled, theme, language, timezone, dateFormat, timeFormat, profileVisible, displayName, avatarUrl, bio, socialLinks } = req.body
    let idx = settings.findIndex(s => s.email === email)
    if (idx === -1) settings.push({ email, notificationEnabled, theme, language, timezone, dateFormat, timeFormat, profileVisible, displayName, avatarUrl, bio, socialLinks })
    else {
      settings[idx].notificationEnabled = notificationEnabled
      if (theme) settings[idx].theme = theme
      if (language) settings[idx].language = language
      if (timezone) settings[idx].timezone = timezone
      if (dateFormat) settings[idx].dateFormat = dateFormat
      if (timeFormat) settings[idx].timeFormat = timeFormat
      if (typeof profileVisible === "boolean") settings[idx].profileVisible = profileVisible
      if (displayName) settings[idx].displayName = displayName
      if (avatarUrl) settings[idx].avatarUrl = avatarUrl
      if (bio !== undefined) settings[idx].bio = bio
      if (socialLinks) settings[idx].socialLinks = socialLinks
    }
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), "utf8")
    return res.status(200).json({ ok: true })
  }
  res.status(405).json({ error: "Method not allowed" })
}