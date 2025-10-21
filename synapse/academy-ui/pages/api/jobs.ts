import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"

const jobsPath = path.resolve(process.cwd(), "backend/ledger/jobs.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  let jobs: any[] = []
  try {
    if (fs.existsSync(jobsPath)) jobs = JSON.parse(fs.readFileSync(jobsPath, "utf8"))
  } catch {}
  res.status(200).json(jobs)
}