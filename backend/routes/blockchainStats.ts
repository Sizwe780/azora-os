/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { AzoraBlockchain } from "../ledger/cryptoLedger"
const blockchain = new AzoraBlockchain("/workspaces/azora-os/backend/ledger/azora-blockchain.json")

import { Request, Response } from "express"

export function getBlockchainStats(req: Request, res: Response) {
  res.status(200).json(blockchain.getBlockchainStats())
}