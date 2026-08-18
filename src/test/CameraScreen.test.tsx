import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CameraScreen from '../screens/CameraScreen'

// Mock Capacitor
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn(() => false),
  },
}))

// Mock Camera
vi.mock('@capacitor/camera', () => ({
  Camera: {
    getPhoto: vi.fn(),
  },
  CameraResultType: {
    DataUrl: 'dataUrl',
  },
}))

// Mock scan history
vi.mock('../types/scanHistory', () => ({
  saveScan: vi.fn(),
}))

describe('CameraScreen', () => {
  const mockNavigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock navigator.mediaDevices
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: {
        getUserMedia: vi.fn(() => Promise.resolve({
          getTracks: () => [{ stop: vi.fn() }],
        })),
        enumerateDevices: vi.fn(() => Promise.resolve([])),
      },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders camera screen without crashing', () => {
    const { container } = render(<CameraScreen navigate={mockNavigate} />)
    expect(container).toBeInTheDocument()
  })

  it('renders capture mode text', () => {
    render(<CameraScreen navigate={mockNavigate} />)
    const captureText = screen.getByText(/capture/i)
    expect(captureText).toBeInTheDocument()
  })

  it('has navigation function available', () => {
    render(<CameraScreen navigate={mockNavigate} />)
    expect(mockNavigate).toBeDefined()
  })
})
