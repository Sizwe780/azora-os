import type { NextApiRequest, NextApiResponse } from "next"
import { AzoraBlockchain } from "../../../../backend/ledger/cryptoLedger"
import path from "path"

// Initialize blockchain (ensure path is correct for your workspace)
const blockchain = new AzoraBlockchain(path.resolve(process.cwd(), "backend/ledger/azora-blockchain.json"))

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const {
    studentId,
    examId,
    webcamFeed,
    screenFeed,
    keystrokes,
    aiFlags,
    screenshots,
    audioLog,
    aiAnomalyScore
  } = req.body

  // Record proctoring evidence to blockchain
  blockchain.addEntry(`proctoring-${examId}-${studentId}`, {
    type: "proctoring-evidence",
    studentId,
    examId,
    webcamFeed,
    screenFeed,
    keystrokes,
    aiFlags,
    screenshots,      // Array of screenshot refs or base64
    audioLog,         // Audio file ref or base64
    aiAnomalyScore,   // Numeric or string score
    timestamp: Date.now()
  })

  return res.status(200).json({ ok: true, message: "Proctoring evidence securely recorded on blockchain." })
}