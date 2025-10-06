// src/server/routes/nation.ts
import express from 'express';
import { prisma } from '../prisma';

export const nationRouter = express.Router();

nationRouter.get('/', async (req, res) => {
  const nations = await prisma.nation.findMany();
  res.json(nations);
});

nationRouter.post('/', async (req, res) => {
  const { name, code } = req.body;
  const nation = await prisma.nation.create({ data: { name, code } });
  res.json(nation);
});
