import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"

const auditPath = path.resolve(process.cwd(), "backend/exports/notification-audit.json")
const backupPath = path.resolve(process.cwd(), "backend/exports/notification-audit-backup.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
  const { indices } = req.body
  if (!Array.isArray(indices)) return res.status(400).json({ error: "Missing indices" })
  let audit: any[] = []
  try {
    if (fs.existsSync(auditPath)) {
      fs.copyFileSync(auditPath, backupPath)
    }
    audit = audit.filter((_, idx) => !indices.includes(idx))
    fs.writeFileSync(auditPath, JSON.stringify(audit, null, 2), "utf8")
  } catch {}
  res.status(200).json({ ok: true })
}