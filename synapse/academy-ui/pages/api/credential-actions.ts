import type { NextApiRequest, NextApiResponse } from "next"
import { AzoraBlockchain } from "../../../../backend/ledger/cryptoLedger"
import path from "path"

const blockchain = new AzoraBlockchain(path.resolve(process.cwd(), "backend/ledger/azora-blockchain.json"))

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, action, actor, reason } = req.body

  if (!id || !action || !actor) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  if (action === "revoke") {
    blockchain.addEntry(`credential-revoke-${id}`, {
      type: "credential-revocation",
      credentialId: id,
      actor,
      reason,
      timestamp: Date.now()
    })
    return res.status(200).json({ ok: true, action: "revoked" })
  }

  if (action === "endorse") {
    blockchain.addEntry(`credential-endorse-${id}`, {
      type: "credential-endorsement",
      credentialId: id,
      actor,
      reason,
      timestamp: Date.now()
    })
    return res.status(200).json({ ok: true, action: "endorsed" })
  }

  res.status(405).json({ error: "Invalid action" })
}