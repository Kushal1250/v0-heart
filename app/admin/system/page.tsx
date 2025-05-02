"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Database,
  User,
  Key,
  Mail,
  MessageSquare,
  ActivitySquare,
  AlertTriangle,
  BarChart3,
  FileText,
  Wrench,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SystemStatus {
  database: {
    connected: boolean
    lastMigration: string
  }
  authentication: {
    verification: boolean
    passwordReset: boolean
  }
  notification: {
    email: boolean
    sms: boolean
  }
}

export default function SystemPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [setupLoading, setSetupLoading] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: {
      connected: false,
      lastMigration: "Unknown",
    },
    authentication: {
      verification: false,
      passwordReset: true,
    },
    notification: {
      email: false,
      sms: false,
    },
  })

  // Fetch system status on component mount
  useEffect(() => {
    fetchSystemStatus()
  }, [])

  const fetchSystemStatus = async () => {
    try {
      setLoading(true)
      setError(null)

      // Check database status
      const dbResponse = await fetch("/api/admin/check-database-status", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      })

      if (dbResponse.ok) {
        const dbData = await dbResponse.json()
        setSystemStatus((prev) => ({
          ...prev,
          database: {
            connected: dbData.status === "connected",
            lastMigration: dbData.lastMigration?.table || "Unknown",
          },
        }))
      }

      // Check auth systems
      const authResponse = await fetch("/api/admin/check-auth-systems", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      })

      if (authResponse.ok) {
        const authData = await authResponse.json()
        setSystemStatus((prev) => ({
          ...prev,
          authentication: {
            verification: authData.verification?.status === "active",
            passwordReset: authData.passwordReset?.status === "active",
          },
        }))
      }

      // Check notification services
      const notifResponse = await fetch("/api/admin/check-notification-services", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      })

      if (notifResponse.ok) {
        const notifData = await notifResponse.json()
        setSystemStatus((prev) => ({
          ...prev,
          notification: {
            email: notifData.email?.status === "configured",
            sms: notifData.sms?.status === "configured",
          },
        }))
      }
    } catch (error) {
      console.error("Error fetching system status:", error)
      setError("Failed to fetch system status. Please try again.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchSystemStatus()
  }

  const setupVerificationSystem = async () => {
    try {
      setSetupLoading((prev) => ({ ...prev, verification: true }))
      setError(null)
      setSuccess(null)

      const response = await fetch("/api/admin/setup-verification-system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess("Verification system set up successfully!")
        // Update status
        setSystemStatus((prev) => ({
          ...prev,
          authentication: {
            ...prev.authentication,
            verification: true,
          },
        }))
      } else {
        setError(data.message || "Failed to set up verification system")
      }
    } catch (error) {
      console.error("Error setting up verification system:", error)
      setError("An error occurred while setting up the verification system")
    } finally {
      setSetupLoading((prev) => ({ ...prev, verification: false }))
    }
  }

  const setupEmailService = async () => {
    try {
      setSetupLoading((prev) => ({ ...prev, email: true }))
      setError(null)
      setSuccess(null)

      const response = await fetch("/api/admin/setup-email-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess("Email service configured successfully!")
        // Update status
        setSystemStatus((prev) => ({
          ...prev,
          notification: {
            ...prev.notification,
            email: true,
          },
        }))
      } else {
        setError(data.message || "Failed to configure email service")
      }
    } catch (error) {
      console.error("Error setting up email service:", error)
      setError("An error occurred while configuring the email service")
    } finally {
      setSetupLoading((prev) => ({ ...prev, email: false }))
    }
  }

  const setupSMSService = async () => {
    try {
      setSetupLoading((prev) => ({ ...prev, sms: true }))
      setError(null)
      setSuccess(null)

      const response = await fetch("/api/admin/setup-sms-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess("SMS service configured successfully!")
        // Update status
        setSystemStatus((prev) => ({
          ...prev,
          notification: {
            ...prev.notification,
            sms: true,
          },
        }))
      } else {
        setError(data.message || "Failed to configure SMS service")
      }
    } catch (error) {
      console.error("Error setting up SMS service:", error)
      setError("An error occurred while configuring the SMS service")
    } finally {
      setSetupLoading((prev) => ({ ...prev, sms: false }))
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-lg font-medium">Loading system status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">System</h1>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh Status"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="mb-6 bg-green-50 text-green-800 border-green-200">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Database Management Card */}
        <Card className="bg-[#0f1117] border-[#1e1e2f] text-white">
          <CardHeader>
            <CardTitle className="text-xl">Database Management</CardTitle>
            <CardDescription className="text-gray-400">Manage database and migrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Database Status:</span>
              {systemStatus.database.connected ? (
                <Badge className="bg-green-500 text-white">Connected</Badge>
              ) : (
                <Badge className="bg-blue-500 text-white">Unknown</Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>Last Migration:</span>
              <span className="text-gray-400">{systemStatus.database.lastMigration}</span>
            </div>

            <Button
              variant="outline"
              className="w-full bg-[#0f1117] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/migrate")}
            >
              <Database className="mr-2 h-4 w-4" /> Run Migration
            </Button>

            <Button
              variant="outline"
              className="w-full bg-[#0f1117] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/database-diagnostics")}
            >
              <Database className="mr-2 h-4 w-4" /> Database Diagnostics
            </Button>
          </CardContent>
        </Card>

        {/* Authentication Systems Card */}
        <Card className="bg-[#0f1117] border-[#1e1e2f] text-white">
          <CardHeader>
            <CardTitle className="text-xl">Authentication Systems</CardTitle>
            <CardDescription className="text-gray-400">Fix auth related issues</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Verification System:</span>
              {systemStatus.authentication.verification ? (
                <Badge className="bg-green-500 text-white">Active</Badge>
              ) : (
                <Badge className="bg-blue-500 text-white">Not Configured</Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>Password Reset System:</span>
              {systemStatus.authentication.passwordReset ? (
                <Badge className="bg-green-500 text-white">Active</Badge>
              ) : (
                <Badge className="bg-blue-500 text-white">Not Configured</Badge>
              )}
            </div>

            <Button
              variant="outline"
              className="w-full bg-[#0f1117] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={setupVerificationSystem}
              disabled={setupLoading.verification || systemStatus.authentication.verification}
            >
              <User className="mr-2 h-4 w-4" />
              {setupLoading.verification ? "Setting Up..." : "Fix Verification System"}
            </Button>

            <Button
              variant="outline"
              className="w-full bg-[#0f1117] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/reset-token-diagnostics")}
              disabled={!systemStatus.authentication.passwordReset}
            >
              <Key className="mr-2 h-4 w-4" /> Fix Password Reset System
            </Button>
          </CardContent>
        </Card>

        {/* Notification Services Card */}
        <Card className="bg-[#0f1117] border-[#1e1e2f] text-white">
          <CardHeader>
            <CardTitle className="text-xl">Notification Services</CardTitle>
            <CardDescription className="text-gray-400">Manage email and SMS services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Email Service:</span>
              {systemStatus.notification.email ? (
                <Badge className="bg-green-500 text-white">Configured</Badge>
              ) : (
                <Badge className="bg-blue-500 text-white">Not Configured</Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>SMS Service:</span>
              {systemStatus.notification.sms ? (
                <Badge className="bg-green-500 text-white">Configured</Badge>
              ) : (
                <Badge className="bg-blue-500 text-white">Not Configured</Badge>
              )}
            </div>

            <Button
              variant="outline"
              className="w-full bg-[#0f1117] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={setupEmailService}
              disabled={setupLoading.email || systemStatus.notification.email}
            >
              <Mail className="mr-2 h-4 w-4" />
              {setupLoading.email ? "Configuring..." : "Configure Email Service"}
            </Button>

            <Button
              variant="outline"
              className="w-full bg-[#0f1117] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={setupSMSService}
              disabled={setupLoading.sms || systemStatus.notification.sms}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              {setupLoading.sms ? "Configuring..." : "Configure SMS Service"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* System Diagnostics Card */}
        <Card className="bg-[#0f1117] border-[#1e1e2f] text-white">
          <CardHeader>
            <CardTitle className="text-xl">System Diagnostics</CardTitle>
            <CardDescription className="text-gray-400">Debug and repair tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full bg-[#0f1117] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/diagnostics")}
            >
              <ActivitySquare className="mr-2 h-4 w-4" /> General Diagnostics
            </Button>

            <Button
              variant="outline"
              className="w-full bg-[#0f1117] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/email-diagnostics")}
            >
              <Mail className="mr-2 h-4 w-4" /> Email Diagnostics
            </Button>

            <Button
              variant="outline"
              className="w-full bg-[#0f1117] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/sms-diagnostics")}
            >
              <MessageSquare className="mr-2 h-4 w-4" /> SMS Diagnostics
            </Button>

            <Button
              variant="outline"
              className="w-full bg-[#0f1117] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/fix-issues")}
            >
              <AlertTriangle className="mr-2 h-4 w-4" /> Fix System Issues
            </Button>
          </CardContent>
        </Card>

        {/* Admin Tools Card */}
        <Card className="bg-[#0f1117] border-[#1e1e2f] text-white">
          <CardHeader>
            <CardTitle className="text-xl">Admin Tools</CardTitle>
            <CardDescription className="text-gray-400">Additional administrative tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full bg-[#0f1117] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/system-health")}
            >
              <BarChart3 className="mr-2 h-4 w-4" /> System Health
            </Button>

            <Button
              variant="outline"
              className="w-full bg-[#0f1117] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/detailed-db-diagnostics")}
            >
              <FileText className="mr-2 h-4 w-4" /> Detailed DB Diagnostics
            </Button>

            <Button
              variant="outline"
              className="w-full bg-[#0f1117] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/reset-token-diagnostics")}
            >
              <Key className="mr-2 h-4 w-4" /> Reset Token Diagnostics
            </Button>

            <Button
              variant="outline"
              className="w-full bg-[#0f1117] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/fix-database")}
            >
              <Wrench className="mr-2 h-4 w-4" /> Fix Database
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
