// src/server/exports/exportDocument.ts
import PDFDocument from 'pdfkit';
import crypto from 'crypto';
import dayjs from 'dayjs';
import { prisma } from '../prisma';
import { generateAzoraUID } from '../utils/uid';
import { recordLedgerEntry } from '../ledger';

interface ExportOptions {
  type: 'ELD_LOG' | 'CONTRACT' | 'PAYOUT' | 'INVOICE';
  entityId: string;
  companyId: string;
  driverId?: string;
  title: string;
  content: (doc: PDFKit.PDFDocument) => void; // callback to render body
}

export async function exportDocument(opts: ExportOptions) {
  const { type, entityId, companyId, driverId, title, content } = opts;

  const doc = new PDFDocument({ size: 'A4', margin: 36 });
  const chunks: Buffer[] = [];
  doc.on('data', (c) => chunks.push(c));
  const done = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

  // Generate UID
  const uid = generateAzoraUID(type);

  // Header with Azora logo + UID
  doc.image('assets/azora-logo.png', 36, 20, { width: 80 });
  doc.fontSize(16).text(`Azora OS — ${title}`, 130, 30);
  doc.fontSize(9).text(`UID: ${uid}`, 450, 30);
  doc.moveDown(2);

  // Body content (custom per document)
  content(doc);

  // Footer
  const metaText = `Generated: ${dayjs().format('YYYY-MM-DD HH:mm')} · Azora OS v1 · Verify UID at https://azoraos.com/verify/${uid}`;
  doc.moveTo(36, 800).lineTo(576, 800).stroke();
  doc.fontSize(8).text(metaText, 36, 810);

  doc.end();
  const buffer = await done;

  // Hash
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');

  // Record in ledger
  await recordLedgerEntry({ uid, type, entityId, driverId, companyId, hash });

  return { buffer, uid, hash, filename: `${type}-${uid}.pdf` };
}
