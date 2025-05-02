"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Clock } from "lucide-react"

interface SystemStatusProps {
  refreshInterval?: number // in milliseconds, default is no auto-refresh
}

export default function SystemStatusDisplay({ refreshInterval }: SystemStatusProps) {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchStatus = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/system-status")

      if (!response.ok) {
        throw new Error(`Failed to fetch system status: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setStatus(data.status)
        setLastUpdated(new Date())
      } else {
        throw new Error(data.message || "Failed to fetch system status")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch system status")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()

    // Set up auto-refresh if interval is provided
    if (refreshInterval) {
      const intervalId = setInterval(fetchStatus, refreshInterval)
      return () => clearInterval(intervalId)
    }
  }, [refreshInterval])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ok":
      case "active":
      case "configured":
      case "healthy":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" /> OK
          </Badge>
        )
      case "error":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" /> Error
          </Badge>
        )
      case "not_configured":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-500">
            <AlertTriangle className="h-3 w-3 mr-1" /> Not Configured
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const renderHealthIndicator = (isHealthy: boolean) => {
    return (
      <div className={isHealthy ? "text-green-500" : "text-red-500"}>
        {isHealthy ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L20 18H4L12 2Z" fill="currentColor" />
          </svg>
        ) : (
          <AlertTriangle className="h-6 w-6" />
        )}
      </div>
    )
  }

  const renderCompactHealthCard = () => {
    if (!status) return null

    const isHealthy =
      status.database?.status === "ok" &&
      status.notification?.email?.status === "configured" &&
      status.notification?.sms?.status === "configured"

    return (
      <Card className="bg-[#0c0c14] border-[#1e1e2f] text-white">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-medium">System Health</CardTitle>
            {renderHealthIndicator(isHealthy)}
          </div>
        </CardHeader>
        <CardContent>
          <h2 className="text-3xl font-bold mb-4">{isHealthy ? "Healthy" : "Warning"}</h2>
          <div className="grid grid-cols-2 gap-y-2">
            <div className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full ${status.database?.status === "ok" ? "bg-green-500" : "bg-red-500"} mr-2`}
              ></div>
              <span>Database</span>
            </div>
            <div className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full ${status.notification?.email?.status === "configured" ? "bg-green-500" : "bg-red-500"} mr-2`}
              ></div>
              <span>Email</span>
            </div>
            <div className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full ${status.notification?.sms?.status === "configured" ? "bg-green-500" : "bg-red-500"} mr-2`}
              ></div>
              <span>SMS</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <span>Storage</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading && !status) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-500">Loading system status...</p>
        </div>
      </div>
    )
  }

  if (error && !status) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button onClick={fetchStatus} className="mt-4" size="sm">
          Retry
        </Button>
      </Alert>
    )
  }

  if (!status) {
    return (
      <Alert className="mb-6">
        <AlertTitle>No Data</AlertTitle>
        <AlertDescription>No system status data available.</AlertDescription>
        <Button onClick={fetchStatus} className="mt-4" size="sm">
          Fetch Status
        </Button>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {renderCompactHealthCard()}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">System Status</h2>
          {lastUpdated && (
            <p className="text-sm text-gray-500">
              <Clock className="h-3 w-3 inline mr-1" />
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>
        <Button onClick={fetchStatus} disabled={loading} size="sm">
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Status */}
        <Card>
          <CardHeader>
            <CardTitle>Database</CardTitle>
            <CardDescription>Database connection and migration status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Connection:</span>
                {getStatusBadge(status.database?.status || "unknown")}
              </div>

              {status.database?.responseTime && (
                <div className="flex items-center justify-between">
                  <span>Response Time:</span>
                  <span className="text-sm font-mono">{status.database.responseTime}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span>Last Migration:</span>
                <span className="text-sm">
                  {status.database?.lastMigration?.table
                    ? `${status.database.lastMigration.table} (${new Date(status.database.lastMigration.date).toLocaleDateString()})`
                    : "Unknown"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Authentication Systems */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>Authentication and verification systems</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Verification System:</span>
                {getStatusBadge(status.authentication?.verification?.status || "unknown")}
              </div>

              <div className="flex items-center justify-between">
                <span>Password Reset:</span>
                {getStatusBadge(status.authentication?.passwordReset?.status || "unknown")}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Services */}
        <Card>
          <CardHeader>
            <CardTitle>Notification</CardTitle>
            <CardDescription>Email and SMS notification services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Email Service:</span>
                {getStatusBadge(status.notification?.email?.status || "unknown")}
              </div>

              <div className="flex items-center justify-between">
                <span>SMS Service:</span>
                {getStatusBadge(status.notification?.sms?.status || "unknown")}
              </div>

              {status.notification?.sms?.missingEnvVars?.length > 0 && (
                <Alert className="mt-2">
                  <AlertTitle>Missing SMS Configuration</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-5 text-sm">
                      {status.notification.sms.missingEnvVars.map((env: string) => (
                        <li key={env}>{env}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>System performance and errors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {status.system?.uptime && (
                <div className="flex items-center justify-between">
                  <span>Uptime:</span>
                  <span>{status.system.uptime}</span>
                </div>
              )}

              {status.system?.memory && (
                <div className="flex items-center justify-between">
                  <span>Memory Usage:</span>
                  <span>
                    {status.system.memory.heapUsed} / {status.system.memory.heapTotal}
                  </span>
                </div>
              )}

              {status.system?.errors && (
                <div className="flex items-center justify-between">
                  <span>Recent Errors:</span>
                  <Badge variant={status.system.errors.count > 0 ? "destructive" : "outline"}>
                    {status.system.errors.count}
                  </Badge>
                </div>
              )}

              {status.system?.nodeVersion && (
                <div className="flex items-center justify-between">
                  <span>Node Version:</span>
                  <span className="text-sm font-mono">{status.system.nodeVersion}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Errors Section */}
      {status.system?.errors?.recent?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Errors</CardTitle>
            <CardDescription>Latest system errors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {status.system.errors.recent.map((error: any, index: number) => (
                <Alert
                  key={error.id || index}
                  className={
                    error.severity === "critical"
                      ? "border-red-500 bg-red-50"
                      : error.severity === "high"
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200"
                  }
                >
                  <AlertTitle className="flex items-center justify-between">
                    <span>{error.context}</span>
                    <Badge
                      className={
                        error.severity === "critical"
                          ? "bg-red-500"
                          : error.severity === "high"
                            ? "bg-orange-500"
                            : error.severity === "medium"
                              ? "bg-yellow-500"
                              : "bg-blue-500"
                      }
                    >
                      {error.severity}
                    </Badge>
                  </AlertTitle>
                  <AlertDescription>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(error.timestamp).toLocaleString()} • ID: {error.id}
                    </p>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
