import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"

const requestsPath = path.resolve(process.cwd(), "backend/ledger/student-requests.json")
const usersPath = path.resolve(process.cwd(), "backend/ledger/users.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
  const { email } = req.body
  if (!email) return res.status(400).json({ error: "Missing email" })
  let requests: any[] = []
  let users: any[] = []
  try {
    if (fs.existsSync(requestsPath)) requests = JSON.parse(fs.readFileSync(requestsPath, "utf8"))
    if (fs.existsSync(usersPath)) users = JSON.parse(fs.readFileSync(usersPath, "utf8"))
    const reqIdx = requests.findIndex(r => r.email === email)
    if (reqIdx === -1) return res.status(404).json({ error: "Request not found" })
    requests[reqIdx].status = "approved"
    const userIdx = users.findIndex(u => u.email === email)
    if (userIdx !== -1) users[userIdx].role = "student"
    fs.writeFileSync(requestsPath, JSON.stringify(requests, null, 2), "utf8")
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), "utf8")
  } catch {}
  res.status(200).json({ ok: true })
}