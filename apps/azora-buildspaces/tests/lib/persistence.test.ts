import { describe, it, expect, jest } from '@jest/globals'

// we will mock firebase-admin
jest.mock('firebase-admin', () => {
  const FieldValue = { arrayUnion: jest.fn((x) => x) }
  const Timestamp = { fromDate: (d: Date) => d }
  const orchestrations: Record<string, any> = {}
  const projectFiles: Record<string, { meta: any; files: Record<string, any> }> = {}

  // the firestore export is both a callable function and has static props
  const firestore = jest.fn(() => {
    return {
      collection: jest.fn((name: string) => ({
        doc: jest.fn((id: string) => {
          if (name === 'buildspaces_orchestrations') {
            orchestrations[id] = orchestrations[id] || { id }
            return {
              set: jest.fn((u, o) => {
                const rec = orchestrations[id]
                if (u.trace) {
                  rec.trace = rec.trace || []
                  rec.trace.push(u.trace)
                }
                const { trace, ...rest } = u
                Object.assign(rec, rest)
                return Promise.resolve()
              }),
              get: jest.fn(() => Promise.resolve({ exists: true, data: () => orchestrations[id] })),
            }
          }

          if (name === 'buildspaces_project_files') {
            projectFiles[id] = projectFiles[id] || { meta: {}, files: {} }
            return {
              set: jest.fn((u, o) => {
                Object.assign(projectFiles[id].meta, u)
                return Promise.resolve()
              }),
              get: jest.fn(() => Promise.resolve({ exists: true, data: () => projectFiles[id].meta })),
              collection: jest.fn((sub: string) => ({
                doc: jest.fn((fileId: string) => ({
                  set: jest.fn((u, o) => {
                    projectFiles[id].files[fileId] = { ...projectFiles[id].files[fileId], ...u }
                    return Promise.resolve()
                  }),
                  get: jest.fn(() => Promise.resolve({ exists: true, data: () => projectFiles[id].files[fileId] })),
                })),
                get: jest.fn(() => Promise.resolve({
                  docs: Object.entries(projectFiles[id].files).map(([key, value]) => ({
                    id: key,
                    data: () => value,
                  })),
                })),
              })),
            }
          }

          return {
            set: jest.fn(() => Promise.resolve()),
            get: jest.fn(() => Promise.resolve({ exists: false, data: () => ({}) })),
          }
        }),
        orderBy: jest.fn(() => ({
          limit: jest.fn(() => ({
            get: jest.fn(() => Promise.resolve({ docs: [] }))
          }))
        })),
      })),
      FieldValue,
      Timestamp,
      batch: jest.fn(() => {
        const batch = {
          set: (ref: any, data: any, options: any) => {
            if (ref?.set) {
              ref.set(data, options)
            }
            return batch
          },
          commit: jest.fn(() => Promise.resolve()),
        }
        return batch
      }),
    }
  })
  firestore.FieldValue = FieldValue
  firestore.Timestamp = Timestamp

  return {
    apps: [{ name: '[DEFAULT]' }],
    initializeApp: jest.fn(),
    credential: { cert: jest.fn() },
    firestore,
  }
})

import { syncTraceToFirestore, loadExecutionState, syncFileToFirestore, getFileSystemSnapshot, syncFileSystemSnapshot, flushPendingWrites } from '@/lib/agents/persistence'

describe('persistence helpers', () => {
  it('syncTraceToFirestore and loadExecutionState work together', async () => {
    const step = { timestamp: new Date().toISOString(), type: 'thought', content: 'hi', metadata: { tokensUsed: 0, model: '' } }
    await syncTraceToFirestore('exec1', step, 'running', 0)
    const rec = await loadExecutionState('exec1')
    expect(rec).not.toBeNull()
    expect(rec?.status).toBe('running')
    expect(rec?.trace[0].content).toBe('hi')
  })

  it('syncFileToFirestore persists a single file', async () => {
    await syncFileToFirestore('proj1', '/src/app.ts', 'hello')
    await flushPendingWrites('proj1') // Flush debounced writes for test
    const snapshot = await getFileSystemSnapshot('proj1')
    expect(snapshot).not.toBeNull()
    expect(snapshot?.files.length).toBe(1)
    expect(snapshot?.files[0].path).toBe('/src/app.ts')
    expect(snapshot?.files[0].content).toBe('hello')
  })

  it('syncFileSystemSnapshot persists multiple files', async () => {
    await syncFileSystemSnapshot('proj2', [
      { path: '/src/index.ts', content: 'a' },
      { path: '/src/utils.ts', content: 'b' },
    ])
    const snapshot = await getFileSystemSnapshot('proj2')
    expect(snapshot?.files.length).toBe(2)
  })
})
