import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"
import cookie from "cookie"

const historyPath = path.resolve(process.cwd(), "backend/ledger/settings-history.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = cookie.parse(req.headers.cookie || "")
  const email = cookies.email
  let history: any[] = []
  try {
    if (fs.existsSync(historyPath)) history = JSON.parse(fs.readFileSync(historyPath, "utf8"))
  } catch {}
  if (req.method === "POST") {
    const { changes } = req.body
    if (!email || !changes) return res.status(400).json({ error: "Missing fields" })
    history.push({ email, changes, timestamp: Date.now() })
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), "utf8")
    return res.status(200).json({ ok: true })
  }
  if (req.method === "GET") {
    const userHistory = history.filter(h => h.email === email)
    return res.status(200).json(userHistory)
  }
  res.status(405).json({ error: "Method not allowed" })
}