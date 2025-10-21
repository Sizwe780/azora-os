import type { NextApiRequest, NextApiResponse } from "next"
let labsStore = [
  { id: "lab-1", title: "AI Model Training", description: "Train a neural network on real data." },
  { id: "lab-2", title: "Blockchain Credential Issuance", description: "Issue and verify credentials on the Azora blockchain." }
]
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") return res.status(200).json(labsStore)
  if (req.method === "POST") {
    labsStore.push(req.body)
    return res.status(201).json({ ok: true })
  }
  res.status(405).json({ error: "Method not allowed" })
}