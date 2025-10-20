import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class BillingService {
  async getTier(userId: string): Promise<{ tier: string }> {
    const sub = await prisma.subscription.findFirst({
      where: { userId, status: 'active' },
    });
    const tier = sub?.tier || 'free_citizen';
    return { tier };
  }

  async createInvoice(userId: string, amount: number): Promise<{ invoiceId: string }> {
    const invoice = await prisma.invoice.create({
      data: { userId, amount },
    });
    await prisma.auditLog.create({
      data: {
        action: 'CREATE_INVOICE',
        details: { userId, amount, invoiceId: invoice.id },
      },
    });
    return { invoiceId: invoice.id };
  }

  // AI: Predict optimal tier
  async predictTier(userId: string): Promise<{ predictedTier: string }> {
    // Mock AI: based on random
    const tiers = ['free_citizen', 'premium', 'enterprise'];
    const predictedTier = tiers[Math.floor(Math.random() * tiers.length)];
    await prisma.auditLog.create({
      data: {
        action: 'PREDICT_TIER',
        details: { userId, predictedTier },
      },
    });
    return { predictedTier };
  }
}