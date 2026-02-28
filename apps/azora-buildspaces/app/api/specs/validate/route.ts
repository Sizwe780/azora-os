import { NextRequest, NextResponse } from 'next/server'
import Ajv, { type ErrorObject } from 'ajv'

/**
 * Spec Chamber — Real-time AJV Validation Endpoint (A2.1)
 *
 * Validates specifications against schema in real-time as the user types.
 * Returns detailed validation results with field-level errors.
 */

// Global instance: compiled once, shared across requests for performance
const ajv = new Ajv({ allErrors: true, verbose: true })

// Core spec schema
const specSchema = {
  type: 'object',
  required: ['id', 'type', 'name', 'version'],
  properties: {
    id: { type: 'string', minLength: 1 },
    type: { type: 'string', enum: ['component', 'api', 'workflow', 'service', 'model'] },
    name: { type: 'string', minLength: 1, maxLength: 200 },
    version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
    description: { type: 'string', maxLength: 2000 },
    requirements: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'description'],
        properties: {
          id: { type: 'string' },
          description: { type: 'string' },
          priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          acceptanceCriteria: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    },
    endpoints: {
      type: 'array',
      items: {
        type: 'object',
        required: ['method', 'path'],
        properties: {
          method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
          path: { type: 'string' },
          description: { type: 'string' },
          requestBody: { type: 'object' },
          responseSchema: { type: 'object' },
        },
      },
    },
    models: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          fields: {
            type: 'array',
            items: {
              type: 'object',
              required: ['name', 'type'],
              properties: {
                name: { type: 'string' },
                type: { type: 'string' },
                required: { type: 'boolean' },
              },
            },
          },
        },
      },
    },
    constitutionalCompliance: {
      type: 'object',
      properties: {
        ubuntuAlignment: { type: 'boolean' },
        dataPrivacy: { type: 'boolean' },
        accessibility: { type: 'boolean' },
      },
    },
  },
  additionalProperties: true,
}

const validateSpec = ajv.compile(specSchema)

interface ValidationDiagnostic {
  path: string
  message: string
  severity: 'error' | 'warning' | 'info'
  keyword: string
}

function formatErrors(errors: ErrorObject[] | null | undefined): ValidationDiagnostic[] {
  if (!errors) return []

  return errors.map((err) => ({
    path: err.instancePath || '/',
    message: err.message || 'Validation error',
    severity: 'error' as const,
    keyword: err.keyword,
  }))
}

function computeCompletenessScore(spec: Record<string, unknown>): {
  score: number
  missing: string[]
} {
  const checks = [
    { field: 'id', weight: 10 },
    { field: 'type', weight: 10 },
    { field: 'name', weight: 10 },
    { field: 'version', weight: 10 },
    { field: 'description', weight: 10 },
    { field: 'requirements', weight: 20 },
    { field: 'endpoints', weight: 15 },
    { field: 'models', weight: 10 },
    { field: 'constitutionalCompliance', weight: 5 },
  ]

  let totalWeight = 0
  let earnedWeight = 0
  const missing: string[] = []

  for (const check of checks) {
    totalWeight += check.weight
    const value = spec[check.field]
    const isEmptyString = typeof value === 'string' && value === ''
    if (value !== undefined && value !== null && !isEmptyString) {
      if (Array.isArray(value) && value.length === 0) {
        missing.push(check.field)
      } else {
        earnedWeight += check.weight
      }
    } else {
      missing.push(check.field)
    }
  }

  return {
    score: totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0,
    missing,
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { spec, format = 'json' } = body

    if (!spec) {
      return NextResponse.json(
        { error: 'Spec content is required' },
        { status: 400 }
      )
    }

    // Parse spec content
    let parsedSpec: Record<string, unknown>
    try {
      if (format === 'yaml') {
        // YAML input: currently expects pre-parsed object or JSON string.
        // For raw YAML string support, integrate a YAML parser (e.g. js-yaml).
        parsedSpec = typeof spec === 'string' ? JSON.parse(spec) : spec
      } else {
        parsedSpec = typeof spec === 'string' ? JSON.parse(spec) : spec
      }
    } catch (parseError) {
      return NextResponse.json({
        valid: false,
        diagnostics: [
          {
            path: '/',
            message: `Failed to parse spec: ${parseError instanceof Error ? parseError.message : 'Invalid format'}`,
            severity: 'error',
            keyword: 'parse',
          },
        ],
        completeness: { score: 0, missing: [] },
      })
    }

    // Validate against schema
    const valid = validateSpec(parsedSpec)
    const diagnostics = formatErrors(validateSpec.errors)

    // Compute completeness score
    const completeness = computeCompletenessScore(parsedSpec)

    // Add warnings for missing optional fields
    const warnings: ValidationDiagnostic[] = completeness.missing
      .filter((f) => !['id', 'type', 'name', 'version'].includes(f))
      .map((field) => ({
        path: `/${field}`,
        message: `Optional field "${field}" is missing. Adding it will improve spec completeness.`,
        severity: 'warning' as const,
        keyword: 'completeness',
      }))

    return NextResponse.json({
      valid,
      diagnostics: [...diagnostics, ...warnings],
      completeness,
      schema: 'azora-spec-v1',
    })
  } catch (error) {
    console.error('[Spec Validation] Error:', error)
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500 }
    )
  }
}
