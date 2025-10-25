/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

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

export class KycAmlService {
  static async checkUser(userId: string, userData: any) {
    // Mock KYC check
    const approved = !!(userData.name && userData.idNumber);
    const risk = approved ? 'low' : 'high';
    const reason = approved ? null : 'Missing info';

    await prisma.kycCheck.create({
      data: {
        userId,
        approved,
        risk,
        reason,
      },
    });

    await AuditService.log('KYC_CHECK', { userData, approved, risk, reason }, userId);

    return { approved, risk, reason };
  }

  static async checkTransaction(userId: string, amount: number) {
    // Mock AML check
    const flagged = amount > 10000;
    const reason = flagged ? 'Large amount' : null;

    await prisma.amlCheck.create({
      data: {
        userId,
        amount,
        flagged,
        reason,
      },
    });

    await AuditService.log('AML_CHECK', { amount, flagged, reason }, userId);

    return { flagged, reason };
  }
}