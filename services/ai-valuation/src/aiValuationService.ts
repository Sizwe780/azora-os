import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AIValuationService {
  private currentUserCount: number = 10000;

  async initialize() {
    console.log('Initializing AI Valuation Service...');

    // Load current user count from database
    const latestGrowth = await prisma.userGrowth.findFirst({
      orderBy: { timestamp: 'desc' }
    });

    if (latestGrowth) {
      this.currentUserCount = latestGrowth.totalUsers;
    }

    console.log(`AI Valuation Service initialized with ${this.currentUserCount} users`);
  }

  async onboardUser(source?: string, metadata: any = {}): Promise<{ totalUsers: number }> {
    try {
      // Increment user count
      this.currentUserCount += 1;

      // Create user onboarding record
      await prisma.userOnboarding.create({
        data: {
          userId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          source,
          metadata
        }
      });

      // Update growth metrics
      await prisma.userGrowth.create({
        data: {
          totalUsers: this.currentUserCount,
          newUsers: 1,
          period: 'realtime',
          metadata: {
            source,
            ...metadata
          }
        }
      });

      // Calculate updated valuation
      await this.calculateValuation();

      // Log audit event
      await this.logAudit('user_onboarded', this.currentUserCount.toString(), 'UserGrowth', {
        source,
        metadata,
        newTotal: this.currentUserCount
      });

      return { totalUsers: this.currentUserCount };
    } catch (error) {
      console.error('Error onboarding user:', error);
      throw error;
    }
  }

  async getTotalUsers(): Promise<{ totalUsers: number }> {
    // Ensure we have the latest count
    const latestGrowth = await prisma.userGrowth.findFirst({
      orderBy: { timestamp: 'desc' }
    });

    if (latestGrowth) {
      this.currentUserCount = latestGrowth.totalUsers;
    }

    return { totalUsers: this.currentUserCount };
  }

  private async calculateValuation() {
    try {
      // Simple valuation calculation based on user count
      // In production, this would use sophisticated AI models
      const userValue = 50; // Average revenue per user per year
      const growthRate = 0.15; // 15% annual growth
      const marketMultiple = 10; // Industry average

      const annualRevenue = this.currentUserCount * userValue;
      const projectedRevenue = annualRevenue * (1 + growthRate);
      const valuation = projectedRevenue * marketMultiple;

      // Store valuation metric
      await prisma.valuationMetrics.create({
        data: {
          metricType: 'company_valuation',
          value: valuation,
          confidence: 0.85,
          parameters: {
            userCount: this.currentUserCount,
            userValue,
            growthRate,
            marketMultiple
          },
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Valid for 30 days
        }
      });

      await this.logAudit('valuation_calculated', valuation.toString(), 'ValuationMetrics', {
        userCount: this.currentUserCount,
        calculatedValue: valuation
      });

    } catch (error) {
      console.error('Error calculating valuation:', error);
      // Don't throw - valuation calculation failure shouldn't break onboarding
    }
  }

  async getValuationMetrics(limit: number = 10) {
    return await prisma.valuationMetrics.findMany({
      orderBy: { calculatedAt: 'desc' },
      take: limit
    });
  }

  async getGrowthMetrics(period?: string, limit: number = 50) {
    const where: any = {};
    if (period) where.period = period;

    return await prisma.userGrowth.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit
    });
  }

  private async logAudit(action: string, entityId: string, entityType: string, details: any) {
    await prisma.auditLog.create({
      data: {
        action,
        entityId,
        entityType,
        details
      }
    });
  }

  async getAuditLogs(entityId?: string, entityType?: string, limit: number = 50) {
    const where: any = {};
    if (entityId) where.entityId = entityId;
    if (entityType) where.entityType = entityType;

    return await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit
    });
  }
}

export const aiValuationService = new AIValuationService();