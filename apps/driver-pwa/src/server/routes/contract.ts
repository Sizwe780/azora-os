// src/server/routes/contracts.ts
import express from 'express';
import { prisma } from '../prisma';

const router = express.Router();

router.get('/api/contracts', async (req, res) => {
  try {
    const contracts = await prisma.contract.findMany({
      include: {
        company: true,
        // Grab the most recent ledger entry for this contract
        ledgerEntries: {
          where: { type: 'CONTRACT' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    const result = contracts.map((c: { id: any; name: any; version: any; active: any; updatedAt: any; ledgerEntries: { uid: any; }[]; }) => ({
      id: c.id,
      name: c.name,
      version: c.version,
      status: c.active ? 'Active' : 'Inactive',
      lastUpdated: c.updatedAt,
      uid: c.ledgerEntries[0]?.uid ?? null
    }));

    res.json({ contracts: result });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
