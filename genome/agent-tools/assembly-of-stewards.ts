/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { ChatOpenAI } from "@langchain/openai";
import { ConstitutionalChain } from "./constitutional-chain";

/**
 * Assembly of Stewards - The Sovereign Legislature
 *
 * Azora Sovereignty Protocol - Layer 2: Governance
 *
 * The Assembly represents the highest deliberative body of the Sovereignty,
 * providing the essential human check on the immutability of the law and
 * the logic of the AI. It is composed of citizens who stand high in the
 * hierarchy through sustained Proof-of-Governance.
 *
 * Primary functions:
 * - Provide insight to the judiciary regarding fair law and an ideal world
 * - Challenge the constitution itself through amendment proposals
 * - Balance democratic values against data-driven efficiency
 */

export interface StewardProfile {
  stewardId: string;
  citizenId: string;
  governanceScore: number; // Proof-of-Governance ranking
  expertiseDomains: string[];
  tenureStart: number;
  lastActivity: number;
  proposalCount: number;
  votingParticipation: number; // Percentage of votes participated
  reputationScore: number; // Community trust metric
  isActive: boolean;
}

export interface ConstitutionalAmendment {
  amendmentId: string;
  proposerId: string;
  title: string;
  description: string;
  fullText: string;
  proposedChanges: {
    section: string;
    currentText: string;
    proposedText: string;
    rationale: string;
  }[];
  status: 'proposed' | 'under_review' | 'approved' | 'rejected' | 'implemented';
  submissionDate: number;
  reviewDeadline: number;
  votingStartDate?: number;
  votingEndDate?: number;
  stewardVotes: Record<string, 'aye' | 'nay' | 'abstain'>;
  oracleAnalysis?: OracleAmendmentAnalysis;
  finalOutcome?: {
    stewardMajority: boolean;
    oracleRecommendation: 'favorable' | 'unfavorable' | 'neutral';
    finalDecision: 'approved' | 'rejected';
    implementationDate?: number;
  };
}

export interface OracleAmendmentAnalysis {
  kaelusAnalysis: {
    logicalConsistency: number; // 0-100
    implementationFeasibility: number; // 0-100
    potentialConflicts: string[];
    logicalRationale: string;
  };
  lyraAnalysis: {
    ethicalAlignment: number; // 0-100, alignment with Ubuntu principles
    socialImpact: 'positive' | 'neutral' | 'negative';
    humanRightsConsiderations: string[];
    ethicalRationale: string;
  };
  solonAnalysis: {
    economicImpact: number; // 0-100 projected benefit
    longTermConsequences: string[];
    efficiencyGains: number; // Percentage improvement
    consequentialRationale: string;
  };
  overallRecommendation: {
    score: number; // 0-100 composite score
    recommendation: 'favorable' | 'unfavorable' | 'neutral';
    confidence: number; // 0-100
    keyConsiderations: string[];
  };
}

export interface PolicyInsight {
  insightId: string;
  category: 'economic' | 'social' | 'technological' | 'environmental' | 'governance';
  title: string;
  description: string;
  proposedActions: string[];
  supportingData: any;
  stewardId: string;
  submissionDate: number;
  relevanceScore: number; // AI-calculated relevance to current challenges
  status: 'submitted' | 'under_review' | 'adopted' | 'rejected';
}

export class AssemblyOfStewards {
  private llm: ChatOpenAI;
  private constitutionalChain: ConstitutionalChain;
  private stewards: Map<string, StewardProfile> = new Map();
  private amendments: Map<string, ConstitutionalAmendment> = new Map();
  private policyInsights: PolicyInsight[] = [];

  // Governance parameters
  private readonly MIN_GOVERNANCE_SCORE = 750; // Minimum score to become steward
  private readonly STEWARD_QUORUM = 0.67; // 2/3 quorum required
  private readonly AMENDMENT_VOTING_PERIOD = 30 * 24 * 60 * 60 * 1000; // 30 days
  private readonly INSIGHT_REVIEW_PERIOD = 14 * 24 * 60 * 60 * 1000; // 14 days

  constructor(openaiApiKey: string) {
    this.llm = new ChatOpenAI({
      openaiApiKey,
      modelName: "gpt-4-turbo-preview",
      temperature: 0.3, // Moderate temperature for balanced analysis
    });

    this.constitutionalChain = new ConstitutionalChain(this.llm);
  }

  /**
   * Nominate a citizen to become a Steward
   */
  async nominateSteward(
    citizenId: string,
    governanceScore: number,
    expertiseDomains: string[]
  ): Promise<{ accepted: boolean; reason: string }> {
    // Verify eligibility
    if (governanceScore < this.MIN_GOVERNANCE_SCORE) {
      return {
        accepted: false,
        reason: `Governance score ${governanceScore} below minimum threshold ${this.MIN_GOVERNANCE_SCORE}`
      };
    }

    // Check for existing stewardship
    const existingStewardId = `steward_${citizenId}`;
    if (this.stewards.has(existingStewardId)) {
      return {
        accepted: false,
        reason: "Citizen is already a steward"
      };
    }

    // Create steward profile
    const stewardProfile: StewardProfile = {
      stewardId: existingStewardId,
      citizenId,
      governanceScore,
      expertiseDomains,
      tenureStart: Date.now(),
      lastActivity: Date.now(),
      proposalCount: 0,
      votingParticipation: 100, // New stewards start at 100%
      reputationScore: 50, // Neutral starting reputation
      isActive: true,
    };

    this.stewards.set(existingStewardId, stewardProfile);

    return {
      accepted: true,
      reason: "Successfully nominated as Steward"
    };
  }

  /**
   * Propose a constitutional amendment
   */
  async proposeAmendment(
    proposerId: string,
    title: string,
    description: string,
    changes: ConstitutionalAmendment['proposedChanges']
  ): Promise<{ amendmentId: string; status: string } | { error: string }> {
    // Verify proposer is an active steward
    const steward = this.stewards.get(proposerId);
    if (!steward || !steward.isActive) {
      return { error: "Only active stewards can propose amendments" };
    }

    // Create amendment
    const amendmentId = `amendment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const amendment: ConstitutionalAmendment = {
      amendmentId,
      proposerId,
      title,
      description,
      fullText: this.generateAmendmentText(title, description, changes),
      proposedChanges: changes,
      status: 'proposed',
      submissionDate: Date.now(),
      reviewDeadline: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days for initial review
      stewardVotes: {},
    };

    this.amendments.set(amendmentId, amendment);

    // Update steward stats
    steward.proposalCount++;
    steward.lastActivity = Date.now();

    return {
      amendmentId,
      status: "Amendment proposed and under initial review"
    };
  }

  /**
   * Submit policy insight for judicial consideration
   */
  async submitPolicyInsight(
    stewardId: string,
    category: PolicyInsight['category'],
    title: string,
    description: string,
    proposedActions: string[],
    supportingData: any
  ): Promise<{ insightId: string; status: string } | { error: string }> {
    // Verify steward
    const steward = this.stewards.get(stewardId);
    if (!steward || !steward.isActive) {
      return { error: "Only active stewards can submit policy insights" };
    }

    // Calculate relevance score using AI
    const relevanceScore = await this.calculateInsightRelevance(
      category,
      title,
      description,
      supportingData
    );

    const insight: PolicyInsight = {
      insightId: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      category,
      title,
      description,
      proposedActions,
      supportingData,
      stewardId,
      submissionDate: Date.now(),
      relevanceScore,
      status: 'submitted',
    };

    this.policyInsights.push(insight);

    // Update steward activity
    steward.lastActivity = Date.now();

    return {
      insightId: insight.insightId,
      status: "Policy insight submitted for review"
    };
  }

  /**
   * Begin amendment voting process
   */
  async initiateAmendmentVoting(amendmentId: string): Promise<{ success: boolean; reason: string }> {
    const amendment = this.amendments.get(amendmentId);
    if (!amendment) {
      return { success: false, reason: "Amendment not found" };
    }

    if (amendment.status !== 'under_review') {
      return { success: false, reason: "Amendment not ready for voting" };
    }

    // Get Oracle analysis
    const oracleAnalysis = await this.requestOracleAmendmentAnalysis(amendment);
    amendment.oracleAnalysis = oracleAnalysis;

    // Start voting
    amendment.status = 'approved'; // Move to voting phase
    amendment.votingStartDate = Date.now();
    amendment.votingEndDate = Date.now() + this.AMENDMENT_VOTING_PERIOD;

    return { success: true, reason: "Amendment voting initiated" };
  }

  /**
   * Cast vote on constitutional amendment
   */
  async castAmendmentVote(
    stewardId: string,
    amendmentId: string,
    vote: 'aye' | 'nay' | 'abstain'
  ): Promise<{ success: boolean; reason: string }> {
    const steward = this.stewards.get(stewardId);
    if (!steward || !steward.isActive) {
      return { success: false, reason: "Invalid steward" };
    }

    const amendment = this.amendments.get(amendmentId);
    if (!amendment || amendment.status !== 'approved' || !amendment.votingEndDate) {
      return { success: false, reason: "Amendment not in voting phase" };
    }

    if (Date.now() > amendment.votingEndDate) {
      return { success: false, reason: "Voting period has ended" };
    }

    // Record vote
    amendment.stewardVotes[stewardId] = vote;

    // Update steward participation
    steward.lastActivity = Date.now();
    // Recalculate participation rate (simplified)
    steward.votingParticipation = Math.min(100, steward.votingParticipation + 1);

    return { success: true, reason: "Vote recorded successfully" };
  }

  /**
   * Finalize amendment voting and determine outcome
   */
  async finalizeAmendmentVoting(amendmentId: string): Promise<{
    outcome: 'approved' | 'rejected';
    stewardMajority: boolean;
    oracleRecommendation: string;
    reasoning: string;
  }> {
    const amendment = this.amendments.get(amendmentId);
    if (!amendment || !amendment.votingEndDate || !amendment.oracleAnalysis) {
      throw new Error("Amendment not ready for finalization");
    }

    // Check if voting period has ended
    if (Date.now() < amendment.votingEndDate) {
      throw new Error("Voting period has not ended");
    }

    // Calculate steward majority
    const activeStewards = Array.from(this.stewards.values()).filter(s => s.isActive);
    const votes = Object.values(amendment.stewardVotes);
    const quorumReached = votes.length >= Math.ceil(activeStewards.length * this.STEWARD_QUORUM);

    if (!quorumReached) {
      amendment.status = 'rejected';
      return {
        outcome: 'rejected',
        stewardMajority: false,
        oracleRecommendation: amendment.oracleAnalysis.overallRecommendation.recommendation,
        reasoning: "Quorum not reached for constitutional amendment"
      };
    }

    const ayeVotes = votes.filter(v => v === 'aye').length;
    const nayVotes = votes.filter(v => v === 'nay').length;
    const stewardMajority = ayeVotes > nayVotes;

    // Balance steward majority with Oracle analysis
    const oracleScore = amendment.oracleAnalysis.overallRecommendation.score;
    const oracleRecommendation = amendment.oracleAnalysis.overallRecommendation.recommendation;

    let finalOutcome: 'approved' | 'rejected';
    let reasoning: string;

    if (stewardMajority && oracleRecommendation === 'favorable') {
      finalOutcome = 'approved';
      reasoning = `Steward majority (${ayeVotes}/${votes.length}) aligned with favorable Oracle recommendation (score: ${oracleScore})`;
    } else if (!stewardMajority && oracleRecommendation === 'unfavorable') {
      finalOutcome = 'rejected';
      reasoning = `Steward majority (${nayVotes}/${votes.length}) aligned with unfavorable Oracle recommendation (score: ${oracleScore})`;
    } else {
      // Conflict - require supermajority for approval
      const supermajorityThreshold = Math.ceil(votes.length * 0.75); // 75%
      if (stewardMajority && ayeVotes >= supermajorityThreshold) {
        finalOutcome = 'approved';
        reasoning = `Supermajority achieved (${ayeVotes}/${votes.length}) despite Oracle concerns`;
      } else {
        finalOutcome = 'rejected';
        reasoning = `Conflicting signals between stewards and Oracle - rejected for further deliberation`;
      }
    }

    // Record final outcome
    amendment.finalOutcome = {
      stewardMajority,
      oracleRecommendation: oracleRecommendation as any,
      finalDecision: finalOutcome,
    };

    amendment.status = finalOutcome === 'approved' ? 'approved' : 'rejected';

    return {
      outcome: finalOutcome,
      stewardMajority,
      oracleRecommendation,
      reasoning,
    };
  }

  /**
   * Get assembly status and metrics
   */
  getAssemblyStatus(): {
    totalStewards: number;
    activeStewards: number;
    pendingAmendments: number;
    activeAmendments: number;
    recentInsights: number;
    averageGovernanceScore: number;
  } {
    const allStewards = Array.from(this.stewards.values());
    const activeStewards = allStewards.filter(s => s.isActive);
    const amendments = Array.from(this.amendments.values());

    const avgGovernanceScore = activeStewards.length > 0
      ? activeStewards.reduce((sum, s) => sum + s.governanceScore, 0) / activeStewards.length
      : 0;

    return {
      totalStewards: allStewards.length,
      activeStewards: activeStewards.length,
      pendingAmendments: amendments.filter(a => a.status === 'proposed' || a.status === 'under_review').length,
      activeAmendments: amendments.filter(a => a.status === 'approved').length,
      recentInsights: this.policyInsights.filter(i => Date.now() - i.submissionDate < 30 * 24 * 60 * 60 * 1000).length,
      averageGovernanceScore: Math.round(avgGovernanceScore),
    };
  }

  /**
   * Get steward profile
   */
  getStewardProfile(stewardId: string): StewardProfile | null {
    return this.stewards.get(stewardId) || null;
  }

  /**
   * Get amendment details
   */
  getAmendment(amendmentId: string): ConstitutionalAmendment | null {
    return this.amendments.get(amendmentId) || null;
  }

  /**
   * Get policy insights by category
   */
  getPolicyInsights(category?: string, status?: string): PolicyInsight[] {
    return this.policyInsights
      .filter(insight => (!category || insight.category === category) &&
                        (!status || insight.status === status))
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  // ========== PRIVATE METHODS ==========

  private generateAmendmentText(
    title: string,
    description: string,
    changes: ConstitutionalAmendment['proposedChanges']
  ): string {
    let fullText = `# Constitutional Amendment: ${title}\n\n`;
    fullText += `**Description:** ${description}\n\n`;
    fullText += `**Proposed Changes:**\n\n`;

    changes.forEach((change, index) => {
      fullText += `## Change ${index + 1}: ${change.section}\n\n`;
      fullText += `**Current Text:**\n${change.currentText}\n\n`;
      fullText += `**Proposed Text:**\n${change.proposedText}\n\n`;
      fullText += `**Rationale:** ${change.rationale}\n\n`;
    });

    return fullText;
  }

  private async calculateInsightRelevance(
    category: string,
    title: string,
    description: string,
    supportingData: any
  ): Promise<number> {
    // Use AI to assess relevance to current system challenges
    const prompt = `
Analyze this policy insight for relevance to the Azora Sovereignty system:

Category: ${category}
Title: ${title}
Description: ${description}
Supporting Data: ${JSON.stringify(supportingData)}

Rate the relevance on a scale of 0-100 based on:
- Alignment with current system challenges
- Potential impact on system stability/efficiency
- Timeliness and urgency
- Feasibility of implementation

Return only a number between 0-100.
    `;

    try {
      const response = await this.llm.invoke(prompt);
      const score = parseInt(response.content.trim());
      return Math.max(0, Math.min(100, score));
    } catch (error) {
      console.error('Failed to calculate insight relevance:', error);
      return 50; // Default neutral score
    }
  }

  private async requestOracleAmendmentAnalysis(
    amendment: ConstitutionalAmendment
  ): Promise<OracleAmendmentAnalysis> {
    // This would integrate with the Guardian Oracles system
    // For now, simulate comprehensive analysis

    const kaelusAnalysis = await this.analyzeLogicalConsistency(amendment);
    const lyraAnalysis = await this.analyzeEthicalAlignment(amendment);
    const solonAnalysis = await this.analyzeConsequentialImpact(amendment);

    const overallScore = (kaelusAnalysis.logicalConsistency +
                         lyraAnalysis.ethicalAlignment +
                         solonAnalysis.economicImpact) / 3;

    let recommendation: 'favorable' | 'unfavorable' | 'neutral' = 'neutral';
    if (overallScore >= 70) recommendation = 'favorable';
    else if (overallScore <= 40) recommendation = 'unfavorable';

    return {
      kaelusAnalysis,
      lyraAnalysis,
      solonAnalysis,
      overallRecommendation: {
        score: Math.round(overallScore),
        recommendation,
        confidence: Math.round((Math.abs(overallScore - 50) / 50) * 100),
        keyConsiderations: this.extractKeyConsiderations(amendment, kaelusAnalysis, lyraAnalysis, solonAnalysis),
      },
    };
  }

  private async analyzeLogicalConsistency(amendment: ConstitutionalAmendment): Promise<OracleAmendmentAnalysis['kaelusAnalysis']> {
    // Simulate logical analysis
    const consistencyScore = Math.floor(Math.random() * 40) + 60; // 60-100
    const feasibilityScore = Math.floor(Math.random() * 30) + 70; // 70-100

    return {
      logicalConsistency: consistencyScore,
      implementationFeasibility: feasibilityScore,
      potentialConflicts: [
        "Potential conflict with existing Section 4.2",
        "May require updates to related protocols"
      ],
      logicalRationale: "The amendment maintains logical consistency with core constitutional principles while introducing necessary flexibility.",
    };
  }

  private async analyzeEthicalAlignment(amendment: ConstitutionalAmendment): Promise<OracleAmendmentAnalysis['lyraAnalysis']> {
    // Simulate ethical analysis
    const alignmentScore = Math.floor(Math.random() * 30) + 65; // 65-95
    const socialImpact: 'positive' | 'neutral' | 'negative' =
      alignmentScore > 80 ? 'positive' : alignmentScore > 60 ? 'neutral' : 'negative';

    return {
      ethicalAlignment: alignmentScore,
      socialImpact,
      humanRightsConsiderations: [
        "Enhances participatory governance",
        "Maintains individual sovereignty rights"
      ],
      ethicalRationale: "The amendment aligns with Ubuntu principles of collective well-being and maintains ethical standards.",
    };
  }

  private async analyzeConsequentialImpact(amendment: ConstitutionalAmendment): Promise<OracleAmendmentAnalysis['solonAnalysis']> {
    // Simulate consequential analysis
    const economicImpact = Math.floor(Math.random() * 35) + 65; // 65-100
    const efficiencyGains = Math.floor(Math.random() * 20) + 5; // 5-25%

    return {
      economicImpact,
      longTermConsequences: [
        "Expected improvement in governance efficiency",
        "Potential for enhanced system adaptability"
      ],
      efficiencyGains,
      consequentialRationale: "Long-term analysis suggests net positive impact on system efficiency and adaptability.",
    };
  }

  private extractKeyConsiderations(
    amendment: ConstitutionalAmendment,
    kaelus: any,
    lyra: any,
    solon: any
  ): string[] {
    const considerations = [];

    if (kaelus.logicalConsistency > 80) {
      considerations.push("High logical consistency with existing framework");
    }

    if (lyra.ethicalAlignment > 80) {
      considerations.push("Strong alignment with Ubuntu ethical principles");
    }

    if (solon.economicImpact > 80) {
      considerations.push("Significant positive economic impact projected");
    }

    if (kaelus.potentialConflicts.length > 0) {
      considerations.push("Potential conflicts with existing provisions require careful implementation");
    }

    return considerations;
  }
}