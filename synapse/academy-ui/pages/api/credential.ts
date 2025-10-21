import type { NextApiRequest, NextApiResponse } from "next"
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.query.userId as string || "test-user-id"
  if (req.method === "POST") {
    const { courseId } = req.body
    // Mint a credential (certificate) for the user
    const credential = await prisma.achievement.create({
      data: {
        title: `Certificate: ${courseId}`,
        icon: "🎓",
        userId
      }
    })
    return res.status(200).json(credential)
  }
  res.status(405).json({ error: "Method not allowed" })
}