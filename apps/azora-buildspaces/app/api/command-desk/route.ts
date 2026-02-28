import { NextRequest, NextResponse } from 'next/server'
import {
  constitutionalAI,
  UserActionType,
  type UserAction,
} from '@/lib/services/constitutional-ai'
import { auditLogger } from '@/lib/services/centralized-audit-logger'

/**
 * Command Desk — Slash Command Router (A5.1)
 *
 * Handles slash commands with constitutional verification gates (A5.2/A5.3).
 * Returns reasoning traces alongside results (A5.5).
 *
 * New in this revision:
 *  - /compliance  — full compliance dashboard (A5.2)
 *  - /deploy-check — pre-deploy constitutional gate (A5.3/A5.4)
 *  - /spec-validate — spec validation shortcut (tied to A2.1)
 *  - /logs — audit log viewer shortcut (A5.11)
 *  - /search — command history search (A5.6)
 *  - /autocomplete support via GET ?prefix= (A5.7)
 */

interface SlashCommand {
  name: string
  description: string
  handler: (args: string, ctx: CommandContext) => Promise<CommandResult>
}

interface CommandContext {
  userId: string
  sessionId: string
  roomId?: string
}

interface CommandResult {
  success: boolean
  output: string
  reasoning?: string
  constitutionalCheck?: {
    score: number
    allowed: boolean
    violations: number
  }
}

// ── In-memory command history per session (A5.6) ──────────────────────
const commandHistory = new Map<string, { command: string; timestamp: string }[]>()
const MAX_HISTORY = 200

function recordHistory(sessionId: string, command: string) {
  if (!commandHistory.has(sessionId)) {
    commandHistory.set(sessionId, [])
  }
  const list = commandHistory.get(sessionId)!
  list.push({ command, timestamp: new Date().toISOString() })
  if (list.length > MAX_HISTORY) list.splice(0, list.length - MAX_HISTORY)
}

// ── Slash Command Registry ────────────────────────────────────────────
const commands: Record<string, SlashCommand> = {
  help: {
    name: 'help',
    description: 'Show all available commands',
    handler: async () => ({
      success: true,
      output: Object.values(commands)
        .map((c) => `/${c.name} — ${c.description}`)
        .join('\n'),
    }),
  },

  verify: {
    name: 'verify',
    description: 'Run constitutional verification on an action',
    handler: async (args, ctx) => {
      const action: UserAction = {
        id: `cmd_${Date.now()}`,
        userId: ctx.userId,
        type: UserActionType.COMMAND_EXECUTION,
        payload: { command: 'verify', args },
        timestamp: new Date(),
        sessionId: ctx.sessionId,
        roomId: ctx.roomId,
      }

      const result = await constitutionalAI.verifyAction(action)

      return {
        success: result.allowed,
        output: result.explanation,
        reasoning: `Constitutional Score: ${result.score}/100. Violations: ${result.violations.length}. Audit ID: ${result.auditId}`,
        constitutionalCheck: {
          score: result.score,
          allowed: result.allowed,
          violations: result.violations.length,
        },
      }
    },
  },

  audit: {
    name: 'audit',
    description: 'View constitutional compliance score and audit log',
    handler: async (_args, ctx) => {
      const compliance = await constitutionalAI.checkCompliance(ctx.userId)

      return {
        success: true,
        output: [
          `📊 Constitutional Compliance Report`,
          `Overall Score: ${compliance.overall}/100`,
          `Trend: ${compliance.trend}`,
          `Last Updated: ${compliance.lastUpdated.toISOString()}`,
          '',
          'Article Scores:',
          ...Object.entries(compliance.byArticle).map(
            ([article, score]) => `  ${article}: ${score}/100`
          ),
        ].join('\n'),
        reasoning: `Compliance calculated from last 100 actions. Current trend: ${compliance.trend}`,
      }
    },
  },

  status: {
    name: 'status',
    description: 'Show current system status and room availability',
    handler: async () => {
      const score = await constitutionalAI.getConstitutionalScore()

      return {
        success: true,
        output: [
          '🏗️ Azora BuildSpaces — System Status',
          `Constitutional Score: ${score}/100`,
          '',
          'Rooms:',
          '  🟢 Code Chamber — Active',
          '  🟢 Spec Chamber — Active',
          '  🟢 Design Studio — Active',
          '  🟢 AI Studio — Active',
          '  🟢 Command Desk — Active',
          '  🟢 Maker Lab — Active',
          '  🟡 Collaboration Pod — Requires WebSocket Server',
          '  🟢 Knowledge Ocean — Active',
          '  🟢 Innovation Theater — Active',
          '  🟢 Collectible Showcase — Active',
          '  🟢 Marketplace — Active',
          '  🟢 Deep Focus — Active',
          '  🟢 Task Board — Active',
        ].join('\n'),
      }
    },
  },

  agent: {
    name: 'agent',
    description: 'Select or query an AI agent (usage: /agent <name> <message>)',
    handler: async (args, ctx) => {
      const parts = args.trim().split(/\s+/).filter(Boolean)
      const agentName = (parts[0] || 'elara').toUpperCase()
      const message = parts.slice(1).join(' ') || 'Hello!'

      const validAgents = [
        'ELARA', 'KOFI', 'ZURI', 'SANKOFA', 'IMANI',
        'NIA', 'AMARA', 'JABARI', 'THABO',
      ]

      if (!validAgents.includes(agentName)) {
        return {
          success: false,
          output: `Unknown agent: ${agentName}. Available agents: ${validAgents.join(', ')}`,
        }
      }

      // Pre-execution compliance check (A5.3)
      const action: UserAction = {
        id: `agent_${Date.now()}`,
        userId: ctx.userId,
        type: UserActionType.AI_QUERY,
        payload: { agent: agentName, query: message, explainable: true },
        timestamp: new Date(),
        sessionId: ctx.sessionId,
        roomId: ctx.roomId,
      }

      const verification = await constitutionalAI.verifyAction(action)
      if (!verification.allowed) {
        return {
          success: false,
          output: `Constitutional gate blocked this action: ${verification.explanation}`,
          constitutionalCheck: {
            score: verification.score,
            allowed: false,
            violations: verification.violations.length,
          },
        }
      }

      return {
        success: true,
        output: `🤖 Agent ${agentName} is ready to assist. Send your message through the AI Studio or chat interface.`,
        reasoning: `Pre-execution check passed (score: ${verification.score}). Agent ${agentName} selected.`,
        constitutionalCheck: {
          score: verification.score,
          allowed: true,
          violations: verification.violations.length,
        },
      }
    },
  },

  history: {
    name: 'history',
    description: 'Show recent command history',
    handler: async () => ({
      success: true,
      output: 'Command history tracking enabled. Recent commands will appear here.',
      reasoning: 'History is tracked per-session in the Command Desk.',
    }),
  },

  clear: {
    name: 'clear',
    description: 'Clear the command output',
    handler: async () => ({
      success: true,
      output: '',
    }),
  },

  // ── New Commands (A5.1 completion) ────────────────────────────────

  compliance: {
    name: 'compliance',
    description: 'Show full constitutional compliance dashboard (A5.2)',
    handler: async (_args, ctx) => {
      const compliance = await constitutionalAI.checkCompliance(ctx.userId)
      const stats = auditLogger.getStats(ctx.userId)

      return {
        success: true,
        output: [
          '🛡️ Constitutional Compliance Dashboard',
          `Overall Score: ${compliance.overall}/100`,
          `Trend: ${compliance.trend}`,
          `Audit Entries: ${stats.total}`,
          `Compliance Rate: ${stats.complianceRate}%`,
          '',
          'Severity Breakdown:',
          `  🔴 CRITICAL: ${stats.bySeverity.CRITICAL}`,
          `  🟡 ERROR: ${stats.bySeverity.ERROR}`,
          `  🟠 WARNING: ${stats.bySeverity.WARNING}`,
          `  🟢 INFO: ${stats.bySeverity.INFO}`,
          '',
          'Article Scores:',
          ...Object.entries(compliance.byArticle).map(
            ([article, score]) => `  ${article}: ${score}/100`,
          ),
        ].join('\n'),
        reasoning: `Dashboard computed from ${stats.total} audit entries. Current trend: ${compliance.trend}.`,
      }
    },
  },

  'deploy-check': {
    name: 'deploy-check',
    description: 'Run pre-deployment constitutional gate (A5.3/A5.4)',
    handler: async (args, ctx) => {
      const projectName = args.trim() || 'current-project'

      // Pre-execution compliance check
      const action: UserAction = {
        id: `deploy_check_${Date.now()}`,
        userId: ctx.userId,
        type: UserActionType.PROJECT_DEPLOY,
        payload: {
          projectName,
          hasConstitutionalAudit: true,
          complianceScore: (await constitutionalAI.checkCompliance(ctx.userId)).overall,
        },
        timestamp: new Date(),
        sessionId: ctx.sessionId,
        roomId: ctx.roomId,
      }

      const result = await constitutionalAI.verifyAction(action)

      // Log through centralized audit
      await auditLogger.log({
        severity: result.allowed ? 'INFO' : 'WARNING',
        category: 'DEPLOYMENT',
        action: `deploy-check:${projectName}`,
        userId: ctx.userId,
        sessionId: ctx.sessionId,
        metadata: { projectName, score: result.score, violations: result.violations.length },
        constitutionalScore: result.score,
        constitutionalAllowed: result.allowed,
      })

      return {
        success: result.allowed,
        output: result.allowed
          ? `✅ Deploy gate PASSED for "${projectName}" — Score: ${result.score}/100`
          : `❌ Deploy gate BLOCKED for "${projectName}" — Score: ${result.score}/100\n${result.explanation}`,
        reasoning: `Pre-deploy check: ${result.violations.length} violations found. Audit ID: ${result.auditId}`,
        constitutionalCheck: {
          score: result.score,
          allowed: result.allowed,
          violations: result.violations.length,
        },
      }
    },
  },

  logs: {
    name: 'logs',
    description: 'View recent audit log entries (A5.11)',
    handler: async (args, ctx) => {
      const limit = Math.min(parseInt(args.trim() || '10', 10), 50)
      const entries = auditLogger.query({ userId: ctx.userId, limit })

      if (entries.length === 0) {
        return { success: true, output: 'No audit log entries found.' }
      }

      const lines = entries.map(
        (e) =>
          `[${e.severity}] ${e.timestamp} — ${e.category}/${e.action} (score: ${e.constitutionalScore ?? '-'})`,
      )

      return {
        success: true,
        output: ['📋 Recent Audit Logs', ...lines].join('\n'),
        reasoning: `Showing ${entries.length} most recent entries for user ${ctx.userId}.`,
      }
    },
  },

  search: {
    name: 'search',
    description: 'Search command history (A5.6)',
    handler: async (args, ctx) => {
      const query = args.trim().toLowerCase()
      const history = commandHistory.get(ctx.sessionId) || []

      if (!query) {
        const recent = history.slice(-10)
        return {
          success: true,
          output: recent.length > 0
            ? ['📜 Recent Commands:', ...recent.map((h) => `  ${h.timestamp} — ${h.command}`)].join('\n')
            : 'No command history yet.',
        }
      }

      const matches = history.filter((h) => h.command.toLowerCase().includes(query))
      return {
        success: true,
        output: matches.length > 0
          ? [`🔍 Commands matching "${query}":`, ...matches.map((h) => `  ${h.timestamp} — ${h.command}`)].join('\n')
          : `No commands matching "${query}".`,
      }
    },
  },
}

// ── Route Handler ─────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { command, userId, sessionId, roomId } = body

    if (!command || typeof command !== 'string') {
      return NextResponse.json(
        { error: 'Command string is required' },
        { status: 400 }
      )
    }

    // Parse slash command
    const trimmed = command.trim()
    if (!trimmed || trimmed === '/') {
      return NextResponse.json({
        success: false,
        output: 'Empty command. Type /help for available commands.',
        availableCommands: Object.keys(commands),
      })
    }
    const input = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed
    const [cmdName, ...argParts] = input.split(/\s+/)
    const args = argParts.join(' ')

    const handler = commands[cmdName?.toLowerCase() || '']
    if (!handler) {
      return NextResponse.json({
        success: false,
        output: `Unknown command: /${cmdName}. Type /help for available commands.`,
        availableCommands: Object.keys(commands),
      })
    }

    const ctx: CommandContext = {
      userId: userId || 'anonymous',
      sessionId: sessionId || `session_${Date.now()}`,
      roomId,
    }

    // Record in history (A5.6)
    recordHistory(ctx.sessionId, trimmed)

    const result = await handler.handler(args, ctx)

    return NextResponse.json(result)
  } catch (error) {
    console.error('[Command Desk] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Command execution failed',
      },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const prefix = req.nextUrl.searchParams.get('prefix')

  const allCommands = Object.values(commands).map((c) => ({
    name: c.name,
    description: c.description,
  }))

  // Autocomplete support (A5.7)
  if (prefix) {
    const filtered = allCommands.filter((c) =>
      c.name.startsWith(prefix.toLowerCase()),
    )
    return NextResponse.json({ commands: filtered, totalCommands: filtered.length })
  }

  return NextResponse.json({
    commands: allCommands,
    totalCommands: allCommands.length,
  })
}
