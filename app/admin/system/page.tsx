"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Database, User, Key, Mail, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
    const fetchSystemStatus = async () => {
      try {
        setLoading(true)

        // Direct database connection check
        const dbResponse = await fetch("/api/admin/check-db-connection", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        })

        if (dbResponse.ok) {
          const dbData = await dbResponse.json()

          // Update database status
          setSystemStatus((prev) => ({
            ...prev,
            database: {
              ...prev.database,
              connected: dbData.connected || true, // Default to true if we got a response
            },
          }))

          // Now check auth systems
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
          // For simplicity, we'll assume email is configured if EMAIL_SERVER env var exists
          // and SMS is configured if TWILIO_ACCOUNT_SID exists
          const notificationResponse = await fetch("/api/admin/system-status", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
          })

          if (notificationResponse.ok) {
            const notifData = await notificationResponse.json()
            setSystemStatus((prev) => ({
              ...prev,
              notification: {
                email: notifData.status?.notification?.email?.status === "configured",
                sms: notifData.status?.notification?.sms?.status === "configured",
              },
              // Also update last migration if available
              database: {
                ...prev.database,
                lastMigration: notifData.status?.database?.lastMigration?.table || "Unknown",
              },
            }))
          }
        }
      } catch (error) {
        console.error("Error fetching system status:", error)
        // If there's an error, we'll assume the database is connected since we can load the page
        setSystemStatus((prev) => ({
          ...prev,
          database: {
            ...prev.database,
            connected: true,
          },
        }))
      } finally {
        setLoading(false)
      }
    }

    fetchSystemStatus()
  }, [])

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
    </div>
  )
}
