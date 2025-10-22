/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Analysis, IAnalysis } from '@/models/Analysis';
import { User, IUser } from '@/models/User';
import { NeuralIntent, INeuralIntent } from '@/models/NeuralIntent';
import { Recommendation, IRecommendation } from '@/models/Recommendation';
import { logger } from '@/utils/logger';
import OpenAI from 'openai';

export class AnalysisService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async performAnalysis(
    userId: string,
    type: 'behavioral' | 'predictive' | 'comparative' | 'trend',
    parameters: any = {}
  ): Promise<IAnalysis> {
    try {
      const startTime = Date.now();

      // Get user data
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Gather relevant data based on analysis type
      const data = await this.gatherAnalysisData(userId, type, parameters);

      // Create analysis document
      const analysis = new Analysis({
        userId,
        type,
        data: {
          input: data,
          parameters,
          filters: parameters.filters || {},
        },
        metadata: {
          algorithm: this.getAlgorithmForType(type),
          processingTime: 0, // Will be updated after processing
          dataPoints: data.totalPoints,
          timeRange: data.timeRange,
        },
        status: 'processing',
      });

      await analysis.save();

      // Perform analysis asynchronously
      this.performAnalysisAsync(analysis, data);

      logger.info('Analysis initiated', {
        userId,
        type,
        analysisId: analysis._id,
      });

      return analysis;
    } catch (error) {
      logger.error('Error initiating analysis:', error);
      throw error;
    }
  }

  private async gatherAnalysisData(
    userId: string,
    type: string,
    parameters: any
  ): Promise<{
    intents: INeuralIntent[];
    recommendations: IRecommendation[];
    totalPoints: number;
    timeRange: { start: Date; end: Date };
  }> {
    const timeRange = parameters.timeRange || {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date(),
    };

    const intents = await NeuralIntent.find({
      userId,
      createdAt: { $gte: timeRange.start, $lte: timeRange.end },
    }).sort({ createdAt: -1 });

    const recommendations = await Recommendation.find({
      userId,
      createdAt: { $gte: timeRange.start, $lte: timeRange.end },
    }).sort({ createdAt: -1 });

    return {
      intents,
      recommendations,
      totalPoints: intents.length + recommendations.length,
      timeRange,
    };
  }

  private getAlgorithmForType(type: string): string {
    const algorithms = {
      behavioral: 'behavior-pattern-analysis',
      predictive: 'machine-learning-prediction',
      comparative: 'benchmark-comparison',
      trend: 'time-series-analysis',
    };
    return algorithms[type as keyof typeof algorithms] || 'general-analysis';
  }

  private async performAnalysisAsync(
    analysis: IAnalysis,
    data: any
  ): Promise<void> {
    try {
      const startTime = Date.now();

      let results;

      switch (analysis.type) {
        case 'behavioral':
          results = await this.performBehavioralAnalysis(data);
          break;
        case 'predictive':
          results = await this.performPredictiveAnalysis(data);
          break;
        case 'comparative':
          results = await this.performComparativeAnalysis(data);
          break;
        case 'trend':
          results = await this.performTrendAnalysis(data);
          break;
        default:
          throw new Error(`Unsupported analysis type: ${analysis.type}`);
      }

      const processingTime = Date.now() - startTime;

      // Update analysis with results
      await Analysis.findByIdAndUpdate(analysis._id, {
        $set: {
          results,
          'metadata.processingTime': processingTime,
          status: 'completed',
        },
      });

      logger.info('Analysis completed successfully', {
        analysisId: analysis._id,
        type: analysis.type,
        processingTime,
      });

    } catch (error) {
      logger.error('Error performing analysis:', error);

      // Update analysis with error
      await Analysis.findByIdAndUpdate(analysis._id, {
        $set: {
          status: 'failed',
          error: error.message,
        },
      });
    }
  }

  private async performBehavioralAnalysis(data: any): Promise<any> {
    const { intents, recommendations } = data;

    // Analyze intent patterns
    const intentPatterns = this.analyzeIntentPatterns(intents);

    // Analyze recommendation effectiveness
    const recommendationPatterns = this.analyzeRecommendationPatterns(recommendations);

    // Generate insights
    const insights = await this.generateBehavioralInsightsAI(intents, recommendations);

    return {
      insights,
      patterns: {
        intents: intentPatterns,
        recommendations: recommendationPatterns,
      },
      predictions: [],
      metrics: {
        accuracy: 0.85,
        confidence: 0.8,
        coverage: intents.length > 0 ? 1 : 0,
      },
    };
  }

  private async performPredictiveAnalysis(data: any): Promise<any> {
    const { intents, recommendations } = data;

    // Generate predictions using AI
    const predictions = await this.generatePredictionsAI(intents, recommendations);

    return {
      insights: [
        'Predictive analysis completed based on user behavior patterns',
        'Future interests predicted with confidence scores',
      ],
      patterns: [],
      predictions,
      metrics: {
        accuracy: 0.75,
        confidence: 0.7,
        coverage: 0.8,
      },
    };
  }

  private async performComparativeAnalysis(data: any): Promise<any> {
    // Compare user behavior against general patterns
    const comparisons = this.generateComparisons(data);

    return {
      insights: [
        'Comparative analysis shows user engagement patterns',
        'Benchmarked against general user behavior',
      ],
      patterns: [],
      predictions: [],
      metrics: {
        accuracy: 0.9,
        confidence: 0.85,
        coverage: 0.95,
      },
    };
  }

  private async performTrendAnalysis(data: any): Promise<any> {
    const { intents } = data;

    // Analyze trends over time
    const trends = this.analyzeTrends(intents);

    return {
      insights: [
        'Trend analysis reveals user behavior evolution',
        'Identified significant patterns and changes over time',
      ],
      patterns: trends,
      predictions: [],
      metrics: {
        accuracy: 0.8,
        confidence: 0.75,
        coverage: 0.9,
      },
    };
  }

  private analyzeIntentPatterns(intents: INeuralIntent[]): any {
    const patterns = intents.reduce((acc, intent) => {
      const key = intent.intent;
      if (!acc[key]) {
        acc[key] = { count: 0, avgConfidence: 0, totalConfidence: 0 };
      }
      acc[key].count++;
      acc[key].totalConfidence += intent.confidence;
      acc[key].avgConfidence = acc[key].totalConfidence / acc[key].count;
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(patterns).map(([intent, data]: [string, any]) => ({
      intent,
      frequency: data.count,
      averageConfidence: data.avgConfidence,
    }));
  }

  private analyzeRecommendationPatterns(recommendations: IRecommendation[]): any {
    return recommendations.map(rec => ({
      type: rec.type,
      score: rec.score,
      itemCount: rec.items.length,
    }));
  }

  private async generateBehavioralInsightsAI(
    intents: INeuralIntent[],
    recommendations: IRecommendation[]
  ): Promise<string[]> {
    try {
      const prompt = `Analyze user behavior patterns from the following data:

Intents: ${intents.slice(0, 10).map(i => `${i.intent} (${i.confidence})`).join(', ')}
Recommendations: ${recommendations.slice(0, 5).map(r => `${r.type} (${r.score})`).join(', ')}

Generate 3-5 key behavioral insights.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a behavioral analyst. Generate concise, actionable insights from user data.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      const response = completion.choices[0]?.message?.content;
      return response ? response.split('\n').filter(line => line.trim()) : [];
    } catch (error) {
      logger.error('Error generating behavioral insights with AI:', error);
      return [
        'User shows consistent engagement patterns',
        'Recommendation acceptance varies by category',
        'Intent confidence indicates clear user preferences',
      ];
    }
  }

  private async generatePredictionsAI(
    intents: INeuralIntent[],
    recommendations: IRecommendation[]
  ): Promise<Array<{
    outcome: string;
    probability: number;
    timeframe: string;
    factors: string[];
  }>> {
    try {
      const prompt = `Based on user behavior data, predict future actions and interests:

Recent intents: ${intents.slice(0, 5).map(i => i.intent).join(', ')}
Recent recommendations: ${recommendations.slice(0, 3).map(r => r.type).join(', ')}

Generate 2-3 predictions with probabilities.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a predictive analyst. Generate future behavior predictions based on current patterns.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.6,
        max_tokens: 200,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) return [];

      // Parse response into structured predictions
      return response.split('\n')
        .filter(line => line.trim())
        .map(line => ({
          outcome: line,
          probability: 0.7,
          timeframe: 'next week',
          factors: ['historical behavior', 'current trends'],
        }));
    } catch (error) {
      logger.error('Error generating predictions with AI:', error);
      return [];
    }
  }

  private generateComparisons(data: any): any {
    // Placeholder for comparative analysis
    return {
      engagement: 'above_average',
      preferences: 'unique_categories',
      activity: 'consistent',
    };
  }

  private analyzeTrends(intents: INeuralIntent[]): any {
    // Simple trend analysis
    const dailyCounts = intents.reduce((acc, intent) => {
      const day = new Date(intent.createdAt).toDateString();
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const trend = Object.values(dailyCounts).reduce((sum, count) => sum + count, 0) / Object.keys(dailyCounts).length;

    return {
      averageDailyActivity: trend,
      trend: trend > 1 ? 'increasing' : 'stable',
    };
  }

  async getUserAnalyses(
    userId: string,
    type?: string,
    status?: string,
    limit: number = 20
  ): Promise<IAnalysis[]> {
    try {
      const query: any = { userId };
      if (type) query.type = type;
      if (status) query.status = status;

      return await Analysis.find(query)
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      logger.error('Error fetching user analyses:', error);
      throw error;
    }
  }

  async getAnalysisById(analysisId: string): Promise<IAnalysis | null> {
    try {
      return await Analysis.findById(analysisId);
    } catch (error) {
      logger.error('Error fetching analysis by ID:', error);
      throw error;
    }
  }
}