/**
 * Cross-Room Event Bus
 * 
 * Central event system that allows rooms to communicate.
 * When something happens in one room (e.g. task completed in Task Board),
 * other rooms can react (e.g. Collectible Showcase unlocks an achievement,
 * Command Desk logs it, Knowledge Ocean indexes it).
 * 
 * Constitutional Compliance:
 * - Ubuntu Philosophy: Collective benefit through interconnected rooms
 * - Transparency: All events are logged and auditable
 */

type EventHandler = (event: RoomEvent) => void

export interface RoomEvent {
  type: string
  room: string
  timestamp: string
  data?: any
  userId?: string
}

class RoomEventBus {
  private handlers: Map<string, EventHandler[]> = new Map()
  private eventLog: RoomEvent[] = []

  on(eventType: string, handler: EventHandler) {
    const existing = this.handlers.get(eventType) || []
    existing.push(handler)
    this.handlers.set(eventType, existing)
    return () => {
      const handlers = this.handlers.get(eventType) || []
      this.handlers.set(
        eventType,
        handlers.filter((h) => h !== handler)
      )
    }
  }

  emit(event: RoomEvent) {
    this.eventLog.push(event)

    // Fire specific handlers
    const handlers = this.handlers.get(event.type) || []
    handlers.forEach((h) => h(event))

    // Fire wildcard handlers
    const wildcardHandlers = this.handlers.get('*') || []
    wildcardHandlers.forEach((h) => h(event))
  }

  getLog() {
    return this.eventLog.slice(-100)
  }

  clear() {
    this.eventLog = []
  }
}

// Singleton
export const roomEventBus = new RoomEventBus()

// ── Event type constants ──
export const ROOM_EVENTS = {
  // Code Chamber
  CODE_COMMIT: 'code-commit',
  CODE_REVIEW: 'code-review',
  REFACTOR_APPLY: 'refactor-apply',
  FILE_CREATED: 'file-created',
  COLLAB_JOIN: 'collab-join',
  
  // Spec Chamber
  SPEC_CREATE: 'spec-create',
  SPEC_VALIDATE: 'spec-validate',
  SPEC_GENERATE_CODE: 'spec-generate-code',
  VISUAL_BUILD: 'visual-build',
  
  // Design Studio
  FIGMA_IMPORT: 'figma-import',
  A11Y_PASS: 'a11y-pass',
  DESIGN_TO_CODE: 'design-to-code',
  
  // AI Studio
  WORKFLOW_RUN: 'workflow-run',
  WORKFLOW_MULTI: 'workflow-multi',
  AGENT_RESPONSE: 'agent-response',
  
  // Command Desk
  SLASH_COMMAND: 'slash-command',
  MESSAGE_SEND: 'message-send',
  
  // Collaboration Pod
  MEETING_SUMMARY: 'meeting-summary',
  
  // Deep Focus
  FOCUS_COMPLETE: 'focus-complete',
  FOCUS_STREAK: 'focus-streak',
  
  // Innovation Theater
  GO_LIVE: 'go-live',
  REACTION_RECEIVED: 'reaction-received',
  SLIDE_AI_GENERATE: 'slide-ai-generate',
  
  // Knowledge Ocean
  KNOWLEDGE_ASK: 'knowledge-ask',
  DOCUMENT_INDEX: 'document-index',
  
  // Maker Lab
  SIMULATE_BOARD: 'simulate-board',
  
  // Task Board
  TASK_CREATE: 'task-create',
  TASK_COMPLETE: 'task-complete',
  TASK_AI_PRIORITIZE: 'task-ai-prioritize',
  
  // Collectible Showcase
  ACHIEVEMENT_UNLOCK: 'achievement-unlock',
  CARD_MINT: 'card-mint',
  
  // Cross-room
  ROOM_NAVIGATE: 'room-navigate',
  ALL_ROOMS_VISITED: 'all-rooms-visited',
} as const
