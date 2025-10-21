import type { NextApiRequest, NextApiResponse } from "next"
let portfolioStore = [
  { id: "evidence-1", title: "Work Experience: Software Engineer", date: "2023-06-01" },
  { id: "evidence-2", title: "Industry Certification: AWS", date: "2024-02-15" }
]
let creditTransfersStore = [
  { id: "credit-1", fromInstitution: "University of Cape Town", toProgramme: "Azora BSc Computer Science", credits: 32 },
  { id: "credit-2", fromInstitution: "Coursera", toProgramme: "Azora Data Science", credits: 12 }
]
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") return res.status(200).json({ portfolio: portfolioStore, creditTransfers: creditTransfersStore })
  res.status(405).json({ error: "Method not allowed" })
}