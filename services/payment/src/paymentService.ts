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

export class PaymentService {
  static async initializePayment(email: string, amount: number, reference: string, callbackUrl?: string) {
    // Mock Paystack integration for independence
    const payment = await prisma.payment.create({
      data: {
        email,
        amount,
        reference,
        status: 'initialized',
      },
    });
    await AuditService.log('PAYMENT_INITIALIZED', { email, amount, reference, callbackUrl }, email);
    return {
      status: true,
      message: 'Payment initialized',
      data: {
        authorization_url: `https://azora-pay.com/pay/${reference}`,
        access_code: reference,
        reference,
      },
    };
  }

  static async verifyPayment(reference: string) {
    const payment = await prisma.payment.findUnique({ where: { reference } });
    if (!payment) throw new Error('Payment not found');
    // Mock verification
    const status = 'success'; // In real, check with provider
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status },
    });
    await AuditService.log('PAYMENT_VERIFIED', { reference, status }, payment.email);
    return { status, reference };
  }

  static async getPayments(userId?: string) {
    return await prisma.payment.findMany({
      where: userId ? { email: userId } : {},
      orderBy: { createdAt: 'desc' },
    });
  }
}