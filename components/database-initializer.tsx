"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export function DatabaseInitializer() {
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<{ users: number; predictions: number } | null>(null)

  const initializeDatabase = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/admin/ensure-database", {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to initialize database: ${response.status}`)
      }

      const data = await response.json()
      setInitialized(true)
      setStats(data.stats)
    } catch (err) {
      console.error("Error initializing database:", err)
      setError(err instanceof Error ? err.message : "Failed to initialize database")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {initialized && stats && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Database Initialized</AlertTitle>
          <AlertDescription>
            Successfully initialized database with {stats.users} users and {stats.predictions} predictions.
          </AlertDescription>
        </Alert>
      )}

      <Button onClick={initializeDatabase} disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Initializing Database...
          </>
        ) : (
          "Initialize Database with Sample Data"
        )}
      </Button>
    </div>
  )
}
