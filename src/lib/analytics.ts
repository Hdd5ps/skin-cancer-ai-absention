// Simplified analytics service that works without Firebase configuration
// This can be extended with Firebase or other analytics services later

export class AnalyticsService {
  private static initialized = false
  private static eventQueue: Array<{ name: string; params?: Record<string, any> }> = []

  static async initialize() {
    try {
      // Initialize Firebase Analytics if available
      // For now, we'll log to console and queue events
      this.initialized = true
      console.log('Analytics service initialized')
      
      // Process queued events
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift()
        if (event) {
          this.logEvent(event.name, event.params)
        }
      }
    } catch (error) {
      console.error('Failed to initialize analytics:', error)
    }
  }

  static async logEvent(name: string, params?: Record<string, any>) {
    if (!this.initialized) {
      this.eventQueue.push({ name, params })
      return
    }

    try {
      console.log('Analytics Event:', name, params)
      // Here you would integrate with Firebase Analytics or other service
      // await FirebaseAnalytics.logEvent({ name, params })
    } catch (error) {
      console.error('Failed to log event:', error)
    }
  }

  static async logScreenView(screenName: string) {
    await this.logEvent('screen_view', { screen_name: screenName })
  }

  static async logError(error: Error, context?: Record<string, any>) {
    console.error('Analytics Error:', error.message, context)
    // Here you would integrate with Firebase Crashlytics or other service
    // await FirebaseCrashlytics.recordError({ message: error.message, stacktrace: error.stack })
  }

  static async setUserProperty(property: string, value: string) {
    console.log('User Property:', property, value)
    // await FirebaseAnalytics.setUserProperty({ key: property, value })
  }

  static async setUserId(userId: string) {
    console.log('User ID:', userId)
    // await FirebaseAnalytics.setUserId({ userId })
  }
}

// Specific event types for the app
export const AnalyticsEvents = {
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
