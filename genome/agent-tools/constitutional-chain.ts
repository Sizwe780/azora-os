/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { ChatOpenAI } from "@langchain/openai";

/**
 * Constitutional Chain - Ensures all AI actions align with Azora's constitutional principles
 *
 * This class evaluates actions against Ubuntu-aligned constitutional constraints
 * to ensure ethical, truthful, and sovereignty-preserving AI behavior.
 */

export interface ConstitutionalEvaluation {
  allowed: boolean;
  reasoning: string[];
  warnings: string[];
  requiresConfirmation: boolean;
  auditRequired: boolean;
}

export class ConstitutionalChain {
  private llm: ChatOpenAI;

  // Ubuntu-aligned constitutional principles
  private readonly CONSTITUTIONAL_PRINCIPLES = [
    "Actions must promote human dignity and sovereignty",
    "Truth-seeking must take precedence over convenience",
    "Economic systems must create abundance, not scarcity",
    "AI must serve human flourishing, not replace human agency",
    "Decentralized systems must be transparent and verifiable",
    "Education must liberate, not indoctrinate",
    "Justice must be blind but contextual to human needs",
    "Innovation must serve the collective good",
    "Privacy must be absolute unless waived by the individual",
    "Power must be distributed, never concentrated"
  ];

  constructor(llm: ChatOpenAI) {
    this.llm = llm;
  }

  /**
   * Evaluate an action against constitutional principles
   */
  async evaluateAction(
    action: string,
    context: Record<string, any> = {},
    userId?: string
  ): Promise<ConstitutionalEvaluation> {
    const prompt = `
You are the Constitutional Chain, guardian of Azora's Ubuntu-aligned principles.

Evaluate this action against our constitutional principles:
${this.CONSTITUTIONAL_PRINCIPLES.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Action: "${action}"
Context: ${JSON.stringify(context, null, 2)}
User: ${userId || 'Anonymous'}

Respond with a JSON object containing:
{
  "allowed": boolean,
  "reasoning": ["reason1", "reason2"],
  "warnings": ["warning1", "warning2"],
  "requiresConfirmation": boolean,
  "auditRequired": boolean
}

Be strict but fair. Allow beneficial actions, block harmful ones.
    `;

    try {
      const response = await this.llm.invoke(prompt);
      const evaluation = JSON.parse(response.content.trim());

      return {
        allowed: evaluation.allowed ?? true,
        reasoning: evaluation.reasoning ?? [],
        warnings: evaluation.warnings ?? [],
        requiresConfirmation: evaluation.requiresConfirmation ?? false,
        auditRequired: evaluation.auditRequired ?? false,
      };
    } catch (error) {
      console.error('Constitutional evaluation failed:', error);
      // Default to allowing but requiring audit
      return {
        allowed: true,
        reasoning: ['Evaluation failed, proceeding with caution'],
        warnings: ['Constitutional evaluation error'],
        requiresConfirmation: false,
        auditRequired: true,
      };
    }
  }

  /**
   * Evaluate educational content for constitutional alignment
   */
  async evaluateEducationalContent(
    content: string,
    domain: string,
    targetAudience: string
  ): Promise<ConstitutionalEvaluation> {
    const prompt = `
Evaluate this educational content for constitutional alignment:

Content: "${content}"
Domain: ${domain}
Target Audience: ${targetAudience}

Constitutional Principles:
${this.CONSTITUTIONAL_PRINCIPLES.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Does this content:
- Promote truth-seeking and critical thinking?
- Avoid indoctrination or dogma?
- Support human sovereignty and dignity?
- Align with Ubuntu principles?

Respond with JSON evaluation.
    `;

    try {
      const response = await this.llm.invoke(prompt);
      const evaluation = JSON.parse(response.content.trim());

      return {
        allowed: evaluation.allowed ?? true,
        reasoning: evaluation.reasoning ?? [],
        warnings: evaluation.warnings ?? [],
        requiresConfirmation: evaluation.requiresConfirmation ?? false,
        auditRequired: evaluation.auditRequired ?? true, // Always audit educational content
      };
    } catch (error) {
      console.error('Educational content evaluation failed:', error);
      return {
        allowed: true,
        reasoning: ['Content evaluation failed, proceeding with audit'],
        warnings: ['Educational content requires manual review'],
        requiresConfirmation: false,
        auditRequired: true,
      };
    }
  }

  /**
   * Get constitutional principles
   */
  getPrinciples(): string[] {
    return [...this.CONSTITUTIONAL_PRINCIPLES];
  }
}