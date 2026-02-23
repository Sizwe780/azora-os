import { NextRequest, NextResponse } from 'next/server'
import { initializeKnowledgeEngine } from '@/lib/knowledge/indexer'
import { prisma } from '@/lib/database/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { rootPath = '/' } = body

    console.log(`[API] Starting indexing from ${rootPath}`)

    const stats = await initializeKnowledgeEngine(rootPath)

    // Save scan results to BuildSpaceProject for persistence
    try {
      const session = await getServerSession(authOptions)
      const ownerId = session?.user ? (session.user as any).id : 'anonymous'
      
      // Generate a cryptographically secure unique slug
      const randomId = crypto.randomBytes(8).toString('hex');
      const slug = `knowledge-scan-${Date.now()}-${randomId}`
      const projectName = `Knowledge Scan - ${new Date().toISOString()}`
      
      await prisma.buildSpaceProject.upsert({
        where: { slug },
        create: {
          name: projectName,
          slug,
          ownerId,
          description: `Indexed ${stats.totalFiles} files with ${stats.totalChunks} code chunks from ${rootPath}`,
        },
        update: {
          description: `Indexed ${stats.totalFiles} files with ${stats.totalChunks} code chunks from ${rootPath}`,
          updatedAt: new Date(),
        },
      })
    } catch (dbError) {
      console.error('[API] Failed to save scan results to database:', dbError)
      // Continue even if database save fails
    }

    return NextResponse.json({
      success: true,
      stats,
      message: `Indexed ${stats.totalFiles} files with ${stats.totalChunks} code chunks`
    })

  } catch (error) {
    console.error('[API] Indexing error:', error)
    return NextResponse.json(
      { error: 'Indexing failed', success: false },
      { status: 500 }
    )
  }
}
