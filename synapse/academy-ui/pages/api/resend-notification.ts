import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"
import { execSync } from "child_process"

const historyPath = path.resolve(process.cwd(), "backend/exports/export-history.json")
const exportDir = path.resolve(process.cwd(), "backend/exports")
const adminEmail = "admin@azora.local" // Set your admin email here

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
  const { file } = req.body
  if (!file) return res.status(400).json({ error: "Missing file parameter" })
  const filePath = path.join(exportDir, file)
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found" })
  const subject = "Azora Regulatory Report Notification (Resent)"
  const body = `Regulatory report resent:\n${filePath}\n\nTimestamp: ${new Date().toISOString()}`
  try {
    execSync(`echo "${body}" | mail -s "${subject}" ${adminEmail}`)
    // Optionally update history
    let history: any[] = []
    if (fs.existsSync(historyPath)) {
      history = JSON.parse(fs.readFileSync(historyPath, "utf8"))
      const idx = history.findIndex(h => h.file === file)
      if (idx !== -1) history[idx].notified = true
      fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), "utf8")
    }
    return res.status(200).json({ ok: true })
  } catch (err) {
    return res.status(500).json({ error: "Notification failed" })
  }
}