// src/server/routes/federation.ts
import express from 'express';
import { prisma } from '../prisma';
export const federationRouter = express.Router();

federationRouter.get('/', async (_req, res) => {
  const feds = await prisma.federation.findMany({ orderBy: { name: 'asc' } });
  res.json(feds);
});

federationRouter.get('/:id', async (req, res) => {
  const fed = await prisma.federation.findUnique({ where: { id: req.params.id } });
  if (!fed) return res.status(404).send('Not found');
  res.json(fed);
});

federationRouter.get('/:id/contracts', async (req, res) => {
  const contracts = await prisma.contract.findMany({
    where: { federationId: req.params.id },
    orderBy: { name: 'asc' }
  });
  res.json(contracts);
});
