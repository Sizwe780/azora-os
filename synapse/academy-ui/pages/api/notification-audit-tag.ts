import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"

const auditPath = path.resolve(process.cwd(), "backend/exports/notification-audit.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
  const { idx, tag } = req.body
  if (typeof idx !== "number" || !tag) return res.status(400).json({ error: "Missing idx or tag" })
  let audit: any[] = []
  try {
    if (fs.existsSync(auditPath)) {
      audit = JSON.parse(fs.readFileSync(auditPath, "utf8"))
      if (audit[idx]) audit[idx].tag = tag
      fs.writeFileSync(auditPath, JSON.stringify(audit, null, 2), "utf8")
    }
  } catch {}
  res.status(200).json({ ok: true })
}