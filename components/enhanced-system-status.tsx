"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusIndicator } from "@/components/status-indicator"
import { RefreshCw, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface SystemStatus {
  database: {
    status: "connected" | "error" | "unknown"
    lastMigration: string
  }
  verification: {
    status: "active" | "error" | "not_configured"
  }
  passwordReset: {
    status: "active" | "error" | "not_configured"
  }
  email: {
    status: "configured" | "error" | "not_configured"
  }
  sms: {
    status: "configured" | "error" | "not_configured"
  }
}

export default function EnhancedSystemStatus() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchSystemStatus = async () => {
    try {
      setRefreshing(true)
      setError(null)

      const response = await fetch("/api/admin/system-status", {
        credentials: "include",
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch system status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.status) {
        setStatus({
          database: {
            status: data.status.database?.status === "ok" ? "connected" : "error",
            lastMigration: data.status.lastMigration?.message || "Unknown",
          },
          verification: {
            status: data.status.verification?.status || "unknown",
          },
          passwordReset: {
            status: data.status.passwordReset?.status || "unknown",
          },
          email: {
            status: data.status.notification?.email?.status || "unknown",
          },
          sms: {
            status: data.status.notification?.sms?.status || "unknown",
          },
        })
      } else {
        throw new Error(data.message || "Failed to fetch system status")
      }
    } catch (err) {
      console.error("Error fetching system status:", err)
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchSystemStatus()
  }, [])

  const checkDatabaseConnection = async () => {
    try {
      const response = await fetch("/api/admin/check-db-connection", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to check database connection")
      }

      await fetchSystemStatus() // Refresh all statuses
    } catch (error) {
      console.error("Error checking database connection:", error)
      throw error
    }
  }

  const checkAuthSystems = async () => {
    try {
      const response = await fetch("/api/admin/check-auth-systems", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to check authentication systems")
      }

      await fetchSystemStatus() // Refresh all statuses
    } catch (error) {
      console.error("Error checking auth systems:", error)
      throw error
    }
  }

  const checkNotificationServices = async () => {
    try {
      const response = await fetch("/api/admin/check-notification-services", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to check notification services")
      }

      await fetchSystemStatus() // Refresh all statuses
    } catch (error) {
      console.error("Error checking notification services:", error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!status) {
    return (
      <Alert>
        <AlertTitle>No Data</AlertTitle>
        <AlertDescription>No system status data available.</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current status of all system components</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSystemStatus}
            disabled={refreshing}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <StatusIndicator label="Database Status" status={status.database.status} onClick={checkDatabaseConnection} />

          <StatusIndicator
            label="Last Migration"
            status={status.database.lastMigration === "Up to date" ? "up-to-date" : "warning"}
          />

          <StatusIndicator
            label="Verification System"
            status={status.verification.status === "active" ? "active" : "error"}
            onClick={checkAuthSystems}
          />

          <StatusIndicator
            label="Password Reset System"
            status={status.passwordReset.status === "active" ? "active" : "error"}
            onClick={checkAuthSystems}
          />

          <StatusIndicator
            label="Email Service"
            status={status.email.status === "configured" ? "configured" : "error"}
            onClick={checkNotificationServices}
          />

          <StatusIndicator
            label="SMS Service"
            status={status.sms.status === "configured" ? "configured" : "error"}
            onClick={checkNotificationServices}
          />
        </div>
      </CardContent>
    </Card>
  )
}
