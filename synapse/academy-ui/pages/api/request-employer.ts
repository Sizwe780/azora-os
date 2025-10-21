import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"
import cookie from "cookie"

const requestsPath = path.resolve(process.cwd(), "backend/ledger/employer-requests.json")
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
  if (!user || user.role === "employer") return res.status(409).json({ error: "Already employer" })
  let requests: any[] = []
  try {
    if (fs.existsSync(requestsPath)) requests = JSON.parse(fs.readFileSync(requestsPath, "utf8"))
  } catch {}
  if (requests.find(r => r.email === email)) return res.status(409).json({ error: "Request pending" })
  requests.push({ email, timestamp: Date.now(), status: "pending" })
  fs.writeFileSync(requestsPath, JSON.stringify(requests, null, 2), "utf8")
  res.status(200).json({ ok: true })
}