/**
 * Workspace Store - The "Room State" (Session Truth)
 * 
 * Constitutional Compliance:
 * - SINGLE SOURCE OF TRUTH: Central state for entire workspace
 * - CONTEXT AWARENESS: Agents know what room/file user is in
 * - PERSISTENT: State survives page refreshes
 * 
 * This store holds the complete truth of the current BuildSpaces session,
 * enabling agents to have full context awareness.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AgentName } from '../agent-bridge'

/**
 * Room Types - The 8 Rooms from BLUEPRINT.md
 */
export type RoomType =
  | 'CODE'
  | 'SPEC'
  | 'DESIGN'
  | 'AI_STUDIO'
  | 'COMMAND'
  | 'MAKER'
  | 'COLLABORATION'
  | 'KNOWLEDGE'

/**
 * Active File State
 */
export interface ActiveFile {
  path: string
  content: string
  language: string
  lastModified: number
  isDirty: boolean // Has unsaved changes
}

/**
 * Agent Activity Record
 */
export interface AgentActivity {
  agent: AgentName
  action: string
  timestamp: number
  room: RoomType
}

/**
 * Workspace Store State
 */
export interface WorkspaceStore {
  // Current Room
  currentRoom: RoomType
  setCurrentRoom: (room: RoomType) => void

  // Active Agents
  activeAgents: AgentName[]
  activateAgent: (agent: AgentName) => void
  deactivateAgent: (agent: AgentName) => void
  isAgentActive: (agent: AgentName) => boolean

  // Constitutional Health
  constitutionalHealth: number
  updateConstitutionalHealth: (score: number) => void
  getHealthStatus: () => 'excellent' | 'good' | 'warning' | 'critical'

  // Active File
  activeFile: ActiveFile | null
  setActiveFile: (file: ActiveFile) => void
  updateFileContent: (content: string) => void
  markFileDirty: (isDirty: boolean) => void
  clearActiveFile: () => void

  // Project Context
  projectName: string | null
  projectRoot: string | null
  setProject: (name: string, root: string) => void

  // Agent Activity Log
  agentActivities: AgentActivity[]
  logAgentActivity: (agent: AgentName, action: string) => void
  getRecentActivities: (limit?: number) => AgentActivity[]

  // Session Metadata
  sessionStartTime: number
  lastInteractionTime: number
  updateInteractionTime: () => void
  getSessionDuration: () => number

  // Room History
  roomHistory: Array<{ room: RoomType; timestamp: number }>
  getRoomHistory: () => Array<{ room: RoomType; timestamp: number }>

  // Reset
  reset: () => void
}

/**
 * Initial state
 */
const initialState = {
  currentRoom: 'CODE' as RoomType,
  activeAgents: ['Elara'] as AgentName[], // Elara is always active
  constitutionalHealth: 100,
  activeFile: null,
  projectName: null,
  projectRoot: null,
  agentActivities: [],
  sessionStartTime: Date.now(),
  lastInteractionTime: Date.now(),
  roomHistory: [{ room: 'CODE' as RoomType, timestamp: Date.now() }],
}

/**
 * Create the workspace store
 */
export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Room Management
      setCurrentRoom: (room: RoomType) => {
        set(state => ({
          currentRoom: room,
          roomHistory: [
            ...state.roomHistory,
            { room, timestamp: Date.now() },
          ],
          lastInteractionTime: Date.now(),
        }))
      },

      // Agent Management
      activateAgent: (agent: AgentName) => {
        set(state => {
          if (state.activeAgents.includes(agent)) {
            return state
          }
          return {
            activeAgents: [...state.activeAgents, agent],
            lastInteractionTime: Date.now(),
          }
        })
        
        // Log activation
        get().logAgentActivity(agent, 'activated')
      },

      deactivateAgent: (agent: AgentName) => {
        // Elara cannot be deactivated
        if (agent === 'Elara') {
          console.warn('[WorkspaceStore] Cannot deactivate Elara - she is always active')
          return
        }

        set(state => ({
          activeAgents: state.activeAgents.filter(a => a !== agent),
          lastInteractionTime: Date.now(),
        }))

        // Log deactivation
        get().logAgentActivity(agent, 'deactivated')
      },

      isAgentActive: (agent: AgentName) => {
        return get().activeAgents.includes(agent)
      },

      // Constitutional Health
      updateConstitutionalHealth: (score: number) => {
        set({
          constitutionalHealth: Math.max(0, Math.min(100, score)),
          lastInteractionTime: Date.now(),
        })
      },

      getHealthStatus: () => {
        const health = get().constitutionalHealth
        if (health >= 90) return 'excellent'
        if (health >= 70) return 'good'
        if (health >= 50) return 'warning'
        return 'critical'
      },

      // File Management
      setActiveFile: (file: ActiveFile) => {
        set({
          activeFile: file,
          lastInteractionTime: Date.now(),
        })
      },

      updateFileContent: (content: string) => {
        set(state => ({
          activeFile: state.activeFile
            ? {
                ...state.activeFile,
                content,
                lastModified: Date.now(),
                isDirty: true,
              }
            : null,
          lastInteractionTime: Date.now(),
        }))
      },

      markFileDirty: (isDirty: boolean) => {
        set(state => ({
          activeFile: state.activeFile
            ? { ...state.activeFile, isDirty }
            : null,
        }))
      },

      clearActiveFile: () => {
        set({ activeFile: null })
      },

      // Project Management
      setProject: (name: string, root: string) => {
        set({
          projectName: name,
          projectRoot: root,
          lastInteractionTime: Date.now(),
        })
      },

      // Agent Activity Logging
      logAgentActivity: (agent: AgentName, action: string) => {
        const activity: AgentActivity = {
          agent,
          action,
          timestamp: Date.now(),
          room: get().currentRoom,
        }

        set(state => ({
          agentActivities: [
            ...state.agentActivities.slice(-99), // Keep last 100
            activity,
          ],
        }))
      },

      getRecentActivities: (limit: number = 10) => {
        return get()
          .agentActivities.slice(-limit)
          .reverse()
      },

      // Session Management
      updateInteractionTime: () => {
        set({ lastInteractionTime: Date.now() })
      },

      getSessionDuration: () => {
        const now = Date.now()
        const start = get().sessionStartTime
        return Math.floor((now - start) / 1000) // Duration in seconds
      },

      // Room History
      getRoomHistory: () => {
        return get().roomHistory.slice(-20) // Last 20 room changes
      },

      // Reset
      reset: () => {
        set({
          ...initialState,
          sessionStartTime: Date.now(),
          lastInteractionTime: Date.now(),
          roomHistory: [{ room: 'CODE' as RoomType, timestamp: Date.now() }],
        })
      },
    }),
    {
      name: 'azora-workspace-store',
      // Only persist certain fields
      partialize: (state) => ({
        currentRoom: state.currentRoom,
        activeAgents: state.activeAgents,
        constitutionalHealth: state.constitutionalHealth,
        projectName: state.projectName,
        projectRoot: state.projectRoot,
        roomHistory: state.roomHistory.slice(-20),
        agentActivities: state.agentActivities.slice(-50),
      }),
    }
  )
)
