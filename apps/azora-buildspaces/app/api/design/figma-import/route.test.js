// Test-friendly CommonJS version of figma-import route
function makeResponse(body, status = 200) {
  return { status, json: async () => body }
}

async function POST(req) {
  const FIGMA_TOKEN = process.env.FIGMA_TOKEN || ''
  if (!FIGMA_TOKEN) {
    return makeResponse({ error: 'Figma integration not configured. Set FIGMA_TOKEN in server env.' }, 501)
  }

  try {
    const body = await req.json()
    const url = body.url || ''
    const m = url.match(/file\/([A-Za-z0-9]+)(?:\/|$)/)
    const fileKey = m ? m[1] : null

    if (!fileKey) return makeResponse({ error: 'Invalid Figma file URL or key could not be extracted.' }, 400)

    const resp = await fetch(`https://api.figma.com/v1/files/${fileKey}`, { headers: { 'X-Figma-Token': FIGMA_TOKEN } })
    if (!resp.ok) {
      const txt = await resp.text()
      return makeResponse({ error: `Figma API error: ${txt}` }, resp.status)
    }

    const data = await resp.json()
    const frame = { id: fileKey, name: data.name || `figma-${fileKey}`, componentsCount: (data.document && data.document.children && data.document.children.length) || 0, raw: data }
    return makeResponse({ frame })
  } catch (err) {
    return makeResponse({ error: String(err) }, 500)
  }
}

module.exports = { POST }
