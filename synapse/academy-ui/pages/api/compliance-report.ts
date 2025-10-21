import type { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import fs from "fs"

const policyPath = path.resolve(process.cwd(), "backend/ledger/policy-events.json")
const blockchainPath = path.resolve(process.cwd(), "backend/ledger/azora-blockchain.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  let policyEvents: any[] = []
  let blockchainEvents: any[] = []
  try {
    if (fs.existsSync(policyPath)) {
      policyEvents = JSON.parse(fs.readFileSync(policyPath, "utf8"))
    }
    if (fs.existsSync(blockchainPath)) {
      const chain = JSON.parse(fs.readFileSync(blockchainPath, "utf8"))
      blockchainEvents = chain.chain?.map(b => b.entries).flat() ?? []
    }
  } catch {}
  res.status(200).json({
    policyEvents,
    blockchainEvents,
    totalPolicyEvents: policyEvents.length,
    totalBlockchainEvents: blockchainEvents.length
  })
}