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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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

      const response = await fetch("/api/admin/system-status", {
        credentials: "include",
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch system status")
      }

      const data = await response.json()

      // Update with actual data from API
      if (data.success && data.status) {
        setSystemStatus({
          database: {
            status: data.status.database?.status === "ok" ? "Connected" : "Unknown",
            lastMigration: data.status.database?.lastMigration?.table || "Unknown",
          },
          authentication: {
            verification: data.status.authentication?.verification?.status || "Not Configured",
            passwordReset: data.status.authentication?.passwordReset?.status || "Active",
          },
          notification: {
            email: data.status.notification?.email?.status || "Not Configured",
            sms: data.status.notification?.sms?.status || "Not Configured",
          },
        })
      }
    } catch (error) {
      console.error("Error fetching system status:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    if (status === "Connected" || status === "Active" || status === "Configured") {
      return <Badge className="bg-green-500 text-white">Active</Badge>
    } else if (status === "Not Configured") {
      return <Badge className="bg-blue-500 text-white">Not Configured</Badge>
    } else {
      return <Badge className="bg-blue-500 text-white">Unknown</Badge>
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
              <Badge className="bg-blue-500 text-white">Unknown</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Last Migration:</span>
              <span className="text-gray-400">Unknown</span>
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
              <Badge className="bg-blue-500 text-white">Not Configured</Badge>
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
              <Badge className="bg-blue-500 text-white">Not Configured</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>SMS Service:</span>
              <Badge className="bg-blue-500 text-white">Not Configured</Badge>
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
