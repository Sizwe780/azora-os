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

export class ApiGatewayService {
  static async logApiCall(method: string, path: string, userId: string | undefined, ip: string, responseTime: number, statusCode: number) {
    await prisma.apiCall.create({
      data: {
        method,
        path,
        userId,
        ip,
        responseTime,
        statusCode,
      },
    });

    await AuditService.log('API_CALL', { method, path, ip, responseTime, statusCode }, userId);
  }

  static async getApiCalls(userId?: string) {
    return await prisma.apiCall.findMany({
      where: userId ? { userId } : {},
      orderBy: { timestamp: 'desc' },
    });
  }
}