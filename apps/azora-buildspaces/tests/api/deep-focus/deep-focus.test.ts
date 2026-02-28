/** @jest-environment node */

/**
 * Tests for Deep Focus Timer & Sessions API
 */

import { GET as timerGET, POST as timerPOST } from '@/app/api/deep-focus/timer/route'
import { GET as sessionsGET, POST as sessionsPOST } from '@/app/api/deep-focus/sessions/route'

function makeGetRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/deep-focus/timer')
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  return { nextUrl: url } as any
}

function makePostRequest(body: Record<string, unknown>) {
  return { json: () => Promise.resolve(body) } as any
}

describe('Deep Focus Timer (/api/deep-focus/timer)', () => {
  it('GET should return no active timer initially', async () => {
    const res = await timerGET(makeGetRequest({ userId: 'timer-test-1' }))
    const data = await res.json()
    expect(data.active).toBe(false)
    expect(data.timer).toBeNull()
  })

  it('POST start should create a pomodoro timer', async () => {
    const res = await timerPOST(makePostRequest({ action: 'start', userId: 'timer-test-2', mode: 'pomodoro' }))
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.timer.mode).toBe('pomodoro')
    expect(data.timer.status).toBe('running')
    expect(data.timer.focusMinutes).toBe(25)
    expect(data.timer.breakMinutes).toBe(5)
  })

  it('POST pause should pause the timer', async () => {
    await timerPOST(makePostRequest({ action: 'start', userId: 'timer-test-3' }))
    const res = await timerPOST(makePostRequest({ action: 'pause', userId: 'timer-test-3' }))
    const data = await res.json()
    expect(data.timer.status).toBe('paused')
  })

  it('POST resume should resume a paused timer', async () => {
    await timerPOST(makePostRequest({ action: 'start', userId: 'timer-test-4' }))
    await timerPOST(makePostRequest({ action: 'pause', userId: 'timer-test-4' }))
    const res = await timerPOST(makePostRequest({ action: 'resume', userId: 'timer-test-4' }))
    const data = await res.json()
    expect(data.timer.status).toBe('running')
  })

  it('POST complete should mark timer as completed', async () => {
    await timerPOST(makePostRequest({ action: 'start', userId: 'timer-test-5' }))
    const res = await timerPOST(makePostRequest({ action: 'complete', userId: 'timer-test-5' }))
    const data = await res.json()
    expect(data.timer.status).toBe('completed')
    expect(data.timer.sessionsCompleted).toBe(1)
  })

  it('POST cancel should remove the timer', async () => {
    await timerPOST(makePostRequest({ action: 'start', userId: 'timer-test-6' }))
    const res = await timerPOST(makePostRequest({ action: 'cancel', userId: 'timer-test-6' }))
    const data = await res.json()
    expect(data.success).toBe(true)
  })

  it('POST distraction should increment counter', async () => {
    await timerPOST(makePostRequest({ action: 'start', userId: 'timer-test-7' }))
    const res = await timerPOST(makePostRequest({ action: 'distraction', userId: 'timer-test-7' }))
    const data = await res.json()
    expect(data.distractions).toBe(1)
  })

  it('should support deep-work preset (90/20)', async () => {
    const res = await timerPOST(makePostRequest({ action: 'start', userId: 'timer-test-8', mode: 'deep-work' }))
    const data = await res.json()
    expect(data.timer.focusMinutes).toBe(90)
    expect(data.timer.breakMinutes).toBe(20)
  })

  it('should return 404 when no active timer for pause', async () => {
    const res = await timerPOST(makePostRequest({ action: 'pause', userId: 'no-timer-user-99' }))
    expect(res.status).toBe(404)
  })
})

describe('Deep Focus Sessions (/api/deep-focus/sessions)', () => {
  function makeSessionGet(params: Record<string, string> = {}) {
    const url = new URL('http://localhost/api/deep-focus/sessions')
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
    return { nextUrl: url } as any
  }

  it('GET should return empty sessions for new user', async () => {
    const res = await sessionsGET(makeSessionGet({ userId: 'session-new-user' }))
    const data = await res.json()
    expect(data.sessions).toEqual([])
    expect(data.stats.totalSessions).toBe(0)
  })

  it('POST should save a session', async () => {
    const res = await sessionsPOST(makePostRequest({
      userId: 'session-user-1',
      session: { mode: 'pomodoro', duration: 25, completed: true, project: 'azora' },
    }))
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.session.id).toBeDefined()
    expect(data.session.duration).toBe(25)
  })

  it('GET should return saved sessions with stats', async () => {
    // Save a couple sessions
    await sessionsPOST(makePostRequest({
      userId: 'session-user-2',
      session: { duration: 25, completed: true },
    }))
    await sessionsPOST(makePostRequest({
      userId: 'session-user-2',
      session: { duration: 50, completed: false },
    }))

    const res = await sessionsGET(makeSessionGet({ userId: 'session-user-2' }))
    const data = await res.json()
    expect(data.stats.totalSessions).toBe(2)
    expect(data.stats.totalMinutes).toBe(75)
    expect(data.stats.completionRate).toBe(50)
  })
})
