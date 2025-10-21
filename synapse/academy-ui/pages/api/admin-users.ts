import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"

const usersPath = path.resolve(process.cwd(), "backend/ledger/users.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  let users: any[] = []
  try {
    if (fs.existsSync(usersPath)) users = JSON.parse(fs.readFileSync(usersPath, "utf8"))
  } catch {}
  const admins = users.filter(u => u.role === "admin")
  res.status(200).json(admins)
}