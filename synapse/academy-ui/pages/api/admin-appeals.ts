import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"
import { AzoraBlockchain } from "../../../../backend/ledger/cryptoLedger"

const appealsPath = path.resolve(process.cwd(), "backend/ledger/appeals.json")
const blockchain = new AzoraBlockchain(path.resolve(process.cwd(), "backend/ledger/azora-blockchain.json"))

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { id, resolution } = req.body
    let appeals: any[] = []
    try {
      if (fs.existsSync(appealsPath)) {
        appeals = JSON.parse(fs.readFileSync(appealsPath, "utf8"))
      }
    } catch {}
    const idx = appeals.findIndex(a => a.id === id)
    if (idx === -1) return res.status(404).json({ error: "Appeal not found" })
    appeals[idx].status = "Resolved"
    appeals[idx].resolution = resolution
    appeals[idx].resolvedAt = Date.now()
    fs.writeFileSync(appealsPath, JSON.stringify(appeals, null, 2), "utf8")
    // Log resolution to blockchain for audit
    blockchain.addEntry(`appeal-resolution-${id}`, {
      type: "appeal-resolution",
      ...appeals[idx]
    })
    return res.status(200).json({ ok: true })
  }
  res.status(405).json({ error: "Method not allowed" })
}