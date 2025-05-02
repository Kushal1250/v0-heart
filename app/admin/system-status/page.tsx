"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { SystemStatusBar } from "@/components/system-status-bar"

interface ServiceStatus {
  status: "configured" | "not_configured" | "unknown" | "error"
  message: string
  lastChecked: string
}

interface SystemStatusData {
  database: ServiceStatus
  emailService: ServiceStatus
  smsService: ServiceStatus
  lastMigration: {
    date: string
    status: "success" | "failed" | "unknown"
  }
}

export default function SystemStatusPage() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<SystemStatusData>({
    database: {
      status: "unknown",
      message: "Database status is unknown",
      lastChecked: new Date().toISOString(),
    },
    emailService: {
      status: "not_configured",
      message: "Email service is not configured",
      lastChecked: new Date().toISOString(),
    },
    smsService: {
      status: "not_configured",
      message: "SMS service is not configured",
      lastChecked: new Date().toISOString(),
    },
    lastMigration: {
      date: "Unknown",
      status: "unknown",
    },
  })

  const refreshStatus = async () => {
    setLoading(true)
    try {
      // This would normally fetch from an API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For now, we're just setting it to match the image
      setStatus({
        database: {
          status: "unknown",
          message: "Database status is unknown",
          lastChecked: new Date().toISOString(),
        },
        emailService: {
          status: "not_configured",
          message: "Email service is not configured",
          lastChecked: new Date().toISOString(),
        },
        smsService: {
          status: "not_configured",
          message: "SMS service is not configured",
          lastChecked: new Date().toISOString(),
        },
        lastMigration: {
          date: "Unknown",
          status: "unknown",
        },
      })
    } catch (error) {
      console.error("Failed to refresh status:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshStatus()
  }, [])

  const getStatusIcon = (status: "configured" | "not_configured" | "unknown" | "error") => {
    switch (status) {
      case "configured":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case "not_configured":
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />
      case "error":
        return <XCircle className="h-6 w-6 text-red-500" />
      case "unknown":
      default:
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SystemStatusBar />

      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">System Status</h1>
          <Button onClick={refreshStatus} disabled={loading} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Status
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Database</CardTitle>
                {getStatusIcon(status.database.status)}
              </div>
              <CardDescription>Database connection and status</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{status.database.message}</p>
              <p className="text-sm text-gray-500 mt-2">
                Last checked: {new Date(status.database.lastChecked).toLocaleString()}
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => {}}>
                Configure Database
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Email Service</CardTitle>
                {getStatusIcon(status.emailService.status)}
              </div>
              <CardDescription>Email delivery service status</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{status.emailService.message}</p>
              <p className="text-sm text-gray-500 mt-2">
                Last checked: {new Date(status.emailService.lastChecked).toLocaleString()}
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => {}}>
                Configure Email
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>SMS Service</CardTitle>
                {getStatusIcon(status.smsService.status)}
              </div>
              <CardDescription>SMS delivery service status</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{status.smsService.message}</p>
              <p className="text-sm text-gray-500 mt-2">
                Last checked: {new Date(status.smsService.lastChecked).toLocaleString()}
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => {}}>
                Configure SMS
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Last Migration</CardTitle>
                {status.lastMigration.status === "success" ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : status.lastMigration.status === "failed" ? (
                  <XCircle className="h-6 w-6 text-red-500" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                )}
              </div>
              <CardDescription>Database migration status</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                {status.lastMigration.status === "unknown"
                  ? "No migration information available"
                  : `Last migration ${status.lastMigration.status} on ${status.lastMigration.date}`}
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => {}}>
                Run Migration
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
