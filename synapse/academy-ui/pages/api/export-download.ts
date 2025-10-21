import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"

const exportDir = path.resolve(process.cwd(), "backend/exports")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { file } = req.query
  if (!file) return res.status(400).json({ error: "Missing file parameter" })
  const filePath = path.join(exportDir, file as string)
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found" })
  res.setHeader("Content-Type", "text/csv")
  res.setHeader("Content-Disposition", `attachment; filename=${file}`)
  res.status(200).send(fs.readFileSync(filePath))
}