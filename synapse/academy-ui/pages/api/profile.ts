import type { NextApiRequest, NextApiResponse } from "next"
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.query.userId as string || "test-user-id"
  if (req.method === "GET") {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { achievements: true, studyTasks: true }
    })
    if (!user) return res.status(404).json({ error: "User not found" })
    res.status(200).json(user)
  } else {
    res.status(405).json({ error: "Method not allowed" })
  }
}