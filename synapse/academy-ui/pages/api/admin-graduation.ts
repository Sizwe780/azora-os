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
    let credentials: any[] = []
    try {
      if (fs.existsSync(graduationPath)) {
        requests = JSON.parse(fs.readFileSync(graduationPath, "utf8"))
      }
      if (fs.existsSync(credentialsPath)) {
        credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf8"))
      }
    } catch {}
    const { studentId, programme } = req.body
    const idx = requests.findIndex(r => r.studentId === studentId && r.programme === programme && r.status === "Pending")
    if (idx === -1) return res.status(404).json({ error: "Request not found" })
    requests[idx].status = "Issued"
    requests[idx].issuedAt = Date.now()
    const credential = {
      id: `cred-${studentId}-${Date.now()}`,
      studentId,
      programme,
      issuedAt: Date.now()
    }
    credentials.push(credential)
    fs.writeFileSync(graduationPath, JSON.stringify(requests, null, 2), "utf8")
    fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2), "utf8")
    blockchain.addEntry(`credential-issue-${credential.id}`, {
      type: "credential-issue",
      ...credential
    })
    return res.status(200).json({ ok: true })
  }
  res.status(405).json({ error: "Method not allowed" })
}