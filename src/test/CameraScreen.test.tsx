import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CameraScreen from '../screens/CameraScreen'
import { getCameraCropRectangle } from '../lib/cameraCrop'

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

  it('toggles and resizes the camera framing guide', () => {
    render(<CameraScreen navigate={mockNavigate} />)

    const frameToggle = screen.getByRole('button', { name: /frame on/i })
    const frameSize = screen.getByRole('slider', { name: /framing area size/i })
    expect(frameToggle).toHaveAttribute('aria-pressed', 'true')
    expect(frameSize).toHaveValue('240')

    fireEvent.change(frameSize, { target: { value: '288' } })
    expect(screen.getByText('288px')).toBeInTheDocument()

    fireEvent.click(frameToggle)
    expect(screen.getByRole('button', { name: /frame off/i })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.queryByRole('slider', { name: /framing area size/i })).not.toBeInTheDocument()
  })

  it('maps the centered square guide through an object-cover preview', () => {
    const previewBounds = new DOMRect(0, 0, 390, 520)
    const frameBounds = new DOMRect(75, 140, 240, 240)

    const crop = getCameraCropRectangle(1280, 720, previewBounds, frameBounds)

    expect(crop.x).toBeCloseTo(474.15, 0)
    expect(crop.y).toBeCloseTo(193.85, 0)
    expect(crop.width).toBeCloseTo(crop.height)
  })

  it('uses the full camera image when framing is disabled', () => {
    const crop = getCameraCropRectangle(1280, 720, new DOMRect(0, 0, 390, 520), null)

    expect(crop).toEqual({ x: 0, y: 0, width: 1280, height: 720 })
  })
})
