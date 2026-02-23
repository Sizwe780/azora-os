/**
 * Nia Agent - Specification Validator
 * 
 * Validates specifications against requirements:
 * - YAML/JSON syntax validation
 * - Schema completeness checking
 * - Acceptance criteria validation
 * - Requirement consistency
 * 
 * Constitutional: Truth in specs - no placeholder requirements
 */

import { z } from 'zod';

export interface SpecValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface SpecValidationResult {
  valid: boolean;
  specId?: string;
  errors: SpecValidationError[];
  warnings: SpecValidationError[];
  completeness: number; // 0-100
  acceptanceCriteria: string[];
  requirements: Record<string, unknown>;
  timestamp: Date;
}

export interface Specification {
  id?: string;
  title: string;
  description: string;
  requirements: Record<string, unknown>;
  acceptanceCriteria: string[];
  scope?: string;
  constraints?: string[];
  dependencies?: string[];
}

/**
 * Nia Agent - Validates specifications
 */
export class NiaAgent {
  private specSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    requirements: z.record(z.any()).refine((r) => !!r && Object.keys(r).length >= 1, {
      message: 'At least one requirement must be defined',
    }),
    acceptanceCriteria: z.array(z.string()).min(1, 'At least one acceptance criterion required'),
    scope: z.string().optional(),
    constraints: z.array(z.string()).optional(),
    dependencies: z.array(z.string()).optional(),
  });

  /**
   * Parse and validate specification
   */
  async validateSpec(specContent: string | unknown): Promise<SpecValidationResult> {
    const startTime = Date.now();
    const errors: SpecValidationError[] = [];
    const warnings: SpecValidationError[] = [];
    let spec: unknown = null;

    // Step 1: Parse YAML/JSON
    try {
      if (typeof specContent === 'string') {
        // Try JSON first
        try {
          spec = JSON.parse(specContent);
        } catch {
            // Try YAML
            const yaml = (await import('js-yaml')) as unknown as {
              load: (s: string) => unknown
            }
            spec = yaml.load(specContent as string);
        }
      } else {
        spec = specContent;
      }
    } catch (error) {
      errors.push({
        field: 'format',
        message: `Failed to parse specification: ${error instanceof Error ? error.message : String(error)}`,
        severity: 'error',
      });
      return {
        valid: false,
        errors,
        warnings,
        completeness: 0,
        acceptanceCriteria: [],
        requirements: {},
        timestamp: new Date(),
      };
    }

    // Step 2: Validate schema
    const schemaResult = this.specSchema.safeParse(spec as unknown);
    if (!schemaResult.success) {
      schemaResult.error.errors.forEach((e) => {
        errors.push({
          field: e.path.join('.'),
          message: e.message,
          severity: 'error',
        });
      });
    }

    // Step 3: Validate requirement content (no placeholders)
    const specObj = spec as Partial<Specification> | undefined

    if (specObj?.requirements) {
      const placeholderKeywords = ['TODO', 'FIXME', 'PLACEHOLDER', 'TBD'];
      for (const [key, value] of Object.entries(specObj.requirements)) {
        const content = JSON.stringify(value).toUpperCase();
        for (const keyword of placeholderKeywords) {
          if (content.includes(keyword)) {
            errors.push({
              field: `requirements.${key}`,
              message: `Requirement contains placeholder content: ${keyword}`,
              severity: 'error',
            });
          }
        }
      }
    }

    // Step 4: Check acceptance criteria specificity
    const acceptanceCriteria = specObj?.acceptanceCriteria || [];
    acceptanceCriteria.forEach((criterion: string, index: number) => {
      if (criterion.length < 10) {
        warnings.push({
          field: `acceptanceCriteria[${index}]`,
          message: 'Acceptance criterion is too vague (less than 10 characters)',
          severity: 'warning',
        });
      }
      if (criterion.toLowerCase().includes('maybe') || criterion.toLowerCase().includes('probably')) {
        warnings.push({
          field: `acceptanceCriteria[${index}]`,
          message: 'Acceptance criterion uses non-deterministic language',
          severity: 'warning',
        });
      }
    });

    // Step 5: Calculate completeness
    const completenessFactors = {
      hasTitle: specObj?.title ? 1 : 0,
      hasDescription: specObj?.description ? 1 : 0,
      hasRequirements: specObj?.requirements ? 1 : 0,
      hasAcceptanceCriteria: specObj?.acceptanceCriteria ? 1 : 0,
      hasScope: specObj?.scope ? 1 : 0,
    };
    const completeness = Math.round(
      (Object.values(completenessFactors).reduce((a, b) => a + b, 0) /
        Object.keys(completenessFactors).length) *
        100
    );

    const valid = errors.length === 0;

    console.log(`[Nia] Validation complete:`, {
      valid,
      completeness,
      errors: errors.length,
      warnings: warnings.length,
      duration: Date.now() - startTime,
    });

    return {
      valid,
      specId: specObj?.id || `spec-${Date.now()}`,
      errors,
      warnings,
      completeness,
      acceptanceCriteria: specObj?.acceptanceCriteria || [],
      requirements: specObj?.requirements || {},
      timestamp: new Date(),
    };
  }

  /**
   * Generate test cases from specification
   */
  async generateTests(spec: Specification): Promise<string[]> {
    const tests: string[] = [];

    for (const criterion of spec.acceptanceCriteria) {
      // Convert acceptance criteria to test description
      const testName = criterion
        .replace(/should\s+/i, 'test_')
        .replace(/\s+/g, '_')
        .toLowerCase();

      tests.push(`test_${testName}`);
    }

    return tests;
  }

  /**
   * Compare two specifications for changes
   */
  async compareSpecs(
    oldSpec: Specification,
    newSpec: Specification
  ): Promise<{ added: string[]; removed: string[]; modified: string[] }> {
    const oldReqs = Object.keys(oldSpec.requirements || {});
    const newReqs = Object.keys(newSpec.requirements || {});

    return {
      added: newReqs.filter((r) => !oldReqs.includes(r)),
      removed: oldReqs.filter((r) => !newReqs.includes(r)),
      modified: oldReqs.filter(
        (r) =>
          newReqs.includes(r) &&
          JSON.stringify(oldSpec.requirements[r]) !==
            JSON.stringify(newSpec.requirements[r])
      ),
    };
  }

  /**
   * Generate specification template
   */
  generateTemplate(): Specification {
    return {
      title: 'Example Specification',
      description: 'A detailed description of what needs to be implemented',
      requirements: {
        REQ_001: {
          description: 'Required feature or functionality',
          priority: 'HIGH',
          complexity: 'MEDIUM',
        },
      },
      acceptanceCriteria: [
        'Given [context], when [action], then [outcome]',
        'The system should [specific behavior]',
        'Users must be able to [user action]',
      ],
      scope: 'Define what is included and excluded',
      constraints: ['Technical constraints or limitations'],
      dependencies: ['Any external dependencies'],
    };
  }
}

// Singleton instance
export const nia = new NiaAgent();
