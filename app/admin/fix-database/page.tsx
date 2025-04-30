"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

export default function FixDatabasePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleFixDatabase = async () => {
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/admin/fix-reset-tokens", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to fix database")
      }

      setSuccess(data.message || "Database fixed successfully")
    } catch (err: any) {
      console.error("Error fixing database:", err)
      setError(err.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Fix Database Tables</CardTitle>
          <CardDescription>Use this tool to fix issues with the password reset tokens table</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <p className="mb-4">
            This will check and fix the password_reset_tokens table structure, ensuring it has the correct columns and
            indexes. Use this if you're experiencing issues with password reset functionality.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleFixDatabase} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fixing Database...
              </>
            ) : (
              "Fix Database Tables"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
