// src/server/ledger.ts
import { prisma } from './prisma';

export async function recordLedgerEntry(params: {
  uid: string;
  type: 'ELD_LOG' | 'CONTRACT' | 'PAYOUT' | 'INVOICE' | 'DRIVER';
  entityId: string;
  driverId?: string;
  companyId?: string;
  hash: string;
}) {
  return prisma.ledgerEntry.create({ data: params });
}

export async function verifyLedgerUID(uid: string) {
  return prisma.ledgerEntry.findUnique({ where: { uid } });
}
