import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// POST /api/projects/[projectId]/git/commit
export async function POST(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    // SECURITY: Require authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { projectId } = await params
    const { message } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid commit message' },
        { status: 400 }
      )
    }

    // Implement actual git commit using system git
    const projectPath = process.cwd()
    // Ensure git user is configured in this environment
    await execAsync('git config user.email "buildspaces@example.com"', { cwd: projectPath })
    await execAsync('git config user.name "BuildSpaces Test"', { cwd: projectPath })

    try {
      await execAsync('git add .', { cwd: projectPath })
      await execAsync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { cwd: projectPath })
      const { stdout: rev } = await execAsync('git rev-parse HEAD', { cwd: projectPath })
      return NextResponse.json({ success: true, commitHash: rev.trim(), message: 'Changes committed successfully' })
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to commit changes' },
      { status: 500 }
    )
  }
}
