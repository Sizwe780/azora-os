/**
 * Agent Bridge - The Synapse (Client-Agent Communication)
 * 
 * Constitutional Compliance:
 * - TYPE-SAFE: Strict types for all agent communications
 * - TRANSPARENT: All communications logged for audit
 * - VALIDATED: Every signal passes through constitutional validation
 * 
 * This is the communication layer between the UI and AI agents,
 * implementing the "nervous system" of the OS.
 */

import { validateConstitution, type ConstitutionalViolation } from '@/lib/constitutional-guard'

/**
 * Agent Signal Types - All possible agent requests
 */
export type AgentSignal =
  | 'REVIEW_CODE'
  | 'GENERATE_SPEC'
  | 'SECURITY_AUDIT'
  | 'GENERATE_COMPONENT'
  | 'EXPLAIN_CODE'
  | 'FIX_BUG'
  | 'OPTIMIZE_PERFORMANCE'
  | 'ADD_TESTS'
  | 'REFACTOR'
  | 'GENERATE_DOCS'

/**
 * Agent names in the system
 */
export type AgentName = 'Elara' | 'Themba' | 'Jabari' | 'Nia' | 'Imani' | 'Sankofa'

/**
 * Signal Payload - Context sent to agents
 */
export interface AgentSignalPayload {
  /** Current file content being worked on */
  fileContent: string
  /** File path for context */
  filePath?: string
  /** Git diff if available */
  diff?: string
  /** Additional context (user's request, project info, etc.) */
  context?: string
  /** Project name */
  projectName?: string
  /** Current room context */
  room?: string
  /** Related files for broader context */
  relatedFiles?: Array<{ path: string; content: string }>
}

/**
 * Agent Request - Complete request sent to an agent
 */
export interface AgentRequest {
  /** Unique request ID for tracking */
  id: string
  /** Agent being called */
  agent: AgentName
  /** Signal type */
  signal: AgentSignal
  /** Request payload */
  payload: AgentSignalPayload
  /** Timestamp */
  timestamp: number
  /** User ID (if available) */
  userId?: string
}

/**
 * Agent Response - Response from an agent
 */
export interface AgentResponse {
  /** Request ID this responds to */
  requestId: string
  /** Agent that responded */
  agent: AgentName
  /** Response status */
  status: 'success' | 'error' | 'pending'
  /** Response data */
  data?: {
    /** Generated code, suggestions, or analysis */
    result: string
    /** Confidence score (0-1) */
    confidence?: number
    /** Additional metadata */
    metadata?: Record<string, any>
  }
  /** Error if status is 'error' */
  error?: string
  /** Constitutional validation result */
  constitutionalCheck: {
    passed: boolean
    violations: ConstitutionalViolation[]
    healthScore: number
  }
  /** Timestamp */
  timestamp: number
}

/**
 * Agent Bridge Class - Manages all agent communications
 */
export class AgentBridge {
  private static instance: AgentBridge
  private requestLog: AgentRequest[] = []
  private responseLog: AgentResponse[] = []
  private listeners: Map<string, (response: AgentResponse) => void> = new Map()

  private constructor() {
    // Singleton pattern
  }

  static getInstance(): AgentBridge {
    if (!AgentBridge.instance) {
      AgentBridge.instance = new AgentBridge()
    }
    return AgentBridge.instance
  }

  /**
   * Send a signal to an agent
   * Constitutional Compliance: Validates before sending
   */
  async sendSignal(
    agent: AgentName,
    signal: AgentSignal,
    payload: AgentSignalPayload
  ): Promise<AgentResponse> {
    // Generate unique request ID
    const requestId = this.generateRequestId()

    // Create request object
    const request: AgentRequest = {
      id: requestId,
      agent,
      signal,
      payload,
      timestamp: Date.now(),
    }

    // Constitutional validation BEFORE sending
    const validationResult = validateConstitution(request)

    if (!validationResult.passed) {
      // Validation failed - log and reject
      console.error('[AgentBridge] Constitutional validation failed:', validationResult.violations)

      const errorResponse: AgentResponse = {
        requestId,
        agent,
        status: 'error',
        error: `Constitutional violation: ${validationResult.violations.map(v => v.message).join(', ')}`,
        constitutionalCheck: validationResult,
        timestamp: Date.now(),
      }

      this.responseLog.push(errorResponse)
      return errorResponse
    }

    // Log request (Transparency principle)
    this.logRequest(request)

    try {
      // Send request to agent API
      // In production, this would be a WebSocket or Server Action
      const response = await this.callAgentAPI(request)

      // Log response
      this.logResponse(response)

      // Notify listeners
      this.notifyListeners(response)

      return response
    } catch (error) {
      const errorResponse: AgentResponse = {
        requestId,
        agent,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        constitutionalCheck: validationResult,
        timestamp: Date.now(),
      }

      this.logResponse(errorResponse)
      return errorResponse
    }
  }

  /**
   * Call the agent API (stub for now, implement with real AI routing)
   */
  private async callAgentAPI(request: AgentRequest): Promise<AgentResponse> {
    // TODO: Integrate with packages/shared-api/ai-router.ts
    // For now, simulate a response

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Simulated response
    const response: AgentResponse = {
      requestId: request.id,
      agent: request.agent,
      status: 'success',
      data: {
        result: this.generateSimulatedResponse(request),
        confidence: 0.85,
        metadata: {
          tokensUsed: 150,
          processingTime: 1000,
        },
      },
      constitutionalCheck: {
        passed: true,
        violations: [],
        healthScore: 95,
      },
      timestamp: Date.now(),
    }

    return response
  }

  /**
   * Generate simulated response (remove when real AI is connected)
   */
  private generateSimulatedResponse(request: AgentRequest): string {
    const responses: Record<AgentSignal, string> = {
      REVIEW_CODE: `I've reviewed your code. Here are my suggestions:\n\n1. Consider adding error handling\n2. The logic looks correct\n3. Add TypeScript types for better safety`,
      GENERATE_SPEC: `Here's a specification for this component:\n\n## Component Spec\n- Purpose: User authentication\n- Props: email, password\n- State: loading, error\n- Events: onSubmit, onError`,
      SECURITY_AUDIT: `Security analysis complete:\n\n✅ No SQL injection vulnerabilities\n✅ Input validation present\n⚠️  Consider adding rate limiting\n⚠️  Add CSRF protection`,
      GENERATE_COMPONENT: `Here's a suggested component:\n\n\`\`\`typescript\nfunction MyComponent() {\n  return <div>Component</div>\n}\n\`\`\``,
      EXPLAIN_CODE: `This code does the following:\n1. Initializes state\n2. Handles user input\n3. Updates the UI`,
      FIX_BUG: `I've identified the issue. Replace line 15 with:\n\n\`\`\`typescript\nconst value = data?.value ?? defaultValue\n\`\`\``,
      OPTIMIZE_PERFORMANCE: `Performance optimizations:\n1. Memoize expensive calculations\n2. Use React.memo for components\n3. Implement virtual scrolling`,
      ADD_TESTS: `Here are suggested tests:\n\n\`\`\`typescript\ndescribe('Component', () => {\n  it('should render', () => {\n    // test code\n  })\n})\n\`\`\``,
      REFACTOR: `Refactored version:\n\n\`\`\`typescript\n// Cleaner, more maintainable code\nconst refactoredFunction = () => {\n  // implementation\n}\n\`\`\``,
      GENERATE_DOCS: `/**\n * Component Documentation\n * \n * @description This component handles user authentication\n * @param email - User's email address\n * @param password - User's password\n */`,
    }

    return responses[request.signal] || 'I can help with that!'
  }

  /**
   * Subscribe to agent responses
   */
  subscribe(requestId: string, callback: (response: AgentResponse) => void): () => void {
    this.listeners.set(requestId, callback)

    // Return unsubscribe function
    return () => {
      this.listeners.delete(requestId)
    }
  }

  /**
   * Get request/response logs (for transparency)
   */
  getLogs(): { requests: AgentRequest[]; responses: AgentResponse[] } {
    return {
      requests: [...this.requestLog],
      responses: [...this.responseLog],
    }
  }

  /**
   * Clear logs (for testing or privacy)
   */
  clearLogs(): void {
    this.requestLog = []
    this.responseLog = []
  }

  // Private helper methods

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private logRequest(request: AgentRequest): void {
    this.requestLog.push(request)
    console.log('[AgentBridge] Request:', {
      id: request.id,
      agent: request.agent,
      signal: request.signal,
      timestamp: new Date(request.timestamp).toISOString(),
    })
  }

  private logResponse(response: AgentResponse): void {
    this.responseLog.push(response)
    console.log('[AgentBridge] Response:', {
      requestId: response.requestId,
      agent: response.agent,
      status: response.status,
      constitutional: response.constitutionalCheck.passed ? '✅' : '❌',
      timestamp: new Date(response.timestamp).toISOString(),
    })
  }

  private notifyListeners(response: AgentResponse): void {
    const listener = this.listeners.get(response.requestId)
    if (listener) {
      listener(response)
    }
  }
}

/**
 * Export singleton instance
 */
export const agentBridge = AgentBridge.getInstance()
