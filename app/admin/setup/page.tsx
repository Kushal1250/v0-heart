"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { DatabaseInitializer } from "@/components/database-initializer"

export default function SetupPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [dbStatus, setDbStatus] = useState<any>(null)
  const [emailStatus, setEmailStatus] = useState<any>(null)
  const [smsStatus, setSmsStatus] = useState<any>(null)
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
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [router])

  const checkDatabaseStatus = async () => {
    try {
      const response = await fetch("/api/admin/check-db-connection")
      const data = await response.json()
      setDbStatus(data)
    } catch (error) {
      console.error("Error checking database status:", error)
      setDbStatus({ success: false, error: String(error) })
    }
  }

  const checkEmailConfig = async () => {
    try {
      const response = await fetch("/api/admin/notification-services")
      const data = await response.json()
      if (data.success) {
        setEmailStatus(data.email)
        setSmsStatus(data.sms)
      }
    } catch (error) {
      console.error("Error checking email config:", error)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      checkDatabaseStatus()
      checkEmailConfig()
    }
  }, [isAdmin])

  if (loading) {
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
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">System Setup</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Database Setup</CardTitle>
            <CardDescription>Initialize your database with required tables and sample data</CardDescription>
          </CardHeader>
          <CardContent>
            <DatabaseInitializer />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>After initializing your database, follow these steps</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Return to the{" "}
                <a href="/admin" className="text-blue-600 hover:underline">
                  Admin Dashboard
                </a>
              </li>
              <li>Check that predictions are now visible</li>
              <li>Configure email and SMS services if needed</li>
              <li>Explore the system features</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
