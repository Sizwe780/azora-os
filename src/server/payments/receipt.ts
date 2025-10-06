// src/server/payments/receipt.ts
import express from 'express';
import { prisma } from '../prisma';
import { generateReceiptPDF } from './invoice';

const router = express.Router();

router.get('/receipt/:reference', async (req, res) => {
  const { reference } = req.params;
  const payment = await prisma.payment.findUnique({
    where: { reference },
    include: { company: true }
  });
  if (!payment || payment.status !== 'success') return res.status(404).send('Not found');

  const { buffer, filename } = await generateReceiptPDF({
    companyId: payment.companyId,
    companyName: payment.company?.name || 'Azora Customer',
    reference,
    amountCents: payment.amount
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buffer);
});

export default router;
