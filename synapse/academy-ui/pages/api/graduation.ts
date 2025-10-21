import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"
import { AzoraBlockchain } from "../../../../backend/ledger/cryptoLedger"

const graduationPath = path.resolve(process.cwd(), "backend/ledger/graduation-requests.json")
const credentialsPath = path.resolve(process.cwd(), "backend/ledger/issued-credentials.json")
const blockchain = new AzoraBlockchain(path.resolve(process.cwd(), "backend/ledger/azora-blockchain.json"))

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    let requests: any[] = []
    try {
      if (fs.existsSync(graduationPath)) {
        requests = JSON.parse(fs.readFileSync(graduationPath, "utf8"))
      }
    } catch {}
    const request = { ...req.body, status: "Pending", timestamp: Date.now() }
    requests.push(request)
    fs.writeFileSync(graduationPath, JSON.stringify(requests, null, 2), "utf8")
    blockchain.addEntry(`graduation-request-${request.studentId}-${Date.now()}`, {
      type: "graduation-request",
      ...request
    })
    return res.status(200).json({ ok: true })
  }
  if (req.method === "GET") {
    let credentials: any[] = []
    try {
      if (fs.existsSync(credentialsPath)) {
        credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf8"))
      }
    } catch {}
    return res.status(200).json(credentials)
  }
  res.status(405).json({ error: "Method not allowed" })
}