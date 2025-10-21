import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"
import cookie from "cookie"

const jobsPath = path.resolve(process.cwd(), "backend/ledger/jobs.json")
const usersPath = path.resolve(process.cwd(), "backend/ledger/users.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = cookie.parse(req.headers.cookie || "")
  const email = cookies.email
  if (!email) return res.status(401).json({ error: "Not logged in" })
  let users: any[] = []
  try {
    if (fs.existsSync(usersPath)) users = JSON.parse(fs.readFileSync(usersPath, "utf8"))
  } catch {}
  const user = users.find(u => u.email === email)
  if (!user || user.role !== "employer") return res.status(403).json({ error: "Forbidden" })
  let jobs: any[] = []
  try {
    if (fs.existsSync(jobsPath)) jobs = JSON.parse(fs.readFileSync(jobsPath, "utf8"))
  } catch {}
  if (req.method === "POST") {
    const { title, description } = req.body
    if (!title || !description) return res.status(400).json({ error: "Missing fields" })
    const jobId = `job-${Date.now()}`
    jobs.push({ id: jobId, title, description, postedBy: email, timestamp: Date.now() })
    fs.writeFileSync(jobsPath, JSON.stringify(jobs, null, 2), "utf8")
    return res.status(200).json({ ok: true, jobId })
  }
  if (req.method === "GET") {
    const myJobs = jobs.filter(j => j.postedBy === email)
    return res.status(200).json(myJobs)
  }
  res.status(405).json({ error: "Method not allowed" })
}