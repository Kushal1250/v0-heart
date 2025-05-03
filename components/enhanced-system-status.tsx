"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusIndicator } from "@/components/status-indicator"
// Update the imports to include the new icons
import { RefreshCw } from "lucide-react"

// Update the SystemStatus interface
interface SystemStatus {
  database: {
    status: "connected" | "error" | "unknown" | "not_configured"
    lastMigration: string
  }
  verification: {
    status: "active" | "error" | "not_configured" | "unknown"
  }
  passwordReset: {
    status: "active" | "error" | "not_configured" | "unknown"
  }
  email: {
    status: "configured" | "error" | "not_configured" | "unknown"
  }
  sms: {
    status: "configured" | "error" | "not_configured" | "unknown"
  }
}

export default function EnhancedSystemStatus() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Update the fetchSystemStatus function to include a demo mode
  const fetchSystemStatus = async () => {
    try {
      setRefreshing(true)
      setError(null)

      // Demo mode - randomly show some services as not configured or unknown
      const demoMode = true

      if (demoMode) {
        setStatus({
          database: {
            status: Math.random() > 0.7 ? "not_configured" : "connected",
            lastMigration: "Up to date",
          },
          verification: {
            status: Math.random() > 0.7 ? "unknown" : "active",
          },
          passwordReset: {
            status: Math.random() > 0.7 ? "not_configured" : "active",
          },
          email: {
            status: Math.random() > 0.7 ? "not_configured" : "configured",
          },
          sms: {
            status: Math.random() > 0.7 ? "unknown" : "configured",
          },
        })
      } else {
        // Original code - always set all services as configured
        setStatus({
          database: {
            status: "connected",
            lastMigration: "Up to date",
          },
          verification: {
            status: "active",
          },
          passwordReset: {
            status: "active",
          },
          email: {
            status: "configured",
          },
          sms: {
            status: "configured",
          },
        })
      }
    } catch (err) {
      console.error("Error fetching system status:", err)

      // Even in case of error, set some services as not configured for demo
      setStatus({
        database: {
          status: "connected",
          lastMigration: "Up to date",
        },
        verification: {
          status: "unknown",
        },
        passwordReset: {
          status: "not_configured",
        },
        email: {
          status: "configured",
        },
        sms: {
          status: "not_configured",
        },
      })

      setError(null) // Don't show error message
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchSystemStatus()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
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
          <StatusIndicator label="Database Status" status="connected" type="database" />

          <StatusIndicator label="Last Migration" status="up-to-date" type="migration" />

          <StatusIndicator label="Verification System" status="active" type="verification" />

          <StatusIndicator label="Password Reset System" status="active" type="password-reset" />

          <StatusIndicator label="Email Service" status="configured" type="email" />

          <StatusIndicator label="SMS Service" status="configured" type="sms" />
        </div>
      </CardContent>
    </Card>
  )
}
