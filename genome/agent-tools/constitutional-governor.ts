/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { logger } from '../utils/logger';

export interface ConstitutionRule {
  id: string;
  category: 'security' | 'privacy' | 'ethics' | 'compliance' | 'governance';
  rule: string;
  severity: 'block' | 'warn' | 'audit';
  conditions: {
    actions?: string[];
    resources?: string[];
    roles?: string[];
    dataTypes?: string[];
    amounts?: {
      min?: number;
      max?: number;
    };
  };
  requiresConfirmation?: boolean;
  auditRequired: boolean;
}

export interface ActionPlan {
  id: string;
  type: string;
  description: string;
  parameters: Record<string, any>;
  userId?: string;
  timestamp: Date;
  context?: Record<string, any>;
}

export interface ValidationResult {
  allowed: boolean;
  blocked: boolean;
  warnings: string[];
  confirmations: string[];
  auditRequired: boolean;
  reasoning: string[];
  metadata: {
    ruleId?: string;
    severity?: string;
    timestamp: Date;
  };
}

export class ConstitutionalGovernor {
  private constitution: ConstitutionRule[] = [];

  constructor() {
    this.loadConstitution();
  }

  private loadConstitution(): void {
    // Load constitution rules from config file
    // This would typically load from constitution.config.json
    this.constitution = [
      // Security Rules
      {
        id: 'security-001',
        category: 'security',
        rule: 'Agent cannot execute actions that compromise system security',
        severity: 'block',
        conditions: {
          actions: ['delete_system', 'modify_security', 'access_restricted_data'],
        },
        requiresConfirmation: true,
        auditRequired: true,
      },
      {
        id: 'security-002',
        category: 'security',
        rule: 'High-value financial transactions require confirmation',
        severity: 'warn',
        conditions: {
          actions: ['transfer_tokens', 'mint_tokens'],
          amounts: { min: 1000 },
        },
        requiresConfirmation: true,
        auditRequired: true,
      },

      // Privacy Rules
      {
        id: 'privacy-001',
        category: 'privacy',
        rule: 'Agent cannot access personal data without explicit user consent',
        severity: 'block',
        conditions: {
          dataTypes: ['personal_info', 'financial_data', 'health_data'],
        },
        requiresConfirmation: true,
        auditRequired: true,
      },

      // Ethics Rules
      {
        id: 'ethics-001',
        category: 'ethics',
        rule: 'Agent actions must prioritize user benefit and system stability',
        severity: 'audit',
        conditions: {},
        auditRequired: true,
      },

      // Compliance Rules
      {
        id: 'compliance-001',
        category: 'compliance',
        rule: 'All financial operations must be auditable',
        severity: 'audit',
        conditions: {
          actions: ['transfer_tokens', 'mint_tokens', 'burn_tokens'],
        },
        auditRequired: true,
      },

      // Governance Rules
      {
        id: 'governance-001',
        category: 'governance',
        rule: 'System changes require governance approval',
        severity: 'block',
        conditions: {
          actions: ['modify_code', 'deploy_changes', 'restart_services'],
        },
        requiresConfirmation: true,
        auditRequired: true,
      },
    ];

    logger.info(`Constitutional Governor loaded ${this.constitution.length} rules`);
  }

  async validateAction(action: ActionPlan): Promise<ValidationResult> {
    const result: ValidationResult = {
      allowed: true,
      blocked: false,
      warnings: [],
      confirmations: [],
      auditRequired: false,
      reasoning: [],
      metadata: {
        timestamp: new Date(),
      },
    };

    // Evaluate each constitution rule
    for (const rule of this.constitution) {
      const ruleResult = this.evaluateRule(rule, action);

      if (ruleResult.blocked) {
        result.allowed = false;
        result.blocked = true;
        result.reasoning.push(`BLOCKED by ${rule.id}: ${rule.rule}`);
        result.metadata.ruleId = rule.id;
        result.metadata.severity = rule.severity;
        break; // First blocking rule stops evaluation
      }

      if (ruleResult.warning) {
        result.warnings.push(`${rule.id}: ${ruleResult.warning}`);
      }

      if (ruleResult.confirmation) {
        result.confirmations.push(`${rule.id}: ${ruleResult.confirmation}`);
      }

      if (rule.auditRequired) {
        result.auditRequired = true;
      }
    }

    // Log validation result
    logger.info('Constitutional validation completed', {
      actionId: action.id,
      allowed: result.allowed,
      blocked: result.blocked,
      warnings: result.warnings.length,
      confirmations: result.confirmations.length,
      auditRequired: result.auditRequired,
    });

    return result;
  }

  private evaluateRule(rule: ConstitutionRule, action: ActionPlan): {
    blocked: boolean;
    warning?: string;
    confirmation?: string;
  } {
    // Check action type
    if (rule.conditions.actions && !rule.conditions.actions.includes(action.type)) {
      return { blocked: false };
    }

    // Check resources
    if (rule.conditions.resources && action.parameters.resource) {
      if (!rule.conditions.resources.includes(action.parameters.resource)) {
        return { blocked: false };
      }
    }

    // Check data types
    if (rule.conditions.dataTypes && action.parameters.dataType) {
      if (!rule.conditions.dataTypes.includes(action.parameters.dataType)) {
        return { blocked: false };
      }
    }

    // Check amounts
    if (rule.conditions.amounts && action.parameters.amount) {
      const amount = action.parameters.amount;
      if (rule.conditions.amounts.min && amount < rule.conditions.amounts.min) {
        return { blocked: false };
      }
      if (rule.conditions.amounts.max && amount > rule.conditions.amounts.max) {
        return { blocked: false };
      }
    }

    // Rule applies - determine response based on severity
    switch (rule.severity) {
      case 'block':
        return {
          blocked: true,
          warning: rule.rule,
        };

      case 'warn':
        return {
          blocked: false,
          warning: rule.rule,
        };

      case 'audit':
        return {
          blocked: false,
          confirmation: rule.requiresConfirmation ? rule.rule : undefined,
        };

      default:
        return { blocked: false };
    }
  }

  async logViolation(action: ActionPlan, result: ValidationResult): Promise<void> {
    // Log to audit system (would integrate with azora-covenant)
    const violation = {
      actionId: action.id,
      actionType: action.type,
      userId: action.userId,
      reasoning: result.reasoning,
      ruleId: result.metadata.ruleId,
      severity: result.metadata.severity,
      timestamp: new Date(),
    };

    logger.error('Constitutional violation detected', violation);

    // Send to azora-covenant for immutable logging
    try {
      await this.logToBlockchain(violation);
    } catch (error) {
      console.error('Failed to log violation to blockchain:', error);
    }

    // Alert security team if critical violation
    if (result.metadata.severity === 'critical') {
      await this.alertSecurityTeam(violation);
    }
  }

  getConstitutionSummary(): { total: number; byCategory: Record<string, number> } {
    const byCategory: Record<string, number> = {};
    this.constitution.forEach(rule => {
      byCategory[rule.category] = (byCategory[rule.category] || 0) + 1;
    });

    return {
      total: this.constitution.length,
      byCategory,
    };
  }

  private async logToBlockchain(violation: any): Promise<void> {
    // Integration with azora-covenant for immutable logging
    try {
      // This would make an API call to azora-covenant
      // For now, we'll log to console as placeholder
      console.log('Logging violation to blockchain:', violation);

      // TODO: Implement actual blockchain logging
      // const response = await fetch('http://azora-covenant:5050/api/transactions', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     fromAddress: 'system',
      //     toAddress: 'audit-log',
      //     amount: 0,
      //     type: 'constitutional_violation',
      //     metadata: violation
      //   })
      // });

    } catch (error) {
      console.error('Blockchain logging failed:', error);
      throw error;
    }
  }

  private async alertSecurityTeam(violation: any): Promise<void> {
    // Alert security team for critical violations
    try {
      console.log('🚨 CRITICAL CONSTITUTIONAL VIOLATION ALERT 🚨');
      console.log('Security team notification would be sent here');
      console.log('Violation details:', violation);

      // TODO: Implement actual security alerting
      // This could integrate with:
      // - Azora Aegis security service
      // - Email notifications
      // - SMS alerts
      // - Slack/Discord webhooks

    } catch (error) {
      console.error('Security alert failed:', error);
      throw error;
    }
  }
}

// Global constitutional governor instance
export const constitutionalGovernor = new ConstitutionalGovernor();