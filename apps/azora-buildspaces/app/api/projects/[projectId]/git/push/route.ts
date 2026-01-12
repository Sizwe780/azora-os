import { NextRequest, NextResponse } from 'next/server'

// POST /api/projects/[projectId]/git/push
export async function POST(request: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const projectId = params.projectId

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
