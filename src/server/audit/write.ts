// src/server/audit/write.ts
import { prisma } from '../prisma';

export interface AuditEntry {
  uid: string;
  companyId?: string;
  actorId?: string;
  type: string;
  targetId?: string;
  meta?: Record<string, any>;
}

export async function writeAudit(entry: AuditEntry, p0: string, p1: string, p2: { name: any; vatNumber: any; vatPercent: any; popiaConsent: any; }) {
  return prisma.audit.create({
    data: {
      uid: entry.uid,
      companyId: entry.companyId ?? null,
      actorId: entry.actorId ?? null,
      type: entry.type,
      targetId: entry.targetId ?? null,
      meta: entry.meta ?? {}
    }
  });
}
