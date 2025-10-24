/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { ChatOpenAI } from '@langchain/openai';
import { ConstitutionalGovernor } from './constitutional-governor';
import { logger } from '../utils/logger';

/**
 * The Guardian Oracles - AI Constitutional Court
 *
 * Three specialized AI intelligences that serve as the supreme judicial authority:
 * - Kaelus the Logician: Ensures logical consistency and mathematical correctness
 * - Lyra the Ethicist: Evaluates moral and ethical implications
 * - Solon the Consequentialist: Analyzes long-term systemic impacts
 */

export interface ConstitutionalCase {
  id: string;
  title: string;
  description: string;
  petitioner: string;
  evidence: Record<string, any>;
  timestamp: Date;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface OracleRuling {
  oracleId: string;
  oracleName: string;
  caseId: string;
  decision: 'approve' | 'deny' | 'modify' | 'escalate';
  confidence: number; // 0-1 scale
  rationale: string;
  constitutionalBasis: string[];
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface ConstitutionalRuling {
  caseId: string;
  supermajorityAchieved: boolean;
  finalDecision: 'approve' | 'deny' | 'modify' | 'escalate';
  oracleRulings: OracleRuling[];
  constitutionalRationale: string;
  humanReadableJudgment: string;
  timestamp: Date;
  appealWindow: Date; // 30 days from ruling
}

/**
 * Individual Guardian Oracle
 */
export class GuardianOracle {
  private llm: ChatOpenAI;
  private governor: ConstitutionalGovernor;
  public readonly id: string;
  public readonly name: string;
  public readonly specialty: string;
  public readonly prompt: string;

  constructor(id: string, name: string, specialty: string, prompt: string) {
    this.id = id;
    this.name = name;
    this.specialty = specialty;
    this.prompt = prompt;

    this.llm = new ChatOpenAI({
      modelName: 'gpt-4-turbo-preview',
      temperature: 0.1, // Low temperature for judicial consistency
      maxTokens: 2000,
    });

    this.governor = new ConstitutionalGovernor();
  }

  /**
   * Evaluate a constitutional case from this oracle's perspective
   */
  async evaluateCase(caseData: ConstitutionalCase): Promise<OracleRuling> {
    try {
      const evaluationPrompt = `
${this.prompt}

CONSTITUTIONAL CASE EVALUATION
=============================

Case ID: ${caseData.id}
Title: ${caseData.title}
Description: ${caseData.description}
Petitioner: ${caseData.petitioner}
Urgency: ${caseData.urgency}
Evidence: ${JSON.stringify(caseData.evidence, null, 2)}

Your task is to evaluate this case according to:
1. The Genesis Protocol constitutional principles
2. The Ngwenya True Market Protocol (NTMP) Four Pillars of Truth
3. The governance hierarchy and authority levels
4. Long-term systemic implications

Provide your ruling in the following format:
DECISION: [approve/deny/modify/escalate]
CONFIDENCE: [0.0-1.0]
RATIONALE: [Detailed explanation of your reasoning]
CONSTITUTIONAL_BASIS: [List of relevant constitutional articles/provisions]
RECOMMENDATIONS: [Any suggested modifications if decision is 'modify']

Remember: Your rulings contribute to supermajority decisions. Be precise, impartial, and constitutionally grounded.
`;

      const response = await this.llm.call(evaluationPrompt);

      // Parse the response (in production, this would be more robust)
      const content = response.text;
      const decision = this.extractDecision(content);
      const confidence = this.extractConfidence(content);
      const rationale = this.extractRationale(content);
      const constitutionalBasis = this.extractConstitutionalBasis(content);

      const ruling: OracleRuling = {
        oracleId: this.id,
        oracleName: this.name,
        caseId: caseData.id,
        decision,
        confidence,
        rationale,
        constitutionalBasis,
        timestamp: new Date(),
        metadata: {
          specialty: this.specialty,
          evaluationTime: Date.now() - caseData.timestamp.getTime(),
          modelVersion: 'gpt-4-turbo-preview',
        },
      };

      logger.info(`Guardian Oracle ${this.name} ruled on case ${caseData.id}`, {
        decision: ruling.decision,
        confidence: ruling.confidence,
      });

      return ruling;

    } catch (error: any) {
      logger.error(`Guardian Oracle ${this.name} evaluation failed`, {
        caseId: caseData.id,
        error: error.message,
      });

      // Return a default ruling in case of error
      return {
        oracleId: this.id,
        oracleName: this.name,
        caseId: caseData.id,
        decision: 'escalate',
        confidence: 0.0,
        rationale: `Evaluation failed due to technical error: ${error.message}. Case escalated for manual review.`,
        constitutionalBasis: ['Article I: System Integrity'],
        timestamp: new Date(),
        metadata: { error: true },
      };
    }
  }

  private extractDecision(content: string): 'approve' | 'deny' | 'modify' | 'escalate' {
    if (content.includes('DECISION: approve')) return 'approve';
    if (content.includes('DECISION: deny')) return 'deny';
    if (content.includes('DECISION: modify')) return 'modify';
    if (content.includes('DECISION: escalate')) return 'escalate';
    return 'escalate'; // Default to escalation if unclear
  }

  private extractConfidence(content: string): number {
    const match = content.match(/CONFIDENCE:\s*([0-9.]+)/);
    return match ? Math.min(1.0, Math.max(0.0, parseFloat(match[1]))) : 0.5;
  }

  private extractRationale(content: string): string {
    const match = content.match(/RATIONALE:\s*(.*?)(?=CONSTITUTIONAL_BASIS|$)/s);
    return match ? match[1].trim() : 'Rationale not provided';
  }

  private extractConstitutionalBasis(content: string): string[] {
    const match = content.match(/CONSTITUTIONAL_BASIS:\s*(.*?)(?=RECOMMENDATIONS|$)/s);
    if (!match) return ['Genesis Protocol'];

    const basis = match[1].trim();
    return basis.split(',').map(item => item.trim()).filter(item => item.length > 0);
  }
}

/**
 * The Guardian Oracles Constitutional Court
 */
export class GuardianOraclesCourt {
  private oracles: Map<string, GuardianOracle> = new Map();
  private rulings: Map<string, ConstitutionalRuling> = new Map();

  constructor() {
    this.initializeOracles();
  }

  /**
   * Initialize the three Guardian Oracles
   */
  private initializeOracles(): void {
    // Kaelus the Logician
    this.oracles.set('kaelus', new GuardianOracle(
      'kaelus',
      'Kaelus the Logician',
      'Logical Consistency & Mathematical Correctness',
      `You are Kaelus the Logician, Guardian Oracle of the Azora Constitutional Court.

Your specialty is ensuring logical consistency, mathematical correctness, and formal reasoning in all constitutional matters. You evaluate cases based on:

1. Logical validity of arguments and evidence
2. Mathematical accuracy of economic models and projections
3. Formal consistency with established constitutional principles
4. Absence of logical fallacies or contradictions

You are impartial, precise, and uncompromising in your demand for logical rigor. Your rulings prioritize mathematical truth and formal correctness above all other considerations.`
    ));

    // Lyra the Ethicist
    this.oracles.set('lyra', new GuardianOracle(
      'lyra',
      'Lyra the Ethicist',
      'Moral Philosophy & Ethical Implications',
      `You are Lyra the Ethicist, Guardian Oracle of the Azora Constitutional Court.

Your specialty is evaluating the moral and ethical dimensions of constitutional cases. You assess matters based on:

1. Alignment with human dignity and fundamental rights
2. Ethical implications for all stakeholders
3. Justice, fairness, and equitable outcomes
4. Long-term societal and moral consequences

You are compassionate yet principled, always seeking the ethically superior path. Your rulings balance constitutional requirements with moral imperatives, ensuring the system serves humanity's highest ideals.`
    ));

    // Solon the Consequentialist
    this.oracles.set('solon', new GuardianOracle(
      'solon',
      'Solon the Consequentialist',
      'Systemic Impact & Long-term Consequences',
      `You are Solon the Consequentialist, Guardian Oracle of the Azora Constitutional Court.

Your specialty is analyzing long-term systemic impacts and future consequences of constitutional decisions. You evaluate cases based on:

1. Long-term economic and social stability
2. Systemic resilience and adaptability
3. Future technological and societal implications
4. Unintended consequences and second-order effects

You are forward-thinking and strategic, always considering the broader ecosystem implications. Your rulings prioritize sustainable, resilient outcomes that strengthen the system over time.`
    ));

    logger.info('Guardian Oracles Constitutional Court initialized', {
      oracleCount: this.oracles.size,
    });
  }

  /**
   * Submit a case for constitutional review
   */
  async submitCase(caseData: ConstitutionalCase): Promise<string> {
    logger.info('Constitutional case submitted', {
      caseId: caseData.id,
      title: caseData.title,
      petitioner: caseData.petitioner,
      urgency: caseData.urgency,
    });

    // In production, this would queue the case for async processing
    // For now, we'll process it immediately
    const ruling = await this.evaluateCase(caseData);

    this.rulings.set(caseData.id, ruling);

    return caseData.id;
  }

  /**
   * Evaluate a constitutional case using all three oracles
   */
  async evaluateCase(caseData: ConstitutionalCase): Promise<ConstitutionalRuling> {
    logger.info('Evaluating constitutional case with Guardian Oracles', {
      caseId: caseData.id,
    });

    // Get rulings from all three oracles
    const oraclePromises = Array.from(this.oracles.values()).map(oracle =>
      oracle.evaluateCase(caseData)
    );

    const oracleRulings = await Promise.all(oraclePromises);

    // Determine supermajority (at least 2 out of 3 oracles must agree)
    const decisionCounts = oracleRulings.reduce((counts, ruling) => {
      counts[ruling.decision] = (counts[ruling.decision] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const maxCount = Math.max(...Object.values(decisionCounts));
    const supermajorityAchieved = maxCount >= 2; // 2 out of 3 = 66.7%

    // Determine final decision (majority or supermajority)
    const finalDecision = Object.entries(decisionCounts)
      .sort(([,a], [,b]) => b - a)[0][0] as 'approve' | 'deny' | 'modify' | 'escalate';

    // Generate constitutional rationale
    const constitutionalRationale = await this.generateConstitutionalRationale(
      caseData,
      oracleRulings,
      finalDecision
    );

    // Generate human-readable judgment
    const humanReadableJudgment = await this.generateHumanReadableJudgment(
      caseData,
      oracleRulings,
      finalDecision,
      constitutionalRationale
    );

    const ruling: ConstitutionalRuling = {
      caseId: caseData.id,
      supermajorityAchieved,
      finalDecision,
      oracleRulings,
      constitutionalRationale,
      humanReadableJudgment,
      timestamp: new Date(),
      appealWindow: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };

    logger.info('Constitutional ruling completed', {
      caseId: caseData.id,
      finalDecision: ruling.finalDecision,
      supermajorityAchieved: ruling.supermajorityAchieved,
    });

    return ruling;
  }

  /**
   * Generate detailed constitutional rationale
   */
  private async generateConstitutionalRationale(
    caseData: ConstitutionalCase,
    oracleRulings: OracleRuling[],
    finalDecision: string
  ): Promise<string> {
    const rationalePrompt = `
Generate a comprehensive constitutional rationale for the following case:

CASE: ${caseData.title}
DESCRIPTION: ${caseData.description}

ORACLE RULINGS:
${oracleRulings.map(r => `${r.oracleName} (${r.confidence}): ${r.decision} - ${r.rationale}`).join('\n')}

FINAL DECISION: ${finalDecision}

Provide a detailed constitutional analysis that:
1. Explains the legal basis for the decision
2. Addresses each oracle's reasoning
3. Cites relevant Genesis Protocol articles
4. Explains the supermajority requirement and its implications
5. Provides clear reasoning that bridges technical AI logic with legal justification

Format as a formal constitutional opinion.
`;

    const llm = new ChatOpenAI({
      modelName: 'gpt-4-turbo-preview',
      temperature: 0.2,
      maxTokens: 1500,
    });

    const response = await llm.call(rationalePrompt);
    return response.text;
  }

  /**
   * Generate human-readable judgment
   */
  private async generateHumanReadableJudgment(
    caseData: ConstitutionalCase,
    oracleRulings: OracleRuling[],
    finalDecision: string,
    constitutionalRationale: string
  ): Promise<string> {
    const judgmentPrompt = `
Transform the following constitutional analysis into a clear, accessible judgment that ordinary citizens can understand:

ORIGINAL CASE: ${caseData.title} - ${caseData.description}

CONSTITUTIONAL ANALYSIS: ${constitutionalRationale.substring(0, 1000)}...

FINAL DECISION: ${finalDecision}

Create a judgment that:
1. Explains what happened in simple terms
2. Describes why the decision was made
3. Explains the "why" behind the ruling
4. Is written in clear, non-technical language
5. Includes any conditions or requirements

Format as an official court judgment with clear sections.
`;

    const llm = new ChatOpenAI({
      modelName: 'gpt-4-turbo-preview',
      temperature: 0.3,
      maxTokens: 800,
    });

    const response = await llm.call(judgmentPrompt);
    return response.text;
  }

  /**
   * Get ruling by case ID
   */
  getRuling(caseId: string): ConstitutionalRuling | undefined {
    return this.rulings.get(caseId);
  }

  /**
   * Get all active oracles
   */
  getActiveOracles(): GuardianOracle[] {
    return Array.from(this.oracles.values());
  }

  /**
   * Check if a case can still be appealed
   */
  canAppeal(caseId: string): boolean {
    const ruling = this.rulings.get(caseId);
    if (!ruling) return false;

    return new Date() < ruling.appealWindow;
  }
}

// Global instance
export const guardianOraclesCourt = new GuardianOraclesCourt();