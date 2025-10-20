// src/server/routes/exports.ts
import express from 'express';
import { prisma } from '../prisma';
import archiver from 'archiver';
import { exportDocument } from '../exports/exportDocument';
import { generateReceiptPDF } from '../payments/invoice';
import { generateEldPdf } from '../logs/eldPdf';

const router = express.Router();

router.get('/api/exports/bulk', async (req, res) => {
  try {
    const { type, from, to } = req.query;
    const where: any = {};
    if (type) where.type = String(type).toUpperCase();
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(String(from));
      if (to) where.createdAt.lte = new Date(String(to));
    }

    const entries = await prisma.ledgerEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200 // limit for performance
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="azora-exports.zip"');

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    for (const e of entries) {
      try {
        let buffer: Buffer, filename: string;
        switch (e.type) {
          case 'CONTRACT': {
            const contract = await prisma.contract.findUnique({ where: { id: e.entityId }, include: { company: true } });
            if (!contract) continue;
            const result = await exportDocument({
              type: 'CONTRACT',
              entityId: contract.id,
              companyId: contract.companyId,
              title: 'Contract',
              content: (doc) => {
                doc.fontSize(12).text(`Contract: ${contract.name}`);
                doc.text(`Version: ${contract.version}`);
                doc.text(`Status: ${contract.active ? 'Active' : 'Inactive'}`);
                doc.moveDown().text(`Terms: ${contract.terms}`);
              }
            });
            buffer = result.buffer;
            filename = result.filename;
            break;
          }
          case 'PAYMENT':
          case 'INVOICE': {
            const payment = await prisma.payment.findUnique({ where: { id: e.entityId }, include: { company: true } });
            if (!payment) continue;
            const result = await generateReceiptPDF({
              companyId: payment.companyId,
              companyName: payment.company?.name ?? 'Azora Customer',
              reference: payment.reference,
              amountCents: payment.amount
            });
            buffer = result.buffer;
            filename = result.filename;
            break;
          }
          case 'PAYOUT': {
            const payout = await prisma.payout.findUnique({ where: { id: e.entityId }, include: { partner: true } });
            if (!payout) continue;
            const result = await exportDocument({
              type: 'PAYOUT',
              entityId: payout.id,
              companyId: payout.partner?.companyId ?? '',
              title: 'Payout Statement',
              content: (doc) => {
                doc.fontSize(12).text(`Partner: ${payout.partner?.id}`);
                doc.text(`Amount: R${(payout.amountCents / 100).toFixed(2)}`);
                doc.text(`Status: ${payout.status}`);
                doc.text(`Period: ${payout.period}`);
              }
            });
            buffer = result.buffer;
            filename = result.filename;
            break;
          }
          case 'ELD_LOG': {
            const result = await generateEldPdf(e.entityId);
            buffer = result.buffer;
            filename = result.filename;
            break;
          }
          default:
            continue;
        }
        archive.append(buffer, { name: filename });
      } catch (err) {
        console.error('Skipping entry', e.uid, err);
      }
    }

    archive.finalize();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
