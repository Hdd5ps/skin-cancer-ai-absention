import { test, expect } from '@playwright/test'

test.describe('Camera Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should navigate to camera screen', async ({ page }) => {
    await page.click('button:has-text("②")')
    await expect(page.locator('text=Capture Mode')).toBeVisible()
  })

  test('should handle camera permission request', async ({ page, context }) => {
    // Grant camera permission
    await context.grantPermissions(['camera'])

    await page.click('button:has-text("②")')
    await expect(page.locator('text=Capture Mode')).toBeVisible()

    // Check if camera stream is initialized
    const videoElement = page.locator('video')
    await expect(videoElement).toBeVisible()
  })

  test('should handle back navigation', async ({ page }) => {
    await page.click('button:has-text("②")')
    await page.click('button:has-text("①")')
    await expect(page.locator('text=Skin Cancer AI')).toBeVisible()
  })

  test('should show permission denied state when camera access is blocked', async ({ page, context }) => {
    // Deny camera permission
    await context.clearPermissions()
    await page.click('button:has-text("②")')

    // Wait for permission error state
    await expect(page.locator('text=Camera access denied')).toBeVisible({ timeout: 5000 })
  })
})

test.describe('App Navigation', () => {
  test('should navigate between all screens', async ({ page }) => {
    await page.goto('/')

    // Test navigation to each screen
    const screens = ['①', '②', '③', '④', '⑤', '⑥']
    for (const screen of screens) {
      await page.click(`button:has-text("${screen}")`)
      await page.waitForTimeout(500) // Small delay for screen transition
    }
  })

  test('should maintain app dimensions on mobile viewport', async ({ page }) => {
    await page.goto('/')
    await page.setViewportSize({ width: 390, height: 844 })

    const appContainer = page.locator('.bg-white')
    const box = await appContainer.boundingBox()
    expect(box?.width).toBe(390)
    expect(box?.height).toBe(844)
  })
})
