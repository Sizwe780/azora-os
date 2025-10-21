import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"

const auditPath = path.resolve(process.cwd(), "backend/exports/notification-audit.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  let audit: any[] = []
  try {
    if (fs.existsSync(auditPath)) {
      audit = JSON.parse(fs.readFileSync(auditPath, "utf8"))
    }
  } catch {}
  res.status(200).json(audit)
}