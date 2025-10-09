// src/server/routes/advisor.ts
import express from 'express';
import { prisma } from '../prisma';
export const advisorRouter = express.Router();

advisorRouter.get('/', async (_req, res) => {
  const advisors = await prisma.advisor.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(advisors);
});

advisorRouter.post('/', async (req, res) => {
  const { name, expertise, nationId, email } = req.body;
  const advisor = await prisma.advisor.create({ data: { name, expertise, nationId, email } });
  res.json(advisor);
});
