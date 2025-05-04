"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export function EnhancedErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.log("Client error captured:", event.error)
      setError(event.error)
      setHasError(true)
      // Prevent the default error handling
      event.preventDefault()
    }

    window.addEventListener("error", handleError)

    return () => {
      window.removeEventListener("error", handleError)
    }
  }, [])

  if (hasError) {
    return (
      <div className="w-full h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Application Error</AlertTitle>
            <AlertDescription>
              <div className="mt-2">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Something went wrong. Please try refreshing the page or contact support if the issue persists.
                </p>
                {error && (
                  <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                    <p className="font-mono">{error.toString()}</p>
                    {error.stack && <pre className="mt-2 whitespace-pre-wrap">{error.stack}</pre>}
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
