// src/server/payments/history.ts
import express from 'express';
import { prisma } from '../prisma';

const router = express.Router();

// GET /api/payments/history/:companyId
router.get('/history/:companyId', async (req, res) => {
  const { companyId } = req.params;
  const payments = await prisma.payment.findMany({
    where: { companyId, status: 'success' },
    orderBy: { createdAt: 'desc' }
  });
  res.json({
    payments: payments.map(p => ({
      reference: p.reference,
      amountCents: p.amount,
      currency: p.currency,
      createdAt: p.createdAt
    }))
  });
});

export default router;
