import type { NextApiRequest, NextApiResponse } from "next"
import { PrismaClient } from "@prisma/client"
import { AzoraBlockchain } from "../../../../backend/ledger/cryptoLedger"
const prisma = new PrismaClient()
const blockchain = new AzoraBlockchain("/workspaces/azora-os/backend/ledger/azora-blockchain.json")

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { name, email, idNumber } = req.body
    const student = await prisma.student.create({ data: { name, email, idNumber } })
    // Add to blockchain ledger
    blockchain.addEntry(`student-${student.id}`, {
      type: "student-onboard",
      name,
      email,
      idNumber,
      timestamp: Date.now()
    })
    return res.status(200).json({ ok: true })
  }
  res.status(405).json({ error: "Method not allowed" })
}