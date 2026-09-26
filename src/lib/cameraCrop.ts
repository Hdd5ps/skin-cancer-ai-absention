export interface CropRectangle {
  x: number
  y: number
  width: number
  height: number
}

export function getCameraCropRectangle(
  sourceWidth: number,
  sourceHeight: number,
  previewBounds: DOMRect,
  frameBounds: DOMRect | null,
): CropRectangle {
  if (!frameBounds || !previewBounds.width || !previewBounds.height) {
    return { x: 0, y: 0, width: sourceWidth, height: sourceHeight }
  }

  const scale = Math.max(previewBounds.width / sourceWidth, previewBounds.height / sourceHeight)
  const visibleWidth = previewBounds.width / scale
  const visibleHeight = previewBounds.height / scale
  const visibleX = (sourceWidth - visibleWidth) / 2
  const visibleY = (sourceHeight - visibleHeight) / 2
  const x = visibleX + (frameBounds.left - previewBounds.left) / scale
  const y = visibleY + (frameBounds.top - previewBounds.top) / scale
  const width = frameBounds.width / scale
  const height = frameBounds.height / scale

  const left = Math.max(0, Math.min(sourceWidth, x))
  const top = Math.max(0, Math.min(sourceHeight, y))
  const right = Math.max(left, Math.min(sourceWidth, x + width))
  const bottom = Math.max(top, Math.min(sourceHeight, y + height))

  return { x: left, y: top, width: right - left, height: bottom - top }
}