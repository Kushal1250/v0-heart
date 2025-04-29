"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RefreshCw, Home, AlertTriangle, Database } from "lucide-react"

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const errorCode = searchParams.get("code")
  const [errorDetails, setErrorDetails] = useState<string>("")

  useEffect(() => {
    // Check database connection on component mount
    const checkDbConnection = async () => {
      try {
        const res = await fetch("/api/health-check")
        const data = await res.json()

        if (!data.database.connected) {
          setErrorDetails(
            data.database.error ||
              "No database connection string was provided. Please check your environment variables.",
          )
        }
      } catch (error) {
        setErrorDetails("Failed to check database connection status.")
      }
    }

    checkDbConnection()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600 dark:text-red-400">
            <AlertTriangle className="mr-2 h-6 w-6" />
            Something went wrong
          </CardTitle>
          <CardDescription>We apologize for the inconvenience. An unexpected error has occurred.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4 bg-red-50 dark:bg-red-900/20">
            <Database className="h-4 w-4" />
            <AlertTitle>Error Details</AlertTitle>
            <AlertDescription className="font-mono text-sm">
              {errorDetails ||
                "No database connection string was provided to `neon()`. Perhaps an environment variable has not been set?"}
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Try the following:</p>
            <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>Refresh the page</li>
              <li>Clear your browser cache</li>
              <li>Check your internet connection</li>
              <li>Verify that your environment variables are correctly set</li>
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
