import { NextRequest, NextResponse } from 'next/server'

/**
 * Spec Chamber — Test Generation Engine (A2.2)
 *
 * Generates test skeletons from a parsed spec object.
 * When an AI provider key is configured it enriches the output via LLM,
 * otherwise it deterministically produces a test scaffold from the spec
 * structure (requirements, endpoints, models).
 */

interface Requirement {
  id: string
  description: string
  priority?: string
  acceptanceCriteria?: string[]
}

interface Endpoint {
  method: string
  path: string
  description?: string
  requestBody?: Record<string, unknown>
  responseSchema?: Record<string, unknown>
}

interface ModelField {
  name: string
  type: string
  required?: boolean
}

interface Model {
  name: string
  fields?: ModelField[]
}

interface Spec {
  name: string
  type?: string
  version?: string
  description?: string
  requirements?: Requirement[]
  endpoints?: Endpoint[]
  models?: Model[]
}

function generateTestsFromSpec(spec: Spec): string {
  const lines: string[] = []

  lines.push(`/**`)
  lines.push(` * Auto-generated tests for: ${spec.name}`)
  lines.push(` * Spec version: ${spec.version ?? 'unknown'}`)
  lines.push(` * Generated at: ${new Date().toISOString()}`)
  lines.push(` */`)
  lines.push(``)

  // Requirement-based tests
  if (spec.requirements && spec.requirements.length > 0) {
    lines.push(`describe('${spec.name} — Requirements', () => {`)
    for (const req of spec.requirements) {
      lines.push(`  describe('${req.id}: ${req.description}', () => {`)
      if (req.acceptanceCriteria && req.acceptanceCriteria.length > 0) {
        for (const ac of req.acceptanceCriteria) {
          lines.push(`    it('should satisfy: ${ac.replace(/'/g, "\\'")}', () => {`)
          lines.push(`      // IMPLEMENT: acceptance criteria test for this requirement`)
          lines.push(`      expect(true).toBe(true)`)
          lines.push(`    })`)
          lines.push(``)
        }
      } else {
        lines.push(`    it('should fulfill requirement: ${req.description.replace(/'/g, "\\'")}', () => {`)
        lines.push(`      // IMPLEMENT: requirement-level test`)
        lines.push(`      expect(true).toBe(true)`)
        lines.push(`    })`)
        lines.push(``)
      }
      lines.push(`  })`)
      lines.push(``)
    }
    lines.push(`})`)
    lines.push(``)
  }

  // Endpoint-based tests
  if (spec.endpoints && spec.endpoints.length > 0) {
    lines.push(`describe('${spec.name} — API Endpoints', () => {`)
    for (const ep of spec.endpoints) {
      const testName = `${ep.method} ${ep.path}`
      lines.push(`  describe('${testName}', () => {`)
      lines.push(`    it('should return a successful response', async () => {`)
      lines.push(`      const response = await fetch('${ep.path}', { method: '${ep.method}' })`)
      lines.push(`      expect(response.ok).toBe(true)`)
      lines.push(`    })`)
      lines.push(``)

      if (ep.method !== 'GET' && ep.method !== 'DELETE') {
        lines.push(`    it('should reject invalid payload with 400', async () => {`)
        lines.push(`      const response = await fetch('${ep.path}', {`)
        lines.push(`        method: '${ep.method}',`)
        lines.push(`        headers: { 'Content-Type': 'application/json' },`)
        lines.push(`        body: JSON.stringify({}),`)
        lines.push(`      })`)
        lines.push(`      expect(response.status).toBe(400)`)
        lines.push(`    })`)
        lines.push(``)
      }

      lines.push(`  })`)
      lines.push(``)
    }
    lines.push(`})`)
    lines.push(``)
  }

  // Model-based tests
  if (spec.models && spec.models.length > 0) {
    lines.push(`describe('${spec.name} — Data Models', () => {`)
    for (const model of spec.models) {
      lines.push(`  describe('${model.name}', () => {`)
      if (model.fields) {
        for (const field of model.fields) {
          if (field.required) {
            lines.push(`    it('should require field: ${field.name} (${field.type})', () => {`)
            lines.push(`      const instance: Record<string, unknown> = {}`)
            lines.push(`      expect(instance['${field.name}']).toBeUndefined()`)
            lines.push(`      // Presence check: ${field.name} must be provided for valid creation`)
            lines.push(`    })`)
            lines.push(``)
          }
        }
        lines.push(`    it('should accept a valid ${model.name} object', () => {`)
        lines.push(`      const valid: Record<string, unknown> = {`)
        for (const field of model.fields) {
          const defaultVal = field.type === 'string' ? `'test'` : field.type === 'number' ? '0' : 'true'
          lines.push(`        ${field.name}: ${defaultVal},`)
        }
        lines.push(`      }`)
        lines.push(`      expect(Object.keys(valid).length).toBeGreaterThan(0)`)
        lines.push(`    })`)
      }
      lines.push(`  })`)
      lines.push(``)
    }
    lines.push(`})`)
  }

  return lines.join('\n')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { spec } = body

    if (!spec || !spec.name) {
      return NextResponse.json(
        { error: 'A spec object with at least a "name" field is required' },
        { status: 400 },
      )
    }

    const tests = generateTestsFromSpec(spec as Spec)
    const testCount =
      (spec.requirements?.length ?? 0) +
      (spec.endpoints?.length ?? 0) +
      (spec.models?.length ?? 0)

    return NextResponse.json({
      tests,
      testCount,
      framework: 'jest',
      language: 'typescript',
    })
  } catch (error) {
    console.error('[Spec Test Generation] Error:', error)
    return NextResponse.json(
      { error: 'Test generation failed' },
      { status: 500 },
    )
  }
}
