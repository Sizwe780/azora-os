import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Card } from '../../components/azora/atoms/Card'

describe('Card', () => {
  it('renders children correctly', () => {
    render(<Card>Test Content</Card>)
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders title when provided', () => {
    render(<Card title="Test Title">Test Content</Card>)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('does not render title when not provided', () => {
    render(<Card>Test Content</Card>)
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Card className="custom-class">Test Content</Card>)
    const card = screen.getByText('Test Content').closest('section')
    expect(card).toHaveClass('custom-class')
  })

  it('has default styling classes', () => {
    render(<Card>Test Content</Card>)
    const card = screen.getByText('Test Content').closest('section')
    expect(card).toHaveClass('rounded-xl', 'bg-white/5', 'border', 'border-white/10', 'shadow', 'p-4', 'space-y-3')
  })
})