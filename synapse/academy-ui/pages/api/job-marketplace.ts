import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"

const jobsPath = path.resolve(process.cwd(), "backend/ledger/jobs.json")
const applicationsPath = path.resolve(process.cwd(), "backend/ledger/job-applications.json")

function getJobs() {
  let jobs = [
    { id: "job-1", title: "Junior Software Engineer", company: "TechCorp", location: "Remote", description: "Entry-level developer, Python/JS." },
    { id: "job-2", title: "Cloud DevOps Intern", company: "Cloudify", location: "Cape Town", description: "Assist with cloud deployments." },
    { id: "job-3", title: "AI Research Assistant", company: "AI Labs", location: "Johannesburg", description: "Support ML projects." }
  ]
  try {
    if (fs.existsSync(jobsPath)) {
      jobs = JSON.parse(fs.readFileSync(jobsPath, "utf8"))
    }
  } catch {}
  return jobs
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.status(200).json(getJobs())
  }
  if (req.method === "POST") {
    const { jobId } = req.body
    let applications: any[] = []
    try {
      if (fs.existsSync(applicationsPath)) {
        applications = JSON.parse(fs.readFileSync(applicationsPath, "utf8"))
      }
    } catch {}
    applications.push({ jobId, timestamp: Date.now() })
    fs.writeFileSync(applicationsPath, JSON.stringify(applications, null, 2), "utf8")
    return res.status(200).json({ ok: true })
  }
  res.status(405).json({ error: "Method not allowed" })
}