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
}