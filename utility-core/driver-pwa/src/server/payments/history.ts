// src/server/payments/history.ts
import express from 'express';
import { prisma } from '../prisma';
import { generateReceiptPDF } from './invoice';

const router = express.Router();

// GET /api/payments/history/:companyId
router.get('/history/:companyId', async (req, res) => {
  const { companyId } = req.params;
  const payments = await prisma.payment.findMany({
    where: { companyId, status: 'success' },
    orderBy: { createdAt: 'desc' }
  });
  res.json({
    payments: payments.map((p) => ({
      reference: p.reference,
      amountCents: p.amount,
      currency: p.currency,
      createdAt: p.createdAt
    }))
  });
});

// GET /api/payments/receipt/:reference (already implemented earlier)
// If you need invoice numbers, generate sequential codes per company:
router.get('/invoice/:reference', async (req, res) => {
  const { reference } = req.params;
  const p = await prisma.payment.findUnique({ where: { reference }, include: { company: true } });
  if (!p || p.status !== 'success') return res.status(404).send('Not found');

  const pdfBuffer = generateReceiptPDF({
    companyName: p.company?.name || 'Azora Customer',
    reference: p.reference,
    amountCents: p.amount
  });
  res.setHeader('Content-Type', 'application/pdf');
  res.send(Buffer.from(pdfBuffer));
});

export default router;
