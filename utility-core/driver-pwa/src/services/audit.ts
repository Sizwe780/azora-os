// src/services/audit.ts
import { prisma } from '../db/client';

export async function audit(companyId: string, actor: string, action: string, details: any) {
  try {
    await prisma.auditEvent.create({
      data: { companyId, actor, action, details, createdAt: new Date() }
    });
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Audit log failed:', e);
    }
  }
}