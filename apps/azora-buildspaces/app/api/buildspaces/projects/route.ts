import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

import { listProjects, createProject } from '@/lib/storage'

export async function GET() {
  try {
    // Prefer Prisma when configured and available; otherwise fallback to file storage
    try {
      const { PRISMA_AVAILABLE } = await import('@/lib/db')
      if (PRISMA_AVAILABLE) {
        const projects = await prisma.buildSpaceProject.findMany({ orderBy: { createdAt: 'desc' } })
        return NextResponse.json({ projects })
      }
    } catch (_) {
      // continue to file storage fallback
    }

    const projects = await listProjects()
    return NextResponse.json({ projects })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
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
