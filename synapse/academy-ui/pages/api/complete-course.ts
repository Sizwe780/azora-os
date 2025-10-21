import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"
import cookie from "cookie"

const completionPath = path.resolve(process.cwd(), "backend/ledger/course-completions.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = cookie.parse(req.headers.cookie || "")
  const email = cookies.email
  if (!email) return res.status(401).json({ error: "Not logged in" })
  let completions: any[] = []
  try {
    if (fs.existsSync(completionPath)) completions = JSON.parse(fs.readFileSync(completionPath, "utf8"))
  } catch {}
  if (req.method === "POST") {
    const { courseId } = req.body
    if (!courseId) return res.status(400).json({ error: "Missing courseId" })
    if (completions.find(c => c.email === email && c.courseId === courseId))
      return res.status(409).json({ error: "Already completed" })
    completions.push({ email, courseId, timestamp: Date.now() })
    fs.writeFileSync(completionPath, JSON.stringify(completions, null, 2), "utf8")
    return res.status(200).json({ ok: true })
  }
  if (req.method === "GET") {
    const userCompletions = completions.filter(c => c.email === email)
    return res.status(200).json(userCompletions)
  }
  res.status(405).json({ error: "Method not allowed" })
}