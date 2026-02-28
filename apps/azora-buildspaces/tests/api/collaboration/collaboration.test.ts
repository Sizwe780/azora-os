/** @jest-environment node */

/**
 * Tests for Collaboration API — Presence, Cursors, Conflict Resolution
 */

import { GET as presenceGET, POST as presencePOST } from '@/app/api/collaboration/presence/route'
import { GET as cursorsGET, POST as cursorsPOST } from '@/app/api/collaboration/cursors/route'
import { GET as conflictsGET, POST as conflictsPOST } from '@/app/api/collaboration/conflicts/route'

function makeGetRequest(path: string, params: Record<string, string> = {}) {
  const url = new URL(`http://localhost/api/collaboration/${path}`)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  return { nextUrl: url } as any
}

function makePostRequest(body: Record<string, unknown>) {
  return { json: () => Promise.resolve(body) } as any
}

describe('Collaboration Presence (/api/collaboration/presence)', () => {
  const roomId = `room_test_${Date.now()}`

  it('GET should return empty room initially', async () => {
    const res = await presenceGET(makeGetRequest('presence', { roomId }))
    const data = await res.json()
    expect(data.users).toEqual([])
    expect(data.count).toBe(0)
  })

  it('POST should register user presence', async () => {
    const res = await presencePOST(makePostRequest({
      roomId,
      userId: 'user-a',
      displayName: 'Alice',
      status: 'online',
    }))
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.presence.userId).toBe('user-a')
    expect(data.presence.color).toBeDefined()
    expect(data.roomUsers).toBe(1)
  })

  it('GET should return registered users', async () => {
    const res = await presenceGET(makeGetRequest('presence', { roomId }))
    const data = await res.json()
    expect(data.count).toBe(1)
    expect(data.users[0].userId).toBe('user-a')
  })

  it('POST should support multiple users in one room', async () => {
    await presencePOST(makePostRequest({ roomId, userId: 'user-b', displayName: 'Bob' }))
    const res = await presenceGET(makeGetRequest('presence', { roomId }))
    const data = await res.json()
    expect(data.count).toBe(2)
  })

  it('POST should require userId', async () => {
    const res = await presencePOST(makePostRequest({ roomId }))
    expect(res.status).toBe(400)
  })
})

describe('Collaboration Cursors (/api/collaboration/cursors)', () => {
  const fileId = `file_test_${Date.now()}`

  it('GET should require fileId', async () => {
    const res = await cursorsGET(makeGetRequest('cursors', {}))
    expect(res.status).toBe(400)
  })

  it('POST should register cursor position', async () => {
    const res = await cursorsPOST(makePostRequest({
      fileId,
      userId: 'user-a',
      cursor: { line: 10, column: 5 },
    }))
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.cursor.cursor).toEqual({ line: 10, column: 5 })
  })

  it('GET should return cursor positions', async () => {
    const res = await cursorsGET(makeGetRequest('cursors', { fileId }))
    const data = await res.json()
    expect(data.count).toBe(1)
    expect(data.cursors[0].userId).toBe('user-a')
  })

  it('POST should support selection ranges', async () => {
    const res = await cursorsPOST(makePostRequest({
      fileId,
      userId: 'user-b',
      cursor: { line: 5, column: 1 },
      selection: { startLine: 5, startColumn: 1, endLine: 8, endColumn: 20 },
      isTyping: true,
    }))
    const data = await res.json()
    expect(data.cursor.selection).toBeDefined()
    expect(data.cursor.isTyping).toBe(true)
  })

  it('POST should require fileId and userId', async () => {
    const res = await cursorsPOST(makePostRequest({ cursor: { line: 1, column: 1 } }))
    expect(res.status).toBe(400)
  })
})

describe('Collaboration Conflicts (/api/collaboration/conflicts)', () => {
  it('GET should return empty conflicts initially', async () => {
    const res = await conflictsGET(makeGetRequest('conflicts', { fileId: 'no-such-file' }))
    const data = await res.json()
    expect(data.conflicts).toEqual([])
    expect(data.total).toBe(0)
  })

  it('POST detect should identify a conflict', async () => {
    const res = await conflictsPOST(makePostRequest({
      action: 'detect',
      fileId: 'test-file.ts',
      baseVersion: 1,
      userA: { userId: 'alice', changes: 'line 10: const x = 1' },
      userB: { userId: 'bob', changes: 'line 10: const x = 2' },
    }))
    const data = await res.json()
    expect(data.conflict).toBe(true)
    expect(data.record).toBeDefined()
    expect(data.record.fileId).toBe('test-file.ts')
  })

  it('POST resolve should mark conflict as resolved', async () => {
    // First detect a conflict
    const detectRes = await conflictsPOST(makePostRequest({
      action: 'detect',
      fileId: 'resolve-test.ts',
      userA: { userId: 'a', changes: 'x' },
      userB: { userId: 'b', changes: 'y' },
    }))
    const detectData = await detectRes.json()
    const conflictId = detectData.record.id

    // Resolve it
    const res = await conflictsPOST(makePostRequest({
      action: 'resolve',
      conflictId,
      resolution: 'Merged both changes',
      resolvedBy: 'alice',
    }))
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.conflict.status).toBe('resolved')
    expect(data.conflict.resolvedBy).toBe('alice')
  })

  it('POST detect should require userA and userB', async () => {
    const res = await conflictsPOST(makePostRequest({
      action: 'detect',
      fileId: 'test.ts',
    }))
    expect(res.status).toBe(400)
  })

  it('POST resolve should return 404 for unknown conflict', async () => {
    const res = await conflictsPOST(makePostRequest({
      action: 'resolve',
      conflictId: 'nonexistent',
    }))
    expect(res.status).toBe(404)
  })
})
