import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />)
    expect(container).toBeInTheDocument()
  })

  it('renders home screen by default', () => {
    render(<App />)
    // Check if heading with skin text is rendered
    const heading = screen.getByRole('heading', { name: /skin/i })
    expect(heading).toBeInTheDocument()
  })

  it('has proper mobile structure', () => {
    const { container } = render(<App />)
    // Check if main container exists
    const appContainer = container.firstChild
    expect(appContainer).toBeInTheDocument()
  })
})
