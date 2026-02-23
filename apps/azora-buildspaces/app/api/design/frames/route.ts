import { NextResponse } from 'next/server'
import { prisma, PRISMA_AVAILABLE } from '@/lib/database/client'

export async function POST(req: Request) {
  if (!PRISMA_AVAILABLE) {
    return NextResponse.json({ error: 'Database not configured. Cannot persist frames.' }, { status: 501 })
  }

  try {
    const body = await req.json()

    // Try to detect authenticated user server-side (optional)
    let sessionUserId: string | null = null
    try {
      // dynamic import so tests or environments without next-auth don't crash
      const { getServerSession } = await import('next-auth/next')
      // import authOptions if available in monorepo packages
      // @ts-ignore
      const maybeAuth = await import('packages/lib/auth').catch(() => null)
      const authOptions = maybeAuth?.authOptions
      if (typeof getServerSession === 'function') {
        const session: any = authOptions ? await getServerSession(authOptions) : await getServerSession()
        sessionUserId = session?.user?.id ?? null
      }
    } catch (e) {
      // ignore - auth not configured in this environment
    }

    const created = await prisma.figmaFrame.create({
      data: {
        figmaId: body.id || body.figmaId || null,
        name: body.name || 'Imported Frame',
        width: typeof body.width === 'number' ? body.width : null,
        height: typeof body.height === 'number' ? body.height : null,
        components: body.components || null,
        raw: body.raw || body.rawData || {},
        importedBy: body.importedBy || sessionUserId || null,
      }
    })

    return NextResponse.json({ frame: created })
  } catch (err) {
    console.error('Failed to save figma frame', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function GET() {
  if (!PRISMA_AVAILABLE) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 501 })
  }

  try {
    const frames = await prisma.figmaFrame.findMany({ orderBy: { importedAt: 'desc' }, take: 50 })
    return NextResponse.json({ frames })
  } catch (err) {
    console.error('Failed to list figma frames', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
