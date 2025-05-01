"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Database,
  FileText,
  AlertTriangle,
  Mail,
  MessageSquare,
  Activity,
  Shield,
  Key,
  BarChart3,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

export default function SystemPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [systemStatus, setSystemStatus] = useState({
    database: { status: "Unknown", lastMigration: "Unknown" },
    verification: { status: "Not Configured" },
    passwordReset: { status: "Active" },
    email: { status: "Not Configured" },
    sms: { status: "Not Configured" },
  })

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = () => {
      const cookies = document.cookie.split(";")
      const isAdminCookie = cookies.find((cookie) => cookie.trim().startsWith("is_admin="))
      const isAdmin = isAdminCookie ? isAdminCookie.split("=")[1] === "true" : false

      setIsAdmin(isAdmin)

      if (!isAdmin) {
        setError("Not authenticated as admin. Please login again.")
        setTimeout(() => {
          router.push("/admin-login?redirect=/admin/system")
        }, 2000)
      }
    }

    checkAdmin()
    setLoading(false)
  }, [router])

  const fetchSystemStatus = async () => {
    setRefreshing(true)
    try {
      // In a real implementation, you would fetch this data from your API
      // For now, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // This would normally come from your API
      setSystemStatus({
        database: { status: "Unknown", lastMigration: "Unknown" },
        verification: { status: "Not Configured" },
        passwordReset: { status: "Active" },
        email: { status: "Not Configured" },
        sms: { status: "Not Configured" },
      })
    } catch (err) {
      console.error("Error fetching system status:", err)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchSystemStatus()
    }
  }, [isAdmin])

  const handleRunMigration = () => {
    router.push("/admin/fix-database")
  }

  const handleDatabaseDiagnostics = () => {
    router.push("/admin/detailed-db-diagnostics")
  }

  const handleFixVerification = () => {
    router.push("/admin/fix-issues")
  }

  const handleFixPasswordReset = () => {
    router.push("/admin/fix-reset-tokens")
  }

  const handleEmailSettings = () => {
    router.push("/admin/email-settings")
  }

  const handleSMSSettings = () => {
    router.push("/admin/verification-settings")
  }

  const handleGeneralDiagnostics = () => {
    router.push("/admin/diagnostics")
  }

  const handleEmailDiagnostics = () => {
    router.push("/admin/email-diagnostics")
  }

  const handleSMSDiagnostics = () => {
    router.push("/admin/sms-diagnostics")
  }

  const handleFixSystemIssues = () => {
    router.push("/admin/fix-issues")
  }

  const handleSystemHealth = () => {
    router.push("/admin/system-health")
  }

  const handleDetailedDBDiagnostics = () => {
    router.push("/admin/detailed-db-diagnostics")
  }

  const handleResetTokenDiagnostics = () => {
    router.push("/admin/reset-token-diagnostics")
  }

  const handleFixDatabase = () => {
    router.push("/admin/fix-database")
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-lg font-medium">Loading system management...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>You do not have permission to access this page.</AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={() => router.push("/admin-login?redirect=/admin/system")}>Login as Admin</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">System Management</h1>
        <p className="text-muted-foreground">Manage system components and diagnostics</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Database Management Card */}
        <Card className="bg-card text-card-foreground dark:bg-gray-950 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Management
            </CardTitle>
            <CardDescription>Manage database and migrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Database Status:</span>
              <Badge variant="outline">{systemStatus.database.status}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Last Migration:</span>
              <span className="text-muted-foreground">{systemStatus.database.lastMigration}</span>
            </div>
            <Button className="w-full flex items-center justify-center gap-2" onClick={handleRunMigration}>
              <Database className="h-4 w-4" />
              Run Migration
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleDatabaseDiagnostics}
            >
              <FileText className="h-4 w-4" />
              Database Diagnostics
            </Button>
          </CardContent>
        </Card>

        {/* Authentication Systems Card */}
        <Card className="bg-card text-card-foreground dark:bg-gray-950 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Authentication Systems
            </CardTitle>
            <CardDescription>Fix auth related issues</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Verification System:</span>
              <Badge variant="outline">{systemStatus.verification.status}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Password Reset System:</span>
              <Badge variant="outline">{systemStatus.passwordReset.status}</Badge>
            </div>
            <Button className="w-full flex items-center justify-center gap-2" onClick={handleFixVerification}>
              <Shield className="h-4 w-4" />
              Fix Verification System
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleFixPasswordReset}
            >
              <Key className="h-4 w-4" />
              Fix Password Reset System
            </Button>
          </CardContent>
        </Card>

        {/* Notification Services Card */}
        <Card className="bg-card text-card-foreground dark:bg-gray-950 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Notification Services
            </CardTitle>
            <CardDescription>Manage email and SMS services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Email Service:</span>
              <Badge variant="outline">{systemStatus.email.status}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>SMS Service:</span>
              <Badge variant="outline">{systemStatus.sms.status}</Badge>
            </div>
            <Button className="w-full flex items-center justify-center gap-2" onClick={handleEmailSettings}>
              <Mail className="h-4 w-4" />
              Email Settings
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleSMSSettings}
            >
              <MessageSquare className="h-4 w-4" />
              SMS Settings
            </Button>
          </CardContent>
        </Card>

        {/* System Diagnostics Card */}
        <Card className="bg-card text-card-foreground dark:bg-gray-950 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Diagnostics
            </CardTitle>
            <CardDescription>Debug and repair tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full flex items-center justify-center gap-2" onClick={handleGeneralDiagnostics}>
              <Activity className="h-4 w-4" />
              General Diagnostics
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleEmailDiagnostics}
            >
              <Mail className="h-4 w-4" />
              Email Diagnostics
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleSMSDiagnostics}
            >
              <MessageSquare className="h-4 w-4" />
              SMS Diagnostics
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleFixSystemIssues}
            >
              <AlertTriangle className="h-4 w-4" />
              Fix System Issues
            </Button>
          </CardContent>
        </Card>

        {/* Admin Tools Card */}
        <Card className="bg-card text-card-foreground dark:bg-gray-950 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Tools
            </CardTitle>
            <CardDescription>Additional administrative tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full flex items-center justify-center gap-2" onClick={handleSystemHealth}>
              <BarChart3 className="h-4 w-4" />
              System Health
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleDetailedDBDiagnostics}
            >
              <Database className="h-4 w-4" />
              Detailed DB Diagnostics
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleResetTokenDiagnostics}
            >
              <Key className="h-4 w-4" />
              Reset Token Diagnostics
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleFixDatabase}
            >
              <Database className="h-4 w-4" />
              Fix Database
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <Button variant="outline" className="flex items-center gap-2" onClick={fetchSystemStatus} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh Status"}
        </Button>
      </div>
    </div>
  )
}
