import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AIRecommendationsService {
  async initialize() {
    console.log('Initializing AI Recommendations Service...');
    // Load any cached models or data if needed
    console.log('AI Recommendations Service initialized');
  }

  async getRecommendations(userId: string, context: any, limit: number = 10): Promise<any[]> {
    try {
      // Get or create user profile
      let userProfile = await prisma.userProfile.findUnique({
        where: { userId }
      });

      if (!userProfile) {
        userProfile = await prisma.userProfile.create({
          data: {
            userId,
            preferences: {},
            behavior: {}
          }
        });
      }

      // Generate recommendations based on user profile and context
      const recommendations = await this.generateRecommendations(userProfile, context, limit);

      // Store recommendations in database
      const savedRecommendations = [];
      for (const rec of recommendations) {
        const savedRec = await prisma.recommendation.create({
          data: {
            userId,
            type: rec.type,
            itemId: rec.itemId,
            itemName: rec.itemName,
            score: rec.score,
            context
          }
        });
        savedRecommendations.push(savedRec);
      }

      // Log audit event
      await this.logAudit('recommendations_generated', userId, 'UserProfile', {
        count: recommendations.length,
        context
      });

      return savedRecommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }

  private async generateRecommendations(userProfile: any, context: any, limit: number): Promise<any[]> {
    // Placeholder for actual AI/ML recommendation logic
    // In production, this would use collaborative filtering, content-based filtering,
    // or advanced ML models like neural networks

    const baseRecommendations = [
      { type: "feature", itemId: "ai-assistant", itemName: "AI Assistant", score: 0.95 },
      { type: "service", itemId: "analytics-dashboard", itemName: "Analytics Dashboard", score: 0.88 },
      { type: "feature", itemId: "predictive-analytics", itemName: "Predictive Analytics", score: 0.82 },
      { type: "service", itemId: "automated-reporting", itemName: "Automated Reporting", score: 0.79 },
      { type: "feature", itemId: "real-time-monitoring", itemName: "Real-time Monitoring", score: 0.75 }
    ];

    // Simple personalization based on user behavior (placeholder logic)
    const personalizedRecs = baseRecommendations.map(rec => ({
      ...rec,
      score: rec.score * (Math.random() * 0.2 + 0.9) // Add some randomization
    }));

    // Sort by score and limit
    return personalizedRecs
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async logInteraction(userId: string, type: string, itemId: string, recommendationId?: string, metadata: any = {}) {
    try {
      await prisma.interaction.create({
        data: {
          userId,
          recommendationId,
          type,
          itemId,
          metadata
        }
      });

      // Update user behavior data for future recommendations
      await this.updateUserBehavior(userId, type, itemId);

      // Log audit event
      await this.logAudit('interaction_logged', userId, 'UserProfile', {
        type,
        itemId,
        recommendationId,
        metadata
      });

    } catch (error) {
      console.error('Error logging interaction:', error);
      throw error;
    }
  }

  private async updateUserBehavior(userId: string, interactionType: string, itemId: string) {
    // Update user profile with interaction data for improved recommendations
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId }
    });

    if (userProfile) {
      const currentBehavior = userProfile.behavior as any;
      const updatedBehavior = {
        ...currentBehavior,
        lastInteraction: {
          type: interactionType,
          itemId,
          timestamp: new Date()
        },
        interactionCount: (currentBehavior.interactionCount || 0) + 1
      };

      await prisma.userProfile.update({
        where: { userId },
        data: { behavior: updatedBehavior }
      });
    }
  }

  async updateUserProfile(userId: string, preferences: any, demographics?: any) {
    try {
      const updateData: any = {
        preferences,
        updatedAt: new Date()
      };

      if (demographics) {
        updateData.demographics = demographics;
      }

      const profile = await prisma.userProfile.upsert({
        where: { userId },
        update: updateData,
        create: {
          userId,
          preferences,
          behavior: {},
          demographics
        }
      });

      await this.logAudit('profile_updated', userId, 'UserProfile', { preferences, demographics });

      return profile;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
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

export const aiRecommendationsService = new AIRecommendationsService();