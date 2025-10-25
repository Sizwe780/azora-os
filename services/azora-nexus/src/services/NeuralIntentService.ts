/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { NeuralIntent, INeuralIntent } from '@/models/NeuralIntent';
import { User, IUser } from '@/models/User';
import { logger } from '@/utils/logger';
import OpenAI from 'openai';

export class NeuralIntentService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async processUserInput(
    userId: string,
    input: string,
    context?: any
  ): Promise<INeuralIntent> {
    try {
      const startTime = Date.now();

      // Get user profile for context
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Analyze input with AI
      const analysis = await this.analyzeInputWithAI(input, user, context);

      // Create neural intent document
      const neuralIntent = new NeuralIntent({
        userId,
        intent: analysis.intent,
        confidence: analysis.confidence,
        context: {
          input,
          entities: analysis.entities,
          sentiment: analysis.sentiment,
          temporalContext: this.getTemporalContext(),
        },
        processed: false,
      });

      await neuralIntent.save();

      // Process the intent asynchronously
      this.processIntentAsync(neuralIntent);

      logger.info('Neural intent processed', {
        userId,
        intent: analysis.intent,
        confidence: analysis.confidence,
      });

      return neuralIntent;
    } catch (error) {
      logger.error('Error processing neural intent:', error);
      throw error;
    }
  }

  private async analyzeInputWithAI(
    input: string,
    user: IUser,
    context?: any
  ): Promise<{
    intent: string;
    confidence: number;
    entities: Array<{
      type: string;
      value: string;
      confidence: number;
    }>;
    sentiment: {
      score: number;
      magnitude: number;
    };
  }> {
    try {
      const prompt = `Analyze the following user input and extract intent, entities, and sentiment:

User Input: "${input}"

User Context:
- Preferences: ${user.preferences.categories.join(', ')}
- Interests: ${user.preferences.interests.join(', ')}
- Previous interactions: Consider user's history and preferences

Additional Context: ${JSON.stringify(context || {})}

Return analysis in JSON format:
{
  "intent": "primary user intent (e.g., 'find_product', 'get_recommendation', 'ask_question')",
  "confidence": 0.85,
  "entities": [
    {
      "type": "entity_type",
      "value": "entity_value",
      "confidence": 0.9
    }
  ],
  "sentiment": {
    "score": -0.3,
    "magnitude": 0.7
  }
}`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an AI intent analyzer that processes user input to understand their needs and emotions. Return analysis in valid JSON format.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      return JSON.parse(response);
    } catch (error) {
      logger.error('Error analyzing input with AI:', error);
      // Fallback analysis
      return this.fallbackIntentAnalysis(input);
    }
  }

  private fallbackIntentAnalysis(input: string): {
    intent: string;
    confidence: number;
    entities: Array<{
      type: string;
      value: string;
      confidence: number;
    }>;
    sentiment: {
      score: number;
      magnitude: number;
    };
  } {
    // Simple keyword-based fallback
    const lowerInput = input.toLowerCase();

    let intent = 'general_query';
    let confidence = 0.5;

    if (lowerInput.includes('recommend') || lowerInput.includes('suggest')) {
      intent = 'get_recommendation';
      confidence = 0.8;
    } else if (lowerInput.includes('find') || lowerInput.includes('search')) {
      intent = 'find_product';
      confidence = 0.8;
    } else if (lowerInput.includes('help') || lowerInput.includes('?')) {
      intent = 'ask_question';
      confidence = 0.7;
    }

    return {
      intent,
      confidence,
      entities: [],
      sentiment: {
        score: 0,
        magnitude: 0.5,
      },
    };
  }

  private getTemporalContext(): {
    timeOfDay: string;
    dayOfWeek: string;
    season: string;
  } {
    const now = new Date();
    const hour = now.getHours();

    let timeOfDay = 'night';
    if (hour >= 5 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 22) timeOfDay = 'evening';

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = days[now.getDay()];

    const month = now.getMonth();
    let season = 'winter';
    if (month >= 2 && month <= 4) season = 'spring';
    else if (month >= 5 && month <= 7) season = 'summer';
    else if (month >= 8 && month <= 10) season = 'fall';

    return { timeOfDay, dayOfWeek, season };
  }

  private async processIntentAsync(intent: INeuralIntent): Promise<void> {
    try {
      // Generate recommendations based on intent
      const recommendations = await this.generateIntentBasedRecommendations(intent);

      // Generate insights
      const insights = await this.generateIntentBasedInsights(intent);

      // Generate actions
      const actions = await this.generateIntentBasedActions(intent);

      // Update the intent with processing results
      await NeuralIntent.findByIdAndUpdate(intent._id, {
        $set: {
          processed: true,
          processingResult: {
            recommendations,
            actions,
            insights,
          },
        },
      });

      logger.info('Intent processing completed', {
        intentId: intent._id,
        recommendationsCount: recommendations.length,
        insightsCount: insights.length,
        actionsCount: actions.length,
      });
    } catch (error) {
      logger.error('Error processing intent asynchronously:', error);

      // Mark as failed
      await NeuralIntent.findByIdAndUpdate(intent._id, {
        $set: {
          processed: true,
          error: error.message,
        },
      });
    }
  }

  private async generateIntentBasedRecommendations(intent: INeuralIntent): Promise<string[]> {
    // This would integrate with the RecommendationService
    // For now, return placeholder recommendations
    return [
      'Consider exploring related products',
      'Check out trending items in your preferred categories',
      'Review personalized suggestions based on your interests',
    ];
  }

  private async generateIntentBasedInsights(intent: INeuralIntent): Promise<string[]> {
    // Generate insights based on intent analysis
    const insights = [];

    if (intent.context.sentiment.score < -0.3) {
      insights.push('User appears dissatisfied - consider follow-up support');
    }

    if (intent.confidence > 0.8) {
      insights.push('High confidence intent detected - strong user signal');
    }

    if (intent.context.entities.length > 0) {
      insights.push(`Identified ${intent.context.entities.length} key entities in user input`);
    }

    return insights;
  }

  private async generateIntentBasedActions(intent: INeuralIntent): Promise<string[]> {
    // Generate actionable items based on intent
    const actions = [];

    if (intent.intent === 'get_recommendation') {
      actions.push('Generate personalized recommendations');
      actions.push('Update user preference profile');
    }

    if (intent.intent === 'find_product') {
      actions.push('Execute product search');
      actions.push('Apply user filters and preferences');
    }

    if (intent.intent === 'ask_question') {
      actions.push('Provide relevant information');
      actions.push('Offer additional assistance');
    }

    return actions;
  }

  async getUserIntents(
    userId: string,
    limit: number = 50
  ): Promise<INeuralIntent[]> {
    try {
      return await NeuralIntent.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      logger.error('Error fetching user intents:', error);
      throw error;
    }
  }

  async updateIntentFeedback(
    intentId: string,
    feedback: { rating: number; comments?: string }
  ): Promise<void> {
    try {
      await NeuralIntent.findByIdAndUpdate(intentId, {
        $set: {
          feedback: {
            ...feedback,
            timestamp: new Date(),
          },
        },
      });

      logger.info('Intent feedback updated', { intentId });
    } catch (error) {
      logger.error('Error updating intent feedback:', error);
      throw error;
    }
  }
}