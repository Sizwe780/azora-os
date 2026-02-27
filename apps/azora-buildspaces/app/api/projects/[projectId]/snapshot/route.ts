import { NextRequest, NextResponse } from 'next/server'
import { getFileSystemSnapshot } from '@/lib/agents/persistence'

export async function GET(
  _req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const snapshot = await getFileSystemSnapshot(params.projectId)
    if (!snapshot) {
      return NextResponse.json({ files: [], updatedAt: null }, { status: 200 })
    }
    return NextResponse.json(snapshot, { status: 200 })
  } catch (error) {
    console.error('[snapshot] failed to load', error)
    return NextResponse.json({ error: 'Failed to load snapshot' }, { status: 500 })
  }
}