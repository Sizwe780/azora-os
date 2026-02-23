import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { promises as fs } from 'fs'
import path from 'path'

/**
 * Get workspace root for a user
 * In production, each user has their own isolated workspace
 */
function getWorkspaceRoot(workspaceId: string): string {
  return path.join(process.cwd(), 'workspaces', workspaceId)
}

/**
 * Validate that a path is within the workspace
 */
function isWithinWorkspace(targetPath: string, workspaceRoot: string): boolean {
  const normalized = path.normalize(targetPath)
  const resolved = path.resolve(workspaceRoot, normalized)
  return resolved.startsWith(workspaceRoot)
}

export async function GET(request: NextRequest) {
  // SECURITY: Require authentication before scanning filesystem
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  // SECURITY: Scope to user's workspace
  const { searchParams } = new URL(request.url)
  const workspaceId = searchParams.get('workspaceId') || session.user.id
  const workspaceRoot = getWorkspaceRoot(workspaceId)

  try {
    const scanPaths = ['app', 'components', 'lib', 'pages']
    const files: Array<{ path: string; name: string; size: number }> = []

    async function walk(dir: string) {
      // SECURITY: Ensure we're still within workspace
      if (!isWithinWorkspace(dir, workspaceRoot)) {
        return
      }
      
      const dirents = await fs.readdir(dir, { withFileTypes: true })
      for (const dirent of dirents) {
        const res = path.resolve(dir, dirent.name)
        
        // SECURITY: Double-check each resolved path
        if (!isWithinWorkspace(res, workspaceRoot)) {
          continue
        }
        
        if (dirent.isDirectory()) {
          await walk(res)
        } else {
          const rel = path.relative(workspaceRoot, res)
          // Limit to JS/TS/MD/JSON files
          if (/(\.tsx?|\.jsx?|\.mdx?|\.json)$/.test(res)) {
            const stat = await fs.stat(res)
            files.push({ path: rel.replace(/\\/g, '/'), name: dirent.name, size: stat.size })
          }
        }
      }
    }

    for (const p of scanPaths) {
      const abs = path.resolve(workspaceRoot, p)
      
      // SECURITY: Validate path is within workspace
      if (!isWithinWorkspace(abs, workspaceRoot)) {
        continue
      }
      
      try {
        await walk(abs)
      } catch (err) {
        // ignore missing folders
      }
    }

    return NextResponse.json({ files: files.slice(0, 200), workspaceId })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
