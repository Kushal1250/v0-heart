"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import EnhancedSystemStatus from "@/components/enhanced-system-status"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Database, RefreshCw, Settings, Activity, Mail, MessageSquare } from "lucide-react"

export default function SystemDashboardPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is admin
    const checkAdmin = async () => {
      try {
        const response = await fetch("/api/auth/user")
        const data = await response.json()

        if (data.success && data.user && data.user.role === "admin") {
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
          // Redirect non-admin users
          setTimeout(() => {
            router.push("/admin-login?redirect=/admin/system-dashboard")
          }, 2000)
        }
      } catch (error) {
        console.error("Error checking admin status:", error)
        setIsAdmin(false)
      }
    }

    checkAdmin()
  }, [router])

  if (isAdmin === null) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Checking authorization...</p>
          </div>
        </div>
      </div>
    )
  }

  if (isAdmin === false) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Unauthorized</AlertTitle>
          <AlertDescription>You do not have permission to access this page. Redirecting to login...</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">System Dashboard</h1>
        <p className="text-gray-500">Monitor and manage all system components</p>
      </div>

      <div className="mb-8">
        <EnhancedSystemStatus />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Database Management</CardTitle>
            <CardDescription>Manage database connections and migrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full flex items-center gap-2"
              onClick={() => router.push("/admin/database-diagnostics")}
            >
              <Database className="h-4 w-4" />
              Database Diagnostics
            </Button>
            <Button
              className="w-full flex items-center gap-2"
              variant="outline"
              onClick={() => router.push("/admin/fix-database")}
            >
              <RefreshCw className="h-4 w-4" />
              Run Database Fixes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Authentication Systems</CardTitle>
            <CardDescription>Manage verification and password reset systems</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full flex items-center gap-2"
              onClick={() => router.push("/admin/verification-settings")}
            >
              <Settings className="h-4 w-4" />
              Verification Settings
            </Button>
            <Button
              className="w-full flex items-center gap-2"
              variant="outline"
              onClick={() => router.push("/admin/reset-token-diagnostics")}
            >
              <Activity className="h-4 w-4" />
              Reset Token Diagnostics
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Service</CardTitle>
            <CardDescription>Manage email configuration and testing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full flex items-center gap-2" onClick={() => router.push("/admin/email-settings")}>
              <Mail className="h-4 w-4" />
              Email Settings
            </Button>
            <Button
              className="w-full flex items-center gap-2"
              variant="outline"
              onClick={() => router.push("/admin/email-test")}
            >
              <Activity className="h-4 w-4" />
              Test Email Service
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SMS Service</CardTitle>
            <CardDescription>Manage SMS configuration and testing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full flex items-center gap-2" onClick={() => router.push("/admin/sms-diagnostics")}>
              <MessageSquare className="h-4 w-4" />
              SMS Settings
            </Button>
            <Button
              className="w-full flex items-center gap-2"
              variant="outline"
              onClick={() => router.push("/admin/sms-test")}
            >
              <Activity className="h-4 w-4" />
              Test SMS Service
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
