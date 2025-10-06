// src/server/routes/payouts.ts
import express from 'express';
import { prisma } from '../prisma';

const router = express.Router();

router.get('/api/payouts', async (req, res) => {
  try {
    const payouts = await prisma.payout.findMany({
      include: {
        partner: true,
        ledgerEntries: {
          where: { type: 'PAYOUT' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    const result = payouts.map(p => ({
      id: p.id,
      partner: p.partner?.id ?? '—',
      amountCents: p.amountCents,
      status: p.status,
      period: p.period,
      createdAt: p.createdAt,
      uid: p.ledgerEntries[0]?.uid ?? null
    }));

    res.json({ payouts: result });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
