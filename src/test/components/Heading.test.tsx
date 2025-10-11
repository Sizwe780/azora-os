import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Heading } from '../../components/azora/atoms/Heading'

describe('Heading', () => {
  it('renders h1 tag with level 1', () => {
    render(<Heading level={1}>Test Heading</Heading>)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Test Heading')
  })

  it('renders h2 tag with level 2', () => {
    render(<Heading level={2}>Test Heading</Heading>)
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Test Heading')
  })

  it('renders h3 tag with level 3', () => {
    render(<Heading level={3}>Test Heading</Heading>)
    const heading = screen.getByRole('heading', { level: 3 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Test Heading')
  })

  it('applies custom className', () => {
    render(<Heading level={1} className="custom-class">Test Heading</Heading>)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveClass('custom-class')
  })
})