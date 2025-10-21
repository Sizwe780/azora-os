import type { NextApiRequest, NextApiResponse } from "next"
import { AzoraBlockchain } from "../../../../backend/ledger/cryptoLedger"
import path from "path"

const blockchain = new AzoraBlockchain(path.resolve(process.cwd(), "backend/ledger/azora-blockchain.json"))

let progressStore: any = {}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    progressStore = req.body
    // Record progress event to blockchain for immutable evidence
    blockchain.addEntry(`progress-${progressStore.lastLesson ?? "unknown"}`, {
      type: "progress-update",
      progress: progressStore
    })
    return res.status(200).json({ ok: true })
  }
  if (req.method === "GET") {
    return res.status(200).json(progressStore)
  }
  res.status(405).json({ error: "Method not allowed" })
}