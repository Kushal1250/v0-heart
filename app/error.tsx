"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RefreshCw, Home, AlertTriangle, Bug } from "lucide-react"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console with more details
    console.error("Application error:", error)
    console.error("Error stack:", error.stack)

    // You could also send this to your error tracking service
    // sendToErrorTracking(error);
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
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
            <AlertTitle className="flex items-center">
              <Bug className="mr-2 h-4 w-4" /> Error Details
            </AlertTitle>
            <AlertDescription className="font-mono text-sm">
              {error.message || "An unknown error occurred"}
              {error.digest && <div className="mt-2 text-xs">Error ID: {error.digest}</div>}
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">Try the following:</p>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>Clear your browser cache and cookies</li>
              <li>Check your internet connection</li>
              <li>Disable browser extensions that might interfere</li>
              <li>Try a different browser</li>
              <li>If the problem persists, contact support</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
          <Button onClick={() => reset()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
