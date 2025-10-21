import type { NextApiRequest, NextApiResponse } from "next"
let portfolioStore = {
  projects: [
    { id: "proj-1", title: "AI Chatbot" },
    { id: "proj-2", title: "Blockchain Credential System" }
  ],
  credentials: [
    { id: "cred-1", title: "AI Foundations Badge" },
    { id: "cred-2", title: "Machine Learning Certificate" }
  ]
}
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") return res.status(200).json(portfolioStore)
  res.status(405).json({ error: "Method not allowed" })
}