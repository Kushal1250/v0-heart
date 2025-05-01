"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Database,
  User,
  Mail,
  MessageSquare,
  Activity,
  BarChart2,
  AlertTriangle,
  Shield,
  FileText,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SystemPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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
      setLoading(false)
    }

    checkAdmin()
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading system page...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>You do not have permission to access this page.</AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={() => router.push("/admin-login?redirect=/admin/system")}>Login as Admin</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">System Management</h1>
        <p className="text-muted-foreground">Manage system components and diagnostics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Database Management */}
        <Card className="bg-[#0f1729] text-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Database Management</CardTitle>
            <p className="text-sm text-gray-400">Manage database and migrations</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Database Status:</span>
              <Badge variant="outline" className="bg-transparent">
                Unknown
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Last Migration:</span>
              <span className="text-gray-400">Unknown</span>
            </div>
            <Button variant="outline" className="w-full justify-center" asChild>
              <Link href="/admin/migrate">
                <Database className="mr-2 h-4 w-4" />
                Run Migration
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-center" asChild>
              <Link href="/admin/database-diagnostics">
                <FileText className="mr-2 h-4 w-4" />
                Database Diagnostics
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Authentication Systems */}
        <Card className="bg-[#0f1729] text-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Authentication Systems</CardTitle>
            <p className="text-sm text-gray-400">Fix auth related issues</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Verification System:</span>
              <Badge variant="outline" className="bg-transparent">
                Not Configured
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Password Reset System:</span>
              <Badge variant="outline" className="bg-transparent">
                Active
              </Badge>
            </div>
            <Button variant="outline" className="w-full justify-center" asChild>
              <Link href="/admin/verification-settings">
                <User className="mr-2 h-4 w-4" />
                Fix Verification System
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-center" asChild>
              <Link href="/admin/fix-issues">
                <Shield className="mr-2 h-4 w-4" />
                Fix Password Reset System
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Notification Services */}
        <Card className="bg-[#0f1729] text-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Notification Services</CardTitle>
            <p className="text-sm text-gray-400">Manage email and SMS services</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Email Service:</span>
              <Badge variant="outline" className="bg-transparent">
                Not Configured
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>SMS Service:</span>
              <Badge variant="outline" className="bg-transparent">
                Not Configured
              </Badge>
            </div>
            <Button variant="outline" className="w-full justify-center" asChild>
              <Link href="/admin/email-settings">
                <Mail className="mr-2 h-4 w-4" />
                Email Settings
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-center" asChild>
              <Link href="/admin/sms-diagnostics">
                <MessageSquare className="mr-2 h-4 w-4" />
                SMS Settings
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* System Diagnostics */}
        <Card className="bg-[#0f1729] text-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold">System Diagnostics</CardTitle>
            <p className="text-sm text-gray-400">Debug and repair tools</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-center" asChild>
              <Link href="/admin/diagnostics">
                <Activity className="mr-2 h-4 w-4" />
                General Diagnostics
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-center" asChild>
              <Link href="/admin/email-diagnostics">
                <Mail className="mr-2 h-4 w-4" />
                Email Diagnostics
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-center" asChild>
              <Link href="/admin/sms-diagnostics">
                <MessageSquare className="mr-2 h-4 w-4" />
                SMS Diagnostics
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-center" asChild>
              <Link href="/admin/fix-issues">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Fix System Issues
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Admin Tools */}
        <Card className="bg-[#0f1729] text-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Admin Tools</CardTitle>
            <p className="text-sm text-gray-400">Additional administrative tools</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-center" asChild>
              <Link href="/admin/system-health">
                <BarChart2 className="mr-2 h-4 w-4" />
                System Health
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-center" asChild>
              <Link href="/admin/detailed-db-diagnostics">
                <Database className="mr-2 h-4 w-4" />
                Detailed DB Diagnostics
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-center" asChild>
              <Link href="/admin/reset-token-diagnostics">
                <Shield className="mr-2 h-4 w-4" />
                Reset Token Diagnostics
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-center" asChild>
              <Link href="/admin/fix-database">
                <Settings className="mr-2 h-4 w-4" />
                Fix Database
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
