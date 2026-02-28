import { NextRequest, NextResponse } from 'next/server'

/**
 * Maker Lab — Project Export
 * POST /api/maker-lab/export
 *
 * Exports a generated project as a downloadable zip or opens it
 * in StackBlitz / CodeSandbox. Returns the project structure
 * ready for external tooling.
 *
 * Industry parity: StackBlitz export, CodeSandbox export
 */
export async function POST(req: NextRequest) {
  try {
    const { files, projectName, target } = await req.json()

    if (!files || !Array.isArray(files)) {
      return NextResponse.json({ error: 'Files array is required' }, { status: 400 })
    }

    const name = projectName || 'azora-project'

    if (target === 'stackblitz') {
      // Generate StackBlitz open URL
      const project = {
        title: name,
        template: 'node',
        files: Object.fromEntries(
          files.map((f: any) => [f.path, f.content]),
        ),
      }

      return NextResponse.json({
        target: 'stackblitz',
        url: `https://stackblitz.com/edit/${name}`,
        project,
        openMethod: 'POST_TO_STACKBLITZ_API',
      })
    }

    if (target === 'codesandbox') {
      // Generate CodeSandbox parameters
      const csFiles = Object.fromEntries(
        files.map((f: any) => [f.path, { content: f.content }]),
      )

      return NextResponse.json({
        target: 'codesandbox',
        parameters: { files: csFiles },
        openMethod: 'POST_TO_CODESANDBOX_DEFINE_API',
      })
    }

    // Default: return file manifest for zip download
    return NextResponse.json({
      target: 'download',
      projectName: name,
      files: files.map((f: any) => ({
        path: f.path,
        content: f.content,
        size: new TextEncoder().encode(f.content).length,
      })),
      totalFiles: files.length,
      totalSize: files.reduce(
        (sum: number, f: any) => sum + new TextEncoder().encode(f.content).length,
        0,
      ),
    })
  } catch (error) {
    console.error('[MakerLab:export] Error:', error)
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 },
    )
  }
}
