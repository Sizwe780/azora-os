import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"
import { AzoraBlockchain } from "../../../../backend/ledger/cryptoLedger"

const appealsPath = path.resolve(process.cwd(), "backend/ledger/appeals.json")
const blockchain = new AzoraBlockchain(path.resolve(process.cwd(), "backend/ledger/azora-blockchain.json"))

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    let appeals: any[] = []
    try {
      if (fs.existsSync(appealsPath)) {
        appeals = JSON.parse(fs.readFileSync(appealsPath, "utf8"))
      }
    } catch {}
    return res.status(200).json(appeals)
  }
  if (req.method === "POST") {
    let appeals: any[] = []
    try {
      if (fs.existsSync(appealsPath)) {
        appeals = JSON.parse(fs.readFileSync(appealsPath, "utf8"))
      }
    } catch {}
    const appeal = {
      id: `appeal-${Date.now()}`,
      ...req.body,
      status: "Pending",
      timestamp: Date.now()
    }
    appeals.push(appeal)
    fs.writeFileSync(appealsPath, JSON.stringify(appeals, null, 2), "utf8")
    // Log appeal to blockchain for audit
    blockchain.addEntry(`appeal-${appeal.id}`, {
      type: "exam-appeal",
      ...appeal
    })
    return res.status(200).json({ ok: true })
  }
  res.status(405).json({ error: "Method not allowed" })
}