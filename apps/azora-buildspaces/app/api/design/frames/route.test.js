// Test-friendly CommonJS version of the frames route for Jest
function makeResponse(body, status = 200) {
  return { status, json: async () => body }
}

const path = '../../../lib/database/client'

function getDb() {
  try {
    return require(path)
  } catch (e) {
    // In some Jest environments the TS module may not be resolvable via require -
    // allow tests to inject a stub via globalThis.__TEST_DB__
    if (globalThis.__TEST_DB__) return globalThis.__TEST_DB__
    throw e
  }
}

async function POST(req) {
  const { PRISMA_AVAILABLE, prisma } = getDb()

  if (!PRISMA_AVAILABLE) {
    return makeResponse({ error: 'Database not configured. Cannot persist frames.' }, 501)
  }

  try {
    const body = await req.json()

    // Allow tests to inject a server session via globalThis.__TEST_SESSION__
    const sessionUserId = (globalThis.__TEST_SESSION__ && globalThis.__TEST_SESSION__.user && globalThis.__TEST_SESSION__.user.id) || null

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

    return makeResponse({ frame: created })
  } catch (err) {
    console.error('Failed to save figma frame', err)
    return makeResponse({ error: String(err) }, 500)
  }
}

async function GET() {
  const { PRISMA_AVAILABLE, prisma } = getDb()

  if (!PRISMA_AVAILABLE) {
    return makeResponse({ error: 'Database not configured.' }, 501)
  }

  try {
    const frames = await prisma.figmaFrame.findMany({ orderBy: { importedAt: 'desc' }, take: 50 })
    return makeResponse({ frames })
  } catch (err) {
    console.error('Failed to list figma frames', err)
    return makeResponse({ error: String(err) }, 500)
  }
}

module.exports = { POST, GET }
