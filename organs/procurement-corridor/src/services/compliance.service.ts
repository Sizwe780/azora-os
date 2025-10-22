/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { logger } from '../utils/logger';
import { ComplianceCheck, ComplianceRule, Tender, Bid } from '../types/tender.types';
import { UNGCPrinciples } from './rules/ungc-rules';
import { SALegalRules } from './rules/sa-legal-rules';

interface ConstitutionRule {
  id: string;
  name: string;
  description: string;
  category: 'constitutional' | 'legal' | 'policy' | 'best_practice';
  severity: 'critical' | 'high' | 'medium' | 'low';
  check: (tender: Tender, bid?: Bid) => Promise<{ passed: boolean; details?: string }>;
}

@Injectable()
export class ComplianceService {
  private constitutionRules: ConstitutionRule[] = [];

  constructor() {
    this.loadConstitutionRules();
  }

  /**
   * Load Constitution-as-Code rules
   */
  private loadConstitutionRules() {
    this.constitutionRules = [
      // Constitutional rules
      {
        id: 'const_fair_equitable',
        name: 'Fair, Equitable, Transparent & Competitive',
        description: 'Section 217 of the Constitution - procurement must be fair, equitable, transparent, competitive, and cost-effective',
        category: 'constitutional',
        severity: 'critical',
        check: async (tender) => {
          // Check transparency requirements
          const transparent = tender.description && tender.evaluationCriteria.length > 0;
          const competitive = tender.status === 'published' || tender.status === 'open';
          
          return {
            passed: transparent && competitive,
            details: !transparent ? 'Missing transparency requirements' : !competitive ? 'Not open for competition' : undefined,
          };
        },
      },
      {
        id: 'const_no_discrimination',
        name: 'Non-Discrimination',
        description: 'Section 9 of the Constitution - equality and non-discrimination',
        category: 'constitutional',
        severity: 'critical',
        check: async (tender) => {
          // Check for discriminatory requirements
          const discriminatoryTerms = ['race', 'gender', 'religion', 'exclude', 'only'];
          const hasDiscrimination = discriminatoryTerms.some(term => 
            tender.description.toLowerCase().includes(term) &&
            !tender.description.toLowerCase().includes('b-bbee') // B-BBEE is allowed
          );
          
          return {
            passed: !hasDiscrimination,
            details: hasDiscrimination ? 'Potentially discriminatory requirements detected' : undefined,
          };
        },
      },
      
      // PPPFA (Preferential Procurement Policy Framework Act) rules
      {
        id: 'pppfa_evaluation',
        name: 'PPPFA Evaluation Framework',
        description: 'Procurement must use 80/20 or 90/10 preference point system',
        category: 'legal',
        severity: 'high',
        check: async (tender) => {
          const priceWeight = tender.evaluationCriteria.find(c => c.type === 'price')?.weight || 0;
          const bbbeeWeight = tender.evaluationCriteria.find(c => c.type === 'bbbee')?.weight || 0;
          
          // For contracts > R50M: 90/10 (90% price, 10% B-BBEE)
          // For contracts <= R50M: 80/20 (80% price, 20% B-BBEE)
          const validRatio = tender.estimatedValue > 50_000_000
            ? (priceWeight === 90 && bbbeeWeight === 10)
            : (priceWeight === 80 && bbbeeWeight === 20);
          
          return {
            passed: validRatio,
            details: !validRatio ? `Invalid PPPFA ratio. Expected ${tender.estimatedValue > 50_000_000 ? '90/10' : '80/20'}` : undefined,
          };
        },
      },
      {
        id: 'pppfa_bbbee',
        name: 'B-BBEE Compliance',
        description: 'B-BBEE verification and scoring',
        category: 'legal',
        severity: 'high',
        check: async (tender, bid) => {
          if (!bid) return { passed: true }; // Only check bids
          
          const hasBBBEE = bid.bbbeeLevel !== undefined && bid.bbbeeCertificate;
          
          return {
            passed: hasBBBEE || !tender.bbbeeRequired,
            details: !hasBBBEE && tender.bbbeeRequired ? 'B-BBEE certificate required but not provided' : undefined,
          };
        },
      },
      
      // Tax compliance
      {
        id: 'tax_clearance',
        name: 'Tax Clearance Certificate',
        description: 'Valid tax clearance certificate required',
        category: 'legal',
        severity: 'critical',
        check: async (tender, bid) => {
          if (!bid) return { passed: true };
          
          const hasTaxClearance = bid.taxClearanceCertificate !== undefined;
          
          return {
            passed: hasTaxClearance || !tender.taxClearanceRequired,
            details: !hasTaxClearance && tender.taxClearanceRequired ? 'Tax clearance certificate required' : undefined,
          };
        },
      },
      
      // CSD (Central Supplier Database) registration
      {
        id: 'csd_registration',
        name: 'CSD Registration',
        description: 'Supplier must be registered on Central Supplier Database',
        category: 'legal',
        severity: 'high',
        check: async (tender, bid) => {
          if (!bid) return { passed: true };
          
          const hasCSD = bid.csdRegistrationNumber !== undefined;
          
          return {
            passed: hasCSD || !tender.centralSupplierDatabaseRequired,
            details: !hasCSD && tender.centralSupplierDatabaseRequired ? 'CSD registration required' : undefined,
          };
        },
      },
      
      // Conflict of interest
      {
        id: 'conflict_of_interest',
        name: 'No Conflict of Interest',
        description: 'Detect potential conflicts of interest',
        category: 'policy',
        severity: 'critical',
        check: async (tender, bid) => {
          // TODO: Implement conflict of interest detection
          // Check if supplier/bid submitter is related to procurement official
          // Check company registration, directors, shareholders
          
          return { passed: true };
        },
      },
      
      // Minimum requirements
      {
        id: 'minimum_requirements',
        name: 'Minimum Requirements Met',
        description: 'All mandatory minimum requirements satisfied',
        category: 'policy',
        severity: 'high',
        check: async (tender, bid) => {
          if (!bid) return { passed: true };
          
          // Check if all minimum requirements are documented
          const allRequirementsMet = tender.minimumRequirements.length > 0 &&
            tender.documentRequirements.length > 0 &&
            bid.documents.length >= tender.documentRequirements.length;
          
          return {
            passed: allRequirementsMet,
            details: !allRequirementsMet ? 'Not all minimum requirements satisfied' : undefined,
          };
        },
      },
      
      // Pricing validation
      {
        id: 'pricing_reasonability',
        name: 'Pricing Reasonability',
        description: 'Bid price must be reasonable and within budget',
        category: 'best_practice',
        severity: 'medium',
        check: async (tender, bid) => {
          if (!bid) return { passed: true };
          
          // Check if bid amount is within reasonable range of estimate
          const withinBudget = bid.bidAmount <= tender.budgetAvailable;
          const notTooLow = bid.bidAmount >= tender.estimatedValue * 0.5; // Not less than 50% of estimate
          const notTooHigh = bid.bidAmount <= tender.estimatedValue * 1.5; // Not more than 150% of estimate
          
          return {
            passed: withinBudget && notTooLow && notTooHigh,
            details: !withinBudget ? 'Exceeds budget' : !notTooLow ? 'Suspiciously low' : !notTooHigh ? 'Suspiciously high' : undefined,
          };
        },
      },
    ];

    // Add new rule sets to the existing ones
    this.rules = [
      ...this.rules, // Keep existing rules
      ...UNGCPrinciples,
      ...SALegalRules,
    ];

    logger.info(`Loaded ${this.constitutionRules.length} Constitution-as-Code rules`);
  }

  /**
   * Run full compliance check on tender
   */
  async checkTenderCompliance(tender: Tender): Promise<ComplianceCheck> {
    logger.info(`Running compliance check on tender ${tender.id}`);

    const checks: ComplianceRule[] = [];
    const violations: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    for (const rule of this.constitutionRules) {
      try {
        const result = await rule.check(tender);
        
        checks.push({
          id: rule.id,
          name: rule.name,
          description: rule.description,
          category: rule.category,
          severity: rule.severity,
          passed: result.passed,
          details: result.details,
        });

        if (!result.passed) {
          const message = `${rule.name}: ${result.details || 'Failed'}`;
          
          if (rule.severity === 'critical' || rule.severity === 'high') {
            violations.push(message);
          } else {
            warnings.push(message);
          }
        }
      } catch (error) {
        logger.error(`Failed to run compliance rule ${rule.id}`, error);
      }
    }

    const passedCount = checks.filter(c => c.passed).length;
    const score = (passedCount / checks.length) * 100;
    const status = violations.length > 0 ? 'failed' : warnings.length > 0 ? 'warning' : 'passed';

    if (violations.length > 0) {
      recommendations.push('Address all critical violations before proceeding');
    }

    const complianceCheck: ComplianceCheck = {
      id: `compliance_${tender.id}_${Date.now()}`,
      tenderId: tender.id,
      status,
      score,
      checks,
      checkedAt: new Date(),
      checkedBy: 'system',
      violations,
      warnings,
      recommendations,
    };

    logger.info(`Compliance check completed for tender ${tender.id}`, {
      score,
      status,
      violations: violations.length,
      warnings: warnings.length,
    });

    return complianceCheck;
  }

  /**
   * Run compliance check on bid
   */
  async checkBidCompliance(tender: Tender, bid: Bid): Promise<ComplianceCheck> {
    logger.info(`Running compliance check on bid ${bid.id} for tender ${tender.id}`);

    const checks: ComplianceRule[] = [];
    const violations: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    for (const rule of this.constitutionRules) {
      try {
        const result = await rule.check(tender, bid);
        
        checks.push({
          id: rule.id,
          name: rule.name,
          description: rule.description,
          category: rule.category,
          severity: rule.severity,
          passed: result.passed,
          details: result.details,
        });

        if (!result.passed) {
          const message = `${rule.name}: ${result.details || 'Failed'}`;
          
          if (rule.severity === 'critical' || rule.severity === 'high') {
            violations.push(message);
          } else {
            warnings.push(message);
          }
        }
      } catch (error) {
        logger.error(`Failed to run compliance rule ${rule.id}`, error);
      }
    }

    const passedCount = checks.filter(c => c.passed).length;
    const score = (passedCount / checks.length) * 100;
    const status = violations.length > 0 ? 'failed' : warnings.length > 0 ? 'warning' : 'passed';

    if (violations.length > 0) {
      recommendations.push('Bid does not meet compliance requirements');
    }

    const complianceCheck: ComplianceCheck = {
      id: `compliance_bid_${bid.id}_${Date.now()}`,
      tenderId: tender.id,
      bidId: bid.id,
      status,
      score,
      checks,
      checkedAt: new Date(),
      checkedBy: 'system',
      violations,
      warnings,
      recommendations,
    };

    logger.info(`Compliance check completed for bid ${bid.id}`, {
      score,
      status,
      violations: violations.length,
    });

    return complianceCheck;
  }

  /**
   * Get all compliance rules
   */
  getComplianceRules(): ConstitutionRule[] {
    return this.constitutionRules;
  }
}

export default new ComplianceService();
