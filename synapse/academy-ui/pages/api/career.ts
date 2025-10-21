import type { NextApiRequest, NextApiResponse } from "next"
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    // Example: Fetch job board entries
    const jobs = await prisma.$queryRaw`SELECT * FROM JobBoard LIMIT 20`
    res.status(200).json(jobs)
  } else if (req.method === "POST") {
    // Example: Save resume or application
    const { userId, resume } = req.body
    // Save resume logic here
    res.status(200).json({ ok: true })
  } else {
    res.status(405).json({ error: "Method not allowed" })
  }
}