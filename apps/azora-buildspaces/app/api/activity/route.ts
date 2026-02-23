/**
 * Cross-Room API — Room interconnection, activity feed, and analytics
 * 
 * This endpoint powers the cross-room activity feed that shows
 * what's happening across all rooms. Industry leaders (Linear, Notion, Figma)
 * all have activity feeds — this is ours.
 * 
 * Constitutional Compliance:
 * - Ubuntu Philosophy: Transparency across all rooms
 * - Collective Benefit: Everyone sees the community's progress
 */

import { NextRequest, NextResponse } from 'next/server'

// In-memory activity store
let activities: {
  id: string
  room: string
  action: string
  description: string
  timestamp: string
  userId?: string
  metadata?: Record<string, any>
}[] = []

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const room = searchParams.get('room')
  const limit = parseInt(searchParams.get('limit') || '50')

  let filtered = activities
  if (room) {
    filtered = activities.filter((a) => a.room === room)
  }

  // Sort by most recent
  filtered = filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit)

  // Room analytics
  const roomCounts = activities.reduce((acc, a) => {
    acc[a.room] = (acc[a.room] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Activity heatmap (last 24 hours by hour)
  const now = Date.now()
  const heatmap = Array.from({ length: 24 }, (_, hour) => {
    const start = now - (23 - hour) * 3600000
    const end = start + 3600000
    return {
      hour,
      count: activities.filter((a) => {
        const t = new Date(a.timestamp).getTime()
        return t >= start && t < end
      }).length,
    }
  })

  return NextResponse.json({
    activities: filtered,
    totalActivities: activities.length,
    roomAnalytics: roomCounts,
    heatmap,
    mostActiveRoom: Object.entries(roomCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null,
  })
}

export async function POST(request: NextRequest) {
  try {
    const { room, action, description, metadata } = await request.json()

    const activity = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      room,
      action,
      description,
      timestamp: new Date().toISOString(),
      metadata,
    }

    activities.push(activity)

    // Keep last 1000 activities
    if (activities.length > 1000) {
      activities = activities.slice(-1000)
    }

    return NextResponse.json({ success: true, activity })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
