// zustand occasionally throws in certain Jest environments (EVAL of mock
// transforms, or when its default export isn't a function). wrap the import
// so the rest of the code can fall back to a no-op store during tests.
let createStore: typeof create
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  createStore = require('zustand').default
  if (typeof createStore !== 'function') {
    throw new Error('zustand.create not a function')
  }
} catch (err) {
  console.warn('[use-citadel-store] zustand unavailable, using stubbed store')
  createStore = <T>(init: any) => {
    // return a hook that provides an empty state and no-op setters
    const state = init(() => {}, () => ({}))
    return () => state as T
  }
}

export interface TraceStep {
  id: string
  type: 'thought' | 'action' | 'observation' | 'result'
  text: string
  timestamp: string
}

interface CitadelState {
  activeTrace: TraceStep[]
  currentProjectContext: {
    activeFile?: string
    openFiles: string[]
    activeRoom?: string
  }
  lastSynced?: string
  addStep(step: TraceStep): void
  clearTrace(): void
  setProjectContext(ctx: Partial<CitadelState['currentProjectContext']>): void
  markSynced(timestamp?: string): void
}

export const useCitadelStore = createStore<CitadelState>((set, get) => ({
  activeTrace: [],
  currentProjectContext: { openFiles: [] },
  lastSynced: undefined,
  addStep: (step) => {
    set((state) => ({ activeTrace: [...state.activeTrace, step] }))
  },
  clearTrace: () => set({ activeTrace: [] }),
  setProjectContext: (ctx) => set((state) => ({ currentProjectContext: { ...state.currentProjectContext, ...ctx } })),
  markSynced: (timestamp) => set({ lastSynced: timestamp || new Date().toISOString() }),
}))
