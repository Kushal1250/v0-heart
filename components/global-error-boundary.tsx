"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RefreshCw, Home, AlertTriangle, FileCode } from "lucide-react"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export function GlobalErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [errorInfo, setErrorInfo] = useState<{ componentStack?: string; errorSource?: string }>({})

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Global error caught:", event.error)

      // Filter out non-critical errors
      if (
        event.message &&
        // Chrome extension errors
        (event.message.includes("extension") ||
          // Common third-party script errors
          event.message.includes("fbevents.js") ||
          event.message.includes("gtm.js") ||
          // False positives
          event.message.includes("ResizeObserver loop"))
      ) {
        // Don't trigger UI error for these errors
        return
      }

      setError(event.error || new Error(event.message))
      setErrorInfo({ errorSource: "window.error" })
      setHasError(true)

      // Try to send error to server
      try {
        fetch("/api/log-client-error", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: event.message,
            stack: event.error?.stack,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
          }),
        }).catch((e) => console.error("Failed to send error to server:", e))
      } catch (e) {
        // Silent fail
      }

      // Prevent the default error handling for better UX
      event.preventDefault()
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason)

      // Don't handle network errors from fetch as fatal UI errors
      if (
        event.reason instanceof Error &&
        event.reason.message &&
        (event.reason.message.includes("fetch") || event.reason.message.includes("network"))
      ) {
        // Log but don't crash UI
        console.warn("Network error detected, not crashing UI:", event.reason)
        return
      }

      setError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)))
      setErrorInfo({ errorSource: "unhandledRejection" })
      setHasError(true)

      // Prevent the default error handling
      event.preventDefault()
    }

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleUnhandledRejection)

    return () => {
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
    }
  }, [])

  // Function to check if browser features are available
  const checkBrowserFeatures = () => {
    try {
      // Test localStorage
      localStorage.setItem("test", "test")
      localStorage.removeItem("test")

      // Test sessionStorage
      sessionStorage.setItem("test", "test")
      sessionStorage.removeItem("test")

      // Test if fetch is available
      if (!window.fetch) {
        return false
      }

      return true
    } catch (e) {
      return false
    }
  }

  // Reset error state
  const reset = () => {
    setHasError(false)
    setError(null)
    setErrorInfo({})
    window.location.reload()
  }

  // Go to error detector
  const goToErrorDetector = () => {
    window.location.href = "/error-detector"
  }

  if (hasError) {
    const canUseBrowserFeatures = checkBrowserFeatures()

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="mr-2 h-6 w-6" />
              Application Error
            </CardTitle>
            <CardDescription>We apologize for the inconvenience. An unexpected error has occurred.</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error Details</AlertTitle>
              <AlertDescription className="font-mono text-sm">
                {error?.message || "An unknown error occurred"}
                {errorInfo?.errorSource && (
                  <div className="mt-1 text-xs opacity-80">Source: {errorInfo.errorSource}</div>
                )}
              </AlertDescription>
            </Alert>

            {!canUseBrowserFeatures && (
              <Alert variant="warning" className="mb-4">
                <AlertTitle>Browser Compatibility Issue</AlertTitle>
                <AlertDescription>
                  This application requires features that may be disabled in your browser settings (like cookies,
                  localStorage, or JavaScript).
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <p className="text-sm text-gray-600">Try the following:</p>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                <li>Clear your browser cache and cookies</li>
                <li>Disable browser extensions</li>
                <li>Try a different browser</li>
                <li>Check if JavaScript and cookies are enabled</li>
                <li>Try again in a few minutes</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => (window.location.href = "/")}>
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={goToErrorDetector}>
                <FileCode className="mr-2 h-4 w-4" />
                Diagnostics
              </Button>
              <Button onClick={reset}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
