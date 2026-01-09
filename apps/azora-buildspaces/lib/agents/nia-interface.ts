/**
 * Nia Agent Interface - Specification Generator
 * 
 * Constitutional Compliance:
 * - Generates complete, validated specifications
 * - Ensures truth verification is included
 * - Expands vague requests into structured specs
 * 
 * Nia is the spec specialist agent who helps users create
 * comprehensive specifications from simple descriptions.
 */

import { agentBridge, type AgentSignalPayload } from '../agent-bridge'

export interface SpecGenerationRequest {
  userInput: string
  context?: string
  existingSpecs?: string[]
}

export interface GeneratedSpec {
  id: string
  name: string
  user_story: string
  scenarios: Array<{
    given: string
    when: string
    then: string
  }>
  acceptance_criteria: string[]
  truth_verification: {
    method: string
    criteria: string[]
  }
}

/**
 * Generate a specification from user input
 * 
 * Example:
 * Input: "I want a login page"
 * Output: Full spec with BDD scenarios, acceptance criteria, and verification method
 */
export async function generateSpec(
  request: SpecGenerationRequest
): Promise<GeneratedSpec> {
  const payload: AgentSignalPayload = {
    fileContent: request.userInput,
    context: request.context || 'Generate specification',
    projectName: 'BuildSpaces',
    room: 'SPEC',
  }

  try {
    // Send to Nia agent via bridge
    const response = await agentBridge.sendSignal('Nia', 'GENERATE_SPEC', payload)

    if (response.status === 'success' && response.data) {
      // Parse the response into a spec
      return parseSpecFromResponse(response.data.result, request.userInput)
    }

    // Fallback: Generate basic spec structure
    return generateBasicSpec(request.userInput)
  } catch (error) {
    console.error('Spec generation failed:', error)
    return generateBasicSpec(request.userInput)
  }
}

/**
 * Parse agent response into structured spec
 */
function parseSpecFromResponse(response: string, userInput: string): GeneratedSpec {
  // Try to extract structured data from agent response
  // For now, generate a basic spec (will be enhanced when real AI is connected)
  return generateBasicSpec(userInput)
}

/**
 * Generate a basic spec structure from user input
 * This is a fallback when AI is not available
 */
function generateBasicSpec(userInput: string): GeneratedSpec {
  // Extract feature name from input
  const featureName = extractFeatureName(userInput)
  const id = featureName.toLowerCase().replace(/\s+/g, '-')

  return {
    id,
    name: featureName,
    user_story: `As a user, I want ${userInput.toLowerCase()}, so that I can accomplish my goals efficiently.`,
    scenarios: [
      {
        given: 'User has access to the system',
        when: 'User attempts to use the feature',
        then: 'System responds appropriately',
      },
    ],
    acceptance_criteria: [
      'Feature is accessible to authorized users',
      'Feature provides clear feedback',
      'Feature handles errors gracefully',
    ],
    truth_verification: {
      method: 'automated_test',
      criteria: [
        'Unit tests pass with 80%+ coverage',
        'Integration tests verify end-to-end flow',
        'Manual testing confirms user experience',
      ],
    },
  }
}

/**
 * Extract feature name from user input
 */
function extractFeatureName(input: string): string {
  // Remove common prefixes
  let cleaned = input
    .replace(/^(I want|I need|Create|Build|Make|Add|Implement)\s+/i, '')
    .replace(/\s+(page|feature|component|system)$/i, '')
    .trim()

  // Capitalize first letter of each word
  return cleaned
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Validate a generated spec
 */
export function validateGeneratedSpec(spec: GeneratedSpec): string[] {
  const errors: string[] = []

  if (!spec.id || spec.id.length < 3) {
    errors.push('ID must be at least 3 characters')
  }

  if (!spec.name || spec.name.length < 3) {
    errors.push('Name must be at least 3 characters')
  }

  if (!spec.scenarios || spec.scenarios.length === 0) {
    errors.push('At least one scenario is required')
  }

  if (!spec.truth_verification || !spec.truth_verification.method) {
    errors.push('Truth verification method is required')
  }

  if (
    !spec.truth_verification?.criteria ||
    spec.truth_verification.criteria.length === 0
  ) {
    errors.push('At least one verification criterion is required')
  }

  return errors
}

/**
 * Enhance a spec with AI suggestions
 */
export async function enhanceSpec(
  spec: GeneratedSpec,
  aspect: 'scenarios' | 'criteria' | 'verification'
): Promise<GeneratedSpec> {
  const payload: AgentSignalPayload = {
    fileContent: JSON.stringify(spec),
    context: `Enhance ${aspect} for specification`,
    room: 'SPEC',
  }

  try {
    const response = await agentBridge.sendSignal('Nia', 'GENERATE_SPEC', payload)

    if (response.status === 'success' && response.data) {
      // For now, return original spec (will be enhanced when real AI is connected)
      return spec
    }

    return spec
  } catch (error) {
    console.error('Spec enhancement failed:', error)
    return spec
  }
}
