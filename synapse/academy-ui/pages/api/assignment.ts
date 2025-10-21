import type { NextApiRequest, NextApiResponse } from "next"
import { PrismaClient } from "@prisma/client"
import { AzoraBlockchain } from "../../../../backend/ledger/cryptoLedger"
const prisma = new PrismaClient()
const blockchain = new AzoraBlockchain("/workspaces/azora-os/backend/ledger/azora-blockchain.json")

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { studentId, moduleCode, submission } = req.body
    const record = await prisma.assignment.create({ data: { studentId, moduleCode, submission } })
    blockchain.addEntry(`assignment-${record.id}`, {
      type: "assignment-submission",
      studentId,
      moduleCode,
      submission,
      timestamp: Date.now()
    })
    return res.status(200).json(record)
  }
  res.status(405).json({ error: "Method not allowed" })
}