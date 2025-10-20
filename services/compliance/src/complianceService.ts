import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export class AuditService {
  static async log(eventType: string, details: any, userId?: string) {
    await prisma.auditLog.create({
      data: {
        eventType,
        details,
        userId,
      },
    });
  }
}

export class ComplianceService {
  static async checkCompliance(userId: string, action: string): Promise<{ compliant: boolean; risk: string }> {
    // Mock compliance check with AI integration placeholder
    const compliant = Math.random() > 0.1; // 90% pass rate
    const risk = compliant ? 'low' : 'high';

    await prisma.complianceCheck.create({
      data: {
        userId,
        action,
        compliant,
        risk,
      },
    });

    await AuditService.log('COMPLIANCE_CHECK', { userId, action, compliant, risk }, userId);

    return { compliant, risk };
  }

  static async getComplianceRecords(userId: string) {
    return await prisma.complianceCheck.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
    });
  }
}