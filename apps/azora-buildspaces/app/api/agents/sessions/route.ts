import { NextResponse } from 'next/server'
import { listExecutionSessions } from '@/lib/agents/persistence'

const serialize = (record: any) => {
  const updatedAt = record?.updatedAt?.toDate
    ? record.updatedAt.toDate().toISOString()
    : record.updatedAt
  return {
    id: record.id,
    projectId: record.projectId,
    status: record.status,
    lastStep: record.lastStep,
    lastStepType: record.lastStepType,
    updatedAt,
  }
}

export async function GET() {
  try {
    const sessions = await listExecutionSessions(12)
    return NextResponse.json({ sessions: sessions.map(serialize) })
  } catch (error) {
    console.error('[agents/sessions] failed to list', error)
    return NextResponse.json({ sessions: [] }, { status: 200 })
  }
}