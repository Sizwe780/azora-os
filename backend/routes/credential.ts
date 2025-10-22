/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { PrismaClient } from "@prisma/client"
import { AzoraBlockchain } from "../ledger/cryptoLedger"
const prisma = new PrismaClient()
const blockchain = new AzoraBlockchain("/workspaces/azora-os/backend/ledger/azora-blockchain.json")

import { Request, Response } from "express"

export async function mintCredential(req: Request, res: Response) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
  const { studentId, qualificationId, details } = req.body
  const credential = await prisma.credential.create({ data: { studentId, qualificationId, details } })
  blockchain.mintToken(`credential-${credential.id}`, studentId, 1)
  blockchain.addEntry(`credential-${credential.id}`, {
    type: "credential-mint",
    studentId,
    qualificationId,
    details,
    timestamp: Date.now()
  })
  res.status(200).json(credential)
}