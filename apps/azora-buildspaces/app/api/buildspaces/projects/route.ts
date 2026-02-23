import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/database/client'

import { listProjects, createProject } from '@/lib/storage'

/**
 * BuildSpaces Projects API
 * 
 * SECURITY: Requires authentication for all operations
 */

export async function GET() {
  try {
    // SECURITY: Require authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const projects = await listProjects()
    return NextResponse.json({ projects })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    // SECURITY: Require authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id
    const body = await req.json()
    const { name, slug, ownerId, description } = body
    if (!name || !slug || !ownerId) {
      return NextResponse.json({ error: 'name, slug, and ownerId are required' }, { status: 400 })
    }

    try {
      const project = await prisma.buildSpaceProject.create({ data: { name, slug, ownerId, description } })
      return NextResponse.json({ project }, { status: 201 })
    } catch (err) {
      const project = await createProject({ name, slug, ownerId, description })
      return NextResponse.json({ project }, { status: 201 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
