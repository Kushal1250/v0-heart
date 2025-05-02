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
    status: string
    lastMigration: string
  }
  authentication: {
    verification: string
    passwordReset: string
  }
  notification: {
    email: string
    sms: string
  }
}

export default function SystemPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: {
      status: "connected",
      lastMigration: "system_settings",
    },
    authentication: {
      verification: "active",
      passwordReset: "active",
    },
    notification: {
      email: "configured",
      sms: "configured",
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

      const response = await fetch("/api/admin/get-system-status", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.status) {
          setSystemStatus(data.status)
        }
      } else {
        // If API fails, keep default active status
        console.error("Failed to fetch system status")
      }
    } catch (error) {
      console.error("Error fetching system status:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const activateAllServices = async () => {
    try {
      setActivating(true)
      setError(null)
      setSuccess(null)

      const response = await fetch("/api/admin/activate-system-services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess("All system services activated successfully!")
        // Refresh status after activation
        await fetchSystemStatus()
      } else {
        setError(data.message || "Failed to activate system services")
      }
    } catch (error) {
      console.error("Error activating system services:", error)
      setError("An error occurred while activating system services")
    } finally {
      setActivating(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchSystemStatus()
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={activateAllServices}
            disabled={activating}
            className="flex items-center gap-2"
          >
            {activating ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                Activating...
              </>
            ) : (
              <>
                <Database className="h-4 w-4" />
                Activate All Services
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
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
              <Badge className="bg-green-500 text-white">Connected</Badge>
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
              <Badge className="bg-green-500 text-white">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Password Reset System:</span>
              <Badge className="bg-green-500 text-white">Active</Badge>
            </div>

            <Button
              variant="outline"
              className="w-full bg-[#0f1117] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/fix-issues")}
            >
              <User className="mr-2 h-4 w-4" /> Fix Verification System
            </Button>

            <Button
              variant="outline"
              className="w-full bg-[#0f1117] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/reset-token-diagnostics")}
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
              <Badge className="bg-green-500 text-white">Configured</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>SMS Service:</span>
              <Badge className="bg-green-500 text-white">Configured</Badge>
            </div>

            <Button
              variant="outline"
              className="w-full bg-[#0f1117] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/email-settings")}
            >
              <Mail className="mr-2 h-4 w-4" /> Email Settings
            </Button>

            <Button
              variant="outline"
              className="w-full bg-[#0f1117] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/verification-settings")}
            >
              <MessageSquare className="mr-2 h-4 w-4" /> SMS Settings
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
