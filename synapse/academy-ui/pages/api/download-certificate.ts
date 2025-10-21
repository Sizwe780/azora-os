import type { NextApiRequest, NextApiResponse } from "next"
import cookie from "cookie"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = cookie.parse(req.headers.cookie || "")
  const email = cookies.email
  const { courseId } = req.query
  if (!email || !courseId) return res.status(400).json({ error: "Missing parameters" })
  const cert = `Certificate of Completion\n\nUser: ${email}\nCourse: ${courseId}\nDate: ${new Date().toLocaleDateString()}`
  res.setHeader("Content-Type", "text/plain")
  res.setHeader("Content-Disposition", `attachment; filename=certificate-${courseId}.txt`)
  res.status(200).send(cert)
}