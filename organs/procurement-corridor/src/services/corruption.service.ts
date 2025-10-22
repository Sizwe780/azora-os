/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../utils/logger';
import { CorruptionAnalysis, CorruptionPattern, Tender, Bid } from '../types/tender.types';

class CorruptionService {
  private openai: OpenAI;
  private anthropic: Anthropic;
  private threshold: number;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
    
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });
    
    this.threshold = parseFloat(process.env.CORRUPTION_MODEL_THRESHOLD || '0.75');
  }

  /**
   * Analyze tender for corruption risks
   */
  async analyzeTender(tender: Tender, bids: Bid[]): Promise<CorruptionAnalysis> {
    logger.info(`Analyzing tender ${tender.id} for corruption risks`);

    const patterns: CorruptionPattern[] = [];
    let totalRisk = 0;

    // 1. Pricing anomaly detection
    const pricingResult = await this.detectPricingAnomalies(tender, bids);
    if (pricingResult.detected) {
      patterns.push(...pricingResult.patterns);
      totalRisk += pricingResult.score;
    }

    // 2. Bid rigging detection
    const riggingResult = await this.detectBidRigging(tender, bids);
    if (riggingResult.detected) {
      patterns.push(...riggingResult.patterns);
      totalRisk += riggingResult.score;
    }

    // 3. Collusion detection
    const collusionResult = await this.detectCollusion(tender, bids);
    if (collusionResult.detected) {
      patterns.push(...collusionResult.patterns);
      totalRisk += collusionResult.score;
    }

    // 4. Conflict of interest
    const conflictResult = await this.detectConflictOfInterest(tender, bids);
    if (conflictResult.detected) {
      patterns.push(...conflictResult.patterns);
      totalRisk += conflictResult.score;
    }

    // Calculate overall risk score (0-100)
    const riskScore = Math.min(Math.round(totalRisk / 4), 100);
    const riskLevel = this.calculateRiskLevel(riskScore);

    // Generate alerts and recommendations
    const { alerts, recommendations, requiredActions } = this.generateRecommendations(
      riskScore,
      patterns
    );

    const analysis: CorruptionAnalysis = {
      id: `corruption_analysis_${tender.id}_${Date.now()}`,
      tenderId: tender.id,
      riskScore,
      riskLevel,
      pricingAnomaly: pricingResult.detected,
      pricingAnomalyScore: pricingResult.score,
      bidRigging: riggingResult.detected,
      bidRiggingScore: riggingResult.score,
      collusion: collusionResult.detected,
      collusionScore: collusionResult.score,
      conflictOfInterest: conflictResult.detected,
      conflictScore: conflictResult.score,
      patterns,
      alerts,
      recommendations,
      requiredActions,
      analyzedAt: new Date(),
      analyzedBy: 'AZORA Corruption Detection AI',
      model: 'gpt-4 + claude-3.5-sonnet',
      modelVersion: '1.0',
    };

    logger.info(`Corruption analysis completed for tender ${tender.id}`, {
      riskScore,
      riskLevel,
      patternsDetected: patterns.length,
    });

    // Send alert if critical risk
    if (riskLevel === 'critical' || riskLevel === 'high') {
      await this.sendCorruptionAlert(analysis);
    }

    return analysis;
  }

  /**
   * Detect pricing anomalies using statistical analysis + AI
   */
  private async detectPricingAnomalies(
    tender: Tender,
    bids: Bid[]
  ): Promise<{ detected: boolean; score: number; patterns: CorruptionPattern[] }> {
    if (bids.length < 3) {
      return { detected: false, score: 0, patterns: [] };
    }

    const patterns: CorruptionPattern[] = [];
    let score = 0;

    // Statistical analysis
    const prices = bids.map(b => b.bidAmount);
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const stdDev = Math.sqrt(
      prices.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / prices.length
    );

    // Check for outliers (> 2 standard deviations)
    const outliers = bids.filter(bid => Math.abs(bid.bidAmount - mean) > 2 * stdDev);
    
    if (outliers.length > 0) {
      score += 30;
      patterns.push({
        type: 'pricing',
        severity: 'medium',
        description: 'Statistical pricing outliers detected',
        evidence: outliers.map(b => `Bid ${b.id}: ${b.bidAmount} (${Math.abs(b.bidAmount - mean) > 3 * stdDev ? '>3σ' : '>2σ'})`),
        confidence: 75,
      });
    }

    // Check for suspiciously low bids (< 50% of estimate)
    const lowBids = bids.filter(bid => bid.bidAmount < tender.estimatedValue * 0.5);
    
    if (lowBids.length > 0) {
      score += 40;
      patterns.push({
        type: 'pricing',
        severity: 'high',
        description: 'Suspiciously low bids detected (possible predatory pricing)',
        evidence: lowBids.map(b => `Bid ${b.id}: ${b.bidAmount} (${Math.round(b.bidAmount / tender.estimatedValue * 100)}% of estimate)`),
        confidence: 85,
      });
    }

    // Check for suspiciously clustered pricing (possible collusion)
    const clusteredPrices = this.findPriceClusters(prices, 0.05); // Within 5% of each other
    
    if (clusteredPrices.length > 0) {
      score += 50;
      patterns.push({
        type: 'pricing',
        severity: 'high',
        description: 'Suspiciously similar pricing detected (possible collusion)',
        evidence: clusteredPrices.map(cluster => `Cluster: ${cluster.join(', ')}`),
        confidence: 80,
      });
    }

    // AI-powered analysis for complex patterns
    if (patterns.length > 0) {
      const aiAnalysis = await this.aiDeepAnalysis('pricing', tender, bids, patterns);
      if (aiAnalysis) {
        patterns.push(aiAnalysis);
        score = Math.min(score + aiAnalysis.confidence * 0.5, 100);
      }
    }

    return {
      detected: patterns.length > 0,
      score: Math.min(score, 100),
      patterns,
    };
  }

  /**
   * Detect bid rigging (tailored specs, rotation schemes, etc.)
   */
  private async detectBidRigging(
    tender: Tender,
    bids: Bid[]
  ): Promise<{ detected: boolean; score: number; patterns: CorruptionPattern[] }> {
    const patterns: CorruptionPattern[] = [];
    let score = 0;

    // Check for overly specific requirements (possible tailoring)
    const verySpecificRequirements = tender.minimumRequirements.filter(req => 
      req.length > 200 || // Very detailed
      req.includes('must be') || // Prescriptive
      req.includes('only') || // Exclusive
      /brand|model|specific/i.test(req) // Brand-specific
    );

    if (verySpecificRequirements.length > 3) {
      score += 40;
      patterns.push({
        type: 'behavior',
        severity: 'high',
        description: 'Overly specific requirements detected (possible tender tailoring)',
        evidence: verySpecificRequirements.slice(0, 3),
        confidence: 70,
      });
    }

    // Check for short submission windows (rushed process)
    const submissionWindow = tender.closingDate.getTime() - (tender.publishedAt?.getTime() || Date.now());
    const daysToSubmit = submissionWindow / (1000 * 60 * 60 * 24);

    if (daysToSubmit < 7) {
      score += 35;
      patterns.push({
        type: 'timing',
        severity: 'medium',
        description: `Very short submission window (${Math.round(daysToSubmit)} days)`,
        evidence: ['Insufficient time for genuine competition'],
        confidence: 65,
      });
    }

    // Check for single bidder (possible pre-arrangement)
    if (bids.length === 1) {
      score += 60;
      patterns.push({
        type: 'behavior',
        severity: 'critical',
        description: 'Only one bid received (possible pre-arranged outcome)',
        evidence: ['Single bidder suggests lack of genuine competition'],
        confidence: 80,
      });
    }

    // Check for winner rotation pattern (requires historical data)
    // TODO: Implement historical analysis across multiple tenders

    return {
      detected: patterns.length > 0,
      score: Math.min(score, 100),
      patterns,
    };
  }

  /**
   * Detect collusion between bidders
   */
  private async detectCollusion(
    tender: Tender,
    bids: Bid[]
  ): Promise<{ detected: boolean; score: number; patterns: CorruptionPattern[] }> {
    const patterns: CorruptionPattern[] = [];
    let score = 0;

    if (bids.length < 2) {
      return { detected: false, score: 0, patterns: [] };
    }

    // Check for complementary bidding (cover bids)
    const sortedBids = [...bids].sort((a, b) => a.bidAmount - b.bidAmount);
    const lowestBid = sortedBids[0];
    const secondLowestBid = sortedBids[1];

    if (secondLowestBid && secondLowestBid.bidAmount > lowestBid.bidAmount * 1.2) {
      score += 45;
      patterns.push({
        type: 'pricing',
        severity: 'high',
        description: 'Large gap between lowest and second-lowest bid (possible cover bidding)',
        evidence: [
          `Lowest: ${lowestBid.bidAmount}`,
          `Second lowest: ${secondLowestBid.bidAmount} (${Math.round((secondLowestBid.bidAmount / lowestBid.bidAmount - 1) * 100)}% higher)`,
        ],
        confidence: 75,
      });
    }

    // Check for identical documentation patterns
    const documentPatterns = bids.map(bid => ({
      bidId: bid.id,
      docCount: bid.documents.length,
      docTypes: bid.documents.map(d => d.type).sort().join(','),
    }));

    const identicalDocs = documentPatterns.filter((p1, i) => 
      documentPatterns.slice(i + 1).some(p2 => p1.docTypes === p2.docTypes)
    );

    if (identicalDocs.length > 0) {
      score += 30;
      patterns.push({
        type: 'document',
        severity: 'medium',
        description: 'Identical documentation patterns across bids (possible coordination)',
        evidence: [`${identicalDocs.length} bids with identical document structures`],
        confidence: 60,
      });
    }

    // Network analysis (requires company registration data)
    // TODO: Implement director/shareholder overlap detection
    // TODO: Check for shared addresses, bank accounts, etc.

    return {
      detected: patterns.length > 0,
      score: Math.min(score, 100),
      patterns,
    };
  }

  /**
   * Detect conflicts of interest
   */
  private async detectConflictOfInterest(
    _tender: Tender,
    _bids: Bid[]
  ): Promise<{ detected: boolean; score: number; patterns: CorruptionPattern[] }> {
    const patterns: CorruptionPattern[] = [];
    const score = 0;

    // TODO: Implement comprehensive conflict of interest detection
    // - Check supplier/bidder relationships with procurement officials
    // - Check company registrations for director overlap
    // - Check for family relationships
    // - Check for previous employment relationships
    // - Cross-reference with declaration of interest forms

    // For now, return placeholder
    return {
      detected: false,
      score,
      patterns,
    };
  }

  /**
   * AI-powered deep analysis using Claude/GPT
   */
  private async aiDeepAnalysis(
    analysisType: string,
    tender: Tender,
    bids: Bid[],
    patterns: CorruptionPattern[]
  ): Promise<CorruptionPattern | null> {
    try {
      const prompt = `You are AZORA's Corruption Detection AI. Analyze this procurement tender for corruption risks.

Tender: ${tender.title}
Estimated Value: ${tender.estimatedValue}
Number of Bids: ${bids.length}

Detected Patterns:
${patterns.map(p => `- ${p.description}: ${p.evidence.join(', ')}`).join('\n')}

Based on South African procurement laws (PPPFA, Constitution Section 217), analyze:
1. Are these patterns consistent with corrupt practices?
2. What additional red flags do you see?
3. What is your confidence level (0-100)?
4. What specific evidence supports corruption?

Respond in JSON format:
{
  "corruption_likely": boolean,
  "confidence": number,
  "description": string,
  "evidence": string[],
  "severity": "low" | "medium" | "high" | "critical"
}`;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0];
      if (content.type !== 'text') return null;

      const analysis = JSON.parse(content.text);

      if (analysis.corruption_likely) {
        return {
          type: 'behavior',
          severity: analysis.severity,
          description: analysis.description,
          evidence: analysis.evidence,
          confidence: analysis.confidence,
        };
      }

      return null;
    } catch (error) {
      logger.error('AI deep analysis failed', error);
      return null;
    }
  }

  /**
   * Find price clusters (prices within threshold% of each other)
   */
  private findPriceClusters(prices: number[], threshold: number): number[][] {
    const clusters: number[][] = [];
    const sorted = [...prices].sort((a, b) => a - b);

    for (let i = 0; i < sorted.length - 1; i++) {
      const cluster = [sorted[i]];
      
      for (let j = i + 1; j < sorted.length; j++) {
        if (Math.abs(sorted[j] - sorted[i]) / sorted[i] <= threshold) {
          cluster.push(sorted[j]);
        } else {
          break;
        }
      }

      if (cluster.length >= 2) {
        clusters.push(cluster);
      }
    }

    return clusters;
  }

  /**
   * Calculate risk level from score
   */
  private calculateRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  /**
   * Generate alerts and recommendations
   */
  private generateRecommendations(
    riskScore: number,
    patterns: CorruptionPattern[]
  ): { alerts: string[]; recommendations: string[]; requiredActions: string[] } {
    const alerts: string[] = [];
    const recommendations: string[] = [];
    const requiredActions: string[] = [];

    if (riskScore >= 80) {
      alerts.push('🚨 CRITICAL: Extremely high corruption risk detected');
      requiredActions.push('Suspend procurement process immediately');
      requiredActions.push('Launch full investigation');
      requiredActions.push('Notify anti-corruption authorities');
    } else if (riskScore >= 60) {
      alerts.push('⚠️  HIGH RISK: Significant corruption indicators detected');
      requiredActions.push('Conduct detailed review of tender process');
      requiredActions.push('Request additional documentation from bidders');
      requiredActions.push('Consider re-tendering with revised specifications');
    } else if (riskScore >= 40) {
      alerts.push('⚡ MEDIUM RISK: Some corruption patterns detected');
      recommendations.push('Review tender specifications for tailoring');
      recommendations.push('Verify bidder independence');
      recommendations.push('Conduct additional due diligence');
    } else {
      alerts.push('✅ LOW RISK: Minimal corruption indicators');
      recommendations.push('Proceed with normal evaluation process');
      recommendations.push('Maintain standard audit trail');
    }

    // Pattern-specific recommendations
    const criticalPatterns = patterns.filter(p => p.severity === 'critical');
    const highPatterns = patterns.filter(p => p.severity === 'high');

    if (criticalPatterns.length > 0) {
      requiredActions.push('Address critical patterns before proceeding');
    }

    if (highPatterns.length > 0) {
      recommendations.push('Investigate high-severity patterns thoroughly');
    }

    return { alerts, recommendations, requiredActions };
  }

  /**
   * Send corruption alert to webhook
   */
  private async sendCorruptionAlert(analysis: CorruptionAnalysis): Promise<void> {
    try {
      const webhookUrl = process.env.CORRUPTION_ALERT_WEBHOOK;
      
      if (!webhookUrl) {
        logger.warn('No corruption alert webhook configured');
        return;
      }

      logger.info(`Sending corruption alert for tender ${analysis.tenderId}`, {
        riskLevel: analysis.riskLevel,
        riskScore: analysis.riskScore,
      });

      // TODO: Implement webhook POST
      // await fetch(webhookUrl, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(analysis),
      // });
    } catch (error) {
      logger.error('Failed to send corruption alert', error);
    }
  }
}

export default new CorruptionService();
