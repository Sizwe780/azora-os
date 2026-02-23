import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface GitStatus {
  branch: string
  hasChanges: boolean
  stagedFiles: string[]
  unstagedFiles: string[]
}

// GET /api/projects/[projectId]/git/status
export async function GET(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  // SECURITY: Require authentication
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  try {
    const { projectId } = await params
    // In a real app, we'd look up the project path from DB using projectId
    // For now, we assume the current working directory is the project root
    const projectPath = process.cwd()

    try {
      const { stdout } = await execAsync('git status --porcelain', { cwd: projectPath })
      const { stdout: branchOut } = await execAsync('git branch --show-current', { cwd: projectPath })

      const lines = stdout.split('\n').filter(Boolean)
      const stagedFiles: string[] = []
      const unstagedFiles: string[] = []

      for (const line of lines) {
        const code = line.substring(0, 2)
        const file = line.substring(3)
        if (code === 'M ' || code === 'A ') stagedFiles.push(file)
        else if (code === ' M' || code === '??') unstagedFiles.push(file)
      }

      const status: GitStatus = {
        branch: branchOut.trim(),
        hasChanges: lines.length > 0,
        stagedFiles,
        unstagedFiles,
      }

      return NextResponse.json(status)
    } catch (e) {
      // Fallback if not a git repo
      return NextResponse.json({
        branch: 'main',
        hasChanges: false,
        stagedFiles: [],
        unstagedFiles: []
      })
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch git status' },
      { status: 500 }
    )
  }
}
