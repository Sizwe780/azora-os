import type { NextApiRequest, NextApiResponse } from "next"
import { AzoraBlockchain } from "../../../../backend/ledger/cryptoLedger"
const blockchain = new AzoraBlockchain("/workspaces/azora-os/backend/ledger/azora-blockchain.json")

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(blockchain.getBlockchainStats())
}