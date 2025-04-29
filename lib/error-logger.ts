/**
 * Error logging utilities
 */

// Generate a unique error ID
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Logs an error to the console and potentially to a monitoring service
 * @param context The context where the error occurred
 * @param error The error object
 * @param additionalData Any additional data to log
 */
export async function logError(context: string, error: unknown, additionalData?: Record<string, any>): Promise<void> {
  console.error(`ERROR in ${context}:`, error)

  if (additionalData) {
    console.error("Additional data:", additionalData)
  }

  // Here you would add calls to your error monitoring service
  // Like Sentry, LogRocket, etc.

  // Example: if (process.env.NODE_ENV === 'production') {
  //   sentryCapture(error, { extra: { context, ...additionalData } });
  // }
}

// Create a standardized error response
export async function createErrorResponse(
  context: string,
  error: unknown,
  metadata: Record<string, any> = {},
): Promise<{ success: false; message: string; errorId: string }> {
  const errorId = await logError(context, error, metadata)

  return {
    success: false,
    message: error instanceof Error ? error.message : "An unexpected error occurred",
    errorId,
  }
}
