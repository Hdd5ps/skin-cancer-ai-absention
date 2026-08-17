import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('renders home screen by default', () => {
    render(<App />)
    expect(screen.getByText(/skin cancer ai/i)).toBeInTheDocument()
  })

  it('renders with proper mobile dimensions', () => {
    const { container } = render(<App />)
    const appContainer = container.querySelector('.bg-white')
    expect(appContainer).toHaveStyle({ width: '390px', height: '844px' })
  })

  it('displays status bar with time', () => {
    render(<App />)
    expect(screen.getByText('9:41')).toBeInTheDocument()
  })

  it('shows navigation buttons for development', () => {
    render(<App />)
    const navButtons = screen.getAllByRole('button')
    expect(navButtons.length).toBeGreaterThan(0)
  })
})
