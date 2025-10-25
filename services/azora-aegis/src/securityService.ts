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

export class SecurityService {
  static async logSecurityEvent(eventType: string, details: any, severity: string, userId?: string, cameraId?: string) {
    await prisma.securityEvent.create({
      data: {
        eventType,
        details,
        severity,
        userId,
        cameraId,
      },
    });

    await AuditService.log('SECURITY_EVENT', { eventType, details, severity, cameraId }, userId);
  }

  static async getSecurityEvents(userId?: string) {
    return await prisma.securityEvent.findMany({
      where: userId ? { userId } : {},
      orderBy: { timestamp: 'desc' },
    });
  }
}