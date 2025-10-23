/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { ChatOpenAI } from "@langchain/openai";

/**
 * Geopolitical Readiness Index - Global Economic Positioning System
 *
 * Genesis Protocol - Part II: Geopolitical Readiness Index
 *
 * Monitors global economic stability and positions Azora for optimal
 * sovereignty in changing geopolitical landscapes.
 */

export interface GeopoliticalFactor {
  factorId: string;
  category: 'economic' | 'political' | 'technological' | 'environmental' | 'social';
  name: string;
  description: string;
  currentValue: number; // 0-100 scale
  trend: 'improving' | 'stable' | 'deteriorating';
  impact: 'high' | 'medium' | 'low';
  lastUpdated: number;
  dataSources: string[];
}

export interface RegionalAssessment {
  regionId: string;
  regionName: string;
  stabilityIndex: number; // 0-100
  opportunityIndex: number; // 0-100
  riskIndex: number; // 0-100
  azoraAlignment: number; // 0-100, how well Azora fits this region
  keyFactors: string[];
  recommendedActions: string[];
  lastAssessment: number;
}

export interface GlobalPositioning {
  overallReadiness: number; // 0-100
  primaryRegions: string[]; // Regions with highest opportunity
  riskRegions: string[]; // Regions to avoid or minimize exposure
  diversificationScore: number; // Geographic diversification health
  sovereigntyIndex: number; // Economic sovereignty score
  timestamp: number;
}

export interface CrisisIndicator {
  indicatorId: string;
  type: 'economic_crisis' | 'political_instability' | 'technological_disruption' | 'environmental_catastrophe';
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedRegions: string[];
  probability: number; // 0-100
  timeHorizon: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
  azoraImpact: 'minimal' | 'moderate' | 'severe' | 'existential';
  mitigationStrategies: string[];
  lastUpdated: number;
}

export class GeopoliticalReadinessIndex {
  private llm: ChatOpenAI;
  private geopoliticalFactors: Map<string, GeopoliticalFactor> = new Map();
  private regionalAssessments: Map<string, RegionalAssessment> = new Map();
  private crisisIndicators: CrisisIndicator[] = [];
  private assessmentHistory: GlobalPositioning[] = [];

  // Core regions to monitor
  private readonly coreRegions = [
    'north_america',
    'european_union',
    'united_kingdom',
    'china',
    'japan',
    'south_korea',
    'singapore',
    'australia',
    'south_africa',
    'brazil',
    'india',
    'middle_east_oil_states',
    'emerging_asia'
  ];

  constructor(openaiApiKey: string) {
    this.llm = new ChatOpenAI({
      openaiApiKey,
      modelName: "gpt-4-turbo-preview",
      temperature: 0.2, // Low temperature for consistent analysis
    });

    this.initializeFactors();
    this.initializeRegions();
  }

  /**
   * Calculate the current Geopolitical Readiness Index
   */
  async calculateReadinessIndex(): Promise<GlobalPositioning> {
    const timestamp = Date.now();

    // Update all factors and assessments
    await this.updateGeopoliticalFactors();
    await this.updateRegionalAssessments();

    // Calculate overall readiness
    const overallReadiness = this.calculateOverallReadiness();

    // Identify primary and risk regions
    const { primaryRegions, riskRegions } = this.identifyKeyRegions();

    // Calculate diversification and sovereignty scores
    const diversificationScore = this.calculateDiversificationScore();
    const sovereigntyIndex = this.calculateSovereigntyIndex();

    const positioning: GlobalPositioning = {
      overallReadiness,
      primaryRegions,
      riskRegions,
      diversificationScore,
      sovereigntyIndex,
      timestamp,
    };

    // Store in history
    this.assessmentHistory.push(positioning);

    // Keep only last 100 assessments
    if (this.assessmentHistory.length > 100) {
      this.assessmentHistory = this.assessmentHistory.slice(-100);
    }

    return positioning;
  }

  /**
   * Assess crisis indicators and their potential impact
   */
  async assessCrisisIndicators(): Promise<CrisisIndicator[]> {
    // Update existing indicators
    await this.updateCrisisIndicators();

    // Identify new potential crises
    const newCrises = await this.identifyPotentialCrises();

    // Add new crises to the list
    for (const crisis of newCrises) {
      if (!this.crisisIndicators.find(c => c.indicatorId === crisis.indicatorId)) {
        this.crisisIndicators.push(crisis);
      }
    }

    // Remove outdated indicators (older than 90 days)
    const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
    this.crisisIndicators = this.crisisIndicators.filter(
      c => c.lastUpdated > ninetyDaysAgo
    );

    return this.crisisIndicators.sort((a, b) => b.probability - a.probability);
  }

  /**
   * Get detailed regional assessment
   */
  async getRegionalAssessment(regionId: string): Promise<RegionalAssessment | null> {
    const assessment = this.regionalAssessments.get(regionId);
    if (!assessment) return null;

    // Update if assessment is older than 24 hours
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    if (assessment.lastAssessment < oneDayAgo) {
      await this.updateRegionalAssessment(regionId);
    }

    return this.regionalAssessments.get(regionId) || null;
  }

  /**
   * Get geopolitical factor details
   */
  getGeopoliticalFactor(factorId: string): GeopoliticalFactor | null {
    return this.geopoliticalFactors.get(factorId) || null;
  }

  /**
   * Get readiness trends over time
   */
  getReadinessTrends(days: number = 30): {
    readinessTrend: number;
    sovereigntyTrend: number;
    diversificationTrend: number;
    averageReadiness: number;
  } {
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    const recentAssessments = this.assessmentHistory.filter(a => a.timestamp > cutoffTime);

    if (recentAssessments.length < 2) {
      return {
        readinessTrend: 0,
        sovereigntyTrend: 0,
        diversificationTrend: 0,
        averageReadiness: 0,
      };
    }

    const first = recentAssessments[0];
    const last = recentAssessments[recentAssessments.length - 1];
    const average = recentAssessments.reduce((sum, a) => sum + a.overallReadiness, 0) / recentAssessments.length;

    return {
      readinessTrend: last.overallReadiness - first.overallReadiness,
      sovereigntyTrend: last.sovereigntyIndex - first.sovereigntyIndex,
      diversificationTrend: last.diversificationScore - first.diversificationScore,
      averageReadiness: average,
    };
  }

  /**
   * Generate strategic recommendations based on current positioning
   */
  async generateStrategicRecommendations(): Promise<{
    immediateActions: string[];
    shortTermStrategy: string[];
    longTermPositioning: string[];
    riskMitigations: string[];
  }> {
    const currentPositioning = await this.calculateReadinessIndex();
    const crisisIndicators = await this.assessCrisisIndicators();

    const recommendations = {
      immediateActions: [] as string[],
      shortTermStrategy: [] as string[],
      longTermPositioning: [] as string[],
      riskMitigations: [] as string[],
    };

    // Immediate actions based on readiness score
    if (currentPositioning.overallReadiness < 60) {
      recommendations.immediateActions.push(
        "Increase reserve ratios in Stability Fund",
        "Activate additional Circuit Breakers",
        "Enhance monitoring of high-risk regions"
      );
    }

    // Short-term strategy based on primary regions
    if (currentPositioning.primaryRegions.length > 0) {
      recommendations.shortTermStrategy.push(
        `Strengthen presence in: ${currentPositioning.primaryRegions.join(', ')}`,
        "Develop region-specific a-Token variants",
        "Establish local partnerships and regulatory compliance"
      );
    }

    // Long-term positioning based on sovereignty index
    if (currentPositioning.sovereigntyIndex < 70) {
      recommendations.longTermPositioning.push(
        "Expand multi-chain architecture",
        "Develop decentralized governance structures",
        "Build independent infrastructure capabilities"
      );
    }

    // Risk mitigations based on crisis indicators
    const highProbabilityCrises = crisisIndicators.filter(c => c.probability > 70);
    if (highProbabilityCrises.length > 0) {
      recommendations.riskMitigations.push(
        ...highProbabilityCrises.flatMap(c => c.mitigationStrategies)
      );
    }

    return recommendations;
  }

  // ========== PRIVATE METHODS ==========

  private initializeFactors(): void {
    // Economic factors
    this.geopoliticalFactors.set('global_gdp_growth', {
      factorId: 'global_gdp_growth',
      category: 'economic',
      name: 'Global GDP Growth',
      description: 'World economic growth rate and projections',
      currentValue: 75,
      trend: 'stable',
      impact: 'high',
      lastUpdated: Date.now(),
      dataSources: ['IMF', 'World Bank', 'OECD'],
    });

    this.geopoliticalFactors.set('currency_stability', {
      factorId: 'currency_stability',
      category: 'economic',
      name: 'Major Currency Stability',
      description: 'Stability of USD, EUR, and other major currencies',
      currentValue: 70,
      trend: 'deteriorating',
      impact: 'high',
      lastUpdated: Date.now(),
      dataSources: ['BIS', 'Federal Reserve', 'ECB'],
    });

    // Political factors
    this.geopoliticalFactors.set('geopolitical_tensions', {
      factorId: 'geopolitical_tensions',
      category: 'political',
      name: 'Geopolitical Tensions',
      description: 'Level of international political conflicts and tensions',
      currentValue: 45,
      trend: 'deteriorating',
      impact: 'high',
      lastUpdated: Date.now(),
      dataSources: ['UN', 'State Department', 'Foreign Affairs'],
    });

    this.geopoliticalFactors.set('regulatory_stability', {
      factorId: 'regulatory_stability',
      category: 'political',
      name: 'Cryptocurrency Regulation Stability',
      description: 'Stability and predictability of crypto regulations globally',
      currentValue: 55,
      trend: 'improving',
      impact: 'high',
      lastUpdated: Date.now(),
      dataSources: ['CoinDesk', 'Blockchain Association', 'FATF'],
    });

    // Technological factors
    this.geopoliticalFactors.set('blockchain_adoption', {
      factorId: 'blockchain_adoption',
      category: 'technological',
      name: 'Global Blockchain Adoption',
      description: 'Rate of blockchain technology adoption worldwide',
      currentValue: 65,
      trend: 'improving',
      impact: 'medium',
      lastUpdated: Date.now(),
      dataSources: ['Chainalysis', 'TripleA', 'Deloitte'],
    });

    // Environmental factors
    this.geopoliticalFactors.set('climate_stability', {
      factorId: 'climate_stability',
      category: 'environmental',
      name: 'Climate Change Impact',
      description: 'Economic impact of climate change and environmental policies',
      currentValue: 60,
      trend: 'deteriorating',
      impact: 'medium',
      lastUpdated: Date.now(),
      dataSources: ['IPCC', 'World Economic Forum', 'IEA'],
    });

    // Social factors
    this.geopoliticalFactors.set('social_stability', {
      factorId: 'social_stability',
      category: 'social',
      name: 'Global Social Stability',
      description: 'Social cohesion and stability across major populations',
      currentValue: 65,
      trend: 'stable',
      impact: 'medium',
      lastUpdated: Date.now(),
      dataSources: ['Pew Research', 'Gallup', 'World Values Survey'],
    });
  }

  private initializeRegions(): void {
    const regionData = {
      north_america: {
        name: 'North America',
        baseStability: 80,
        baseOpportunity: 85,
        baseRisk: 20,
      },
      european_union: {
        name: 'European Union',
        baseStability: 75,
        baseOpportunity: 80,
        baseRisk: 25,
      },
      united_kingdom: {
        name: 'United Kingdom',
        baseStability: 70,
        baseOpportunity: 75,
        baseRisk: 30,
      },
      china: {
        name: 'China',
        baseStability: 65,
        baseOpportunity: 90,
        baseRisk: 35,
      },
      japan: {
        name: 'Japan',
        baseStability: 85,
        baseOpportunity: 70,
        baseRisk: 15,
      },
      south_korea: {
        name: 'South Korea',
        baseStability: 75,
        baseOpportunity: 80,
        baseRisk: 25,
      },
      singapore: {
        name: 'Singapore',
        baseStability: 90,
        baseOpportunity: 85,
        baseRisk: 10,
      },
      australia: {
        name: 'Australia',
        baseStability: 80,
        baseOpportunity: 75,
        baseRisk: 20,
      },
      south_africa: {
        name: 'South Africa',
        baseStability: 60,
        baseOpportunity: 70,
        baseRisk: 40,
      },
      brazil: {
        name: 'Brazil',
        baseStability: 55,
        baseOpportunity: 75,
        baseRisk: 45,
      },
      india: {
        name: 'India',
        baseStability: 65,
        baseOpportunity: 85,
        baseRisk: 35,
      },
      middle_east_oil_states: {
        name: 'Middle East Oil States',
        baseStability: 70,
        baseOpportunity: 80,
        baseRisk: 30,
      },
      emerging_asia: {
        name: 'Emerging Asia',
        baseStability: 60,
        baseOpportunity: 90,
        baseRisk: 40,
      },
    };

    for (const [regionId, data] of Object.entries(regionData)) {
      this.regionalAssessments.set(regionId, {
        regionId,
        regionName: data.name,
        stabilityIndex: data.baseStability,
        opportunityIndex: data.baseOpportunity,
        riskIndex: data.baseRisk,
        azoraAlignment: this.calculateAzoraAlignment(regionId),
        keyFactors: [],
        recommendedActions: [],
        lastAssessment: Date.now(),
      });
    }
  }

  private async updateGeopoliticalFactors(): Promise<void> {
    // In production, this would fetch real-time data from APIs
    // For now, simulate updates with AI analysis

    for (const [factorId, factor] of this.geopoliticalFactors) {
      // Simulate factor updates based on AI analysis
      const update = await this.analyzeFactorUpdate(factor);
      factor.currentValue = update.newValue;
      factor.trend = update.trend;
      factor.lastUpdated = Date.now();
    }
  }

  private async updateRegionalAssessments(): Promise<void> {
    for (const regionId of this.coreRegions) {
      await this.updateRegionalAssessment(regionId);
    }
  }

  private async updateRegionalAssessment(regionId: string): Promise<void> {
    const assessment = this.regionalAssessments.get(regionId);
    if (!assessment) return;

    // Analyze regional factors
    const analysis = await this.analyzeRegionalFactors(regionId);

    assessment.stabilityIndex = analysis.stabilityIndex;
    assessment.opportunityIndex = analysis.opportunityIndex;
    assessment.riskIndex = analysis.riskIndex;
    assessment.azoraAlignment = this.calculateAzoraAlignment(regionId);
    assessment.keyFactors = analysis.keyFactors;
    assessment.recommendedActions = analysis.recommendedActions;
    assessment.lastAssessment = Date.now();
  }

  private async updateCrisisIndicators(): Promise<void> {
    // Update existing indicators
    for (const indicator of this.crisisIndicators) {
      const update = await this.analyzeCrisisUpdate(indicator);
      indicator.probability = update.probability;
      indicator.severity = update.severity;
      indicator.lastUpdated = Date.now();
    }
  }

  private async identifyPotentialCrises(): Promise<CrisisIndicator[]> {
    // Use AI to identify emerging crisis patterns
    const prompt = `
Analyze current geopolitical factors and identify potential crisis scenarios that could impact the Azora ecosystem.

Consider:
- Economic indicators showing stress
- Political developments with global implications
- Technological disruptions
- Environmental events
- Social movements

Return 3-5 most probable crisis scenarios in JSON format:
[{
  "indicatorId": "string",
  "type": "economic_crisis|political_instability|technological_disruption|environmental_catastrophe",
  "severity": "low|medium|high|critical",
  "affectedRegions": ["region1", "region2"],
  "probability": number (0-100),
  "timeHorizon": "immediate|short_term|medium_term|long_term",
  "azoraImpact": "minimal|moderate|severe|existential",
  "mitigationStrategies": ["strategy1", "strategy2"]
}]
    `;

    try {
      const response = await this.llm.invoke(prompt);
      const crises = JSON.parse(response.content as string);
      return crises.map((crisis: any) => ({
        ...crisis,
        lastUpdated: Date.now(),
      }));
    } catch (error) {
      console.error('Failed to identify potential crises:', error);
      return [];
    }
  }

  private calculateOverallReadiness(): number {
    const factors = Array.from(this.geopoliticalFactors.values());
    const regions = Array.from(this.regionalAssessments.values());

    // Weight factors by impact and category
    let weightedSum = 0;
    let totalWeight = 0;

    for (const factor of factors) {
      const weight = factor.impact === 'high' ? 3 : factor.impact === 'medium' ? 2 : 1;
      weightedSum += factor.currentValue * weight;
      totalWeight += weight;
    }

    // Include regional opportunity weighted by Azora alignment
    for (const region of regions) {
      const regionalWeight = region.azoraAlignment / 100; // 0-1
      weightedSum += region.opportunityIndex * regionalWeight;
      totalWeight += regionalWeight;
    }

    return Math.min(100, Math.max(0, weightedSum / totalWeight));
  }

  private identifyKeyRegions(): { primaryRegions: string[]; riskRegions: string[] } {
    const regions = Array.from(this.regionalAssessments.values());

    // Sort by opportunity index (weighted by Azora alignment)
    const sortedByOpportunity = regions
      .map(r => ({
        ...r,
        weightedOpportunity: r.opportunityIndex * (r.azoraAlignment / 100)
      }))
      .sort((a, b) => b.weightedOpportunity - a.weightedOpportunity);

    // Sort by risk index
    const sortedByRisk = regions
      .sort((a, b) => b.riskIndex - a.riskIndex);

    return {
      primaryRegions: sortedByOpportunity.slice(0, 3).map(r => r.regionId),
      riskRegions: sortedByRisk.slice(0, 3).map(r => r.regionId),
    };
  }

  private calculateDiversificationScore(): number {
    const regions = Array.from(this.regionalAssessments.values());

    // Calculate geographic diversification based on opportunity distribution
    const totalOpportunity = regions.reduce((sum, r) => sum + r.opportunityIndex, 0);
    const averageOpportunity = totalOpportunity / regions.length;

    // Measure how evenly opportunities are distributed
    let variance = 0;
    for (const region of regions) {
      variance += Math.pow(region.opportunityIndex - averageOpportunity, 2);
    }
    variance /= regions.length;

    // Convert variance to diversification score (lower variance = better diversification)
    const diversificationScore = Math.max(0, 100 - (variance / 100));

    return diversificationScore;
  }

  private calculateSovereigntyIndex(): number {
    // Calculate based on factors that affect economic sovereignty
    const sovereigntyFactors = [
      'regulatory_stability',
      'blockchain_adoption',
      'geopolitical_tensions'
    ];

    let sovereigntyScore = 0;
    for (const factorId of sovereigntyFactors) {
      const factor = this.geopoliticalFactors.get(factorId);
      if (factor) {
        sovereigntyScore += factor.currentValue;
      }
    }

    return sovereigntyScore / sovereigntyFactors.length;
  }

  private calculateAzoraAlignment(regionId: string): number {
    // Calculate how well Azora's values and technology align with each region
    // Based on regulatory environment, technological adoption, economic policies

    const alignmentFactors: Record<string, number> = {
      north_america: 85, // Strong regulatory clarity, high adoption
      european_union: 80, // Good regulatory framework, privacy focus
      united_kingdom: 82, // Post-Brexit innovation hub
      china: 70, // High adoption but regulatory uncertainty
      japan: 75, // Strong institutional adoption
      south_korea: 78, // High tech adoption, regulatory evolution
      singapore: 90, // Crypto-friendly regulatory environment
      australia: 83, // Balanced regulatory approach
      south_africa: 88, // Azora's home base, strong alignment
      brazil: 72, // Growing adoption, some regulatory challenges
      india: 76, // Large market potential, regulatory evolution
      middle_east_oil_states: 65, // Growing interest, conservative approach
      emerging_asia: 74, // High growth potential, varying regulatory maturity
    };

    return alignmentFactors[regionId] || 50;
  }

  private async analyzeFactorUpdate(factor: GeopoliticalFactor): Promise<{
    newValue: number;
    trend: 'improving' | 'stable' | 'deteriorating';
  }> {
    // Simulate factor analysis - in production would use real data
    const randomChange = (Math.random() - 0.5) * 10; // -5 to +5
    const newValue = Math.max(0, Math.min(100, factor.currentValue + randomChange));

    let trend: 'improving' | 'stable' | 'deteriorating' = 'stable';
    if (newValue > factor.currentValue + 2) trend = 'improving';
    else if (newValue < factor.currentValue - 2) trend = 'deteriorating';

    return { newValue, trend };
  }

  private async analyzeRegionalFactors(regionId: string): Promise<{
    stabilityIndex: number;
    opportunityIndex: number;
    riskIndex: number;
    keyFactors: string[];
    recommendedActions: string[];
  }> {
    // Simulate regional analysis - in production would analyze region-specific data
    const baseAssessment = this.regionalAssessments.get(regionId);
    if (!baseAssessment) {
      return {
        stabilityIndex: 50,
        opportunityIndex: 50,
        riskIndex: 50,
        keyFactors: [],
        recommendedActions: [],
      };
    }

    // Apply some variation based on current geopolitical factors
    const geopoliticalImpact = this.calculateGeopoliticalImpact(regionId);

    return {
      stabilityIndex: Math.max(0, Math.min(100, baseAssessment.stabilityIndex + geopoliticalImpact.stability)),
      opportunityIndex: Math.max(0, Math.min(100, baseAssessment.opportunityIndex + geopoliticalImpact.opportunity)),
      riskIndex: Math.max(0, Math.min(100, baseAssessment.riskIndex + geopoliticalImpact.risk)),
      keyFactors: [
        'Regulatory environment',
        'Economic growth',
        'Political stability',
        'Technology adoption'
      ],
      recommendedActions: [
        'Monitor regulatory developments',
        'Build local partnerships',
        'Assess market opportunities'
      ],
    };
  }

  private calculateGeopoliticalImpact(regionId: string): {
    stability: number;
    opportunity: number;
    risk: number;
  } {
    // Calculate how current geopolitical factors affect each region
    const geopoliticalTension = this.geopoliticalFactors.get('geopolitical_tensions')?.currentValue || 50;
    const regulatoryStability = this.geopoliticalFactors.get('regulatory_stability')?.currentValue || 50;

    // Different regions are affected differently by global factors
    const regionSensitivity: Record<string, number> = {
      north_america: 0.8,
      european_union: 0.9,
      united_kingdom: 0.7,
      china: 1.2,
      japan: 0.6,
      south_korea: 0.8,
      singapore: 0.5,
      australia: 0.6,
      south_africa: 0.9,
      brazil: 1.0,
      india: 0.8,
      middle_east_oil_states: 1.1,
      emerging_asia: 1.0,
    };

    const sensitivity = regionSensitivity[regionId] || 1.0;

    return {
      stability: (regulatoryStability - 50) * sensitivity * 0.1,
      opportunity: (100 - geopoliticalTension - 50) * sensitivity * 0.1,
      risk: (geopoliticalTension - 50) * sensitivity * 0.1,
    };
  }

  private async analyzeCrisisUpdate(indicator: CrisisIndicator): Promise<{
    probability: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }> {
    // Simulate crisis probability updates
    const randomChange = (Math.random() - 0.5) * 20; // -10 to +10
    const newProbability = Math.max(0, Math.min(100, indicator.probability + randomChange));

    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (newProbability > 75) severity = 'critical';
    else if (newProbability > 50) severity = 'high';
    else if (newProbability > 25) severity = 'medium';

    return { probability: newProbability, severity };
  }
}