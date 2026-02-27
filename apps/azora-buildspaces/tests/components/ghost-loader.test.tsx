import React from 'react'
import { renderToString } from 'react-dom/server'
import GhostLoader from '@/components/shared/GhostLoader'
describe('GhostLoader component', () => {
  it('renders a code-shaped skeleton when variant is code', () => {
    const html = renderToString(<GhostLoader variant="code" />)
    expect(html).toContain('bg-zinc-700')
  })

  it('renders a message-shaped skeleton when variant is message', () => {
    const html = renderToString(<GhostLoader variant="message" />)
    expect(html).toContain('bg-zinc-700')
    expect(html).toMatch(/w-3\/4/)
  })
})
