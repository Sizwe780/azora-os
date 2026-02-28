const WebSocket = require('ws')
const http = require('http')
const Y = require('yjs')
const wss = new WebSocket.Server({ noServer: true })
const setupWSConnection = require('y-websocket/bin/utils').setupWSConnection
const LeveldbPersistence = require('y-leveldb').LeveldbPersistence

// Persistence setup
const persistenceDir = process.env.YPERSISTENCE || './y-leveldb'
const ldb = new LeveldbPersistence(persistenceDir)

// Set persistence on the utils module
const utils = require('y-websocket/bin/utils')
utils.setPersistence({
  bindState: async (docName, ydoc) => {
    const persistedYdoc = await ldb.getYDoc(docName)
    const newUpdates = Y.encodeStateAsUpdate(ydoc)
    ldb.storeUpdate(docName, newUpdates)
    Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc))
    ydoc.on('update', update => {
      ldb.storeUpdate(docName, update)
    })
  },
  writeState: async (docName, ydoc) => {
    await ldb.storeUpdate(docName, Y.encodeStateAsUpdate(ydoc))
  }
})

const port = process.env.PORT || 1234
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',')

const server = http.createServer((request, response) => {
  // Health check endpoint for k8s probes (A7.1)
  if (request.url === '/health' || request.url === '/healthz') {
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({
      status: 'healthy',
      service: 'y-websocket-server',
      connections: wss.clients.size,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }))
    return
  }

  // CORS preflight
  const origin = request.headers.origin
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin)
  }
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (request.method === 'OPTIONS') {
    response.writeHead(204)
    response.end()
    return
  }

  response.writeHead(200, { 'Content-Type': 'text/plain' })
  response.end('Azora Yjs WebSocket Server — running')
})

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, ws => {
    wss.emit('connection', ws, request)
  })
})

wss.on('connection', (ws, req) => {
  setupWSConnection(ws, req)
})

// Graceful shutdown
function shutdown() {
  console.log('Shutting down y-websocket server...')
  wss.clients.forEach(client => {
    client.close(1001, 'Server shutting down')
  })
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
  // Force exit after 10s
  setTimeout(() => process.exit(1), 10000)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

server.listen(port, () => {
  console.log('Azora Yjs WebSocket Server running on port ' + port)
  console.log('Persistence directory:', persistenceDir)
  console.log('Health check: http://localhost:' + port + '/health')
})
