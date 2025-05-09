/**
 * Enhanced error logging utilities
 */
import { db } from "./db"

// Error severity levels
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// Generate a unique error ID
export function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// Interface for error log entry
export interface ErrorLogEntry {
  id: string
  timestamp: Date
  context: string
  message: string
  stack?: string
  severity: ErrorSeverity
  userId?: string
  metadata?: Record<string, any>
}

/**
 * Logs an error to the console and potentially to a monitoring service
 * @param context The context in which the error occurred
 * @param error The error object
 * @param metadata Additional metadata about the error
 */
export async function logError(context: string, error: any, metadata?: any): Promise<void> {
  console.error(`[${context}] Error:`, error)

  if (metadata) {
    console.error(`[${context}] Metadata:`, metadata)
  }

  // In a real application, you would send this to a monitoring service like Sentry
  // For now, we'll just log it to the console
}

/**
 * Store error log in database
 */
async function storeErrorLog(logEntry: ErrorLogEntry): Promise<void> {
  try {
    // Check if error_logs table exists
    const tableExists = await db`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'error_logs'
      );
    `

    // Create table if it doesn't exist
    if (!tableExists[0]?.exists) {
      await db`
        CREATE TABLE error_logs (
          id TEXT PRIMARY KEY,
          timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
          context TEXT NOT NULL,
          message TEXT NOT NULL,
          stack TEXT,
          severity TEXT NOT NULL,
          user_id TEXT,
          metadata JSONB,
          resolved BOOLEAN DEFAULT false,
          resolution_notes TEXT,
          resolution_timestamp TIMESTAMP WITH TIME ZONE
        )
      `
    }

    // Insert error log
    await db`
      INSERT INTO error_logs (id, timestamp, context, message, stack, severity, user_id, metadata)
      VALUES (
        ${logEntry.id},
        ${logEntry.timestamp},
        ${logEntry.context},
        ${logEntry.message},
        ${logEntry.stack || null},
        ${logEntry.severity},
        ${logEntry.userId || null},
        ${JSON.stringify(logEntry.metadata || {})}
      )
    `
  } catch (error) {
    console.error("Failed to store error log:", error)
    // Don't throw - this is a best-effort operation
  }
}

/**
 * Create a standardized error response
 */
export async function createErrorResponse(
  context: string,
  error: unknown,
  userId?: string,
  metadata: Record<string, any> = {},
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
): Promise<{ success: false; message: string; errorId: string }> {
  const errorId = generateErrorId()
  await storeErrorLog({
    id: errorId,
    timestamp: new Date(),
    context,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    severity,
    userId,
    metadata,
  })
  await logError(context, error, metadata)

  return {
    success: false,
    message: error instanceof Error ? error.message : "An unexpected error occurred",
    errorId,
  }
}

/**
 * Get recent error logs
 */
export async function getRecentErrorLogs(limit = 100): Promise<ErrorLogEntry[]> {
  try {
    const logs = await db`
      SELECT * FROM error_logs
      ORDER BY timestamp DESC
      LIMIT ${limit}
    `

    return logs.map((log) => ({
      ...log,
      metadata: log.metadata || {},
    }))
  } catch (error) {
    console.error("Failed to retrieve error logs:", error)
    return []
  }
}

/**
 * Mark an error as resolved
 */
export async function resolveError(errorId: string, notes: string): Promise<boolean> {
  try {
    await db`
      UPDATE error_logs
      SET resolved = true,
          resolution_notes = ${notes},
          resolution_timestamp = NOW()
      WHERE id = ${errorId}
    `
    return true
  } catch (error) {
    console.error("Failed to mark error as resolved:", error)
    return false
  }
}
