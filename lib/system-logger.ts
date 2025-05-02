/**
 * System Logger Utility
 *
 * A centralized logging utility for the application that handles different log levels
 * and provides consistent logging across the application.
 */

type LogLevel = "debug" | "info" | "warn" | "error"

interface LogOptions {
  module?: string
  data?: Record<string, any>
  timestamp?: boolean
}

class SystemLogger {
  private isProduction: boolean

  constructor() {
    this.isProduction = process.env.NODE_ENV === "production"
  }

  /**
   * Log a debug message (only in development)
   */
  debug(message: string, options: LogOptions = {}): void {
    if (!this.isProduction) {
      this.log("debug", message, options)
    }
  }

  /**
   * Log an informational message
   */
  info(message: string, options: LogOptions = {}): void {
    this.log("info", message, options)
  }

  /**
   * Log a warning message
   */
  warn(message: string, options: LogOptions = {}): void {
    this.log("warn", message, options)
  }

  /**
   * Log an error message
   */
  error(message: string | Error, options: LogOptions = {}): void {
    if (message instanceof Error) {
      this.log("error", message.message, {
        ...options,
        data: {
          ...(options.data || {}),
          stack: message.stack,
          name: message.name,
        },
      })
    } else {
      this.log("error", message, options)
    }
  }

  /**
   * Log a message with the specified level
   */
  private log(level: LogLevel, message: string, options: LogOptions = {}): void {
    const { module, data, timestamp = true } = options

    const logData: Record<string, any> = {
      level,
      message,
      ...(module ? { module } : {}),
      ...(data ? { data } : {}),
      ...(timestamp ? { timestamp: new Date().toISOString() } : {}),
    }

    // In production, we might want to send logs to a service
    if (this.isProduction) {
      // Here we could integrate with a logging service
      // For now, we'll just use console
      this.consoleLog(level, logData)

      // Store critical logs in database if needed
      // if (level === "error") {
      //   this.persistLog(logData).catch((err) => {
      //     console.error("Failed to persist log:", err)
      //   })
      // }
    } else {
      // In development, just use console with formatting
      this.consoleLog(level, logData)
    }
  }

  /**
   * Format and output log to console
   */
  private consoleLog(level: LogLevel, data: Record<string, any>): void {
    const { message, module, timestamp } = data

    let formattedMessage = ""
    if (timestamp) {
      formattedMessage += `[${new Date(timestamp).toLocaleTimeString()}] `
    }
    if (module) {
      formattedMessage += `[${module}] `
    }
    formattedMessage += message

    switch (level) {
      case "debug":
        console.debug(formattedMessage, data.data || "")
        break
      case "info":
        console.info(formattedMessage, data.data || "")
        break
      case "warn":
        console.warn(formattedMessage, data.data || "")
        break
      case "error":
        console.error(formattedMessage, data.data || "")
        break
    }
  }

  /**
   * Persist critical logs to database
   */
  private async persistLog(logData: Record<string, any>): Promise<void> {
    try {
      // This would be implemented to store logs in the database
      // For now, we'll just simulate it
      if (typeof window === "undefined") {
        // Server-side code to store logs
        // Example: await db.query('INSERT INTO system_logs ...')
      }
    } catch (error) {
      console.error("Error persisting log:", error)
    }
  }
}

// Export a singleton instance
const systemLogger = new SystemLogger()
export { systemLogger }
