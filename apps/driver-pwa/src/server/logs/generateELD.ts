// src/server/logs/eldPdf.ts
import PDFDocument from 'pdfkit';
import dayjs from 'dayjs';
import crypto from 'crypto';
import path from 'path';
import { prisma } from '../prisma';
import { generateAzoraUID } from '../utils/uid';
import { recordLedgerEntry } from '../ledger';

type StatusLine = 'OFF' | 'SB' | 'D' | 'ON';
interface EldEntry {
  status: StatusLine;
  from: string;
  to: string;
  note?: string;
  location?: { lat: number; lon: number; name?: string };
}

function statusRowY(status: StatusLine, gridTop: number, rowHeight: number) {
  const order: StatusLine[] = ['OFF', 'SB', 'D', 'ON'];
  return gridTop + order.indexOf(status) * rowHeight + rowHeight / 2;
}
function timeToX(time: string, gridLeft: number, gridWidth: number) {
  const [h, m] = time.split(':').map(Number);
  const minutes = h * 60 + m;
  return gridLeft + (minutes / (24 * 60)) * gridWidth;
}

export async function generateEldPdf(tripId: string) {
  const log = await prisma.eLDLog.findFirst({
    where: { tripId },
    include: { trip: { include: { company: true } }, driver: true }
  });
  if (!log) throw new Error('ELD log not found');

  const sheet = log.sheet as { date: string; driver: string; entries: EldEntry[]; signatures?: { driver?: string; carrier?: string } };
  const company = log.trip.company;

  const doc = new PDFDocument({ size: 'A4', margin: 36 });
  const chunks: Buffer[] = [];
  doc.on('data', (c) => chunks.push(c));
  const done = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

  // Branding + UID
  const uid = generateAzoraUID('LOG');
  const logoPath = path.join(process.cwd(), 'assets', 'azora-logo.png');
  try { doc.image(logoPath, 36, 20, { width: 80 }); } catch {}
  doc.fontSize(16).text('Azora OS — Electronic Logbook (ELD) · Daily Log', 130, 30);
  doc.fontSize(9).text(`UID: ${uid}`, 450, 30);

  // Header (localized SA)
  doc.moveDown(0.5);
  doc.fontSize(10);
  doc.text(`Date: ${dayjs(log.date).format('YYYY-MM-DD')} (SAST, UTC+${(log.utcOffsetMin ?? 120) / 60})`);
  doc.text(`Driver: ${sheet.driver} · Licence No.: ${log.driverLicense ?? '—'}`);
  doc.text(`Company: ${company.name} · VAT No.: ${company.vatNumber ?? '—'}`);
  doc.text(`Vehicle: ${log.vehicleId ?? '—'} · Plate: ${log.vehiclePlate ?? '—'}`);
  doc.text(`Odometer: Start ${log.odometerStartKm ?? '—'} km · End ${log.odometerEndKm ?? '—'} km`);
  doc.moveDown(0.5);
  doc.text(`HOS: Driving ${(log.hosDrivingMin ?? 0) / 60} h · On Duty ${(log.hosOnDutyMin ?? 0) / 60} h · Cycle ${(log.hosCycleMin ?? 0) / 60} h`);

  // Grid
  const gridLeft = 36, gridTop = 150, gridWidth = 540, gridHeight = 220;
  const rows: StatusLine[] = ['OFF', 'SB', 'D', 'ON'];
  const rowHeight = gridHeight / rows.length;
  doc.lineWidth(1).rect(gridLeft, gridTop, gridWidth, gridHeight).stroke();
  rows.forEach((r, i) => {
    const y = gridTop + i * rowHeight;
    doc.moveTo(gridLeft, y).lineTo(gridLeft + gridWidth, y).stroke();
    doc.fontSize(9).text(r, gridLeft - 28, y + 4, { width: 24, align: 'right' });
  });
  for (let h = 0; h <= 24; h++) {
    const x = gridLeft + (h / 24) * gridWidth;
    doc.moveTo(x, gridTop).lineTo(x, gridTop + gridHeight).stroke();
    if (h < 24) doc.fontSize(8).text(`${h}`, x - 4, gridTop + gridHeight + 6);
  }
  doc.lineWidth(2);
  sheet.entries.forEach((e) => {
    const y = statusRowY(e.status, gridTop, rowHeight);
    const x1 = timeToX(e.from, gridLeft, gridWidth);
    const x2 = timeToX(e.to, gridLeft, gridWidth);
    doc.moveTo(x1, y).lineTo(x2, y).stroke();
    doc.lineWidth(1).moveTo(x1, gridTop).lineTo(x1, gridTop + gridHeight).stroke();
    doc.lineWidth(2);
  });

  // Events table
  doc.moveDown(2);
  doc.fontSize(12).text('Duty Status Events');
  doc.moveDown(0.5).fontSize(9);
  const tableTop = 400;
  const colX = [36, 140, 220, 400, 480], colW = [100, 80, 180, 80, 80];
  ['Time', 'Status', 'Location', 'Note', 'Duration'].forEach((h, i) => doc.text(h, colX[i], tableTop, { width: colW[i], underline: true }));
  let y = tableTop + 16;
  sheet.entries.forEach((e) => {
    const loc = e.location?.name ?? (e.location ? `${e.location.lat.toFixed(3)}, ${e.location.lon.toFixed(3)}` : '—');
    const [fh, fm] = e.from.split(':').map(Number);
    const [th, tm] = e.to.split(':').map(Number);
    const durMin = (th * 60 + tm) - (fh * 60 + fm);
    [`${e.from}–${e.to}`, e.status, loc, e.note ?? '—', `${durMin} min`]
      .forEach((c, i) => doc.text(c, colX[i], y, { width: colW[i] }));
    y += 14;
  });

  // Certification + signatures
  doc.moveDown(1.5).fontSize(12).text('Certification');
  doc.fontSize(9);
  doc.text(`Driver certification: ${log.certifiedByDriver ? 'Yes' : 'No'}`);
  if (sheet.signatures?.driver) { try { doc.image(sheet.signatures.driver, 280, 680, { width: 150 }); } catch {} }
  doc.text(`Carrier certification: ${log.certifiedByCarrier ? 'Yes' : 'No'}`);
  if (sheet.signatures?.carrier) { try { doc.image(sheet.signatures.carrier, 280, 710, { width: 150 }); } catch {} }
  doc.text('Driver Signature: ____________________________     Date: __________');
  doc.text('Carrier Signature: ___________________________     Date: __________');

  // Violations
  if (log.violations) {
    doc.moveDown(0.5).fillColor('#b00020').text('Violations:');
    (log.violations as any[]).forEach(v => doc.text(`- ${v.code ?? '—'}: ${v.message ?? ''}`));
    doc.fillColor('#000000');
  }

  // Footer and hash + verify hint
  const metaText = `Generated: ${dayjs().format('YYYY-MM-DD HH:mm')} · Azora OS ELD v1 · Trip: ${tripId}`;
  doc.moveTo(36, 800).lineTo(576, 800).stroke();
  doc.fontSize(8).text(metaText, 36, 806);
  doc.text(`Verify UID: ${uid} · https://azoraos.com/verify/${uid}`, 36, 818);

  doc.end();
  const pdfBuffer = await done;

  // Hash and ledger record
  const hash = crypto.createHash('sha256').update(pdfBuffer).digest('hex');
  await recordLedgerEntry({
    uid,
    type: 'ELD_LOG',
    entityId: log.id,
    driverId: log.driverId ?? undefined,
    companyId: log.trip.companyId,
    hash
  });

  await prisma.eLDLog.update({
    where: { id: log.id },
    data: { pdfUrl: `/api/trips/${tripId}/logs/pdf`, contentHash: hash }
  });

  const filename = `eld-${tripId}-${dayjs(log.date).format('YYYYMMDD')}.pdf`;
  return { buffer: pdfBuffer, filename, hash, uid };
}
