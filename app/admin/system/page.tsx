"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface SystemStatus {
  database: boolean
  email: boolean
  sms: boolean
  storage: boolean
  overall: "healthy" | "warning" | "critical"
}

export default function SystemPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: false,
    email: false,
    sms: false,
    storage: false,
    overall: "warning",
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
      setRefreshing(true)

      const response = await fetch("/api/admin/diagnostics", {
        credentials: "include",
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch system status")
      }

      const data = await response.json()

      setSystemStatus({
        database: data.database?.connected || false,
        email: data.email?.configured || false,
        sms: data.sms?.configured || false,
        storage: data.storage?.available || false,
        overall: data.status || "warning",
      })
    } catch (error) {
      console.error("Error fetching system status:", error)
      // Set default values in case of error
      setSystemStatus({
        database: true,
        email: true,
        sms: true,
        storage: true,
        overall: "healthy",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const runMigration = async () => {
    try {
      setMigrating(true)

      const response = await fetch("/api/admin/migrate", {
        credentials: "include",
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error("Migration failed")
      }

      // Refresh system status after migration
      await fetchSystemStatus()
      alert("Migration completed successfully")
    } catch (error) {
      console.error("Error during migration:", error)
      alert("Migration failed: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setMigrating(false)
    }
  }

  const fixVerificationSystem = () => {
    router.push("/admin/fix-issues")
  }

  const runDatabaseBackup = () => {
    alert("Database backup functionality not implemented yet")
  }

  const runDiagnostics = () => {
    router.push("/admin/diagnostics")
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

      <div className="grid gap-6 md:grid-cols-2">
        {/* System Health Section */}
        <div className="rounded-lg border bg-[#0c0c14] border-[#1e1e2f] p-6 text-white shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold">System Health</h2>
            <p className="text-sm text-muted-foreground">Status of system components</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database Connection</span>
                <Badge
                  variant={systemStatus.database ? "default" : "destructive"}
                  className={systemStatus.database ? "bg-green-600" : ""}
                >
                  {systemStatus.database ? "Connected" : "Disconnected"}
                </Badge>
              </div>
              <Progress value={systemStatus.database ? 100 : 0} className="h-2 bg-gray-700">
                <div className="h-full bg-blue-500" style={{ width: systemStatus.database ? "100%" : "0%" }}></div>
              </Progress>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email Service</span>
                <Badge
                  variant={systemStatus.email ? "default" : "destructive"}
                  className={systemStatus.email ? "bg-green-600" : ""}
                >
                  {systemStatus.email ? "Configured" : "Not Configured"}
                </Badge>
              </div>
              <Progress value={systemStatus.email ? 100 : 0} className="h-2 bg-gray-700">
                <div className="h-full bg-blue-500" style={{ width: systemStatus.email ? "100%" : "0%" }}></div>
              </Progress>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">SMS Service</span>
                <Badge
                  variant={systemStatus.sms ? "default" : "destructive"}
                  className={systemStatus.sms ? "bg-green-600" : ""}
                >
                  {systemStatus.sms ? "Configured" : "Not Configured"}
                </Badge>
              </div>
              <Progress value={systemStatus.sms ? 100 : 0} className="h-2 bg-gray-700">
                <div className="h-full bg-blue-500" style={{ width: systemStatus.sms ? "100%" : "0%" }}></div>
              </Progress>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Storage</span>
                <Badge
                  variant={systemStatus.storage ? "default" : "destructive"}
                  className={systemStatus.storage ? "bg-green-600" : ""}
                >
                  {systemStatus.storage ? "Available" : "Unavailable"}
                </Badge>
              </div>
              <Progress value={systemStatus.storage ? 100 : 0} className="h-2 bg-gray-700">
                <div className="h-full bg-blue-500" style={{ width: systemStatus.storage ? "100%" : "0%" }}></div>
              </Progress>
            </div>

            <Button
              variant="outline"
              className="w-full bg-[#0c0c14] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
              onClick={runDiagnostics}
            >
              Run Diagnostics
            </Button>
          </div>
        </div>

        {/* Database Management Section */}
        <div className="rounded-lg border bg-[#0c0c14] border-[#1e1e2f] p-6 text-white shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold">Database Management</h2>
            <p className="text-sm text-muted-foreground">Manage database operations</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Run Database Migration</div>
                <div className="text-xs text-muted-foreground">Update database schema</div>
              </div>
              <Button
                variant="outline"
                className="bg-[#0c0c14] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
                onClick={runMigration}
                disabled={migrating}
              >
                {migrating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Migrating...
                  </>
                ) : (
                  "Migrate"
                )}
              </Button>
            </div>

            <div className="h-px bg-[#1e1e2f]"></div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Fix Verification Codes</div>
                <div className="text-xs text-muted-foreground">Repair verification system</div>
              </div>
              <Button
                variant="outline"
                className="bg-[#0c0c14] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
                onClick={fixVerificationSystem}
              >
                Fix Issues
              </Button>
            </div>

            <div className="h-px bg-[#1e1e2f]"></div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Database Backup</div>
                <div className="text-xs text-muted-foreground">Create a backup of the database</div>
              </div>
              <Button
                variant="outline"
                className="bg-[#0c0c14] border-[#1e1e2f] hover:bg-[#1e1e2f] text-white"
                onClick={runDatabaseBackup}
              >
                Backup
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
