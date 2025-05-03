"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusIndicator } from "@/components/status-indicator"
import { AlertTriangle, Database, RefreshCw, Settings, Mail, MessageSquare, Key, Lock, Shield } from "lucide-react"

export default function SystemManagementPage() {
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
            router.push("/admin-login?redirect=/admin/system-management")
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
        <h1 className="text-3xl font-bold mb-2">System Management</h1>
        <p className="text-gray-500">Configure and monitor all system components</p>
      </div>

      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-black text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Management
                </CardTitle>
                <CardDescription className="text-gray-400">Manage database and migrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-center">
                  <span>Database Status:</span>
                  <StatusIndicator label="" status="connected" type="database" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Last Migration:</span>
                  <StatusIndicator label="" status="up-to-date" type="migration" />
                </div>
                <Button
                  className="w-full flex items-center justify-center gap-2"
                  variant="outline"
                  onClick={() => router.push("/admin/database-diagnostics")}
                >
                  <Database className="h-4 w-4" />
                  Database Diagnostics
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-black text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Authentication Systems
                </CardTitle>
                <CardDescription className="text-gray-400">Fix auth related issues</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-center">
                  <span>Verification System:</span>
                  <StatusIndicator label="" status="not_configured" type="verification" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Password Reset System:</span>
                  <StatusIndicator label="" status="unknown" type="password-reset" />
                </div>
                <Button
                  className="w-full flex items-center justify-center gap-2"
                  variant="outline"
                  onClick={() => router.push("/admin/verification-settings")}
                >
                  <Key className="h-4 w-4" />
                  Verification Settings
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-black text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Notification Services
                </CardTitle>
                <CardDescription className="text-gray-400">Manage email and SMS services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-center">
                  <span>Email Service:</span>
                  <StatusIndicator label="" status="not_configured" type="email" />
                </div>
                <div className="flex justify-between items-center">
                  <span>SMS Service:</span>
                  <StatusIndicator label="" status="unknown" type="sms" />
                </div>
                <Button
                  className="w-full flex items-center justify-center gap-2"
                  variant="outline"
                  onClick={() => router.push("/admin/email-settings")}
                >
                  <Mail className="h-4 w-4" />
                  Email Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Database Configuration</CardTitle>
              <CardDescription>Manage your database connection and settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Connection Status</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <StatusIndicator label="Database Status" status="connected" type="database" />
                    <StatusIndicator label="Last Migration" status="up-to-date" type="migration" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Database Actions</h3>
                  <div className="flex flex-col gap-2">
                    <Button className="w-full flex items-center gap-2" size="sm">
                      <RefreshCw className="h-4 w-4" />
                      Run Migration
                    </Button>
                    <Button className="w-full flex items-center gap-2" size="sm" variant="outline">
                      <Database className="h-4 w-4" />
                      Database Diagnostics
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="authentication">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Systems</CardTitle>
              <CardDescription>Manage verification and password reset systems</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Verification System</h3>
                  <StatusIndicator label="Status" status="not_configured" type="verification" />
                  <Button className="w-full flex items-center gap-2" size="sm">
                    <Settings className="h-4 w-4" />
                    Configure Verification
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Password Reset System</h3>
                  <StatusIndicator label="Status" status="unknown" type="password-reset" />
                  <Button className="w-full flex items-center gap-2" size="sm">
                    <Lock className="h-4 w-4" />
                    Configure Password Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Services</CardTitle>
              <CardDescription>Manage email and SMS notification services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Email Service</h3>
                  <StatusIndicator label="Status" status="not_configured" type="email" />
                  <Button className="w-full flex items-center gap-2" size="sm">
                    <Mail className="h-4 w-4" />
                    Configure Email
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">SMS Service</h3>
                  <StatusIndicator label="Status" status="unknown" type="sms" />
                  <Button className="w-full flex items-center gap-2" size="sm">
                    <MessageSquare className="h-4 w-4" />
                    Configure SMS
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
