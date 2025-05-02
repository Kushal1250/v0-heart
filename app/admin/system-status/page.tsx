"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import SystemStatusDisplay from "@/components/system-status-display"
import { useRouter } from "next/navigation"

export default function SystemStatusPage() {
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
            router.push("/admin-login")
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
          <AlertTitle>Unauthorized</AlertTitle>
          <AlertDescription>You do not have permission to access this page. Redirecting to login...</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">System Status Dashboard</h1>
        <p className="text-gray-500">Monitor the health and status of all system components</p>
      </div>

      <div className="mb-8">
        <SystemStatusDisplay refreshInterval={30000} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>System management actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" onClick={() => router.push("/admin/system")}>
              Go to System Management
            </Button>
            <Button className="w-full" variant="outline" onClick={() => router.push("/admin")}>
              Return to Admin Dashboard
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documentation</CardTitle>
            <CardDescription>System status information</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              This dashboard provides real-time information about the status of all system components:
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-500 space-y-2">
              <li>
                <strong>Database:</strong> Connection status and response time
              </li>
              <li>
                <strong>Authentication:</strong> Status of verification and password reset systems
              </li>
              <li>
                <strong>Notification:</strong> Email and SMS service configuration status
              </li>
              <li>
                <strong>System Health:</strong> Memory usage, uptime, and recent errors
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
