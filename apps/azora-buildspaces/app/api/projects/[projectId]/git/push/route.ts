import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// POST /api/projects/[projectId]/git/push
export async function POST(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    // SECURITY: Require authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { projectId } = await params

    // Perform git push (may fail if no remote is configured)
    const projectPath = process.cwd()
    try {
      const { stdout, stderr } = await execAsync('git push --all --no-verify', { cwd: projectPath })
      return NextResponse.json({ success: true, stdout, stderr, message: 'Push attempted' })
    } catch (e: any) {
      // Return error details to the caller
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to push changes' },
      { status: 500 }
    )
  }
}
