/** @jest-environment node */

// Patch next/server
const ns = require('next/server')
ns.NextResponse = { json: (body: any, init?: any) => ({ body, status: init?.status ?? 200 }) }

const {
  GET: viewersGet,
  POST: viewersPost,
} = require('@/app/api/theater/viewers/route')

const {
  GET: chatGet,
  POST: chatPost,
} = require('@/app/api/theater/chat/route')

const {
  GET: reactionGet,
  POST: reactionPost,
} = require('@/app/api/theater/reaction/route')

const {
  GET: pollGet,
  POST: pollPost,
} = require('@/app/api/theater/poll/route')

function makeUrl(params = '') {
  return { url: `http://localhost/api/theater${params}` }
}

function makeReq(body: unknown, params = '') {
  return { json: async () => body, url: `http://localhost/api/theater${params}` }
}

// ── Viewers ──────────────────────────────────────────────────────────────────

describe('Theater Viewers', () => {
  it('GET returns empty viewer list for new session', async () => {
    const res = await viewersGet(makeUrl('?sessionId=sess-viewers-new') as any)
    const { body } = res as any
    expect(body.count).toBe(0)
    expect(Array.isArray(body.viewers)).toBe(true)
  })

  it('POST join adds a viewer', async () => {
    const res = await viewersPost(
      makeReq({ sessionId: 'sess-v1', viewerId: 'u1', name: 'Alice', action: 'join' }) as any,
    )
    const { body } = res as any
    expect(body.success).toBe(true)
    expect(body.count).toBe(1)
  })

  it('POST leave removes a viewer', async () => {
    await viewersPost(makeReq({ sessionId: 'sess-v2', viewerId: 'u1', name: 'Bob', action: 'join' }) as any)
    const res = await viewersPost(makeReq({ sessionId: 'sess-v2', viewerId: 'u1', action: 'leave' }) as any)
    const { body } = res as any
    expect(body.count).toBe(0)
  })

  it('POST returns 400 when viewerId is missing', async () => {
    const res = await viewersPost(makeReq({ sessionId: 'sess-v3' }) as any)
    const { status } = res as any
    expect(status).toBe(400)
  })
})

// ── Chat ─────────────────────────────────────────────────────────────────────

describe('Theater Chat', () => {
  it('GET returns empty messages for new session', async () => {
    const res = await chatGet(makeUrl('?sessionId=sess-chat-new') as any)
    const { body } = res as any
    expect(body.total).toBe(0)
  })

  it('POST creates a chat message', async () => {
    const res = await chatPost(
      makeReq({ sessionId: 'sess-c1', authorId: 'u1', authorName: 'Alice', content: 'Hello!' }) as any,
    )
    const { body } = res as any
    expect(body.success).toBe(true)
    expect(body.message.content).toBe('Hello!')
  })

  it('POST returns 400 when content is missing', async () => {
    const res = await chatPost(makeReq({ sessionId: 's', authorId: 'u1', content: '  ' }) as any)
    const { status } = res as any
    expect(status).toBe(400)
  })
})

// ── Reactions ────────────────────────────────────────────────────────────────

describe('Theater Reactions', () => {
  it('GET returns zero counts for new session', async () => {
    const res = await reactionGet(makeUrl('?sessionId=sess-r-new') as any)
    const { body } = res as any
    expect(Array.isArray(body.reactions)).toBe(true)
    expect(body.reactions.every((r: any) => r.count === 0)).toBe(true)
  })

  it('POST records a reaction and increments count', async () => {
    await reactionPost(makeReq({ sessionId: 'sess-r1', emoji: '👍' }) as any)
    const res = await reactionGet(makeUrl('?sessionId=sess-r1') as any)
    const { body } = res as any
    const thumbs = body.reactions.find((r: any) => r.emoji === '👍')
    expect(thumbs.count).toBe(1)
  })

  it('POST returns 400 for disallowed emoji', async () => {
    const res = await reactionPost(makeReq({ sessionId: 'sess-r2', emoji: '🍕' }) as any)
    const { status } = res as any
    expect(status).toBe(400)
  })
})

// ── Polls ─────────────────────────────────────────────────────────────────────

describe('Theater Polls', () => {
  it('POST create returns a new poll', async () => {
    const res = await pollPost(
      makeReq({ sessionId: 'sess-p1', action: 'create', question: 'Which feature first?', options: ['A', 'B', 'C'] }) as any,
    )
    const { body } = res as any
    expect(body.success).toBe(true)
    expect(body.poll.question).toBe('Which feature first?')
    expect(body.poll.options).toHaveLength(3)
  })

  it('POST vote records a vote', async () => {
    const createRes = await pollPost(
      makeReq({ sessionId: 'sess-p2', action: 'create', question: 'Tabs or spaces?', options: ['Tabs', 'Spaces'] }) as any,
    )
    const poll = (createRes as any).body.poll

    const voteRes = await pollPost(
      makeReq({ sessionId: 'sess-p2', action: 'vote', pollId: poll.id, optionId: poll.options[0].id, voterId: 'voter1' }) as any,
    )
    const { body } = voteRes as any
    expect(body.success).toBe(true)
    expect(body.poll.options[0].votes).toBe(1)
  })

  it('POST returns 400 when creating poll with fewer than 2 options', async () => {
    const res = await pollPost(
      makeReq({ sessionId: 'sess-p3', action: 'create', question: 'Q?', options: ['Only one'] }) as any,
    )
    const { status } = res as any
    expect(status).toBe(400)
  })
})
