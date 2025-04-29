"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CreateVerificationCodesTable() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const runMigration = async () => {
    setStatus("loading")
    setMessage("Running migration...")

    try {
      const response = await fetch("/api/admin/migrate/verification-codes-table", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Migration failed")
      }

      setStatus("success")
      setMessage(data.message || "Migration completed successfully")
    } catch (error) {
      setStatus("error")
      setMessage(`Migration failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Verification Codes Table</CardTitle>
          <CardDescription>
            This script will create the verification_codes table in your database to support SMS verification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "error" && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === "success" && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <p className="mb-4">
            This migration will create a table to store verification codes for password reset and account verification.
            The table will include:
          </p>

          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li>ID (UUID primary key)</li>
            <li>User ID (foreign key to users table)</li>
            <li>Code (verification code)</li>
            <li>Created at timestamp</li>
            <li>Expires at timestamp (15 minutes after creation)</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button onClick={runMigration} disabled={status === "loading"} className="w-full">
            {status === "loading" ? "Running Migration..." : "Run Migration"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
