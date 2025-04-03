/**
 * Initialize error logging service
 * This is a simplified version without external dependencies
 */
export const initErrorLogging = () => {
  // In a real application, you would initialize your error logging service here
  console.log('Error logging initialized');
};

/**
 * Log an error to the error tracking service
 * @param message - Error message or Error object
 * @param context - Additional context information
 */
export const logError = (message: string | Error, context?: Record<string, any>) => {
  if (message instanceof Error) {
    console.error('Error:', message);
    console.error('Context:', context);
  } else {
    console.error('Error:', message);
    console.error('Context:', context);
  }
  
  // In a production environment, you would send this to your error tracking service
};

/**
 * Log a message to the error tracking service
 * @param message - The message to log
 * @param level - The log level
 * @param context - Additional context information
 */
export const logMessage = (
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, any>
) => {
  console.log(`[${level.toUpperCase()}]`, message, context);
  
  // In a production environment, you would send this to your error tracking service
};

/**
 * Log an info-level message
 * @param message - The message to log
 * @param context - Additional context information
 */
export const logInfo = (
  message: string,
  context?: Record<string, any>
) => {
  logMessage(message, 'info', context);
};

/**
 * Set user information for error tracking
 * @param user - User information
 */
export const setUser = (user: { id: string; email?: string; username?: string }) => {
  console.log('User set:', user);
  
  // In a production environment, you would set the user in your error tracking service
};

/**
 * Clear user information from error tracking
 */
export const clearUser = () => {
  console.log('User cleared');
  
  // In a production environment, you would clear the user in your error tracking service
};