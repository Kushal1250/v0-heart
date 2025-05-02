"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, ChevronUp, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import SystemStatusBar from "@/components/system-status-bar"
import Link from "next/link"

interface User {
  id: string
  email: string
  name: string | null
  password?: string
  role: string
  created_at: string
  provider?: string
  phone?: string
  profile_picture?: string
}

interface Prediction {
  id: string
  userId: string
  userName: string
  result: number
  timestamp: string
  data: Record<string, any>
}

interface SystemHealth {
  database: boolean
  email: boolean
  sms: boolean
  verification: boolean
  passwordReset: boolean
  storage: boolean
  overall: "healthy" | "warning" | "critical"
}

type SortField = "name" | "email" | "created_at"
type SortOrder = "asc" | "desc"

export default function AdminDashboardClient() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [filteredPredictions, setFilteredPredictions] = useState<Prediction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [predictionSearchTerm, setPredictionSearchTerm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [migrationMessage, setMigrationMessage] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null)
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [showPredictionDialog, setShowPredictionDialog] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>("created_at")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [systemHealth, setSystemHealth] = useState({
    database: true,
    email: true,
    sms: true,
    verification: true,
    passwordReset: true,
    storage: true,
    overall: "healthy",
  })
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    totalPredictions: 0,
    averageRisk: 0,
    highRiskCount: 0,
    newUsersToday: 0,
    newPredictionsToday: 0,
  })
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})

  const [showResetDialog, setShowResetDialog] = useState(false)
  const [resetUserId, setResetUserId] = useState("")
  const [resetUserEmail, setResetUserEmail] = useState("")
  const [resetMessage, setResetMessage] = useState("")
  const [isResetting, setIsResetting] = useState(false)

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
          router.push("/admin-login?redirect=/admin")
        }, 2000)
      }
    }

    checkAdmin()
  }, [router])

  // Fetch data when admin status is confirmed
  useEffect(() => {
    if (isAdmin) {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [isAdmin])

  // Filter and sort users based on search term and sort settings
  useEffect(() => {
    let filtered = [...users]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.phone && user.phone.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let valueA: string | null = a[sortField] || ""
      let valueB: string | null = b[sortField] || ""

      // Handle null values
      if (valueA === null) valueA = ""
      if (valueB === null) valueB = ""

      // For dates, convert to timestamp for comparison
      if (sortField === "created_at") {
        const dateA = new Date(valueA).getTime()
        const dateB = new Date(valueB).getTime()
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA
      }

      // For strings, use localeCompare
      return sortOrder === "asc"
        ? valueA.toString().localeCompare(valueB.toString())
        : valueB.toString().localeCompare(valueA.toString())
    })

    setFilteredUsers(filtered)
  }, [searchTerm, users, sortField, sortOrder])

  // Filter predictions based on search term
  useEffect(() => {
    if (predictionSearchTerm) {
      const filtered = predictions.filter(
        (pred) =>
          pred.userName.toLowerCase().includes(predictionSearchTerm.toLowerCase()) ||
          pred.userId.toLowerCase().includes(predictionSearchTerm.toLowerCase()),
      )
      setFilteredPredictions(filtered)
    } else {
      setFilteredPredictions(predictions)
    }
  }, [predictionSearchTerm, predictions])

  // Calculate statistics
  useEffect(() => {
    if (users.length > 0 || predictions.length > 0) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const newUsersToday = users.filter((user) => {
        const createdDate = new Date(user.created_at)
        return createdDate >= today
      }).length

      const adminUsers = users.filter((user) => user.role === "admin").length

      const newPredictionsToday = predictions.filter((pred) => {
        const predDate = new Date(pred.timestamp)
        return predDate >= today
      }).length

      const highRiskCount = predictions.filter((pred) => pred.result > 0.5).length

      const totalRisk = predictions.reduce((sum, pred) => sum + pred.result, 0)
      const averageRisk = predictions.length > 0 ? totalRisk / predictions.length : 0

      setStats({
        totalUsers: users.length,
        activeUsers: users.length - adminUsers, // Simplified active user count
        adminUsers,
        totalPredictions: predictions.length,
        averageRisk,
        highRiskCount,
        newUsersToday,
        newPredictionsToday,
      })
    }
  }, [users, predictions])

  const fetchData = async () => {
    setRefreshing(true)
    setError("")

    try {
      await Promise.all([fetchUsers(), fetchPredictions(), fetchSystemHealth()])
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch data")
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        credentials: "include",
        cache: "no-store",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to fetch users: ${response.status}`)
      }

      const data = await response.json()
      if (data.users) {
        setUsers(data.users)
        setFilteredUsers(data.users)
      }
      return data.users
    } catch (err) {
      console.error("Error fetching users:", err)
      throw err
    }
  }

  const fetchPredictions = async () => {
    try {
      const response = await fetch("/api/admin/predictions", {
        credentials: "include",
        cache: "no-store",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to fetch predictions: ${response.status}`)
      }

      const data = await response.json()
      if (data.predictions) {
        setPredictions(data.predictions)
        setFilteredPredictions(data.predictions)
      }
      return data.predictions
    } catch (err) {
      console.error("Error fetching predictions:", err)
      throw err
    }
  }

  const fetchSystemHealth = async () => {
    try {
      const response = await fetch("/api/admin/system-status", {
        credentials: "include",
        cache: "no-store",
      })

      if (!response.ok) {
        return
      }

      const data = await response.json()

      if (data.success && data.status) {
        // Extract status from the API response
        const dbStatus = data.status.database?.status === "ok" || data.status.database?.status === "connected"
        const emailStatus = data.status.notification?.email?.status === "configured"
        const smsStatus = data.status.notification?.sms?.status === "configured"
        const verificationStatus = data.status.verification?.status === "active"
        const passwordResetStatus = data.status.passwordReset?.status === "active"
        const storageStatus = true // Assuming storage is always available

        // Determine overall health
        const isHealthy =
          dbStatus && emailStatus && smsStatus && verificationStatus && passwordResetStatus && storageStatus

        setSystemHealth({
          database: dbStatus,
          email: emailStatus,
          sms: smsStatus,
          verification: verificationStatus,
          passwordReset: passwordResetStatus,
          storage: storageStatus,
          overall: isHealthy ? "healthy" : "warning",
        })
      }
    } catch (err) {
      console.error("Error fetching system health:", err)
      // Set default values in case of error
      setSystemHealth({
        database: true,
        email: true,
        sms: true,
        verification: true,
        passwordReset: true,
        storage: true,
        overall: "healthy",
      })
    }
  }

  const runMigration = async () => {
    try {
      setMigrating(true)
      setMigrationMessage("")

      const response = await fetch("/api/admin/migrate", {
        credentials: "include",
        cache: "no-store",
      })

      const data = await response.json()

      if (response.ok) {
        setMigrationMessage(data.message || "Migration completed successfully")
        if (data.migrations && data.migrations.length > 0) {
          setMigrationMessage(`${data.message}: ${data.migrations.join(", ")}`)
        }

        // Refresh data after migration
        fetchData()
      } else {
        setMigrationMessage(`Migration failed: ${data.error || "Unknown error"}`)
      }
    } catch (err) {
      console.error("Error during migration:", err)
      setMigrationMessage(err instanceof Error ? err.message : "Migration failed")
    } finally {
      setMigrating(false)
    }
  }

  const handleUserClick = (user: User) => {
    setSelectedUser(user)
    setShowUserDialog(true)
  }

  const handlePredictionClick = (prediction: Prediction) => {
    setSelectedPrediction(prediction)
    setShowPredictionDialog(true)
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to delete user")
      }

      // Remove user from state
      setUsers(users.filter((user) => user.id !== userId))
      setFilteredUsers(filteredUsers.filter((user) => user.id !== userId))
      setDeleteConfirmation(null)
    } catch (err) {
      console.error("Error deleting user:", err)
      setError(err instanceof Error ? err.message : "Failed to delete user")
    }
  }

  const handleUpdateUserRole = async (userId: string, newRole: "user" | "admin") => {
    try {
      const response = await fetch("/api/admin/users/role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ userId, role: newRole }),
      })

      if (!response.ok) {
        throw new Error("Failed to update user role")
      }

      // Update user in state
      const updatedUsers = users.map((user) => (user.id === userId ? { ...user, role: newRole } : user))
      setUsers(updatedUsers)
      setShowUserDialog(false)
    } catch (err) {
      console.error("Error updating user role:", err)
      setError(err instanceof Error ? err.message : "Failed to update user role")
    }
  }

  const handleResetPassword = async (userId: string, email: string) => {
    setResetUserId(userId)
    setResetUserEmail(email)
    setResetMessage("")
    setShowResetDialog(true)
  }

  const confirmResetPassword = async () => {
    try {
      setIsResetting(true)
      setResetMessage("")

      const response = await fetch("/api/admin/users/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ userId: resetUserId, email: resetUserEmail }),
      })

      const data = await response.json()

      if (response.ok) {
        setResetMessage(data.message || "Password reset link has been sent to the user's email")
        setTimeout(() => {
          setShowResetDialog(false)
          setShowUserDialog(false)
        }, 2000)
      } else {
        setResetMessage(`Error: ${data.message || "Failed to reset password"}`)
      }
    } catch (err) {
      console.error("Error resetting password:", err)
      setResetMessage(err instanceof Error ? err.message : "Failed to reset password")
    } finally {
      setIsResetting(false)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      // Set new field and default to ascending order
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return null
    }
    return sortOrder === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4 inline" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4 inline" />
    )
  }

  const handleLoginRetry = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "is_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    router.push("/admin-login?redirect=/admin")
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-lg font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>You do not have permission to access this page.</AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={handleLoginRetry}>Login as Admin</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Add the system status bar at the top */}
      <SystemStatusBar className="sticky top-0 z-10" />

      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/system-status" className="block">
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>View and manage system status</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Monitor database, email, and SMS services</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/email-settings" className="block">
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Email Settings</CardTitle>
                <CardDescription>Configure email service</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Set up and test email delivery</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/verification-settings" className="block">
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Verification Settings</CardTitle>
                <CardDescription>Configure verification methods</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Set up email and SMS verification</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/fix-issues" className="block">
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Fix Issues</CardTitle>
                <CardDescription>Resolve system issues</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Run automated fixes for common problems</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/database-diagnostics" className="block">
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Database Diagnostics</CardTitle>
                <CardDescription>Check database health</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Run diagnostics and view database status</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/detailed-db-diagnostics" className="block">
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Detailed DB Diagnostics</CardTitle>
                <CardDescription>Advanced database checks</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Run detailed database diagnostics</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
