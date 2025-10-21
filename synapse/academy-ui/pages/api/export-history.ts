import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"

const exportDir = path.resolve(process.cwd(), "backend/exports")
const historyPath = path.resolve(process.cwd(), "backend/exports/export-history.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  let history: any[] = []
  try {
    if (fs.existsSync(historyPath)) {
      history = JSON.parse(fs.readFileSync(historyPath, "utf8"))
    } else if (fs.existsSync(exportDir)) {
      // Fallback: scan exportDir for files
      const files = fs.readdirSync(exportDir)
      history = files.map(file => ({
        file,
        timestamp: fs.statSync(path.join(exportDir, file)).mtimeMs,
        notified: false
      }))
    }
  } catch {}
  res.status(200).json(history)
}