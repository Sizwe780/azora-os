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

export class NotificationService {
  static async sendNotification(userId: string, title: string, message: string, action?: string) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        action,
      },
    });
    // In real system, dispatch via WebSocket, email, etc.
    console.log(`📣 NOTIFICATION for ${userId}: "${title}" - "${message}"`);
    await AuditService.log('NOTIFICATION_SENT', { title, message, action }, userId);
    return notification;
  }

  static async getNotifications(userId: string) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async proactiveNotify(userId: string): Promise<{ title: string; message: string }> {
    // AI-driven proactive notification
    const title = 'Proactive Alert';
    const message = 'Based on your activity, consider completing a course for bonus AZR.';
    await this.sendNotification(userId, title, message, 'learn');
    return { title, message };
  }
}