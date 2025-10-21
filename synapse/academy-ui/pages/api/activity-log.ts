import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"
import cookie from "cookie"

const logPath = path.resolve(process.cwd(), "backend/ledger/activity-log.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = cookie.parse(req.headers.cookie || "")
  const email = cookies.email || "anonymous"
  let log: any[] = []
  try {
    if (fs.existsSync(logPath)) log = JSON.parse(fs.readFileSync(logPath, "utf8"))
  } catch {}
  if (req.method === "POST") {
    const { action, details } = req.body
    log.push({ email, action, details, timestamp: Date.now() })
    fs.writeFileSync(logPath, JSON.stringify(log, null, 2), "utf8")
    return res.status(200).json({ ok: true })
  }
  if (req.method === "GET") {
    const userLog = log.filter(entry => entry.email === email)
    return res.status(200).json(userLog)
  }
  res.status(405).json({ error: "Method not allowed" })
}