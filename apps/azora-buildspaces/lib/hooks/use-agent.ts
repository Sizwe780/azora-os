"use client"

/**
 * useAgent Hook - Developer-Friendly Agent Interaction
 * 
 * Constitutional Compliance:
 * - FULL CONSTITUTIONAL FLOW: Validates through guard before sending
 * - CONTEXT-AWARE: Automatically includes workspace context
 * - TRANSPARENT: All interactions logged
 * 
 * Usage Example:
 * ```typescript
 * const { askAgent, isLoading, response } = useAgent('Elara')
 * askAgent('Fix this bug', currentFile)
 * ```
 */

import { useState, useCallback, useEffect } from 'react'
import {
  agentBridge,
  type AgentName,
  type AgentSignal,
  type AgentResponse,
  type AgentSignalPayload,
} from '@/lib/agent-bridge'
import { useWorkspaceStore } from '@/lib/stores/workspace-store'
import { logConstitutionalCheck } from '@/lib/constitutional-guard'

export interface UseAgentOptions {
  /** Automatically include active file in payload */
  includeActiveFile?: boolean
  /** Automatically include project context */
  includeProjectContext?: boolean
  /** Callback when response received */
  onResponse?: (response: AgentResponse) => void
  /** Callback when error occurs */
  onError?: (error: string) => void
}

export interface UseAgentReturn {
  /** Send a request to the agent */
  askAgent: (
    signal: AgentSignal,
    context?: string,
    customPayload?: Partial<AgentSignalPayload>
  ) => Promise<AgentResponse>
  
  /** Current loading state */
  isLoading: boolean
  
  /** Last response from agent */
  response: AgentResponse | null
  
  /** Last error */
  error: string | null
  
  /** Clear response and error */
  clear: () => void
  
  /** Agent activity history */
  history: AgentResponse[]
}

/**
 * Hook for interacting with AI agents
 */
export function useAgent(
  agent: AgentName,
  options: UseAgentOptions = {}
): UseAgentReturn {
  const {
    includeActiveFile = true,
    includeProjectContext = true,
    onResponse,
    onError,
  } = options

  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<AgentResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<AgentResponse[]>([])

  // Get workspace context
  const {
    activeFile,
    projectName,
    projectRoot,
    currentRoom,
    logAgentActivity,
    updateInteractionTime,
    activateAgent,
  } = useWorkspaceStore()

  // Ensure agent is activated when hook is used
  useEffect(() => {
    activateAgent(agent)
  }, [agent, activateAgent])

  /**
   * Ask the agent a question or give a command
   */
  const askAgent = useCallback(
    async (
      signal: AgentSignal,
      context?: string,
      customPayload?: Partial<AgentSignalPayload>
    ): Promise<AgentResponse> => {
      // Clear previous error
      setError(null)
      setIsLoading(true)
      updateInteractionTime()

      try {
        // Build payload with context
        const payload: AgentSignalPayload = {
          fileContent: '',
          ...customPayload,
        }

        // Include active file if enabled
        if (includeActiveFile && activeFile) {
          payload.fileContent = activeFile.content
          payload.filePath = activeFile.path
        }

        // Include project context if enabled
        if (includeProjectContext) {
          payload.projectName = projectName || undefined
          payload.room = currentRoom
        }

        // Add user context
        if (context) {
          payload.context = context
        }

        // Log activity
        logAgentActivity(agent, `${signal}: ${context || 'no context'}`)

        // Send request through bridge (includes constitutional validation)
        const agentResponse = await agentBridge.sendSignal(agent, signal, payload)

        // Update state
        setResponse(agentResponse)
        setHistory(prev => [...prev, agentResponse])

        // Handle response
        if (agentResponse.status === 'error') {
          setError(agentResponse.error || 'Unknown error')
          onError?.(agentResponse.error || 'Unknown error')
        } else {
          onResponse?.(agentResponse)
        }

        return agentResponse
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Request failed'
        setError(errorMessage)
        onError?.(errorMessage)
        
        // Return error response
        return {
          requestId: 'error',
          agent,
          status: 'error',
          error: errorMessage,
          constitutionalCheck: {
            passed: false,
            violations: [],
            healthScore: 0,
          },
          timestamp: Date.now(),
        }
      } finally {
        setIsLoading(false)
      }
    },
    [
      agent,
      activeFile,
      projectName,
      currentRoom,
      includeActiveFile,
      includeProjectContext,
      logAgentActivity,
      updateInteractionTime,
      onResponse,
      onError,
    ]
  )

  /**
   * Clear response and error
   */
  const clear = useCallback(() => {
    setResponse(null)
    setError(null)
  }, [])

  return {
    askAgent,
    isLoading,
    response,
    error,
    clear,
    history,
  }
}

/**
 * Convenience hooks for specific agents
 */
export const useElara = (options?: UseAgentOptions) => useAgent('Elara', options)
export const useThemba = (options?: UseAgentOptions) => useAgent('Themba', options)
export const useJabari = (options?: UseAgentOptions) => useAgent('Jabari', options)
export const useNia = (options?: UseAgentOptions) => useAgent('Nia', options)
export const useImani = (options?: UseAgentOptions) => useAgent('Imani', options)
export const useSankofa = (options?: UseAgentOptions) => useAgent('Sankofa', options)
