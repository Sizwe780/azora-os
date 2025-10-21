import { AzoraBlockchain } from "../ledger/cryptoLedger"
import { Request, Response } from "express"
const blockchain = new AzoraBlockchain("/workspaces/azora-os/backend/ledger/azora-blockchain.json")

export async function recordProctoring(req: Request, res: Response) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
  const { studentId, examId, webcamFeed, screenFeed, keystrokes, aiFlags } = req.body
  // Store proctoring evidence and AI invigilator flags on blockchain
  blockchain.addEntry(`proctoring-${examId}-${studentId}`, {
    type: "proctoring-evidence",
    studentId,
    examId,
    webcamFeed,      // base64 or encrypted stream reference
    screenFeed,      // base64 or encrypted stream reference
    keystrokes,      // array of keystroke events
    aiFlags,         // array of AI-detected anomalies
    timestamp: Date.now()
  })
  res.status(200).json({ ok: true })
}