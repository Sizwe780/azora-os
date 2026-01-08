/**
 * Integrated Terminal Service
 * 
 * Provides xterm.js-based terminal functionality with full shell capabilities,
 * multiple terminal tabs, session management, and collaborative features.
 */

import { z } from 'zod'
import { EventEmitter } from 'events'
import { constitutionalAI, UserActionType, UserAction } from './constitutional-ai'

// Terminal Configuration Schema
const TerminalConfigSchema = z.object({
  id: z.string(),
  containerId: z.string(),
  userId: z.string(),
  shell: z.enum(['bash', 'zsh', 'fish', 'sh', 'powershell', 'cmd']).default('bash'),
  workingDirectory: z.string().default('/workspace'),
  environment: z.record(z.string()).default({}),
  dimensions: z.object({
    cols: z.number().default(80),
    rows: z.number().default(24)
  }),
  theme: z.object({
    background: z.string().default('#1e1e1e'),
    foreground: z.string().default('#ffffff'),
    cursor: z.string().default('#ffffff'),
    selection: z.string().default('#264f78')
  }).default({}),
  features: z.object({
    scrollback: z.number().default(1000),
    bellSound: z.boolean().default(false),
    cursorBlink: z.boolean().default(true),
    fontSize: z.number().default(14),
    fontFamily: z.string().default('Monaco, Menlo, "Ubuntu Mono", monospace')
  }).default({})
})

const TerminalSessionSchema = z.object({
  id: z.string(),
  config: TerminalConfigSchema,
  status: z.enum(['starting', 'running', 'stopped', 'error']),
  pid: z.number().optional(),
  createdAt: z.date(),
  lastActivity: z.date(),
  history: z.array(z.string()).default([]),
  collaborators: z.array(z.string()).default([]),
  isShared: z.boolean().default(false)
})

// Types
export type TerminalConfig = z.infer<typeof TerminalConfigSchema>
export type TerminalSession = z.infer<typeof TerminalSessionSchema>

export interface TerminalCommand {
  id: string
  command: string
  timestamp: Date
  userId: string
  output: string
  exitCode: number
  duration: number
}

export interface TerminalSearchResult {
  sessionId: string
  lineNumber: number
  content: string
  timestamp: Date
}

/**
 * Integrated Terminal Service
 * 
 * Manages terminal sessions with xterm.js integration
 */
export class IntegratedTerminal extends EventEmitter {
  private sessions: Map<string, TerminalSession> = new Map()
  private processes: Map<string, TerminalProcess> = new Map()
  private searchIndex: Map<string, TerminalCommand[]> = new Map()
  private collaborationManager: TerminalCollaborationManager

  constructor() {
    super()
    this.collaborationManager = new TerminalCollaborationManager()
    this.setupEventHandlers()
  }

  /**
   * Create a new terminal session
   */
  async createSession(config: TerminalConfig): Promise<string> {
    try {
      // Validate configuration
      const validatedConfig = TerminalConfigSchema.parse(config)

      // Create session
      const session: TerminalSession = {
        id: validatedConfig.id,
        config: validatedConfig,
        status: 'starting',
        createdAt: new Date(),
        lastActivity: new Date(),
        history: [],
        collaborators: [validatedConfig.userId],
        isShared: false
      }

      this.sessions.set(session.id, session)

      // Start terminal process
      const process = await this.startTerminalProcess(session)
      this.processes.set(session.id, process)

      // Update session status
      session.status = 'running'
      session.pid = process.pid
      session.lastActivity = new Date()

      this.emit('sessionCreated', { sessionId: session.id, userId: validatedConfig.userId })

      return session.id

    } catch (error) {
      throw new Error(`Failed to create terminal session: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get terminal session
   */
  getSession(sessionId: string): TerminalSession | null {
    return this.sessions.get(sessionId) || null
  }

  /**
   * List all sessions for a user
   */
  listSessions(userId: string): TerminalSession[] {
    return Array.from(this.sessions.values()).filter(session =>
      session.collaborators.includes(userId)
    )
  }

  /**
   * Write data to terminal
   */
  async writeToTerminal(sessionId: string, data: string, userId: string): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Terminal session ${sessionId} not found`)
    }

    if (!session.collaborators.includes(userId)) {
      throw new Error(`User ${userId} not authorized for session ${sessionId}`)
    }

    const process = this.processes.get(sessionId)
    if (!process || session.status !== 'running') {
      throw new Error(`Terminal session ${sessionId} is not running`)
    }

    try {
      // Write to terminal process
      await process.write(data)

      // Update last activity
      session.lastActivity = new Date()

      // Broadcast to collaborators if shared
      if (session.isShared) {
        await this.collaborationManager.broadcastInput(sessionId, data, userId)
      }

      this.emit('terminalInput', { sessionId, data, userId })

    } catch (error) {
      throw new Error(`Failed to write to terminal: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Resize terminal
   */
  async resizeTerminal(sessionId: string, cols: number, rows: number): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Terminal session ${sessionId} not found`)
    }

    const process = this.processes.get(sessionId)
    if (!process) {
      throw new Error(`Terminal process ${sessionId} not found`)
    }

    try {
      await process.resize(cols, rows)

      // Update session config
      session.config.dimensions = { cols, rows }
      session.lastActivity = new Date()

      this.emit('terminalResized', { sessionId, cols, rows })

    } catch (error) {
      throw new Error(`Failed to resize terminal: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Execute command in terminal
   */
  async executeCommand(sessionId: string, command: string, userId: string): Promise<TerminalCommand> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Terminal session ${sessionId} not found`)
    }

    if (!session.collaborators.includes(userId)) {
      throw new Error(`User ${userId} not authorized for session ${sessionId}`)
    }

    const startTime = Date.now()
    const commandId = `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    try {
      // Build a user action for constitutional verification
      const userAction: UserAction = {
        id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type: UserActionType.COMMAND_EXECUTION,
        payload: { command, sessionId, cwd: session.config.workingDirectory },
        timestamp: new Date(),
        sessionId,
        roomId: undefined
      }

      // Verify via Constitutional AI
      const verification = await constitutionalAI.verifyAction(userAction)

      // Audit the verification result
      await constitutionalAI.logAudit({
        id: verification.auditId,
        timestamp: new Date(),
        userId: userAction.userId,
        action: userAction,
        result: verification,
        constitutionalScore: verification.score,
        violations: verification.violations,
        status: verification.allowed ? 'COMPLIANT' : 'VIOLATION'
      })

      if (!verification.allowed) {
        // Block execution and surface explanation
        throw new Error(`Constitutional Violation: ${verification.explanation}`)
      }

      // Execute command
      const result = await this.writeToTerminal(sessionId, command + '\n', userId)

      // Create command record
      const terminalCommand: TerminalCommand = {
        id: commandId,
        command,
        timestamp: new Date(),
        userId,
        output: '', // Will be populated by output handler
        exitCode: 0, // Will be updated when command completes
        duration: Date.now() - startTime
      }

      // Add to search index
      const sessionCommands = this.searchIndex.get(sessionId) || []
      sessionCommands.push(terminalCommand)
      this.searchIndex.set(sessionId, sessionCommands)

      // Add to session history
      session.history.push(command)
      if (session.history.length > 1000) {
        session.history = session.history.slice(-1000)
      }

      this.emit('commandExecuted', { sessionId, command: terminalCommand })

      return terminalCommand

    } catch (error) {
      throw new Error(`Failed to execute command: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Search terminal history
   */
  async searchHistory(sessionId: string, query: string, userId: string): Promise<TerminalSearchResult[]> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Terminal session ${sessionId} not found`)
    }

    if (!session.collaborators.includes(userId)) {
      throw new Error(`User ${userId} not authorized for session ${sessionId}`)
    }

    const commands = this.searchIndex.get(sessionId) || []
    const results: TerminalSearchResult[] = []

    // Search command history
    commands.forEach((command, index) => {
      if (command.command.toLowerCase().includes(query.toLowerCase()) ||
        command.output.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          sessionId,
          lineNumber: index,
          content: command.command,
          timestamp: command.timestamp
        })
      }
    })

    // Search session history
    session.history.forEach((historyItem, index) => {
      if (historyItem.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          sessionId,
          lineNumber: index,
          content: historyItem,
          timestamp: new Date() // Approximate timestamp
        })
      }
    })

    return results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  /**
   * Share terminal session
   */
  async shareSession(sessionId: string, targetUserId: string, ownerId: string): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Terminal session ${sessionId} not found`)
    }

    if (!session.collaborators.includes(ownerId)) {
      throw new Error(`User ${ownerId} not authorized to share session ${sessionId}`)
    }

    if (!session.collaborators.includes(targetUserId)) {
      session.collaborators.push(targetUserId)
      session.isShared = true
      session.lastActivity = new Date()

      await this.collaborationManager.addCollaborator(sessionId, targetUserId)

      this.emit('sessionShared', { sessionId, targetUserId, ownerId })
    }
  }

  /**
   * Stop sharing terminal session
   */
  async unshareSession(sessionId: string, targetUserId: string, ownerId: string): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Terminal session ${sessionId} not found`)
    }

    if (!session.collaborators.includes(ownerId)) {
      throw new Error(`User ${ownerId} not authorized to unshare session ${sessionId}`)
    }

    session.collaborators = session.collaborators.filter(id => id !== targetUserId)
    if (session.collaborators.length <= 1) {
      session.isShared = false
    }
    session.lastActivity = new Date()

    await this.collaborationManager.removeCollaborator(sessionId, targetUserId)

    this.emit('sessionUnshared', { sessionId, targetUserId, ownerId })
  }

  /**
   * Close terminal session
   */
  async closeSession(sessionId: string, userId: string): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Terminal session ${sessionId} not found`)
    }

    if (!session.collaborators.includes(userId)) {
      throw new Error(`User ${userId} not authorized for session ${sessionId}`)
    }

    try {
      // Stop terminal process
      const process = this.processes.get(sessionId)
      if (process) {
        await process.kill()
        this.processes.delete(sessionId)
      }

      // Clean up collaboration
      if (session.isShared) {
        await this.collaborationManager.closeSession(sessionId)
      }

      // Update session status
      session.status = 'stopped'
      session.lastActivity = new Date()

      // Remove from active sessions
      this.sessions.delete(sessionId)
      this.searchIndex.delete(sessionId)

      this.emit('sessionClosed', { sessionId, userId })

    } catch (error) {
      throw new Error(`Failed to close terminal session: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get terminal themes
   */
  getAvailableThemes(): Record<string, any> {
    return {
      dark: {
        background: '#1e1e1e',
        foreground: '#ffffff',
        cursor: '#ffffff',
        selection: '#264f78',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5'
      },
      light: {
        background: '#ffffff',
        foreground: '#000000',
        cursor: '#000000',
        selection: '#add6ff',
        black: '#000000',
        red: '#cd3131',
        green: '#00bc00',
        yellow: '#949800',
        blue: '#0451a5',
        magenta: '#bc05bc',
        cyan: '#0598bc',
        white: '#555555'
      },
      monokai: {
        background: '#272822',
        foreground: '#f8f8f2',
        cursor: '#f8f8f0',
        selection: '#49483e',
        black: '#272822',
        red: '#f92672',
        green: '#a6e22e',
        yellow: '#f4bf75',
        blue: '#66d9ef',
        magenta: '#ae81ff',
        cyan: '#a1efe4',
        white: '#f8f8f2'
      }
    }
  }

  // Private methods

  private async startTerminalProcess(session: TerminalSession): Promise<TerminalProcess> {
    const process = new TerminalProcess(session.config)

    // Set up output handler
    process.on('output', (data: string) => {
      this.handleTerminalOutput(session.id, data)
    })

    // Set up exit handler
    process.on('exit', (code: number) => {
      this.handleTerminalExit(session.id, code)
    })

    await process.start()
    return process
  }

  private handleTerminalOutput(sessionId: string, data: string): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    // Update last activity
    session.lastActivity = new Date()

    // Broadcast to collaborators if shared
    if (session.isShared) {
      this.collaborationManager.broadcastOutput(sessionId, data)
    }

    this.emit('terminalOutput', { sessionId, data })
  }

  private handleTerminalExit(sessionId: string, exitCode: number): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    session.status = 'stopped'
    session.lastActivity = new Date()

    this.emit('terminalExit', { sessionId, exitCode })
  }

  private setupEventHandlers(): void {
    // Clean up inactive sessions every 5 minutes
    setInterval(() => {
      this.cleanupInactiveSessions()
    }, 5 * 60 * 1000)
  }

  private cleanupInactiveSessions(): void {
    const now = Date.now()
    const inactiveThreshold = 30 * 60 * 1000 // 30 minutes

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity.getTime() > inactiveThreshold && session.status === 'stopped') {
        this.sessions.delete(sessionId)
        this.searchIndex.delete(sessionId)
        this.processes.delete(sessionId)

        this.emit('sessionCleanedUp', { sessionId })
      }
    }
  }
}

/**
 * Terminal Process Manager
 * 
 * Manages individual terminal processes
 */
class TerminalProcess extends EventEmitter {
  public pid?: number
  private config: TerminalConfig
  private process?: any // Mock process for now

  constructor(config: TerminalConfig) {
    super()
    this.config = config
  }

  async start(): Promise<void> {
    try {
      const response = await fetch('http://localhost:3010', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          did: "did:key:z6MkpTHR8V369",
          signature: "UNSIGNED",
          payload: {
            type: "TERMINAL_START",
            id: this.config.id,
            shell: this.config.shell,
            cwd: this.config.workingDirectory
          }
        })
      });

      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();

      this.pid = data.pid;
      this.emit('output', `Terminal started (PID: ${this.pid})\n`);
      this.emit('output', `${this.config.workingDirectory}$ `);
    } catch (error) {
      this.emit('output', `\nError starting terminal: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }
  }

  async write(data: string): Promise<void> {
    try {
      const response = await fetch('http://localhost:3010', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          did: "did:key:z6MkpTHR8V369",
          signature: "UNSIGNED",
          payload: {
            type: "TERMINAL_WRITE",
            id: this.config.id,
            data: data
          }
        })
      });

      if (!response.ok) throw new Error(await response.text());
      const result = await response.json();

      if (result.output) {
        this.emit('output', result.output);
      }
    } catch (error) {
      this.emit('output', `\nError writing to terminal: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }
  }

  async resize(cols: number, rows: number): Promise<void> {
    // In a real PTY, we'd send a resize signal
    this.emit('output', `\nTerminal resized to ${cols}x${rows}\n`);
    this.emit('output', `${this.config.workingDirectory}$ `);
  }

  async kill(): Promise<void> {
    this.emit('exit', 0);
  }
}

/**
 * Terminal Collaboration Manager
 * 
 * Manages real-time collaboration for shared terminal sessions
 */
class TerminalCollaborationManager {
  private sharedSessions: Map<string, Set<string>> = new Map()

  async addCollaborator(sessionId: string, userId: string): Promise<void> {
    const collaborators = this.sharedSessions.get(sessionId) || new Set()
    collaborators.add(userId)
    this.sharedSessions.set(sessionId, collaborators)
  }

  async removeCollaborator(sessionId: string, userId: string): Promise<void> {
    const collaborators = this.sharedSessions.get(sessionId)
    if (collaborators) {
      collaborators.delete(userId)
      if (collaborators.size === 0) {
        this.sharedSessions.delete(sessionId)
      }
    }
  }

  async broadcastInput(sessionId: string, data: string, fromUserId: string): Promise<void> {
    const collaborators = this.sharedSessions.get(sessionId)
    if (collaborators) {
      // In real implementation, would broadcast via WebSocket
      console.log(`Broadcasting input from ${fromUserId} to ${collaborators.size} collaborators`)
    }
  }

  async broadcastOutput(sessionId: string, data: string): Promise<void> {
    const collaborators = this.sharedSessions.get(sessionId)
    if (collaborators) {
      // In real implementation, would broadcast via WebSocket
      console.log(`Broadcasting output to ${collaborators.size} collaborators`)
    }
  }

  async closeSession(sessionId: string): Promise<void> {
    this.sharedSessions.delete(sessionId)
  }
}

// Export singleton instance
export const integratedTerminal = new IntegratedTerminal()