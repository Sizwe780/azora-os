/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AiTradingService {
  async executeTrade(symbol: string, type: string, amount: number, userId?: string) {
    // AI: Simulate price and execute
    const price = await this.getCurrentPrice(symbol);
    const trade = await prisma.trade.create({
      data: {
        symbol,
        type,
        amount,
        price,
        userId,
      },
    });

    // Audit
    await this.logAudit('TRADE_EXECUTED', trade.id, 'Trade', { symbol, type, amount, price });

    return trade;
  }

  async createStrategy(name: string, parameters: any) {
    const strategy = await prisma.strategy.create({
      data: {
        name,
        parameters,
        performance: 0.0,
      },
    });

    // Audit
    await this.logAudit('STRATEGY_CREATED', strategy.id, 'Strategy', { name });

    return strategy;
  }

  async getTrades(userId: string) {
    return await prisma.trade.findMany({
      where: { userId },
      include: { auditLogs: true },
    });
  }

  async getCurrentPrice(symbol: string): Promise<number> {
    // AI placeholder: Simulate price
    return Math.random() * 100 + 50; // Mock price
  }

  private async logAudit(action: string, entityId: string, entityType: string, details?: any) {
    await prisma.auditLog.create({
      data: {
        action,
        entityId,
        entityType,
        details,
      },
    });
  }
}

export default new AiTradingService();