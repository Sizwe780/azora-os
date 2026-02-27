import React from 'react'
import { renderToString } from 'react-dom/server'

// we'll require the component inside each test so we can manipulate mocks freely
// (particularly for the sync-timestamp case)


describe('ReasoningTrace component', () => {
  it('shows a ghost loader when store contains pending action', () => {
    const ReasoningTrace = require('@/components/shared/ReasoningTrace').default
    const now = new Date().toISOString()
    const html = renderToString(
      <ReasoningTrace
        skeleton="message"
        initialSteps={[{ id: '1', type: 'action', text: 'Starting something', timestamp: now }]}
      />
    )
    expect(html).toContain('bg-zinc-700')
  })

  it('hides loader once observation is present', () => {
    const ReasoningTrace = require('@/components/shared/ReasoningTrace').default
    const now = new Date().toISOString()
    const html = renderToString(
      <ReasoningTrace
        skeleton="code"
        initialSteps={[
          { id: '1', type: 'action', text: 'Starting something', timestamp: now },
          { id: '1', type: 'observation', text: 'done', timestamp: now },
        ]}
      />
    )
    expect(html).not.toContain('bg-zinc-700')
  })

  it('displays a last-synced timestamp when override is provided', () => {
    const now = '2026-02-26T15:00:00.000Z'
    const ReasoningTrace = require('@/components/shared/ReasoningTrace').default
    const html = renderToString(
      <ReasoningTrace
        skeleton="code"
        initialSteps={[]}
        lastSyncedOverride={now}
      />
    )
    // SSR should include the green dot since showSync initializes true
    expect(html).toContain('bg-green-400')
  })
})
