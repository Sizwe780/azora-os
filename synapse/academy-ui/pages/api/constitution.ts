import type { NextApiRequest, NextApiResponse } from "next"
import fs from "fs"
import path from "path"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const filePath = path.resolve(process.cwd(), "../../../codex/constitution/AZORA_CONSTITUTION.md")
  const content = fs.readFileSync(filePath, "utf8")
  res.setHeader("Content-Type", "text/plain")
  res.status(200).send(content)
}