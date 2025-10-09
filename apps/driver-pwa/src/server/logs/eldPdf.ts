// src/server/logs/eldPdf.ts
import PDFDocument from 'pdfkit';
import dayjs from 'dayjs';
import crypto from 'crypto';
import { prisma } from '../prisma';

type StatusLine = 'OFF' | 'SB' | 'D' | 'ON';

interface EldEntry {
  status: StatusLine;
  from: string; // "HH:mm"
  to: string;   // "HH:mm"
  note?: string;
  location?: { lat: number; lon: number; name?: string };
}

function statusRowY(status: StatusLine, gridTop: number, rowHeight: number) {
  // OFF, SB, D, ON stacked top→bottom
  const order: StatusLine[] = ['OFF', 'SB', 'D', 'ON'];
  return gridTop + order.indexOf(status) * rowHeight + rowHeight / 2;
}

function timeToX(time: string, gridLeft: number, gridWidth: number) {
  const [h, m] = time.split(':').map(Number);
  const minutes = h * 60 + m;
  const ratio = minutes / (24 * 60);
  return gridLeft + ratio * gridWidth;
}

export async function generateEldPdf(tripId: string) {
  const log = await prisma.eLDLog.findFirst({
    where: { tripId },
    include: { trip: { include: { company: true } }, driver: true }
  });
  if (!log) throw new Error('ELD log not found');

  const sheet = log.sheet as { date: string; driver: string; entries: EldEntry[] };
  const company = log.trip.company;

  const doc = new PDFDocument({ size: 'A4', margin: 36 });
  const chunks: Buffer[] = [];
  doc.on('data', (c) => chunks.push(c));
  const done = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

  // Header
  doc.fontSize(16).text('Electronic Logbook (ELD) — Daily Log', { align: 'left' });
  doc.moveDown(0.5);
  doc.fontSize(10);
  doc.text(`Date: ${dayjs(log.date).format('YYYY-MM-DD')} (Timezone: ${log.timeZone ?? 'SAST'}, UTC+${(log.utcOffsetMin ?? 120) / 60})`);
  doc.text(`Driver: ${sheet.driver}  License: ${log.driverLicense ?? '—'}`);
  doc.text(`Company: ${company.name}  VAT: ${company.vatNumber ?? '—'}`);
  doc.text(`Vehicle: ${log.vehicleId ?? '—'}  Plate: ${log.vehiclePlate ?? '—'}`);
  doc.text(`Odometer: Start ${log.odometerStartKm ?? '—'} km, End ${log.odometerEndKm ?? '—'} km`);
  doc.moveDown(0.5);
  doc.text(`HOS: Driving ${Math.round((log.hosDrivingMin ?? 0) / 60 * 10) / 10} h, On Duty ${Math.round((log.hosOnDutyMin ?? 0) / 60 * 10) / 10} h, Cycle ${(Math.round((log.hosCycleMin ?? 0) / 60 * 10) / 10)} h`);

  // Grid
  const gridLeft = 36, gridTop = 150, gridWidth = 540, gridHeight = 220;
  const rows: StatusLine[] = ['OFF', 'SB', 'D', 'ON'];
  const rowHeight = gridHeight / rows.length;

  doc.lineWidth(1);
  doc.rect(gridLeft, gridTop, gridWidth, gridHeight).stroke();

  // Horizontal lines and labels
  rows.forEach((r, i) => {
    const y = gridTop + i * rowHeight;
    doc.moveTo(gridLeft, y).lineTo(gridLeft + gridWidth, y).stroke();
    doc.fontSize(9).text(r, gridLeft - 28, y + 4, { width: 24, align: 'right' });
  });

  // Vertical hour lines
  for (let h = 0; h <= 24; h++) {
    const x = gridLeft + (h / 24) * gridWidth;
    doc.moveTo(x, gridTop).lineTo(x, gridTop + gridHeight).stroke();
    if (h < 24) {
      doc.fontSize(8).text(`${h}`, x - 4, gridTop + gridHeight + 6);
    }
  }

  // Draw status segments
  doc.lineWidth(2);
  sheet.entries.forEach((e) => {
    const y = statusRowY(e.status, gridTop, rowHeight);
    const x1 = timeToX(e.from, gridLeft, gridWidth);
    const x2 = timeToX(e.to, gridLeft, gridWidth);
    doc.moveTo(x1, y).lineTo(x2, y).stroke();
    // Vertical transitions
    doc.lineWidth(1);
    doc.moveTo(x1, y).lineTo(x1, statusRowY(e.status, gridTop, rowHeight)).stroke();
    doc.lineWidth(2);
  });

  // Events table
  doc.moveDown(2);
  doc.fontSize(12).text('Duty Status Events');
  doc.moveDown(0.5);
  doc.fontSize(9);

  const tableTop = 400;
  const colX = [36, 140, 220, 400, 480]; // Time, Status, Location, Note, Duration
  const colW = [100, 80, 180, 80, 80];

  // Header row
  ['Time', 'Status', 'Location', 'Note', 'Duration'].forEach((h, i) => {
    doc.text(h, colX[i], tableTop, { width: colW[i], underline: true });
  });

  // Rows
  let y = tableTop + 16;
  sheet.entries.forEach((e) => {
    const loc = e.location?.name ?? (e.location ? `${e.location.lat.toFixed(3)}, ${e.location.lon.toFixed(3)}` : '—');
    const [fh, fm] = e.from.split(':').map(Number);
    const [th, tm] = e.to.split(':').map(Number);
    const durMin = (th * 60 + tm) - (fh * 60 + fm);

    const cells = [e.from + '–' + e.to, e.status, loc, e.note ?? '—', `${durMin} min`];
    cells.forEach((c, i) => doc.text(c, colX[i], y, { width: colW[i] }));
    y += 14;
  });

  // Certification block
  doc.moveDown(1.5);
  doc.fontSize(12).text('Certification');
  doc.fontSize(9);
  doc.text(`Driver certification: ${log.certifiedByDriver ? 'Yes' : 'No'}`);
  doc.text(`Carrier certification: ${log.certifiedByCarrier ? 'Yes' : 'No'}`);
  doc.moveDown(0.5);
  doc.text('Driver Signature: ____________________________     Date: __________');
  doc.text('Carrier Signature: ___________________________     Date: __________');

  // Violations
  if (log.violations) {
    doc.moveDown(0.5);
    doc.fillColor('#b00020').text('Violations:', { continued: false });
    (log.violations as any[]).forEach(v => doc.text(`- ${v.code ?? '—'}: ${v.message ?? ''}`));
    doc.fillColor('#000000');
  }

  // Footer and hash
  const metaText = `Generated: ${dayjs().format('YYYY-MM-DD HH:mm')} · Software: Azora OS ELD v1 · Trip: ${tripId}`;
  const currentContent = JSON.stringify({ sheet, metaText, company: company.name, driver: sheet.driver });
  const hash = crypto.createHash('sha256').update(currentContent).digest('hex');

  doc.moveTo(36, 800).lineTo(576, 800).stroke();
  doc.fontSize(8).text(metaText, 36, 806);
  doc.text(`Content Hash: ${hash}`, 36, 818);

  doc.end();
  const pdfBuffer = await done;

  // Persist file (replace with S3 or storage)
  // Example: save to disk; in production upload to object storage
  const filename = `eld-${tripId}-${dayjs(log.date).format('YYYYMMDD')}.pdf`;
  // fs.writeFileSync(path.join('/tmp', filename), pdfBuffer); // if using fs

  await prisma.eLDLog.update({
    where: { id: log.id },
    data: { pdfUrl: `/api/logs/${log.id}/pdf`, contentHash: hash }
  });

  return { buffer: pdfBuffer, filename, hash };
}
