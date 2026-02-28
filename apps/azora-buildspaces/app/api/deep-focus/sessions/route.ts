import { NextRequest, NextResponse } from 'next/server'

/**
 * Deep Focus — Session History & Management
 * GET/POST /api/deep-focus/sessions
 *
 * Manages focus session records: list past sessions, retrieve stats,
 * tag sessions with projects/labels.
 *
 * Industry parity: Toggl Track, RescueTime session log
 */

interface FocusSession {
  id: string
  userId: string
  mode: string
  duration: number
  completed: boolean
  startedAt: string
  endedAt: string
  distractions: number
  project?: string
  tags: string[]
  notes?: string
}

// In-memory session history
const sessionHistory = new Map<string, FocusSession[]>()

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId') || 'default'
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50', 10)
  const project = req.nextUrl.searchParams.get('project')

  let sessions = sessionHistory.get(userId) || []

  if (project) {
    sessions = sessions.filter((s) => s.project === project)
  }

  // Sort by most recent first
  const sorted = [...sessions].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  )

  const limited = sorted.slice(0, limit)

  // Calculate aggregate stats
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0)
  const completedSessions = sessions.filter((s) => s.completed).length
  const completionRate =
    sessions.length > 0 ? Math.round((completedSessions / sessions.length) * 100) : 0

  // Project breakdown
  const projectMap = new Map<string, number>()
  sessions.forEach((s) => {
    const p = s.project || 'untagged'
    projectMap.set(p, (projectMap.get(p) || 0) + s.duration)
  })

  return NextResponse.json({
    sessions: limited,
    stats: {
      totalSessions: sessions.length,
      totalMinutes,
      completedSessions,
      completionRate,
      avgDuration: sessions.length > 0 ? Math.round(totalMinutes / sessions.length) : 0,
      avgDistractions:
        sessions.length > 0
          ? +(sessions.reduce((s, se) => s + se.distractions, 0) / sessions.length).toFixed(1)
          : 0,
    },
    projects: Array.from(projectMap.entries()).map(([name, minutes]) => ({
      name,
      minutes,
    })),
  })
}

export async function POST(req: NextRequest) {
  try {
    const { userId = 'default', session: sessionData } = await req.json()

    if (!sessionData) {
      return NextResponse.json({ error: 'Session data is required' }, { status: 400 })
    }

    const session: FocusSession = {
      id: `fs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId,
      mode: sessionData.mode || 'pomodoro',
      duration: sessionData.duration || 25,
      completed: sessionData.completed !== false,
      startedAt: sessionData.startedAt || new Date().toISOString(),
      endedAt: sessionData.endedAt || new Date().toISOString(),
      distractions: sessionData.distractions || 0,
      project: sessionData.project,
      tags: sessionData.tags || [],
      notes: sessionData.notes,
    }

    const sessions = sessionHistory.get(userId) || []
    sessions.push(session)
    sessionHistory.set(userId, sessions)

    return NextResponse.json({ success: true, session })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
