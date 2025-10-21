import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"

const jobsPath = path.resolve(process.cwd(), "backend/ledger/jobs.json")
const applicationsPath = path.resolve(process.cwd(), "backend/ledger/job-applications.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  let jobs: any[] = []
  let applications: any[] = []
  try {
    if (fs.existsSync(jobsPath)) {
      jobs = JSON.parse(fs.readFileSync(jobsPath, "utf8"))
    }
    if (fs.existsSync(applicationsPath)) {
      applications = JSON.parse(fs.readFileSync(applicationsPath, "utf8"))
    }
  } catch {}
  const totalJobs = jobs.length
  const totalApplications = applications.length
  const applicationsPerJob = totalJobs > 0 ? (totalApplications / totalJobs).toFixed(2) : "0"
  res.status(200).json({
    totalJobs,
    totalApplications,
    applicationsPerJob,
    jobs,
    applications
  })
}