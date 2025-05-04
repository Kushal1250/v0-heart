// Advanced error tracking utility

type ErrorData = {
  message: string
  stack?: string
  componentStack?: string
  timestamp: number
  url: string
  userAgent: string
}

class ErrorTracker {
  private static errors: ErrorData[] = []
  private static initialized = false

  static init() {
    if (this.initialized) return
    this.initialized = true

    if (typeof window !== "undefined") {
      // Capture unhandled errors
      window.addEventListener("error", (event) => {
        this.captureError({
          message: event.message,
          stack: event.error?.stack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
        })
      })

      // Capture unhandled promise rejections
      window.addEventListener("unhandledrejection", (event) => {
        const error = event.reason
        this.captureError({
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
        })
      })

      // Listen for hydration errors specifically
      const originalConsoleError = console.error
      console.error = (...args) => {
        if (
          args[0] &&
          typeof args[0] === "string" &&
          (args[0].includes("Hydration") || args[0].includes("hydration"))
        ) {
          this.captureError({
            message: `Hydration Error: ${args.join(" ")}`,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
          })
        }
        originalConsoleError.apply(console, args)
      }
    }
  }

  static captureError(errorData: ErrorData) {
    this.errors.push(errorData)

    // Limit stored errors to prevent memory issues
    if (this.errors.length > 10) {
      this.errors.shift()
    }

    // Store in sessionStorage for persistence across page reloads
    try {
      sessionStorage.setItem("errorData", JSON.stringify(this.errors))
    } catch (e) {
      // Ignore storage errors
    }

    // You could send to a server endpoint here
    // this.sendToServer(errorData)
  }

  static getErrors() {
    try {
      const storedErrors = sessionStorage.getItem("errorData")
      if (storedErrors) {
        this.errors = JSON.parse(storedErrors)
      }
    } catch (e) {
      // Ignore parsing errors
    }

    return this.errors
  }

  static clearErrors() {
    this.errors = []
    try {
      sessionStorage.removeItem("errorData")
    } catch (e) {
      // Ignore storage errors
    }
  }
}

export default ErrorTracker
