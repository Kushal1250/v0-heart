"use client"

export function setupGlobalErrorHandlers() {
  if (typeof window !== "undefined") {
    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      console.error("Unhandled promise rejection:", event.reason)
      // Prevent the default handler from running
      event.preventDefault()
    })

    // Log all errors
    const originalConsoleError = console.error
    console.error = (...args) => {
      // Log to your analytics or monitoring service here if needed
      originalConsoleError(...args)
    }
  }
}
