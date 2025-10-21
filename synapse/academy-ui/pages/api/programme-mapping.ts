import type { NextApiRequest, NextApiResponse } from "next"
let programmesStore = [
  { id: "prog-1", title: "Higher Certificate in IT Support", nqfLevel: 5, credits: 120, heqsfCategory: "Higher Certificate" },
  { id: "prog-2", title: "Diploma in Software Development", nqfLevel: 6, credits: 240, heqsfCategory: "Diploma" },
  { id: "prog-3", title: "Advanced Diploma in Cybersecurity", nqfLevel: 7, credits: 120, heqsfCategory: "Advanced Diploma" },
  { id: "prog-4", title: "Bachelor of Science in Computer Science", nqfLevel: 7, credits: 360, heqsfCategory: "Bachelor's Degree" },
  { id: "prog-5", title: "Bachelor of Commerce in Information Systems", nqfLevel: 7, credits: 360, heqsfCategory: "Bachelor's Degree" },
  { id: "prog-6", title: "Bachelor of Science Honours in AI", nqfLevel: 8, credits: 120, heqsfCategory: "Honours Degree" },
  { id: "prog-7", title: "Master of Science in Data Science", nqfLevel: 9, credits: 180, heqsfCategory: "Master's Degree" }
]
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") return res.status(200).json(programmesStore)
  res.status(405).json({ error: "Method not allowed" })
}