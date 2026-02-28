import { NextRequest, NextResponse } from 'next/server'

/**
 * Notebook — Cell Management (Jupyter parity)
 * GET/POST/PUT/DELETE /api/notebook/cells
 *
 * Manages notebook cells: create, reorder, update, delete.
 * Supports code cells, markdown cells, and output cells.
 *
 * Industry parity: Jupyter Notebook, Google Colab, Observable
 */

interface NotebookCell {
  id: string
  type: 'code' | 'markdown' | 'output' | 'raw'
  source: string
  language: string
  outputs: CellOutput[]
  metadata: {
    collapsed: boolean
    scrolled: boolean
    executionCount?: number
    executionTime?: number
  }
  position: number
}

interface CellOutput {
  type: 'text' | 'html' | 'image' | 'error' | 'stream'
  content: string
  mimeType?: string
}

// In-memory notebook store (notebookId → cells)
const notebooks = new Map<string, NotebookCell[]>()

export async function GET(req: NextRequest) {
  const notebookId = req.nextUrl.searchParams.get('notebookId') || 'default'
  const cells = notebooks.get(notebookId) || []

  return NextResponse.json({
    notebookId,
    cells: cells.sort((a, b) => a.position - b.position),
    cellCount: cells.length,
    metadata: {
      language: 'typescript',
      kernelStatus: 'idle',
    },
  })
}

export async function POST(req: NextRequest) {
  try {
    const { notebookId = 'default', type, source, language, position } = await req.json()

    const cells = notebooks.get(notebookId) || []

    const cell: NotebookCell = {
      id: `cell_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: type || 'code',
      source: source || '',
      language: language || 'typescript',
      outputs: [],
      metadata: {
        collapsed: false,
        scrolled: false,
      },
      position: position ?? cells.length,
    }

    cells.push(cell)
    notebooks.set(notebookId, cells)

    return NextResponse.json({ success: true, cell })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { notebookId = 'default', cellId, source, type, metadata } = await req.json()

    if (!cellId) {
      return NextResponse.json({ error: 'cellId is required' }, { status: 400 })
    }

    const cells = notebooks.get(notebookId) || []
    const cell = cells.find((c) => c.id === cellId)

    if (!cell) {
      return NextResponse.json({ error: 'Cell not found' }, { status: 404 })
    }

    if (source !== undefined) cell.source = source
    if (type !== undefined) cell.type = type
    if (metadata) Object.assign(cell.metadata, metadata)

    return NextResponse.json({ success: true, cell })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { notebookId = 'default', cellId } = await req.json()

    if (!cellId) {
      return NextResponse.json({ error: 'cellId is required' }, { status: 400 })
    }

    const cells = notebooks.get(notebookId) || []
    const idx = cells.findIndex((c) => c.id === cellId)

    if (idx === -1) {
      return NextResponse.json({ error: 'Cell not found' }, { status: 404 })
    }

    cells.splice(idx, 1)
    // Reindex positions
    cells.forEach((c, i) => { c.position = i })

    return NextResponse.json({ success: true, remainingCells: cells.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
