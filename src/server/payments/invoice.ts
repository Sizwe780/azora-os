// src/server/payments/invoice.ts
import { jsPDF } from 'jspdf';
import dayjs from 'dayjs';
import crypto from 'crypto';
import path from 'path';
import { prisma } from '../prisma';
import { generateAzoraUID } from '../utils/uid';
import { recordLedgerEntry } from '../ledger';

export async function generateReceiptPDF({
  companyId,
  driverId,
  companyName,
  reference,
  amountCents,
  vatPercent = 15,
}: {
  companyId: string;
  driverId?: string;
  companyName: string;
  reference: string;
  amountCents: number;
  vatPercent?: number;
}) {
  const doc = new jsPDF();
  const amount = amountCents / 100;
  const vat = +(amount * (vatPercent / 100)).toFixed(2);
  const total = +(amount + vat).toFixed(2);

  // UID + logo
  const uid = generateAzoraUID('RECEIPT');
  try {
    doc.addImage(path.join(process.cwd(), 'assets', 'azora-logo.png'), 'PNG', 10, 5, 30, 15);
  } catch {}
  doc.setFontSize(16).text(`Receipt — ${companyName}`, 50, 15);
  doc.setFontSize(10).text(`UID: ${uid}`, 160, 15);

  // Body
  doc.setFontSize(12);
  doc.text(`Reference: ${reference}`, 20, 40);
  doc.text(`Date: ${dayjs().format('YYYY-MM-DD')}`, 20, 50);
  doc.text(`Amount (excl. VAT): R${amount.toFixed(2)}`, 20, 70);
  doc.text(`VAT (${vatPercent}%): R${vat.toFixed(2)}`, 20, 80);
  doc.text(`Total: R${total.toFixed(2)}`, 20, 90);

  // Footer
  doc.setFontSize(8);
  doc.text(`Generated: ${dayjs().format('YYYY-MM-DD HH:mm')} · Verify at https://azoraos.com/verify/${uid}`, 20, 280);

  const arrayBuffer = doc.output('arraybuffer');
  const buffer = Buffer.from(arrayBuffer);

  // Hash + ledger
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  await recordLedgerEntry({
    uid,
    type: 'INVOICE',
    entityId: reference,
    driverId,
    companyId,
    hash
  });

  return { buffer, uid, hash, filename: `receipt-${reference}.pdf` };
}
