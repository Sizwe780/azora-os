// src/server/routes/federation.ts
import express from 'express';
import { prisma } from '../prisma';

export const federationRouter = express.Router();

federationRouter.get('/', async (req, res) => {
  const federations = await prisma.federation.findMany();
  res.json(federations);
});

federationRouter.post('/', async (req, res) => {
  const { name, description } = req.body;
  const federation = await prisma.federation.create({ data: { name, description } });
  res.json(federation);
});
