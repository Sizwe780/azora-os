import type { NextApiRequest, NextApiResponse } from "next"
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    // Fetch student projects for marketplace
    const projects = await prisma.$queryRaw`SELECT * FROM Marketplace LIMIT 20`
    res.status(200).json(projects)
  } else if (req.method === "POST") {
    // Add new project
    const { userId, project } = req.body
    // Save project logic here
    res.status(200).json({ ok: true })
  } else {
    res.status(405).json({ error: "Method not allowed" })
  }
}