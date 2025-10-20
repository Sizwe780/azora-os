// src/server/jobs/scheduledExports.ts
import cron from 'node-cron';
import { prisma } from '../prisma';
import { generateEldPdf } from '../logs/eldPdf';
import { exportDocument } from '../exports/exportDocument';
import { generateReceiptPDF } from '../payments/invoice';
import archiver from 'archiver';
import { PassThrough } from 'stream';
import nodemailer from 'nodemailer';
import { uploadExport } from '../storage'; // helper for S3/Azure/GCP
import express from 'express';
import axios from 'axios';

export const scheduledExportsRouter = express.Router();

/**
 * Core export runner for a given period + type
 */
export async function runExportForPeriod(period: string, type: string) {
  const [year, month] = period.split('-').map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  const entries = await prisma.ledgerEntry.findMany({
    where: { createdAt: { gte: start, lte: end } },
    orderBy: { createdAt: 'asc' }
  });

  // Stream archive into memory
  const archive = archiver('zip', { zlib: { level: 9 } });
  const stream = new PassThrough();
  archive.pipe(stream);

  const buffers: Buffer[] = [];
  stream.on('data', (chunk) => buffers.push(chunk));

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

  await archive.finalize();
  const zipBuffer = Buffer.concat(buffers);

  const filename = `exports/azora-${period}.zip`;
  const signedUrl = await uploadExport(zipBuffer, filename);

  await prisma.scheduledExport.create({
    data: {
      type,
      period,
      url: signedUrl,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  return signedUrl;
}

/**
 * Cron job: run automatically on the 1st of each month
 */
async function runMonthlyExport() {
  const now = new Date();
  const period = now.toISOString().slice(0, 7);
  const signedUrl = await runExportForPeriod(period, 'MONTHLY');

  // Email admins with link
  const transporter = nodemailer.createTransport({
    service: 'SendGrid',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });

  await transporter.sendMail({
    from: 'compliance@azoraos.com',
    to: 'admin@azoraos.com',
    subject: `Azora Monthly Compliance Export — ${period}`,
    text: `Your compliance export is ready.\n\nDownload securely here:\n${signedUrl}\n\nLink expires in 7 days.`
  });
}

cron.schedule('0 2 1 * *', runMonthlyExport);

/**
 * API routes
 */
scheduledExportsRouter.get('/api/scheduled-exports', async (req, res) => {
  const exportsList = await prisma.scheduledExport.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  res.json({ exports: exportsList });
});

scheduledExportsRouter.post('/api/scheduled-exports/regenerate', async (req, res) => {
  const { period, type } = req.body;
  if (!period || !type) return res.status(400).json({ error: 'Period and type required' });

  try {
    const signedUrl = await runExportForPeriod(period, type);
    res.json({ ok: true, url: signedUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Bulk download: combine multiple exports into one zip
 */
scheduledExportsRouter.post('/api/scheduled-exports/bulk', async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: 'ids[] required' });

  const exportsList = await prisma.scheduledExport.findMany({
    where: { id: { in: ids } }
  });

  const archive = archiver('zip', { zlib: { level: 9 } });
  const stream = new PassThrough();
  archive.pipe(stream);

  const buffers: Buffer[] = [];
  stream.on('data', (chunk) => buffers.push(chunk));

  for (const exp of exportsList) {
    try {
      // fetch each export zip from its signed URL
      const resp = await axios.get<ArrayBuffer>(exp.url, { responseType: 'arraybuffer' });
      archive.append(Buffer.from(resp.data), { name: `${exp.period}-${exp.type}.zip` });
    } catch (err) {
      console.error('Skipping export', exp.id, err);
    }
  }

  await archive.finalize();
  const zipBuffer = Buffer.concat(buffers);

  const filename = `exports/azora-bulk-${Date.now()}.zip`;
  const signedUrl = await uploadExport(zipBuffer, filename);

  res.json({ ok: true, url: signedUrl });
});
