/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { ChatOpenAI } from "@langchain/openai";
import { ConstitutionalChain } from "./constitutional-chain";

/**
 * AI Immune System - Metabolic Health Monitor
 *
 * Genesis Protocol - Part II: AI Immune System
 *
 * Monitors the Azora ecosystem's metabolic health through:
 * - Proof-of-Contribution verification
 * - Economic vitality assessment
 * - Systemic risk detection
 * - Auto-immune responses to threats
 */

export interface MetabolicMetrics {
  timestamp: number;
  contributionScore: number; // 0-100, aggregate contribution health
  economicVitality: number; // 0-100, economic activity level
  systemicRisk: number;     // 0-100, risk of systemic failure
  immuneResponse: number;   // 0-100, immune system activation level
  metabolicEfficiency: number; // 0-100, resource utilization efficiency
}

export interface ContributionRecord {
  contributorId: string;
  contributionType: 'development' | 'governance' | 'economic' | 'social';
  impactScore: number;
  timestamp: number;
  verified: boolean;
  metabolicImpact: number;
}

export interface ImmuneAlert {
  alertId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'contribution_drift' | 'economic_atrophy' | 'systemic_risk' | 'metabolic_inefficiency';
  description: string;
  timestamp: number;
  recommendedAction: string;
  autoResponseTriggered: boolean;
}

export class AIImmuneSystem {
  private llm: ChatOpenAI;
  private constitutionalChain: ConstitutionalChain;
  private metabolicHistory: MetabolicMetrics[] = [];
  private contributionRecords: ContributionRecord[] = [];
  private activeAlerts: ImmuneAlert[] = [];
  private immuneThresholds: {
    contributionMin: number;
    vitalityMin: number;
    riskMax: number;
    efficiencyMin: number;
  };

  constructor(openaiApiKey: string) {
    this.llm = new ChatOpenAI({
      openaiApiKey,
      modelName: "gpt-4-turbo-preview",
      temperature: 0.1, // Low temperature for consistent analysis
    });

    this.constitutionalChain = new ConstitutionalChain(this.llm);

    // Initialize immune thresholds from Genesis Protocol
    this.immuneThresholds = {
      contributionMin: 75,  // Minimum healthy contribution score
      vitalityMin: 70,      // Minimum economic vitality
      riskMax: 30,         // Maximum acceptable systemic risk
      efficiencyMin: 65,    // Minimum metabolic efficiency
    };
  }

  /**
   * Assess current metabolic health of the ecosystem
   */
  async assessMetabolicHealth(): Promise<MetabolicMetrics> {
    const currentMetrics = await this.calculateMetabolicMetrics();

    // Store in history
    this.metabolicHistory.push(currentMetrics);

    // Keep only last 1000 readings
    if (this.metabolicHistory.length > 1000) {
      this.metabolicHistory = this.metabolicHistory.slice(-1000);
    }

    // Check for immune response triggers
    await this.evaluateImmuneResponse(currentMetrics);

    return currentMetrics;
  }

  /**
   * Record and verify a contribution to the ecosystem
   */
  async recordContribution(contribution: Omit<ContributionRecord, 'verified' | 'metabolicImpact'>): Promise<boolean> {
    // Verify contribution using AI analysis
    const verification = await this.verifyContribution(contribution);

    const record: ContributionRecord = {
      ...contribution,
      verified: verification.isValid,
      metabolicImpact: verification.metabolicImpact,
    };

    this.contributionRecords.push(record);

    // Keep only last 10,000 records
    if (this.contributionRecords.length > 10000) {
      this.contributionRecords = this.contributionRecords.slice(-10000);
    }

    return verification.isValid;
  }

  /**
   * Get current immune system status
   */
  getImmuneStatus(): {
    metrics: MetabolicMetrics | null;
    activeAlerts: ImmuneAlert[];
    immuneActivation: number;
    overallHealth: 'healthy' | 'warning' | 'critical';
  } {
    const latestMetrics = this.metabolicHistory[this.metabolicHistory.length - 1] || null;

    let overallHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
    let immuneActivation = 0;

    if (latestMetrics) {
      const issues = this.countHealthIssues(latestMetrics);
      immuneActivation = Math.min(100, issues * 25); // 25% per issue

      if (issues >= 3 || latestMetrics.systemicRisk > 70) {
        overallHealth = 'critical';
      } else if (issues >= 1) {
        overallHealth = 'warning';
      }
    }

    return {
      metrics: latestMetrics,
      activeAlerts: this.activeAlerts,
      immuneActivation,
      overallHealth,
    };
  }

  /**
   * Trigger manual immune response
   */
  async triggerImmuneResponse(alertId: string, responseType: string): Promise<boolean> {
    const alert = this.activeAlerts.find(a => a.alertId === alertId);
    if (!alert) return false;

    // Constitutional check for immune response
    const constitutionalCheck = await this.constitutionalChain.evaluateAction({
      action: `Trigger immune response: ${responseType}`,
      context: `Alert: ${alert.description}`,
      potentialImpact: 'High - Could affect ecosystem operations',
    });

    if (!constitutionalCheck.allowed) {
      console.warn(`Immune response blocked by constitution: ${constitutionalCheck.reason}`);
      return false;
    }

    // Execute immune response based on type
    await this.executeImmuneResponse(responseType, alert);

    // Mark alert as responded to
    alert.autoResponseTriggered = true;

    return true;
  }

  /**
   * Get metabolic health trends
   */
  getMetabolicTrends(hours: number = 24): {
    contributionTrend: number;
    vitalityTrend: number;
    riskTrend: number;
    efficiencyTrend: number;
  } {
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    const recentMetrics = this.metabolicHistory.filter(m => m.timestamp > cutoffTime);

    if (recentMetrics.length < 2) {
      return { contributionTrend: 0, vitalityTrend: 0, riskTrend: 0, efficiencyTrend: 0 };
    }

    const first = recentMetrics[0];
    const last = recentMetrics[recentMetrics.length - 1];

    return {
      contributionTrend: last.contributionScore - first.contributionScore,
      vitalityTrend: last.economicVitality - first.economicVitality,
      riskTrend: last.systemicRisk - first.systemicRisk,
      efficiencyTrend: last.metabolicEfficiency - first.metabolicEfficiency,
    };
  }

  // ========== PRIVATE METHODS ==========

  private async calculateMetabolicMetrics(): Promise<MetabolicMetrics> {
    const now = Date.now();

    // Analyze recent contributions (last 24 hours)
    const recentContributions = this.contributionRecords.filter(
      c => now - c.timestamp < 24 * 60 * 60 * 1000
    );

    // Calculate contribution score
    const contributionScore = this.calculateContributionScore(recentContributions);

    // Calculate economic vitality
    const economicVitality = await this.calculateEconomicVitality();

    // Assess systemic risk
    const systemicRisk = await this.assessSystemicRisk();

    // Calculate metabolic efficiency
    const metabolicEfficiency = this.calculateMetabolicEfficiency(recentContributions);

    // Calculate immune response level
    const immuneResponse = this.calculateImmuneResponseLevel({
      contributionScore,
      economicVitality,
      systemicRisk,
      metabolicEfficiency,
    });

    return {
      timestamp: now,
      contributionScore,
      economicVitality,
      systemicRisk,
      immuneResponse,
      metabolicEfficiency,
    };
  }

  private calculateContributionScore(contributions: ContributionRecord[]): number {
    if (contributions.length === 0) return 0;

    const verifiedContributions = contributions.filter(c => c.verified);
    const totalImpact = verifiedContributions.reduce((sum, c) => sum + c.metabolicImpact, 0);
    const averageImpact = totalImpact / contributions.length;

    // Weight by recency and diversity
    const recencyWeight = Math.min(1, contributions.length / 100); // More contributions = healthier
    const diversityWeight = this.calculateDiversityWeight(contributions);

    return Math.min(100, (averageImpact * recencyWeight * diversityWeight * 100));
  }

  private calculateDiversityWeight(contributions: ContributionRecord[]): number {
    const types = new Set(contributions.map(c => c.contributionType));
    const diversityRatio = types.size / 4; // 4 contribution types
    return 0.5 + (diversityRatio * 0.5); // Range: 0.5 - 1.0
  }

  private async calculateEconomicVitality(): Promise<number> {
    // In production, this would analyze:
    // - Transaction volumes
    // - Token velocities
    // - Market depths
    // - User engagement metrics

    // For now, simulate based on contribution activity
    const recentActivity = this.contributionRecords.filter(
      c => Date.now() - c.timestamp < 7 * 24 * 60 * 60 * 1000 // Last 7 days
    ).length;

    return Math.min(100, (recentActivity / 10) * 100); // 10 contributions/day = 100% vitality
  }

  private async assessSystemicRisk(): Promise<number> {
    // Analyze multiple risk factors
    const concentrationRisk = await this.assessConcentrationRisk();
    const volatilityRisk = await this.assessVolatilityRisk();
    const dependencyRisk = await this.assessDependencyRisk();

    // Weighted average
    return (concentrationRisk * 0.4) + (volatilityRisk * 0.4) + (dependencyRisk * 0.2);
  }

  private async assessConcentrationRisk(): Promise<number> {
    // Check if contributions are concentrated among few participants
    const contributors = new Set(this.contributionRecords.map(c => c.contributorId));
    const totalContributions = this.contributionRecords.length;

    if (contributors.size === 0) return 100; // No contributors = maximum risk

    const averagePerContributor = totalContributions / contributors.size;
    const concentrationScore = Math.min(100, averagePerContributor * 10);

    return 100 - concentrationScore; // Invert: higher concentration = higher risk
  }

  private async assessVolatilityRisk(): Promise<number> {
    // Analyze contribution volatility over time
    if (this.metabolicHistory.length < 24) return 50; // Not enough data

    const recentMetrics = this.metabolicHistory.slice(-24); // Last 24 readings
    const contributionScores = recentMetrics.map(m => m.contributionScore);

    const mean = contributionScores.reduce((a, b) => a + b) / contributionScores.length;
    const variance = contributionScores.reduce((acc, score) => acc + Math.pow(score - mean, 2), 0) / contributionScores.length;
    const volatility = Math.sqrt(variance);

    return Math.min(100, volatility * 2); // Scale volatility to 0-100
  }

  private async assessDependencyRisk(): Promise<number> {
    // Check dependency on specific contribution types or individuals
    const typeDistribution = this.analyzeContributionTypeDistribution();
    const maxTypePercentage = Math.max(...Object.values(typeDistribution));

    return Math.min(100, maxTypePercentage * 2); // High concentration in one type = high risk
  }

  private analyzeContributionTypeDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {
      development: 0,
      governance: 0,
      economic: 0,
      social: 0,
    };

    const recentContributions = this.contributionRecords.filter(
      c => Date.now() - c.timestamp < 30 * 24 * 60 * 60 * 1000 // Last 30 days
    );

    recentContributions.forEach(contribution => {
      distribution[contribution.contributionType] += contribution.impactScore;
    });

    const total = Object.values(distribution).reduce((a, b) => a + b, 0);
    if (total === 0) return distribution;

    // Convert to percentages
    Object.keys(distribution).forEach(key => {
      distribution[key] = (distribution[key] / total) * 100;
    });

    return distribution;
  }

  private calculateMetabolicEfficiency(contributions: ContributionRecord[]): number {
    if (contributions.length === 0) return 0;

    // Efficiency = output / input
    // Output = sum of metabolic impacts
    // Input = number of contributions (effort)
    const totalOutput = contributions.reduce((sum, c) => sum + c.metabolicImpact, 0);
    const totalInput = contributions.length;

    const efficiency = (totalOutput / totalInput) * 100;
    return Math.min(100, Math.max(0, efficiency));
  }

  private calculateImmuneResponseLevel(metrics: {
    contributionScore: number;
    economicVitality: number;
    systemicRisk: number;
    metabolicEfficiency: number;
  }): number {
    const issues = this.countHealthIssues(metrics);
    return Math.min(100, issues * 25); // 25% activation per health issue
  }

  private countHealthIssues(metrics: MetabolicMetrics): number {
    let issues = 0;

    if (metrics.contributionScore < this.immuneThresholds.contributionMin) issues++;
    if (metrics.economicVitality < this.immuneThresholds.vitalityMin) issues++;
    if (metrics.systemicRisk > this.immuneThresholds.riskMax) issues++;
    if (metrics.metabolicEfficiency < this.immuneThresholds.efficiencyMin) issues++;

    return issues;
  }

  private async evaluateImmuneResponse(metrics: MetabolicMetrics): Promise<void> {
    const issues = this.countHealthIssues(metrics);

    if (issues === 0) {
      // Clear resolved alerts
      this.activeAlerts = this.activeAlerts.filter(alert =>
        !this.isAlertResolved(alert, metrics)
      );
      return;
    }

    // Generate alerts for each issue
    const alerts = this.generateAlerts(metrics);

    // Add new alerts
    for (const alert of alerts) {
      if (!this.activeAlerts.find(a => a.alertId === alert.alertId)) {
        this.activeAlerts.push(alert);
      }
    }

    // Trigger auto-responses for critical alerts
    const criticalAlerts = this.activeAlerts.filter(a => a.severity === 'critical');
    for (const alert of criticalAlerts) {
      if (!alert.autoResponseTriggered) {
        await this.triggerAutoResponse(alert);
      }
    }
  }

  private generateAlerts(metrics: MetabolicMetrics): ImmuneAlert[] {
    const alerts: ImmuneAlert[] = [];
    const timestamp = Date.now();

    if (metrics.contributionScore < this.immuneThresholds.contributionMin) {
      alerts.push({
        alertId: `contribution-${timestamp}`,
        severity: metrics.contributionScore < 50 ? 'critical' : 'high',
        type: 'contribution_drift',
        description: `Contribution score dropped to ${metrics.contributionScore}%. Ecosystem health at risk.`,
        timestamp,
        recommendedAction: 'Increase contribution incentives and engagement campaigns',
        autoResponseTriggered: false,
      });
    }

    if (metrics.systemicRisk > this.immuneThresholds.riskMax) {
      alerts.push({
        alertId: `risk-${timestamp}`,
        severity: metrics.systemicRisk > 70 ? 'critical' : 'high',
        type: 'systemic_risk',
        description: `Systemic risk elevated to ${metrics.systemicRisk}%. Potential cascade failure.`,
        timestamp,
        recommendedAction: 'Activate Circuit Breakers and increase reserve ratios',
        autoResponseTriggered: false,
      });
    }

    if (metrics.metabolicEfficiency < this.immuneThresholds.efficiencyMin) {
      alerts.push({
        alertId: `efficiency-${timestamp}`,
        severity: 'medium',
        type: 'metabolic_inefficiency',
        description: `Metabolic efficiency at ${metrics.metabolicEfficiency}%. Resource waste detected.`,
        timestamp,
        recommendedAction: 'Optimize contribution reward mechanisms',
        autoResponseTriggered: false,
      });
    }

    return alerts;
  }

  private async triggerAutoResponse(alert: ImmuneAlert): Promise<void> {
    // Auto-responses based on alert type
    switch (alert.type) {
      case 'contribution_drift':
        await this.respondToContributionDrift();
        break;
      case 'systemic_risk':
        await this.respondToSystemicRisk();
        break;
      case 'metabolic_inefficiency':
        await this.respondToMetabolicInefficiency();
        break;
    }

    alert.autoResponseTriggered = true;
  }

  private async respondToContributionDrift(): Promise<void> {
    // Auto-response: Increase contribution rewards temporarily
    console.log('🤖 AI Immune System: Activating contribution incentives...');

    // In production, this would:
    // - Increase staking rewards
    // - Activate contribution bounties
    // - Send notifications to ecosystem participants
  }

  private async respondToSystemicRisk(): Promise<void> {
    // Auto-response: Activate defensive measures
    console.log('🤖 AI Immune System: Activating systemic defenses...');

    // In production, this would:
    // - Trigger Circuit Breakers
    // - Increase Stability Fund diversion
    // - Activate emergency governance procedures
  }

  private async respondToMetabolicInefficiency(): Promise<void> {
    // Auto-response: Optimize resource allocation
    console.log('🤖 AI Immune System: Optimizing metabolic efficiency...');

    // In production, this would:
    // - Rebalance reward distributions
    // - Adjust contribution requirements
    // - Optimize computational resource usage
  }

  private isAlertResolved(alert: ImmuneAlert, metrics: MetabolicMetrics): boolean {
    switch (alert.type) {
      case 'contribution_drift':
        return metrics.contributionScore >= this.immuneThresholds.contributionMin;
      case 'systemic_risk':
        return metrics.systemicRisk <= this.immuneThresholds.riskMax;
      case 'metabolic_inefficiency':
        return metrics.metabolicEfficiency >= this.immuneThresholds.efficiencyMin;
      default:
        return false;
    }
  }

  private async verifyContribution(contribution: Omit<ContributionRecord, 'verified' | 'metabolicImpact'>): Promise<{
    isValid: boolean;
    metabolicImpact: number;
  }> {
    // Use AI to verify contribution authenticity and calculate impact
    const prompt = `
Analyze this ecosystem contribution for authenticity and metabolic impact:

Contribution Details:
- Type: ${contribution.contributionType}
- Impact Score: ${contribution.impactScore}
- Contributor: ${contribution.contributorId}
- Timestamp: ${new Date(contribution.timestamp).toISOString()}

Evaluate:
1. Is this contribution genuine and valuable to the ecosystem?
2. What is the metabolic impact score (0-100) considering sustainability and long-term value?

Respond with JSON: {"isValid": boolean, "metabolicImpact": number, "reasoning": "string"}
    `;

    try {
      const response = await this.llm.invoke(prompt);
      const result = JSON.parse(response.content as string);

      return {
        isValid: result.isValid,
        metabolicImpact: Math.max(0, Math.min(100, result.metabolicImpact)),
      };
    } catch (error) {
      console.error('Contribution verification failed:', error);
      return { isValid: false, metabolicImpact: 0 };
    }
  }

  private async executeImmuneResponse(responseType: string, alert: ImmuneAlert): Promise<void> {
    console.log(`🤖 Executing immune response: ${responseType} for alert ${alert.alertId}`);

    // In production, this would integrate with various ecosystem components
    // For now, just log the response
    switch (responseType) {
      case 'increase_incentives':
        console.log('💰 Increasing contribution incentives by 25%');
        break;
      case 'activate_circuit_breaker':
        console.log('🔌 Activating circuit breaker for stability');
        break;
      case 'rebalance_fund':
        console.log('⚖️ Rebalancing stability fund allocations');
        break;
      default:
        console.log(`⚡ Executing custom response: ${responseType}`);
    }
  }
}