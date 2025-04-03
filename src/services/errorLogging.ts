/**
 * Error Logging Service
 * 
 * A simple service for logging errors in the application.
 * This can be expanded to send errors to an external service like Sentry.
 */

/**
 * Log an error with optional metadata
 * @param message Error message
 * @param metadata Additional information about the error
 */
export function logError(message: string, metadata?: Record<string, any>): void {
  console.error(`[ERROR] ${message}`, metadata);
  
  // TODO: In production, send errors to an external service
  // if (import.meta.env.PROD) {
  //   // Example: Send to Sentry or other error tracking service
  // }
}

/**
 * Log a warning with optional metadata
 * @param message Warning message
 * @param metadata Additional information about the warning
 */
export function logWarning(message: string, metadata?: Record<string, any>): void {
  console.warn(`[WARNING] ${message}`, metadata);
}

/**
 * Log an informational message with optional metadata
 * @param message Info message
 * @param metadata Additional information
 */
export function logInfo(message: string, metadata?: Record<string, any>): void {
  if (import.meta.env.DEV) {
    console.info(`[INFO] ${message}`, metadata);
  }
}