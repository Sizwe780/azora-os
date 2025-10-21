import { AzoraBlockchain } from "../ledger/cryptoLedger"
const blockchain = new AzoraBlockchain("/workspaces/azora-os/backend/ledger/azora-blockchain.json")

import { Request, Response } from "express"

export async function recordProctoring(req: Request, res: Response) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
  const { studentId, examId, evidence } = req.body
  blockchain.addEntry(`proctoring-${examId}-${studentId}`, {
    type: "proctoring-evidence",
    studentId,
    examId,
    evidence,
    timestamp: Date.now()
  })
  res.status(200).json({ ok: true })
}