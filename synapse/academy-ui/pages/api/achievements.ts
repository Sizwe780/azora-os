import type { NextApiRequest, NextApiResponse } from "next"
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // TODO: Use real user auth, here we use a test user
  const userId = req.query.userId as string || "test-user-id"
  const achievements = await prisma.achievement.findMany({ where: { userId } })
  res.status(200).json(achievements)
}