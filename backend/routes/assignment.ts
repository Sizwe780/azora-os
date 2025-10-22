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

export async function submitAssignment(req: Request, res: Response) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
  const { studentId, moduleCode, submission } = req.body
  const record = await prisma.assignment.create({ data: { studentId, moduleCode, submission } })
  blockchain.addEntry(`assignment-${record.id}`, {
    type: "assignment-submission",
    studentId,
    moduleCode,
    submission,
    timestamp: Date.now()
  })
  res.status(200).json(record)
}