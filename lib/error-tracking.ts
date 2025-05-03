/**
 * Error tracking utility for client-side errors
 */
export function initErrorTracking() {
  if (typeof window !== "undefined") {
    // Only run on client side
    const originalConsoleError = console.error

    // Override console.error to provide more context
    console.error = (...args) => {
      // Call original console.error
      originalConsoleError.apply(console, args)

      // Log additional debugging info
      const errorInfo = {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        error:
          args[0] instanceof Error
            ? {
                message: args[0].message,
                stack: args[0].stack,
                name: args[0].name,
              }
            : args[0],
      }

      // You could send this to your backend or a logging service
      // For now, just log it to console in a structured way
      originalConsoleError.call(console, "Detailed error info:", errorInfo)
    }

    // Global error handler
    window.addEventListener("error", (event) => {
      console.error("Global error caught:", event.error)
    })

    // Unhandled promise rejection handler
    window.addEventListener("unhandledrejection", (event) => {
      console.error("Unhandled promise rejection:", event.reason)
    })
  }
}
