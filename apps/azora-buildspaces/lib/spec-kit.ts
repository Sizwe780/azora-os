import * as yaml from 'js-yaml'
import { z } from 'zod'

/**
 * Local spec-kit shim for BuildSpaces
 * Provides SpecValidator and SpecType without requiring the @azora/spec-kit package
 */

export type SpecType = "component" | "api" | "database" | "workflow" | "feature"

export interface ValidationResult {
  valid: boolean
  errors?: any[]
  spec?: any
}

const baseSchema = z.object({
  id: z.string(),
  type: z.enum(["component", "api", "database", "workflow", "feature"]),
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
  requirements: z.array(z.string()).optional(),
}).passthrough()

const TEMPLATES: Record<string, string> = {
  component: `id: comp-001
type: component
name: MyComponent
version: "1.0.0"
description: A reusable UI component
requirements:
  - Must be responsive
  - Must support dark mode
  - Must be accessible (WCAG 2.1)
props:
  title: string
  isActive: boolean`,

  api: `id: api-001
type: api
name: MyAPI
version: "1.0.0"
description: REST API endpoint
requirements:
  - Must respond in < 100ms
  - Must be authenticated
endpoints:
  - method: GET
    path: /items`,

  database: `id: db-001
type: database
name: MySchema
version: "1.0.0"
description: Database schema definition
requirements:
  - Must support soft deletes
  - Must have audit trail
tables:
  - name: users
    columns:
      - name: id
        type: uuid
        primary: true
      - name: email
        type: varchar
        unique: true`,

  workflow: `id: flow-001
type: workflow
name: MyWorkflow
version: "1.0.0"
description: Business process flow
requirements:
  - Must be atomic
  - Must log all steps
steps:
  - validate_input
  - process_data
  - save_result`,

  feature: `id: feat-001
type: feature
name: MyFeature
version: "1.0.0"
description: Feature specification
requirements:
  - Must pass all acceptance criteria
  - Must have unit tests
acceptance_criteria:
  - Users can create an account
  - Users receive confirmation email
  - Users can log in after verification`,
}

export class SpecValidator {
  static validate(content: string, type?: SpecType | string): ValidationResult {
    try {
      if (!content || content.trim().length === 0) {
        return { valid: false, errors: [{ message: "Spec content is empty" }] }
      }

      let parsed: any;
      try {
        parsed = yaml.load(content);
      } catch (e: any) {
        return { valid: false, errors: [{ message: `YAML Parse Error: ${e.message}` }] }
      }

      if (typeof parsed !== 'object' || parsed === null) {
        return { valid: false, errors: [{ message: "Spec must be a YAML object" }] }
      }

      const result = baseSchema.safeParse(parsed);

      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          message: `${err.path.join('.')}: ${err.message}`
        }));
        return { valid: false, errors, spec: parsed }
      }

      if (type && result.data.type !== type) {
        return { valid: false, errors: [{ message: `Expected type '${type}', but got '${result.data.type}'` }], spec: parsed }
      }

      return { valid: true, spec: parsed }
    } catch (error: any) {
      return { valid: false, errors: [{ message: error.message || "Unknown error" }] }
    }
  }

  static generateTemplate(type: SpecType | string): string {
    return TEMPLATES[type] || TEMPLATES.component
  }
}
