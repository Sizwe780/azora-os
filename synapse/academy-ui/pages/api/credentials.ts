import type { NextApiRequest, NextApiResponse } from "next"
import { AzoraBlockchain } from "../../../../backend/ledger/cryptoLedger"
import path from "path"

const blockchain = new AzoraBlockchain(path.resolve(process.cwd(), "backend/ledger/azora-blockchain.json"))

let credentialsStore = [
  { id: "cred-1", title: "AI Foundations Badge", type: "Open Badge 3.0", issuedAt: "2025-10-21", owner: "student-1" },
  { id: "cred-2", title: "Machine Learning Certificate", type: "Verifiable Credential", issuedAt: "2025-10-21", owner: "student-2" }
]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") return res.status(200).json(credentialsStore)
  if (req.method === "POST") {
    const body = req.body
    // persist credential to blockchain and mint token
    const tokenId = `credential-${body.id ?? crypto.randomUUID()}`
    blockchain.mintToken(tokenId, body.owner || "unknown", 1)
    blockchain.addEntry(tokenId, { type: "credential-issue", credential: body })
    credentialsStore.push({ ...body, id: tokenId, issuedAt: new Date().toISOString() })
    return res.status(201).json({ ok: true, id: tokenId })
  }
  res.status(405).json({ error: "Method not allowed" })
}