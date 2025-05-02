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
  FileText,
  BarChart3,
  ShieldAlert,
  HardDrive,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

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
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: {
      status: "Unknown",
      lastMigration: "Unknown",
    },
    authentication: {
      verification: "Not Configured",
      passwordReset: "Active",
    },
    notification: {
      email: "Not Configured",
      sms: "Not Configured",
    },
  })
  const [isAdmin, setIsAdmin] = useState(false)

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = () => {
      const cookies = document.cookie.split(";")
      const isAdminCookie = cookies.find((cookie) => cookie.trim().startsWith("is_admin="))
      const isAdmin = isAdminCookie ? isAdminCookie.split("=")[1] === "true" : false

      setIsAdmin(isAdmin)

      if (!isAdmin) {
        router.push("/admin-login?redirect=/admin/system")
      }
    }

    checkAdmin()
  }, [router])

  // Fetch system status
  useEffect(() => {
    if (isAdmin) {
      fetchSystemStatus()
    }
  }, [isAdmin])

  const fetchSystemStatus = async () => {
    try {
      setLoading(true)

      const response = await fetch("/api/admin/diagnostics", {
        credentials: "include",
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch system status")
      }

      const data = await response.json()

      // Update with actual data from API
      setSystemStatus({
        database: {
          status: data.database?.connected ? "Connected" : "Unknown",
          lastMigration: data.database?.lastMigration || "Unknown",
        },
        authentication: {
          verification: data.authentication?.verification?.status || "Not Configured",
          passwordReset: data.authentication?.passwordReset?.status || "Active",
        },
        notification: {
          email: data.notification?.email?.status || "Not Configured",
          sms: data.notification?.sms?.status || "Not Configured",
        },
      })
    } catch (error) {
      console.error("Error fetching system status:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    if (status === "Connected" || status === "Active" || status === "Configured") {
      return <Badge className="bg-green-500">Active</Badge>
    } else if (status === "Not Configured") {
      return <Badge className="bg-yellow-500">Not Configured</Badge>
    } else {
      return <Badge className="bg-gray-500">Unknown</Badge>
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
      <h1 className="mb-6 text-3xl font-bold">System</h1>

      {/* New System Management Cards */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Database Management Card */}
        <Card className="bg-[#0c0c14] border-[#1e1e2f] text-white">
          <CardHeader>
            <CardTitle className="text-xl">Database Management</CardTitle>
            <CardDescription className="text-gray-400">Manage database and migrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Database Status:</span>
              <span className="text-gray-400">Unknown</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Last Migration:</span>
              <span className="text-gray-400">Unknown</span>
            </div>

            <Button
              variant="outline"
              className="w-full bg-[#0c0c14] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/migrate")}
            >
              <Database className="mr-2 h-4 w-4" /> Run Migration
            </Button>

            <Button
              variant="outline"
              className="w-full bg-[#0c0c14] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/database-diagnostics")}
            >
              <FileText className="mr-2 h-4 w-4" /> Database Diagnostics
            </Button>
          </CardContent>
        </Card>

        {/* Authentication Systems Card */}
        <Card className="bg-[#0c0c14] border-[#1e1e2f] text-white">
          <CardHeader>
            <CardTitle className="text-xl">Authentication Systems</CardTitle>
            <CardDescription className="text-gray-400">Fix auth related issues</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Verification System:</span>
              <span className="text-yellow-500">Not Configured</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Password Reset System:</span>
              <span className="text-green-500">Active</span>
            </div>

            <Button
              variant="outline"
              className="w-full bg-[#0c0c14] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/fix-issues")}
            >
              <User className="mr-2 h-4 w-4" /> Fix Verification System
            </Button>

            <Button
              variant="outline"
              className="w-full bg-[#0c0c14] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/reset-token-diagnostics")}
            >
              <Key className="mr-2 h-4 w-4" /> Fix Password Reset System
            </Button>
          </CardContent>
        </Card>

        {/* Notification Services Card */}
        <Card className="bg-[#0c0c14] border-[#1e1e2f] text-white">
          <CardHeader>
            <CardTitle className="text-xl">Notification Services</CardTitle>
            <CardDescription className="text-gray-400">Manage email and SMS services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Email Service:</span>
              <span className="text-yellow-500">Not Configured</span>
            </div>
            <div className="flex items-center justify-between">
              <span>SMS Service:</span>
              <span className="text-yellow-500">Not Configured</span>
            </div>

            <Button
              variant="outline"
              className="w-full bg-[#0c0c14] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/email-settings")}
            >
              <Mail className="mr-2 h-4 w-4" /> Email Settings
            </Button>

            <Button
              variant="outline"
              className="w-full bg-[#0c0c14] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/verification-settings")}
            >
              <MessageSquare className="mr-2 h-4 w-4" /> SMS Settings
            </Button>
          </CardContent>
        </Card>

        {/* System Diagnostics Card */}
        <Card className="bg-[#0c0c14] border-[#1e1e2f] text-white">
          <CardHeader>
            <CardTitle className="text-xl">System Diagnostics</CardTitle>
            <CardDescription className="text-gray-400">Debug and repair tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full bg-[#0c0c14] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/diagnostics")}
            >
              <ActivitySquare className="mr-2 h-4 w-4" /> General Diagnostics
            </Button>

            <Button
              variant="outline"
              className="w-full bg-[#0c0c14] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/email-diagnostics")}
            >
              <Mail className="mr-2 h-4 w-4" /> Email Diagnostics
            </Button>

            <Button
              variant="outline"
              className="w-full bg-[#0c0c14] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/sms-diagnostics")}
            >
              <MessageSquare className="mr-2 h-4 w-4" /> SMS Diagnostics
            </Button>

            <Button
              variant="outline"
              className="w-full bg-[#0c0c14] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/fix-issues")}
            >
              <AlertTriangle className="mr-2 h-4 w-4" /> Fix System Issues
            </Button>
          </CardContent>
        </Card>

        {/* Admin Tools Card */}
        <Card className="bg-[#0c0c14] border-[#1e1e2f] text-white">
          <CardHeader>
            <CardTitle className="text-xl">Admin Tools</CardTitle>
            <CardDescription className="text-gray-400">Additional administrative tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full bg-[#0c0c14] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/system-health")}
            >
              <BarChart3 className="mr-2 h-4 w-4" /> System Health
            </Button>

            <Button
              variant="outline"
              className="w-full bg-[#0c0c14] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/detailed-db-diagnostics")}
            >
              <Database className="mr-2 h-4 w-4" /> Detailed DB Diagnostics
            </Button>

            <Button
              variant="outline"
              className="w-full bg-[#0c0c14] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/reset-token-diagnostics")}
            >
              <Key className="mr-2 h-4 w-4" /> Reset Token Diagnostics
            </Button>

            <Button
              variant="outline"
              className="w-full bg-[#0c0c14] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/fix-database")}
            >
              <HardDrive className="mr-2 h-4 w-4" /> Fix Database
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Original content below */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Database Management Section */}
        <Card className="bg-[#0c0c14] border-[#1e1e2f] text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" /> Database Management
            </CardTitle>
            <CardDescription className="text-gray-400">Manage database and migrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Database Status:</span>
              {getStatusBadge(systemStatus.database.status)}
            </div>
            <div className="flex items-center justify-between">
              <span>Last Migration:</span>
              <span className="text-sm text-gray-400">{systemStatus.database.lastMigration}</span>
            </div>

            <Button
              variant="outline"
              className="w-full bg-[#0c0c14] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white mt-4"
              onClick={() => router.push("/admin/migrate")}
            >
              <Database className="mr-2 h-4 w-4" /> Run Migration
            </Button>

            <Button
              variant="outline"
              className="w-full bg-[#0c0c14] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/database-diagnostics")}
            >
              <FileText className="mr-2 h-4 w-4" /> Database Diagnostics
            </Button>
          </CardContent>
        </Card>

        {/* Authentication Systems Section */}
        <Card className="bg-[#0c0c14] border-[#1e1e2f] text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> Authentication Systems
            </CardTitle>
            <CardDescription className="text-gray-400">Fix auth related issues</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Verification System:</span>
              {getStatusBadge(systemStatus.authentication.verification)}
            </div>
            <div className="flex items-center justify-between">
              <span>Password Reset System:</span>
              {getStatusBadge(systemStatus.authentication.passwordReset)}
            </div>

            <Button
              variant="outline"
              className="w-full bg-[#0c0c14] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white mt-4"
              onClick={() => router.push("/admin/fix-issues")}
            >
              <User className="mr-2 h-4 w-4" /> Fix Verification System
            </Button>

            <Button
              variant="outline"
              className="w-full bg-[#0c0c14] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/reset-token-diagnostics")}
            >
              <Key className="mr-2 h-4 w-4" /> Fix Password Reset System
            </Button>
          </CardContent>
        </Card>

        {/* Notification Services Section */}
        <Card className="bg-[#0c0c14] border-[#1e1e2f] text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" /> Notification Services
            </CardTitle>
            <CardDescription className="text-gray-400">Manage email and SMS services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Email Service:</span>
              {getStatusBadge(systemStatus.notification.email)}
            </div>
            <div className="flex items-center justify-between">
              <span>SMS Service:</span>
              {getStatusBadge(systemStatus.notification.sms)}
            </div>

            <Button
              variant="outline"
              className="w-full bg-[#0c0c14] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white mt-4"
              onClick={() => router.push("/admin/email-settings")}
            >
              <Mail className="mr-2 h-4 w-4" /> Email Settings
            </Button>

            <Button
              variant="outline"
              className="w-full bg-[#0c0c14] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/verification-settings")}
            >
              <MessageSquare className="mr-2 h-4 w-4" /> SMS Settings
            </Button>
          </CardContent>
        </Card>

        {/* System Diagnostics Section */}
        <Card className="bg-[#0c0c14] border-[#1e1e2f] text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ActivitySquare className="h-5 w-5" /> System Diagnostics
            </CardTitle>
            <CardDescription className="text-gray-400">Debug and repair tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full bg-[#0c0c14] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/diagnostics")}
            >
              <ActivitySquare className="mr-2 h-4 w-4" /> General Diagnostics
            </Button>

            <Button
              variant="outline"
              className="w-full bg-[#0c0c14] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/email-diagnostics")}
            >
              <Mail className="mr-2 h-4 w-4" /> Email Diagnostics
            </Button>

            <Button
              variant="outline"
              className="w-full bg-[#0c0c14] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/sms-diagnostics")}
            >
              <MessageSquare className="mr-2 h-4 w-4" /> SMS Diagnostics
            </Button>

            <Button
              variant="outline"
              className="w-full bg-[#0c0c14] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/fix-issues")}
            >
              <AlertTriangle className="mr-2 h-4 w-4" /> Fix System Issues
            </Button>
          </CardContent>
        </Card>

        {/* Admin Tools Section */}
        <Card className="bg-[#0c0c14] border-[#1e1e2f] text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" /> Admin Tools
            </CardTitle>
            <CardDescription className="text-gray-400">Additional administrative tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full bg-[#0c0c14] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/system-health")}
            >
              <BarChart3 className="mr-2 h-4 w-4" /> System Health
            </Button>

            <Button
              variant="outline"
              className="w-full bg-[#0c0c14] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/detailed-db-diagnostics")}
            >
              <Database className="mr-2 h-4 w-4" /> Detailed DB Diagnostics
            </Button>

            <Button
              variant="outline"
              className="w-full bg-[#0c0c14] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/reset-token-diagnostics")}
            >
              <Key className="mr-2 h-4 w-4" /> Reset Token Diagnostics
            </Button>

            <Button
              variant="outline"
              className="w-full bg-[#0c0c14] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={() => router.push("/admin/fix-database")}
            >
              <HardDrive className="mr-2 h-4 w-4" /> Fix Database
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* New System Health and Database Management Section */}
      <div className="grid gap-6 mt-8 md:grid-cols-2">
        {/* System Health Card */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold">System Health</CardTitle>
            <CardDescription>Status of system components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span>Database Connection</span>
                <span className="font-medium text-blue-600">Connected</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full w-full"></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span>Email Service</span>
                <span className="font-medium text-blue-600">Configured</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full w-full"></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span>SMS Service</span>
                <span className="font-medium text-blue-600">Configured</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full w-full"></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span>Storage</span>
                <span className="font-medium text-blue-600">Available</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full w-full"></div>
              </div>
            </div>

            <Button
              className="w-full mt-4 bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-200"
              onClick={() => router.push("/admin/diagnostics")}
            >
              Run Diagnostics
            </Button>
          </CardContent>
        </Card>

        {/* Database Management Card */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold">Database Management</CardTitle>
            <CardDescription>Manage database operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Run Database Migration</h3>
                <p className="text-sm text-gray-500">Update database schema</p>
              </div>
              <Button
                className="bg-white text-gray-900 border border-gray-300 hover:bg-gray-100"
                onClick={() => router.push("/admin/migrate")}
              >
                Migrate
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Fix Verification Codes</h3>
                <p className="text-sm text-gray-500">Repair verification system</p>
              </div>
              <Button
                className="bg-white text-gray-900 border border-gray-300 hover:bg-gray-100"
                onClick={() => router.push("/admin/fix-issues")}
              >
                Fix Issues
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Database Backup</h3>
                <p className="text-sm text-gray-500">Create a backup of the database</p>
              </div>
              <Button className="bg-white text-gray-900 border border-gray-300 hover:bg-gray-100">Backup</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Section */}
      <Card className="bg-white border-gray-200 mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold">Configuration</CardTitle>
          <CardDescription>System configuration settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <h3 className="font-medium">Email Notifications</h3>
              <p className="text-sm text-gray-500">Send email notifications to users</p>
            </div>
            <Switch className="data-[state=checked]:bg-red-500" defaultChecked />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <h3 className="font-medium">SMS Notifications</h3>
              <p className="text-sm text-gray-500">Send SMS notifications to users</p>
            </div>
            <Switch className="data-[state=checked]:bg-red-500" defaultChecked />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <h3 className="font-medium">Maintenance Mode</h3>
              <p className="text-sm text-gray-500">Put the system in maintenance mode</p>
            </div>
            <Switch className="bg-gray-300 data-[state=checked]:bg-gray-700" />
          </div>

          <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-4">Save Configuration</Button>
        </CardContent>
      </Card>
    </div>
  )
}
