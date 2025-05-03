"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import InitializeDatabase from "@/scripts/initialize-database"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react"

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
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">System Setup</h1>
        <p className="text-gray-500">Configure database and notification services</p>
      </div>

      <Tabs defaultValue="database">
        <TabsList className="mb-6">
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="email">Email Service</TabsTrigger>
          <TabsTrigger value="sms">SMS Service</TabsTrigger>
        </TabsList>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Connection</CardTitle>
              <CardDescription>Check and configure your database connection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Connection Status:</span>
                  {dbStatus ? (
                    dbStatus.success ? (
                      <span className="flex items-center text-green-500">
                        <CheckCircle className="h-4 w-4 mr-1" /> Connected
                      </span>
                    ) : (
                      <span className="flex items-center text-red-500">
                        <XCircle className="h-4 w-4 mr-1" /> Not Connected
                      </span>
                    )
                  ) : (
                    <span className="flex items-center text-yellow-500">
                      <AlertTriangle className="h-4 w-4 mr-1" /> Unknown
                    </span>
                  )}
                </div>

                {dbStatus && dbStatus.success && (
                  <div className="flex items-center justify-between">
                    <span>Response Time:</span>
                    <span>{dbStatus.responseTime}</span>
                  </div>
                )}

                {dbStatus && !dbStatus.success && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertTitle>Connection Error</AlertTitle>
                    <AlertDescription>{dbStatus.error}</AlertDescription>
                  </Alert>
                )}

                <div className="pt-4">
                  <Button onClick={checkDatabaseStatus} className="mr-2">
                    <RefreshCw className="h-4 w-4 mr-2" /> Check Connection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <InitializeDatabase />
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Service Configuration</CardTitle>
              <CardDescription>Configure your email service for notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  {emailStatus ? (
                    emailStatus.configured ? (
                      <span className="flex items-center text-green-500">
                        <CheckCircle className="h-4 w-4 mr-1" /> Configured
                      </span>
                    ) : (
                      <span className="flex items-center text-yellow-500">
                        <AlertTriangle className="h-4 w-4 mr-1" /> Not Configured
                      </span>
                    )
                  ) : (
                    <span className="flex items-center text-gray-500">
                      <AlertTriangle className="h-4 w-4 mr-1" /> Unknown
                    </span>
                  )}
                </div>

                <Alert className="mt-4">
                  <AlertTitle>Environment Variables Required</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">To configure email, add these environment variables to your project:</p>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      <li>EMAIL_SERVER - SMTP server address</li>
                      <li>EMAIL_PORT - SMTP server port (usually 587)</li>
                      <li>EMAIL_USER - SMTP username</li>
                      <li>EMAIL_PASSWORD - SMTP password</li>
                      <li>EMAIL_FROM - Sender email address</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="pt-4">
                  <Button onClick={checkEmailConfig} className="mr-2">
                    <RefreshCw className="h-4 w-4 mr-2" /> Check Configuration
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SMS Service Configuration</CardTitle>
              <CardDescription>Configure your SMS service for notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  {smsStatus ? (
                    smsStatus.configured ? (
                      <span className="flex items-center text-green-500">
                        <CheckCircle className="h-4 w-4 mr-1" /> Configured
                      </span>
                    ) : (
                      <span className="flex items-center text-yellow-500">
                        <AlertTriangle className="h-4 w-4 mr-1" /> Not Configured
                      </span>
                    )
                  ) : (
                    <span className="flex items-center text-gray-500">
                      <AlertTriangle className="h-4 w-4 mr-1" /> Unknown
                    </span>
                  )}
                </div>

                <Alert className="mt-4">
                  <AlertTitle>Environment Variables Required</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">
                      To configure SMS with Twilio, add these environment variables to your project:
                    </p>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      <li>TWILIO_ACCOUNT_SID - Your Twilio account SID</li>
                      <li>TWILIO_AUTH_TOKEN - Your Twilio auth token</li>
                      <li>TWILIO_PHONE_NUMBER - Your Twilio phone number</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="pt-4">
                  <Button onClick={checkEmailConfig} className="mr-2">
                    <RefreshCw className="h-4 w-4 mr-2" /> Check Configuration
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
