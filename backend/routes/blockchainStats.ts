import { AzoraBlockchain } from "../ledger/cryptoLedger"
const blockchain = new AzoraBlockchain("/workspaces/azora-os/backend/ledger/azora-blockchain.json")

import { Request, Response } from "express"

export function getBlockchainStats(req: Request, res: Response) {
  res.status(200).json(blockchain.getBlockchainStats())
}