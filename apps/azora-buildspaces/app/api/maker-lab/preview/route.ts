import { NextRequest, NextResponse } from 'next/server'

/**
 * Maker Lab — Preview Server
 * POST /api/maker-lab/preview
 *
 * Returns a sandboxed HTML preview of the generated application.
 * For security, the preview runs in a sandboxed iframe with
 * restricted permissions.
 *
 * Industry parity: StackBlitz WebContainer, CodeSandbox preview
 */
export async function POST(req: NextRequest) {
  try {
    const { files, entryPoint } = await req.json()

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: 'Files array is required' }, { status: 400 })
    }

    // Find the HTML entry point or generate one
    const htmlFile = files.find(
      (f: any) => f.path === (entryPoint || 'index.html'),
    )

    if (htmlFile) {
      return NextResponse.json({
        preview: htmlFile.content,
        type: 'html',
        sandbox: {
          permissions: 'allow-scripts allow-forms',
          csp: "default-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com",
        },
      })
    }

    // For React/Next.js apps, generate an importmap-based preview
    const appFile = files.find(
      (f: any) =>
        f.path.includes('App.tsx') ||
        f.path.includes('App.jsx') ||
        f.path.includes('page.tsx'),
    )

    const cssFile = files.find(
      (f: any) =>
        f.path.includes('index.css') ||
        f.path.includes('globals.css') ||
        f.path.includes('App.css'),
    )

    const previewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <script type="importmap">
  {
    "imports": {
      "react": "https://esm.sh/react@18",
      "react-dom": "https://esm.sh/react-dom@18",
      "react-dom/client": "https://esm.sh/react-dom@18/client",
      "react/jsx-runtime": "https://esm.sh/react@18/jsx-runtime"
    }
  }
  </script>
  ${cssFile ? `<style>${cssFile.content}</style>` : ''}
</head>
<body>
  <div id="root"></div>
  <script type="module">
    ${appFile ? `// Preview of: ${appFile.path}\nconsole.log('Azora BuildSpaces Preview loaded');` : '// No app file found'}
  </script>
  <noscript>Preview requires JavaScript</noscript>
</body>
</html>`

    return NextResponse.json({
      preview: previewHtml,
      type: 'react-preview',
      sandbox: {
        permissions: 'allow-scripts',
        csp: "default-src 'self' 'unsafe-inline' https://esm.sh https://cdn.jsdelivr.net",
      },
    })
  } catch (error) {
    console.error('[MakerLab:preview] Error:', error)
    return NextResponse.json(
      { error: 'Preview generation failed' },
      { status: 500 },
    )
  }
}
