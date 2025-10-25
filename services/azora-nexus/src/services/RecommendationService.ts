/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Recommendation, IRecommendation } from '@/models/Recommendation';
import { User, IUser } from '@/models/User';
import { NeuralIntent, INeuralIntent } from '@/models/NeuralIntent';
import { logger } from '@/utils/logger';
import OpenAI from 'openai';

export class RecommendationService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateRecommendations(
    userId: string,
    type: 'product' | 'content' | 'service' | 'personalized',
    context?: any
  ): Promise<IRecommendation> {
    try {
      const startTime = Date.now();

      // Get user profile and preferences
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get recent neural intents for context
      const recentIntents = await NeuralIntent.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10);

      // Generate AI-powered recommendations
      const recommendations = await this.generateAIRecommendations(
        user,
        recentIntents,
        type,
        context
      );

      // Calculate overall score
      const score = this.calculateRecommendationScore(recommendations);

      // Create recommendation document
      const recommendation = new Recommendation({
        userId,
        type,
        items: recommendations,
        score,
        context: {
          userPreferences: user.preferences,
          behavioralData: recentIntents,
          temporalFactors: context?.temporalFactors,
        },
        metadata: {
          algorithm: 'neural-network-v1',
          processingTime: Date.now() - startTime,
          confidence: score,
          source: 'ai-nexus',
        },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });

      await recommendation.save();

      logger.info('Recommendations generated successfully', {
        userId,
        type,
        itemCount: recommendations.length,
        score,
      });

      return recommendation;
    } catch (error) {
      logger.error('Error generating recommendations:', error);
      throw error;
    }
  }

  private async generateAIRecommendations(
    user: IUser,
    intents: INeuralIntent[],
    type: string,
    context?: any
  ): Promise<Array<{
    id: string;
    title: string;
    description?: string;
    category: string;
    score: number;
    metadata: any;
  }>> {
    try {
      const prompt = this.buildRecommendationPrompt(user, intents, type, context);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an AI recommendation engine that provides personalized suggestions based on user behavior and preferences. Return recommendations in JSON format.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const recommendations = JSON.parse(response);

      // Validate and score recommendations
      return recommendations.map((rec: any, index: number) => ({
        id: `rec_${Date.now()}_${index}`,
        title: rec.title,
        description: rec.description,
        category: rec.category,
        score: Math.min(Math.max(rec.score || 0.8, 0), 1),
        metadata: rec.metadata || {},
      }));
    } catch (error) {
      logger.error('Error generating AI recommendations:', error);
      // Fallback to rule-based recommendations
      return this.generateFallbackRecommendations(user, type);
    }
  }

  private buildRecommendationPrompt(
    user: IUser,
    intents: INeuralIntent[],
    type: string,
    context?: any
  ): string {
    return `Generate personalized ${type} recommendations for a user with the following profile:

User Preferences:
- Categories: ${user.preferences.categories.join(', ')}
- Interests: ${user.preferences.interests.join(', ')}
- Personalization Level: ${user.preferences.personalizationLevel}

Recent Intent History:
${intents.map(intent => `- ${intent.intent} (confidence: ${intent.confidence})`).join('\n')}

Context: ${JSON.stringify(context || {})}

Please return 5-10 recommendations in the following JSON format:
[
  {
    "title": "Recommendation Title",
    "description": "Brief description",
    "category": "Category name",
    "score": 0.85,
    "metadata": {
      "reasoning": "Why this recommendation fits",
      "urgency": "high|medium|low"
    }
  }
]`;
  }

  private generateFallbackRecommendations(
    user: IUser,
    type: string
  ): Array<{
    id: string;
    title: string;
    description?: string;
    category: string;
    score: number;
    metadata: any;
  }> {
    // Simple rule-based fallback
    const recommendations = [];

    for (const category of user.preferences.categories) {
      recommendations.push({
        id: `fallback_${category}_${Date.now()}`,
        title: `Recommended ${category} item`,
        description: `Based on your interest in ${category}`,
        category,
        score: 0.7,
        metadata: { source: 'fallback' },
      });
    }

    return recommendations.slice(0, 5);
  }

  private calculateRecommendationScore(
    recommendations: Array<{ score: number }>
  ): number {
    if (recommendations.length === 0) return 0;

    const totalScore = recommendations.reduce((sum, rec) => sum + rec.score, 0);
    return totalScore / recommendations.length;
  }

  async getUserRecommendations(
    userId: string,
    type?: string,
    limit: number = 20
  ): Promise<IRecommendation[]> {
    try {
      const query: any = { userId };
      if (type) {
        query.type = type;
      }

      return await Recommendation.find(query)
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      logger.error('Error fetching user recommendations:', error);
      throw error;
    }
  }

  async updateRecommendationFeedback(
    recommendationId: string,
    feedback: { rating: number; comments?: string }
  ): Promise<void> {
    try {
      await Recommendation.findByIdAndUpdate(recommendationId, {
        $set: {
          'metadata.feedback': {
            ...feedback,
            timestamp: new Date(),
          },
        },
      });

      logger.info('Recommendation feedback updated', { recommendationId });
    } catch (error) {
      logger.error('Error updating recommendation feedback:', error);
      throw error;
    }
  }
}