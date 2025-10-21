import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"

const requestsPath = path.resolve(process.cwd(), "backend/ledger/alumni-requests.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  let requests: any[] = []
  try {
    if (fs.existsSync(requestsPath)) requests = JSON.parse(fs.readFileSync(requestsPath, "utf8"))
  } catch {}
  res.status(200).json(requests)
}