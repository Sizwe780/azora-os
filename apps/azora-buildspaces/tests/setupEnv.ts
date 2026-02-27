// Shims that must run before any modules are imported by tests
import 'openai/shims/node'
import 'fake-indexeddb/auto'

// Provide a test DATABASE_URL so Prisma client initialization paths can run
// in unit tests. Uses a file SQLite DB in workspace (no DB server required).
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./.azora-test.db'

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nodeFetch = require('node-fetch')
  if (!globalThis.fetch) globalThis.fetch = nodeFetch
  if (!globalThis.Request && nodeFetch && nodeFetch.Request) globalThis.Request = nodeFetch.Request
} catch (e) {
  // node-fetch not installed; openai shims may provide the runtime
}

// Provide a very small safe fallback for `fetch` and `Request` so tests that
// only check presence of these APIs don't crash. If a real polyfill is
// available (node-fetch or openai shims), it will be used instead.
if (typeof globalThis.fetch === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  globalThis.fetch = async (_url: any, _opts?: any) => ({ ok: true, status: 200, json: async () => ({}), text: async () => '' } as any)
}

if (typeof (globalThis as any).Request === 'undefined') {
  // Minimal Request polyfill for test environment
  // Only provides identity; not a full Web Request implementation
  ;(globalThis as any).Request = class Request {
    constructor() {}
  }
}

if (typeof (globalThis as any).Response === 'undefined') {
  ;(globalThis as any).Response = class Response {
    body: any
    status: number
    constructor(body?: any, init?: any) { this.body = body; this.status = init?.status || 200 }
    async json() { return this.body }
    async text() { return String(this.body) }
  }
}
