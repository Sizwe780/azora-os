import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"

const auditPath = path.resolve(process.cwd(), "backend/exports/notification-audit.json")
const backupPath = path.resolve(process.cwd(), "backend/exports/notification-audit-backup.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
  try {
    if (fs.existsSync(backupPath)) {
      const backup = fs.readFileSync(backupPath, "utf8")
      fs.writeFileSync(auditPath, backup, "utf8")
      return res.status(200).json({ ok: true })
    }
    return res.status(404).json({ error: "No backup found" })
  } catch {
    return res.status(500).json({ error: "Restore failed" })
  }
}