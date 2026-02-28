import { NextRequest, NextResponse } from 'next/server'

/**
 * Deep Focus — Pomodoro Timer API (Forest/Centered parity)
 * POST /api/deep-focus/timer
 *
 * Manages focus timer state: start, pause, resume, complete.
 * Supports Pomodoro (25/5), Deep Work (90/20), Sprint (15/5),
 * and custom durations.
 *
 * Industry parity: Forest, Centered, Toggl Timer
 */

interface TimerState {
  id: string
  userId: string
  mode: 'pomodoro' | 'deep-work' | 'sprint' | 'custom'
  status: 'running' | 'paused' | 'completed' | 'cancelled'
  focusMinutes: number
  breakMinutes: number
  startedAt: string
  pausedAt?: string
  completedAt?: string
  elapsed: number
  sessionsCompleted: number
  distractions: number
}

const PRESETS: Record<string, { focus: number; break: number }> = {
  pomodoro: { focus: 25, break: 5 },
  'deep-work': { focus: 90, break: 20 },
  sprint: { focus: 15, break: 5 },
}

// In-memory timer store (keyed by userId)
const activeTimers = new Map<string, TimerState>()

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId') || 'default'
  const timer = activeTimers.get(userId)

  if (!timer) {
    return NextResponse.json({ active: false, timer: null })
  }

  // Calculate real elapsed time
  if (timer.status === 'running') {
    const now = Date.now()
    const started = new Date(timer.startedAt).getTime()
    timer.elapsed = Math.floor((now - started) / 1000)
  }

  return NextResponse.json({
    active: timer.status === 'running' || timer.status === 'paused',
    timer,
    remaining: Math.max(0, timer.focusMinutes * 60 - timer.elapsed),
  })
}

export async function POST(req: NextRequest) {
  try {
    const { action, userId = 'default', mode, focusMinutes, breakMinutes } = await req.json()

    if (action === 'start') {
      const preset = PRESETS[mode || 'pomodoro'] || PRESETS.pomodoro
      const timer: TimerState = {
        id: `timer_${Date.now()}`,
        userId,
        mode: mode || 'pomodoro',
        status: 'running',
        focusMinutes: focusMinutes || preset.focus,
        breakMinutes: breakMinutes || preset.break,
        startedAt: new Date().toISOString(),
        elapsed: 0,
        sessionsCompleted: 0,
        distractions: 0,
      }
      activeTimers.set(userId, timer)
      return NextResponse.json({ success: true, timer })
    }

    const timer = activeTimers.get(userId)
    if (!timer) {
      return NextResponse.json({ error: 'No active timer' }, { status: 404 })
    }

    if (action === 'pause') {
      timer.status = 'paused'
      timer.pausedAt = new Date().toISOString()
      return NextResponse.json({ success: true, timer })
    }

    if (action === 'resume') {
      timer.status = 'running'
      timer.pausedAt = undefined
      return NextResponse.json({ success: true, timer })
    }

    if (action === 'complete') {
      timer.status = 'completed'
      timer.completedAt = new Date().toISOString()
      timer.sessionsCompleted += 1
      return NextResponse.json({ success: true, timer })
    }

    if (action === 'cancel') {
      timer.status = 'cancelled'
      activeTimers.delete(userId)
      return NextResponse.json({ success: true, message: 'Timer cancelled' })
    }

    if (action === 'distraction') {
      timer.distractions += 1
      return NextResponse.json({ success: true, distractions: timer.distractions })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
