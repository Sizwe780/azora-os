// src/server/routes/nation.ts
import express from 'express';
import { prisma } from '../prisma';
export const nationRouter = express.Router();

nationRouter.get('/', async (_req, res) => {
  const nations = await prisma.nation.findMany({ orderBy: { name: 'asc' } });
  res.json(nations);
});

nationRouter.get('/:id', async (req, res) => {
  const nation = await prisma.nation.findUnique({
    where: { id: req.params.id }
  });
  if (!nation) return res.status(404).send('Not found');
  res.json(nation);
});

nationRouter.get('/:id/federations', async (req, res) => {
  const feds = await prisma.federation.findMany({
    where: { nationId: req.params.id },
    orderBy: { name: 'asc' }
  });
  res.json(feds);
});

nationRouter.get('/:id/advisors', async (req, res) => {
  const advisors = await prisma.advisor.findMany({
    where: { nationId: req.params.id },
    orderBy: { name: 'asc' }
  });
  res.json(advisors);
});
