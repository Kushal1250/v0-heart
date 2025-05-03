"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RefreshCw, Home, AlertTriangle } from "lucide-react"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export function ClientErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      console.error("Client error caught:", event.error)
      setError(event.error)
      setHasError(true)
      // Prevent the default error handling
      event.preventDefault()
    }

    const rejectionHandler = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason)
      setError(new Error(event.reason?.message || "Unhandled Promise Rejection"))
      setHasError(true)
      // Prevent the default error handling
      event.preventDefault()
    }

    window.addEventListener("error", errorHandler)
    window.addEventListener("unhandledrejection", rejectionHandler)

    return () => {
      window.removeEventListener("error", errorHandler)
      window.removeEventListener("unhandledrejection", rejectionHandler)
    }
  }, [])

  if (hasError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="mr-2 h-6 w-6" />
              Something went wrong
            </CardTitle>
            <CardDescription>We apologize for the inconvenience. An unexpected error has occurred.</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error Details</AlertTitle>
              <AlertDescription className="font-mono text-sm">
                {error?.message || "An unknown error occurred"}
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">Try the following:</p>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                <li>Refresh the page</li>
                <li>Clear your browser cache</li>
                <li>Check your internet connection</li>
                <li>Try again later</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => (window.location.href = "/")}>
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
