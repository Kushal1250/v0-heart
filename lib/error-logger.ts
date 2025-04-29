/**
 * Error logging utilities
 */

// Generate a unique error ID
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// Log an error and return an error ID
export async function logError(context: string, error: unknown, metadata: Record<string, any> = {}): Promise<string> {
  const errorId = generateErrorId()

  const errorInfo = {
    id: errorId,
    timestamp: new Date().toISOString(),
    context,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    metadata,
  }

  // In production, you might want to send this to a logging service
  console.error("ERROR:", JSON.stringify(errorInfo, null, 2))

  return errorId
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
