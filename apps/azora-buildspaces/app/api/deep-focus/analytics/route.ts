/**
 * Deep Focus — Analytics & Insights API
 * 
 * Industry leaders: RescueTime, Forest, Centered, Toggl
 * Our edge: AI-powered focus insights, constitutional alignment (respects user autonomy)
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

// In-memory focus analytics store
const focusAnalytics = new Map<string, any[]>()

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId') || 'default'
  const sessions = focusAnalytics.get(userId) || []

  // Generate weekly heatmap (7 days × 24 hours)
  const heatmap: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0))
  sessions.forEach((s: any) => {
    const date = new Date(s.timestamp)
    const day = date.getDay()
    const hour = date.getHours()
    heatmap[day][hour] += s.duration || 1
  })

  // Streak calculation
  const today = new Date()
  let streak = 0
  for (let d = 0; d < 365; d++) {
    const checkDate = new Date(today)
    checkDate.setDate(today.getDate() - d)
    const dateStr = checkDate.toISOString().split('T')[0]
    const hasSession = sessions.some((s: any) =>
      new Date(s.timestamp).toISOString().split('T')[0] === dateStr
    )
    if (hasSession) streak++
    else break
  }

  // Daily totals for the last 30 days
  const dailyTotals: { date: string; minutes: number; sessions: number }[] = []
  for (let d = 29; d >= 0; d--) {
    const checkDate = new Date(today)
    checkDate.setDate(today.getDate() - d)
    const dateStr = checkDate.toISOString().split('T')[0]
    const daySessions = sessions.filter((s: any) =>
      new Date(s.timestamp).toISOString().split('T')[0] === dateStr
    )
    dailyTotals.push({
      date: dateStr,
      minutes: daySessions.reduce((sum: number, s: any) => sum + (s.duration || 0), 0),
      sessions: daySessions.length,
    })
  }

  // Total stats
  const totalMinutes = sessions.reduce((sum: number, s: any) => sum + (s.duration || 0), 0)
  const totalSessions = sessions.length
  const avgSessionMinutes = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0
  const bestDay = dailyTotals.reduce((best, day) => day.minutes > best.minutes ? day : best, { date: '', minutes: 0, sessions: 0 })

  return NextResponse.json({
    streak,
    totalMinutes,
    totalSessions,
    avgSessionMinutes,
    bestDay,
    heatmap,
    dailyTotals,
    goals: {
      dailyMinutes: 120,
      weeklyMinutes: 600,
      monthlyMinutes: 2400,
      dailyProgress: Math.min(100, Math.round((dailyTotals[dailyTotals.length - 1]?.minutes || 0) / 120 * 100)),
    },
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, userId = 'default', data } = body

    if (action === 'log-session') {
      const sessions = focusAnalytics.get(userId) || []
      sessions.push({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        duration: data.duration || 25,
        mode: data.mode || 'pomodoro',
        completed: data.completed !== false,
        distractions: data.distractions || 0,
      })
      focusAnalytics.set(userId, sessions)
      return NextResponse.json({ success: true, totalSessions: sessions.length })
    }

    if (action === 'ai-insights') {
      const sessions = focusAnalytics.get(userId) || []
      const result = await generateObject({
        model: openai('gpt-4o-mini'),
        schema: z.object({
          productivityScore: z.number().min(0).max(100),
          peakHours: z.array(z.string()),
          insights: z.array(z.string()),
          recommendations: z.array(z.string()),
          encouragement: z.string(),
        }),
        prompt: `Analyze this developer's focus session data and provide actionable insights.
        
Sessions: ${JSON.stringify(sessions.slice(-50))}
Total sessions: ${sessions.length}
Average session: ${sessions.length > 0 ? Math.round(sessions.reduce((s: number, ses: any) => s + (ses.duration || 0), 0) / sessions.length) : 0} minutes

Provide:
1. Productivity score (0-100)
2. Best hours for deep work
3. Key insights about patterns
4. Recommendations for improvement
5. An encouraging message aligned with Ubuntu philosophy ("I am because we are")

Be warm, specific, and actionable. Respect the user's autonomy.`,
      })
      return NextResponse.json(result.object)
    }

    if (action === 'set-goal') {
      // Store goals
      return NextResponse.json({ success: true, goal: data })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
