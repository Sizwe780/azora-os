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

export async function onboardStudent(req: Request, res: Response) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
  const { name, email, idNumber } = req.body
  const student = await prisma.student.create({ data: { name, email, idNumber } })
  blockchain.addEntry(`student-${student.id}`, {
    type: "student-onboard",
    name,
    email,
    idNumber,
    timestamp: Date.now()
  })
  res.status(200).json({ ok: true, student })
}