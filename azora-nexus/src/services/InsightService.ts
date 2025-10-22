/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Insight, IInsight } from '@/models/Insight';
import { User, IUser } from '@/models/User';
import { NeuralIntent, INeuralIntent } from '@/models/NeuralIntent';
import { Recommendation, IRecommendation } from '@/models/Recommendation';
import { logger } from '@/utils/logger';
import OpenAI from 'openai';

export class InsightService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateInsights(
    userId: string,
    type: 'behavioral' | 'predictive' | 'comparative' | 'trend' | 'anomaly'
  ): Promise<IInsight[]> {
    try {
      const startTime = Date.now();

      // Gather user data for analysis
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const recentIntents = await NeuralIntent.find({ userId })
        .sort({ createdAt: -1 })
        .limit(100);

      const recentRecommendations = await Recommendation.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50);

      // Generate insights based on type
      const insights = await this.generateInsightsByType(
        type,
        user,
        recentIntents,
        recentRecommendations
      );

      logger.info('Insights generated successfully', {
        userId,
        type,
        insightCount: insights.length,
      });

      return insights;
    } catch (error) {
      logger.error('Error generating insights:', error);
      throw error;
    }
  }

  private async generateInsightsByType(
    type: string,
    user: IUser,
    intents: INeuralIntent[],
    recommendations: IRecommendation[]
  ): Promise<IInsight[]> {
    const insights: IInsight[] = [];

    switch (type) {
      case 'behavioral':
        insights.push(...await this.generateBehavioralInsights(user, intents));
        break;
      case 'predictive':
        insights.push(...await this.generatePredictiveInsights(user, intents, recommendations));
        break;
      case 'trend':
        insights.push(...await this.generateTrendInsights(user, intents));
        break;
      case 'anomaly':
        insights.push(...await this.generateAnomalyInsights(user, intents));
        break;
      case 'comparative':
        insights.push(...await this.generateComparativeInsights(user, intents));
        break;
    }

    return insights;
  }

  private async generateBehavioralInsights(
    user: IUser,
    intents: INeuralIntent[]
  ): Promise<IInsight[]> {
    const insights: IInsight[] = [];

    try {
      // Analyze intent patterns
      const intentCounts = intents.reduce((acc, intent) => {
        acc[intent.intent] = (acc[intent.intent] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topIntent = Object.entries(intentCounts)
        .sort(([,a], [,b]) => b - a)[0];

      if (topIntent) {
        insights.push(new Insight({
          userId: user._id,
          category: 'behavioral',
          content: `Your most common intent is "${topIntent[0]}" with ${topIntent[1]} occurrences. This suggests a strong preference for this type of interaction.`,
          priority: 'medium',
          actionable: true,
          metadata: {
            source: 'behavioral-analysis',
            algorithm: 'pattern-recognition',
            confidence: 0.85,
            dataPoints: intents.length,
            timeRange: {
              start: intents[intents.length - 1]?.createdAt || new Date(),
              end: intents[0]?.createdAt || new Date(),
            },
          },
          recommendations: [{
            type: 'personalization',
            description: 'Increase recommendations for this intent type',
            impact: 'high',
            effort: 'low',
          }],
        }));
      }

      // Analyze temporal patterns
      const hourCounts = intents.reduce((acc, intent) => {
        const hour = new Date(intent.createdAt).getHours();
        acc[hour] = (acc[acc] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const peakHour = Object.entries(hourCounts)
        .sort(([,a], [,b]) => b - a)[0];

      if (peakHour) {
        insights.push(new Insight({
          userId: user._id,
          category: 'behavioral',
          content: `You are most active at ${peakHour[0]}:00, with ${peakHour[1]} interactions during this hour.`,
          priority: 'low',
          actionable: true,
          metadata: {
            source: 'temporal-analysis',
            algorithm: 'time-pattern',
            confidence: 0.75,
            dataPoints: intents.length,
            timeRange: {
              start: intents[intents.length - 1]?.createdAt || new Date(),
              end: intents[0]?.createdAt || new Date(),
            },
          },
          recommendations: [{
            type: 'timing',
            description: 'Schedule recommendations during peak activity hours',
            impact: 'medium',
            effort: 'medium',
          }],
        }));
      }

      // Save insights to database
      for (const insight of insights) {
        await insight.save();
      }

    } catch (error) {
      logger.error('Error generating behavioral insights:', error);
    }

    return insights;
  }

  private async generatePredictiveInsights(
    user: IUser,
    intents: INeuralIntent[],
    recommendations: IRecommendation[]
  ): Promise<IInsight[]> {
    const insights: IInsight[] = [];

    try {
      // Predict future interests based on trends
      const recentIntents = intents.slice(0, 20);
      const categories = recentIntents
        .flatMap(intent => intent.context.entities)
        .filter(entity => entity.type === 'category')
        .map(entity => entity.value);

      const categoryCounts = categories.reduce((acc, category) => {
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const trendingCategory = Object.entries(categoryCounts)
        .sort(([,a], [,b]) => b - a)[0];

      if (trendingCategory && trendingCategory[1] >= 3) {
        insights.push(new Insight({
          userId: user._id,
          category: 'predictive',
          content: `Based on your recent activity, you may be interested in more "${trendingCategory[0]}" related content and products.`,
          priority: 'medium',
          actionable: true,
          metadata: {
            source: 'predictive-analysis',
            algorithm: 'trend-prediction',
            confidence: 0.7,
            dataPoints: recentIntents.length,
            timeRange: {
              start: recentIntents[recentIntents.length - 1]?.createdAt || new Date(),
              end: recentIntents[0]?.createdAt || new Date(),
            },
          },
          recommendations: [{
            type: 'content',
            description: `Explore more ${trendingCategory[0]} recommendations`,
            impact: 'high',
            effort: 'low',
          }],
        }));
      }

      // Save insights to database
      for (const insight of insights) {
        await insight.save();
      }

    } catch (error) {
      logger.error('Error generating predictive insights:', error);
    }

    return insights;
  }

  private async generateTrendInsights(
    user: IUser,
    intents: INeuralIntent[]
  ): Promise<IInsight[]> {
    const insights: IInsight[] = [];

    try {
      // Analyze trends over time
      const weeklyData = this.groupByWeek(intents);
      const trend = this.calculateTrend(weeklyData);

      if (Math.abs(trend.slope) > 0.1) {
        const direction = trend.slope > 0 ? 'increasing' : 'decreasing';
        insights.push(new Insight({
          userId: user._id,
          category: 'trend',
          content: `Your activity level is ${direction} with a ${Math.abs(trend.slope * 100).toFixed(1)}% change per week.`,
          priority: trend.slope > 0 ? 'low' : 'medium',
          actionable: true,
          metadata: {
            source: 'trend-analysis',
            algorithm: 'linear-regression',
            confidence: 0.8,
            dataPoints: weeklyData.length,
            timeRange: {
              start: intents[intents.length - 1]?.createdAt || new Date(),
              end: intents[0]?.createdAt || new Date(),
            },
          },
          recommendations: trend.slope < 0 ? [{
            type: 'engagement',
            description: 'Consider re-engagement strategies to maintain activity',
            impact: 'medium',
            effort: 'high',
          }] : [],
        }));
      }

      // Save insights to database
      for (const insight of insights) {
        await insight.save();
      }

    } catch (error) {
      logger.error('Error generating trend insights:', error);
    }

    return insights;
  }

  private async generateAnomalyInsights(
    user: IUser,
    intents: INeuralIntent[]
  ): Promise<IInsight[]> {
    const insights: IInsight[] = [];

    try {
      // Detect anomalies in behavior
      const avgConfidence = intents.reduce((sum, intent) => sum + intent.confidence, 0) / intents.length;
      const anomalies = intents.filter(intent => Math.abs(intent.confidence - avgConfidence) > 0.3);

      if (anomalies.length > 0) {
        insights.push(new Insight({
          userId: user._id,
          category: 'anomaly',
          content: `Detected ${anomalies.length} unusual interactions with significantly different confidence levels.`,
          priority: 'high',
          actionable: true,
          metadata: {
            source: 'anomaly-detection',
            algorithm: 'statistical-outlier',
            confidence: 0.9,
            dataPoints: intents.length,
            timeRange: {
              start: intents[intents.length - 1]?.createdAt || new Date(),
              end: intents[0]?.createdAt || new Date(),
            },
          },
          recommendations: [{
            type: 'investigation',
            description: 'Review unusual interactions for potential issues',
            impact: 'high',
            effort: 'medium',
          }],
        }));
      }

      // Save insights to database
      for (const insight of insights) {
        await insight.save();
      }

    } catch (error) {
      logger.error('Error generating anomaly insights:', error);
    }

    return insights;
  }

  private async generateComparativeInsights(
    user: IUser,
    intents: INeuralIntent[]
  ): Promise<IInsight[]> {
    const insights: IInsight[] = [];

    try {
      // Compare user behavior to general patterns
      // This would typically compare against aggregated data
      const userAvgConfidence = intents.reduce((sum, intent) => sum + intent.confidence, 0) / intents.length;
      const generalAvgConfidence = 0.75; // Placeholder for general average

      if (userAvgConfidence > generalAvgConfidence + 0.1) {
        insights.push(new Insight({
          userId: user._id,
          category: 'comparative',
          content: `Your interaction confidence is ${((userAvgConfidence - generalAvgConfidence) * 100).toFixed(1)}% higher than average.`,
          priority: 'low',
          actionable: false,
          metadata: {
            source: 'comparative-analysis',
            algorithm: 'benchmarking',
            confidence: 0.85,
            dataPoints: intents.length,
            timeRange: {
              start: intents[intents.length - 1]?.createdAt || new Date(),
              end: intents[0]?.createdAt || new Date(),
            },
          },
          recommendations: [],
        }));
      }

      // Save insights to database
      for (const insight of insights) {
        await insight.save();
      }

    } catch (error) {
      logger.error('Error generating comparative insights:', error);
    }

    return insights;
  }

  private groupByWeek(intents: INeuralIntent[]): Record<string, number> {
    return intents.reduce((acc, intent) => {
      const week = this.getWeekNumber(intent.createdAt);
      acc[week] = (acc[week] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private getWeekNumber(date: Date): string {
    const year = date.getFullYear();
    const week = Math.ceil((date.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    return `${year}-W${week}`;
  }

  private calculateTrend(data: Record<string, number>): { slope: number; intercept: number } {
    const entries = Object.entries(data).map(([week, count]) => ({
      x: parseInt(week.split('-W')[1]),
      y: count,
    }));

    if (entries.length < 2) return { slope: 0, intercept: 0 };

    const n = entries.length;
    const sumX = entries.reduce((sum, point) => sum + point.x, 0);
    const sumY = entries.reduce((sum, point) => sum + point.y, 0);
    const sumXY = entries.reduce((sum, point) => sum + point.x * point.y, 0);
    const sumXX = entries.reduce((sum, point) => sum + point.x * point.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  async getUserInsights(
    userId: string,
    category?: string,
    status?: string,
    limit: number = 20
  ): Promise<IInsight[]> {
    try {
      const query: any = { userId };
      if (category) query.category = category;
      if (status) query.status = status;

      return await Insight.find(query)
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      logger.error('Error fetching user insights:', error);
      throw error;
    }
  }

  async updateInsightStatus(
    insightId: string,
    status: 'new' | 'viewed' | 'acted_upon' | 'dismissed'
  ): Promise<void> {
    try {
      const update: any = { status };

      if (status === 'viewed') {
        update.viewedAt = new Date();
      } else if (status === 'acted_upon') {
        update.actedUponAt = new Date();
      }

      await Insight.findByIdAndUpdate(insightId, { $set: update });

      logger.info('Insight status updated', { insightId, status });
    } catch (error) {
      logger.error('Error updating insight status:', error);
      throw error;
    }
  }
}