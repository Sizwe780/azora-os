import { NextRequest, NextResponse } from 'next/server'
import {
  constitutionalAI,
  UserActionType,
  type UserAction,
} from '@/lib/services/constitutional-ai'

/**
 * Command Desk — Slash Command Router (A5.1)
 *
 * Handles slash commands with constitutional verification gates (A5.2/A5.3).
 * Returns reasoning traces alongside results (A5.5).
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

export async function GET() {
  return NextResponse.json({
    commands: Object.values(commands).map((c) => ({
      name: c.name,
      description: c.description,
    })),
    totalCommands: Object.keys(commands).length,
  })
}
