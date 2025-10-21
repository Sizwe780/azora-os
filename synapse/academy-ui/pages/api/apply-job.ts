import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"
import cookie from "cookie"

const jobsPath = path.resolve(process.cwd(), "backend/ledger/job-applications.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = cookie.parse(req.headers.cookie || "")
  const email = cookies.email
  if (!email) return res.status(401).json({ error: "Not logged in" })
  let applications: any[] = []
  try {
    if (fs.existsSync(jobsPath)) applications = JSON.parse(fs.readFileSync(jobsPath, "utf8"))
  } catch {}
  if (req.method === "POST") {
    const { jobId } = req.body
    if (!jobId) return res.status(400).json({ error: "Missing jobId" })
    if (applications.find(a => a.email === email && a.jobId === jobId))
      return res.status(409).json({ error: "Already applied" })
    applications.push({ email, jobId, timestamp: Date.now() })
    fs.writeFileSync(jobsPath, JSON.stringify(applications, null, 2), "utf8")
    return res.status(200).json({ ok: true })
  }
  if (req.method === "GET") {
    const userApps = applications.filter(a => a.email === email)
    return res.status(200).json(userApps)
  }
  res.status(405).json({ error: "Method not allowed" })
}