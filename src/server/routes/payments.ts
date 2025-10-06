// src/server/routes/payments.ts
import express from 'express';
import { prisma } from '../prisma';

const router = express.Router();

router.get('/api/payments', async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        company: true,
        ledgerEntries: {
          where: { type: 'INVOICE' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    const result = payments.map(p => ({
      id: p.id,
      reference: p.reference,
      provider: p.provider,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      createdAt: p.createdAt,
      company: p.company?.name ?? '—',
      uid: p.ledgerEntries[0]?.uid ?? null
    }));

    res.json({ payments: result });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
