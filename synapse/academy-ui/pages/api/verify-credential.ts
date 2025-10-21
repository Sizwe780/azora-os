import type { NextApiRequest, NextApiResponse } from "next"
import { AzoraBlockchain } from "../../../../backend/ledger/cryptoLedger"
import path from "path"

const blockchain = new AzoraBlockchain(path.resolve(process.cwd(), "backend/ledger/azora-blockchain.json"))

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  // Search for credential in blockchain tokens
  const token = blockchain["tokens"].get(id as string)
  if (!token) return res.status(404).json({ valid: false, credential: null })
  // Find credential issuance entry
  const block = blockchain["chain"].find(b =>
    b.entries.some(e => e.key === `token-${id}` || e.key === id)
  )
  const entry = block?.entries.find(e => e.key === `token-${id}` || e.key === id)
  const valid = entry ? blockchain.verifyEntrySignature(entry) : false
  res.status(200).json({
    valid,
    credential: entry?.payload?.credential ?? token
  })
}