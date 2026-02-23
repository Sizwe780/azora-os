"use client"

/**
 * Presence Engine - Real-time User Awareness
 * 
 * Constitutional Compliance:
 * - UBUNTU PHILOSOPHY: Individual success = Collective success
 * - TRANSPARENCY: Users always know who is watching/editing (no invisible observers)
 * - CONFLICT PRESERVATION: Both intentions preserved, never silent overwrite
 * 
 * Tracks user presence, cursors, and selections using YJS Awareness API.
 */

import { useEffect, useState, useCallback } from 'react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
// import { Awareness } from 'y-protocols/awareness'

export interface UserPresence {
  userId: string
  userName: string
  userColor: string
  cursorPosition?: { x: number; y: number }
  selection?: {
    startLine: number
    startColumn: number
    endLine: number
    endColumn: number
  }
  currentFile?: string
  lastActivity: number
  isFollowing?: string // userId they're following
}

export interface PresenceState {
  localUser: UserPresence
  remoteUsers: Map<number, UserPresence>
  provider: WebsocketProvider | null
  awareness: any | null
}

const COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Orange
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E2', // Light Blue
]

let globalDoc: Y.Doc | null = null
let globalProvider: WebsocketProvider | null = null

/**
 * Get or create global YDoc
 */
function getGlobalDoc(): Y.Doc {
  if (!globalDoc) {
    globalDoc = new Y.Doc()
  }
  return globalDoc
}

/**
 * Initialize WebSocket provider
 */
function initProvider(roomId: string): WebsocketProvider {
  if (globalProvider && globalProvider.roomname === roomId) {
    return globalProvider
  }

  // Clean up old provider
  if (globalProvider) {
    globalProvider.destroy()
  }

  const doc = getGlobalDoc()
  
  // Use WebSocket URL (in production, this should be an env variable)
  // For now, use localhost or a demo server
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:1234'
  
  globalProvider = new WebsocketProvider(wsUrl, roomId, doc, {
    connect: true,
  })

  return globalProvider
}

/**
 * Generate a consistent color for a user
 */
function getUserColor(userId: string): string {
  const hash = userId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)
  return COLORS[Math.abs(hash) % COLORS.length]
}

/**
 * Generate a user ID (in production, this would come from auth)
 */
function generateUserId(): string {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('azora-user-id') : null
  if (stored) return stored

  const id = `user-${Math.random().toString(36).substr(2, 9)}`
  if (typeof window !== 'undefined') {
    localStorage.setItem('azora-user-id', id)
  }
  return id
}

/**
 * Generate a user name (in production, this would come from auth)
 */
function generateUserName(): string {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('azora-user-name') : null
  if (stored) return stored

  const adjectives = ['Swift', 'Brave', 'Wise', 'Bold', 'Keen']
  const nouns = ['Coder', 'Builder', 'Designer', 'Architect', 'Creator']
  const name = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${
    nouns[Math.floor(Math.random() * nouns.length)]
  }`
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('azora-user-name', name)
  }
  return name
}

/**
 * usePresence Hook
 * 
 * Provides real-time presence tracking for a collaboration room
 */
export function usePresence(roomId: string) {
  const [state, setState] = useState<PresenceState>({
    localUser: {
      userId: '',
      userName: '',
      userColor: '',
      lastActivity: Date.now(),
    },
    remoteUsers: new Map(),
    provider: null,
    awareness: null,
  })

  // Initialize presence
  useEffect(() => {
    if (typeof window === 'undefined') return

    const userId = generateUserId()
    const userName = generateUserName()
    const userColor = getUserColor(userId)

    const provider = initProvider(roomId)
    const awareness = provider.awareness

    // Set local presence
    const localUser: UserPresence = {
      userId,
      userName,
      userColor,
      lastActivity: Date.now(),
    }

    awareness.setLocalState(localUser)

    // Update state
    setState({
      localUser,
      remoteUsers: new Map(),
      provider,
      awareness,
    })

    // Listen for remote presence changes
    const handleChange = () => {
      const remoteUsers = new Map<number, UserPresence>()
      
      awareness.getStates().forEach((state, clientId) => {
        if (clientId !== awareness.clientID) {
          remoteUsers.set(clientId, state as UserPresence)
        }
      })

      setState(prev => ({
        ...prev,
        remoteUsers,
      }))
    }

    awareness.on('change', handleChange)

    // Cleanup
    return () => {
      awareness.off('change', handleChange)
      // Don't destroy provider on unmount - keep connection alive
    }
  }, [roomId])

  /**
   * Update local user cursor position
   */
  const updateCursor = useCallback(
    (position: { x: number; y: number }) => {
      if (!state.awareness) return

      const currentState = state.awareness.getLocalState() as UserPresence
      state.awareness.setLocalStateField('cursorPosition', position)
      state.awareness.setLocalStateField('lastActivity', Date.now())

      setState(prev => ({
        ...prev,
        localUser: {
          ...prev.localUser,
          cursorPosition: position,
          lastActivity: Date.now(),
        },
      }))
    },
    [state.awareness]
  )

  /**
   * Update local user selection in editor
   */
  const updateSelection = useCallback(
    (selection: UserPresence['selection']) => {
      if (!state.awareness) return

      state.awareness.setLocalStateField('selection', selection)
      state.awareness.setLocalStateField('lastActivity', Date.now())

      setState(prev => ({
        ...prev,
        localUser: {
          ...prev.localUser,
          selection,
          lastActivity: Date.now(),
        },
      }))
    },
    [state.awareness]
  )

  /**
   * Update current file being edited
   */
  const updateCurrentFile = useCallback(
    (filePath: string) => {
      if (!state.awareness) return

      state.awareness.setLocalStateField('currentFile', filePath)
      state.awareness.setLocalStateField('lastActivity', Date.now())

      setState(prev => ({
        ...prev,
        localUser: {
          ...prev.localUser,
          currentFile: filePath,
          lastActivity: Date.now(),
        },
      }))
    },
    [state.awareness]
  )

  /**
   * Start following another user
   */
  const followUser = useCallback(
    (targetUserId: string) => {
      if (!state.awareness) return

      state.awareness.setLocalStateField('isFollowing', targetUserId)

      setState(prev => ({
        ...prev,
        localUser: {
          ...prev.localUser,
          isFollowing: targetUserId,
        },
      }))
    },
    [state.awareness]
  )

  /**
   * Stop following
   */
  const unfollowUser = useCallback(() => {
    if (!state.awareness) return

    state.awareness.setLocalStateField('isFollowing', null)

    setState(prev => ({
      ...prev,
      localUser: {
        ...prev.localUser,
        isFollowing: undefined,
      },
    }))
  }, [state.awareness])

  /**
   * Get YJS document for collaboration
   */
  const getYDoc = useCallback(() => {
    return getGlobalDoc()
  }, [])

  /**
   * Get WebSocket provider
   */
  const getProvider = useCallback(() => {
    return state.provider
  }, [state.provider])

  return {
    localUser: state.localUser,
    remoteUsers: Array.from(state.remoteUsers.values()),
    remoteUsersMap: state.remoteUsers,
    updateCursor,
    updateSelection,
    updateCurrentFile,
    followUser,
    unfollowUser,
    getYDoc,
    getProvider,
    awareness: state.awareness,
  }
}

/**
 * Get active users count
 */
export function getActiveUsersCount(remoteUsers: UserPresence[]): number {
  const now = Date.now()
  const activeThreshold = 30000 // 30 seconds

  return remoteUsers.filter(user => {
    return now - user.lastActivity < activeThreshold
  }).length + 1 // +1 for local user
}

/**
 * Check if a user is currently active
 */
export function isUserActive(user: UserPresence): boolean {
  const now = Date.now()
  const activeThreshold = 30000 // 30 seconds
  return now - user.lastActivity < activeThreshold
}
