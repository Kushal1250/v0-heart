"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

export default function DatabaseDiagnosticsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const runMigration = async (migrationName: string) => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch(`/api/admin/migrate/${migrationName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Database Diagnostics</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Verification Codes Table</CardTitle>
          <CardDescription>Fix issues with the verification_codes table structure</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This will check and fix the verification_codes table structure to ensure it can store email addresses and
            phone numbers.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => runMigration("fix-verification-codes")} disabled={isLoading}>
            {isLoading ? "Running..." : "Fix Verification Codes Table"}
          </Button>
        </CardFooter>
      </Card>

      <Separator className="my-6" />

      {result && (
        <Alert variant={result.success ? "default" : "destructive"} className="mt-6">
          <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
