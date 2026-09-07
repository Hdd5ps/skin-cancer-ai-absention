export class AnalyticsService {
  private static initialized = false
  private static eventQueue: Array<{ name: string; props?: Record<string, unknown> }> = []

  static initialize(): void {
    this.initialized = true
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()
      if (event) this.track(event.name, event.props)
    }
  }

  static track(event: string, props?: Record<string, unknown>): void {
    if (!this.initialized) {
      this.eventQueue.push({ name: event, props })
      return
    }
    console.debug('[analytics]', event, props ?? {})
  }

  static logEvent(event: string, props?: Record<string, unknown>): void {
    this.track(event, props)
  }

  static logScreenView(screenName: string): void {
    this.track(AnalyticsEvents.SCREEN_VIEW, { screen_name: screenName })
  }

  static logError(error: Error, context?: Record<string, unknown>): void {
    this.track(AnalyticsEvents.ANALYSIS_FAILED, { message: error.message, ...context })
  }

  static setUserProperty(property: string, value: string): void { this.track('user_property', { property, value }) }
  static setUserId(userId: string): void { this.track('user_id_set', { user_id: userId }) }
}

// Specific event types for the app
export const AnalyticsEvents = {
  SCREEN_VIEW: 'screen_view',
  // Camera events
  CAMERA_OPENED: 'camera_opened',
  CAMERA_PERMISSION_GRANTED: 'camera_permission_granted',
  CAMERA_PERMISSION_DENIED: 'camera_permission_denied',
  PHOTO_CAPTURED: 'photo_captured',
  PHOTO_UPLOADED: 'photo_uploaded',
  CAMERA_SWITCHED: 'camera_switched',
  FLASH_TOGGLED: 'flash_toggled',

  // Analysis events
  ANALYSIS_STARTED: 'analysis_started',
  ANALYSIS_COMPLETED: 'analysis_completed',
  ANALYSIS_FAILED: 'analysis_failed',
  BLUR_DETECTED: 'blur_detected',
  LOW_CONFIDENCE: 'low_confidence',
  RESULT_RECEIVED: 'result_received',

  // Navigation events
  SCREEN_HOME: 'screen_home',
  SCREEN_CAMERA: 'screen_camera',
  SCREEN_RESULTS: 'screen_results',
  SCREEN_HISTORY: 'screen_history',

  // Error events
  API_ERROR: 'api_error',
  CAMERA_ERROR: 'camera_error',
  NETWORK_ERROR: 'network_error',
}
