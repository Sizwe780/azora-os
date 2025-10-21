import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"

const jobsPath = path.resolve(process.cwd(), "backend/ledger/jobs.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    let jobs: any[] = []
    try {
      if (fs.existsSync(jobsPath)) {
        jobs = JSON.parse(fs.readFileSync(jobsPath, "utf8"))
      }
    } catch {}
    const job = { ...req.body, id: `job-${Date.now()}` }
    jobs.push(job)
    fs.writeFileSync(jobsPath, JSON.stringify(jobs, null, 2), "utf8")
    return res.status(200).json({ ok: true })
  }
  res.status(405).json({ error: "Method not allowed" })
}