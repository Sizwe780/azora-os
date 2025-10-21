import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"
import cookie from "cookie"

const enrollPath = path.resolve(process.cwd(), "backend/ledger/course-enrollments.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = cookie.parse(req.headers.cookie || "")
  const email = cookies.email
  if (!email) return res.status(401).json({ error: "Not logged in" })
  let enrollments: any[] = []
  try {
    if (fs.existsSync(enrollPath)) enrollments = JSON.parse(fs.readFileSync(enrollPath, "utf8"))
  } catch {}
  if (req.method === "POST") {
    const { courseId } = req.body
    if (!courseId) return res.status(400).json({ error: "Missing courseId" })
    if (enrollments.find(e => e.email === email && e.courseId === courseId))
      return res.status(409).json({ error: "Already enrolled" })
    enrollments.push({ email, courseId, timestamp: Date.now() })
    fs.writeFileSync(enrollPath, JSON.stringify(enrollments, null, 2), "utf8")
    return res.status(200).json({ ok: true })
  }
  if (req.method === "GET") {
    const userEnrollments = enrollments.filter(e => e.email === email)
    return res.status(200).json(userEnrollments)
  }
  res.status(405).json({ error: "Method not allowed" })
}