import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CameraScreen from '../screens/CameraScreen'
import type { Screen } from '../App'

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
    // Mock mediaDevices for web camera
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn() }],
        }),
      },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders camera screen correctly', () => {
    render(<CameraScreen navigate={mockNavigate} />)
    expect(screen.getByText('Capture Mode')).toBeInTheDocument()
  })

  it('requests camera permission on mount', async () => {
    render(<CameraScreen navigate={mockNavigate} />)
    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
    })
  })

  it('handles permission denial gracefully', async () => {
    vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValueOnce(
      new Error('Permission denied')
    )

    render(<CameraScreen navigate={mockNavigate} />)

    await waitFor(() => {
      expect(screen.getByText(/camera access denied/i)).toBeInTheDocument()
    })
  })

  it('navigates back to home when back button is clicked', () => {
    render(<CameraScreen navigate={mockNavigate} />)
    const backButton = screen.getByRole('button')
    fireEvent.click(backButton)
    expect(mockNavigate).toHaveBeenCalledWith('home')
  })

  it('shows file input for gallery upload on web', () => {
    render(<CameraScreen navigate={mockNavigate} />)
    const fileInput = document.querySelector('input[type="file"]')
    expect(fileInput).toBeInTheDocument()
  })
})
