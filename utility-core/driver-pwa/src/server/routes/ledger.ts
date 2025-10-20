// src/server/routes/ledger.ts
import express from 'express';
import { prisma } from '../prisma';
import { verifyLedgerUID } from '../ledger';

export const ledgerRouter = express.Router();

ledgerRouter.get('/api/ledger/verify/:uid', async (req, res) => {
  const entry = await verifyLedgerUID(req.params.uid);
  if (!entry) return res.status(404).json({ valid: false, message: 'UID not found' });
  res.json({ valid: true, entry });
});

// New: list all ledger entries
ledgerRouter.get('/api/ledger', async (req, res) => {
  const entries = await prisma.ledgerEntry.findMany({
    orderBy: { createdAt: 'desc' },
    take: 500
  });
  res.json({ entries });
});
