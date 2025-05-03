"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function InitializeDatabase() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    details?: string[]
  } | null>(null)

  const initializeDatabase = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/init-db", {
        method: "POST",
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: "Failed to initialize database",
        details: [error instanceof Error ? error.message : "Unknown error"],
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Initialize Database</CardTitle>
        <CardDescription>
          Set up the required database tables for the Heart Disease Predictor application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-gray-500">This will create all necessary tables if they don't exist:</p>
        <ul className="list-disc pl-5 text-sm text-gray-500 space-y-1 mb-4">
          <li>Users table</li>
          <li>Predictions table</li>
          <li>System settings table</li>
          <li>Verification codes table</li>
          <li>Password reset tokens table</li>
        </ul>

        {result && (
          <Alert className={`mt-4 ${result.success ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}`}>
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
            </div>
            <AlertDescription>{result.message}</AlertDescription>
            {result.details && result.details.length > 0 && (
              <ul className="mt-2 list-disc pl-5 text-sm">
                {result.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            )}
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={initializeDatabase} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Initializing...
            </>
          ) : (
            "Initialize Database"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
