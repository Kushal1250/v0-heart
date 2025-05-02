"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Database,
  RefreshCw,
  Search,
  Users,
  Eye,
  EyeOff,
  Trash2,
  UserCheck,
  UserX,
  Key,
  ChevronUp,
  ChevronDown,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

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
  storage: boolean
  overall: "healthy" | "warning" | "critical"
}

type SortField = "name" | "email" | "created_at"
type SortOrder = "asc" | "desc"

export default function AdminDashboard() {
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
        const dbStatus = data.status.database?.status === "ok"
        const emailStatus = data.status.notification?.email?.status === "configured"
        const smsStatus = data.status.notification?.sms?.status === "configured"
        const storageStatus = true // Assuming storage is always available

        // Determine overall health
        const isHealthy = dbStatus && emailStatus && smsStatus && storageStatus

        setSystemHealth({
          database: dbStatus,
          email: emailStatus,
          sms: smsStatus,
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
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, view predictions, and monitor system health</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={runMigration}
            disabled={migrating}
            className="flex items-center gap-2"
          >
            <Database className={`h-4 w-4 ${migrating ? "animate-pulse" : ""}`} />
            {migrating ? "Migrating..." : "Run Migration"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </Button>
        </div>
      </div>

      {migrationMessage && (
        <Alert variant={migrationMessage.includes("failed") ? "destructive" : "default"} className="mb-6">
          <AlertDescription>{migrationMessage}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={handleLoginRetry}>
              Re-login
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue={activeTab} className="mb-6" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">{stats.newUsersToday} new today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPredictions}</div>
                <p className="text-xs text-muted-foreground">{stats.newPredictionsToday} new today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Risk</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(stats.averageRisk * 100).toFixed(1)}%</div>
                <Progress value={stats.averageRisk * 100} className="mt-2" />
              </CardContent>
            </Card>

            {/* System Health Card */}
            <Card className="bg-[#0c0c14] border-[#1e1e2f] text-white">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-medium">System Health</CardTitle>
                  <div className="text-green-500">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L20 18H4L12 2Z" fill="currentColor" />
                    </svg>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <h2 className="text-3xl font-bold mb-4">Healthy</h2>
                <div className="grid grid-cols-2 gap-y-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span>Database</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span>Email</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span>SMS</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span>Storage</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Latest user registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.name || "Unnamed User"}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Badge variant={user.role === "admin" ? "default" : "outline"}>{user.role}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveTab("users")}>
                  View All Users
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Predictions</CardTitle>
                <CardDescription>Latest heart disease risk assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictions.slice(0, 5).map((prediction) => (
                    <div key={prediction.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{prediction.userName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(prediction.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge
                        variant={prediction.result > 0.5 ? "destructive" : "success"}
                        className={prediction.result > 0.5 ? "bg-red-600" : "bg-green-600"}
                      >
                        {(prediction.result * 100).toFixed(0)}% Risk
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveTab("predictions")}>
                  View All Predictions
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* System Status Card - Added to bottom of Dashboard */}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email or phone"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {filteredUsers.length} of {users.length} users
              </span>
            </div>
          </div>

          <div className="rounded-md border border-[#1e1e2f]">
            <Table>
              <TableHeader className="bg-[#0c0c14] text-white">
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-[#1e1e2f] transition-colors"
                    onClick={() => handleSort("name")}
                  >
                    Name {getSortIcon("name")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-[#1e1e2f] transition-colors"
                    onClick={() => handleSort("email")}
                  >
                    Email {getSortIcon("email")}
                  </TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-[#1e1e2f] transition-colors"
                    onClick={() => handleSort("created_at")}
                  >
                    Created {getSortIcon("created_at")}
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name || "N/A"}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="relative">
                          <Input
                            type={showPasswords[user.id] ? "text" : "password"}
                            defaultValue={user.password || "password123"}
                            className="h-8 w-24 text-xs pr-8"
                            onChange={(e) => {
                              // Update password in local state
                              const updatedUsers = users.map((u) =>
                                u.id === user.id ? { ...u, password: e.target.value } : u,
                              )
                              setUsers(updatedUsers)
                            }}
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            onClick={() => {
                              setShowPasswords((prev) => ({
                                ...prev,
                                [user.id]: !prev[user.id],
                              }))
                            }}
                          >
                            {showPasswords[user.id] ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "outline"}>{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{user.provider || "email"}</Badge>
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleUserClick(user)}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View user</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleResetPassword(user.id, user.email)}>
                            <Key className="h-4 w-4" />
                            <span className="sr-only">Reset password</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search predictions by user"
                value={predictionSearchTerm}
                onChange={(e) => setPredictionSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {filteredPredictions.length} of {predictions.length} predictions
              </span>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPredictions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No predictions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPredictions.map((pred) => (
                    <TableRow key={pred.id}>
                      <TableCell className="font-medium">{pred.userName}</TableCell>
                      <TableCell>
                        <Badge
                          variant={pred.result > 0.5 ? "destructive" : "success"}
                          className={pred.result > 0.5 ? "bg-red-600" : "bg-green-600"}
                        >
                          {(pred.result * 100).toFixed(1)}% Risk
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(pred.timestamp).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handlePredictionClick(pred)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View details</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Status of system components</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Database Connection</span>
                    <Badge variant={systemHealth.database ? "success" : "destructive"}>
                      {systemHealth.database ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>
                  <Progress value={systemHealth.database ? 100 : 0} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Email Service</span>
                    <Badge variant={systemHealth.email ? "success" : "destructive"}>
                      {systemHealth.email ? "Configured" : "Not Configured"}
                    </Badge>
                  </div>
                  <Progress value={systemHealth.email ? 100 : 0} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">SMS Service</span>
                    <Badge variant={systemHealth.sms ? "success" : "destructive"}>
                      {systemHealth.sms ? "Configured" : "Not Configured"}
                    </Badge>
                  </div>
                  <Progress value={systemHealth.sms ? 100 : 0} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Storage</span>
                    <Badge variant={systemHealth.storage ? "success" : "destructive"}>
                      {systemHealth.storage ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                  <Progress value={systemHealth.storage ? 100 : 0} className="h-2" />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => router.push("/admin/diagnostics")}
                >
                  Run Diagnostics
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Management</CardTitle>
                <CardDescription>Manage database operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Run Database Migration</div>
                    <div className="text-xs text-muted-foreground">Update database schema</div>
                  </div>
                  <Button variant="outline" size="sm" onClick={runMigration} disabled={migrating}>
                    {migrating ? "Migrating..." : "Migrate"}
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Fix Verification Codes</div>
                    <div className="text-xs text-muted-foreground">Repair verification system</div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push("/admin/fix-issues")}>
                    Fix Issues
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Database Backup</div>
                    <div className="text-xs text-muted-foreground">Create a backup of the database</div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => alert("Backup functionality not implemented")}>
                    Backup
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>System configuration settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">Send email notifications to users</p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <p className="text-xs text-muted-foreground">Send SMS notifications to users</p>
                </div>
                <Switch id="sms-notifications" defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  <p className="text-xs text-muted-foreground">Put the system in maintenance mode</p>
                </div>
                <Switch id="maintenance-mode" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Save Configuration</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Details Dialog */}
      {selectedUser && (
        <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>Detailed information about the selected user.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold">
                  {selectedUser.name
                    ? selectedUser.name.charAt(0).toUpperCase()
                    : selectedUser.email.charAt(0).toUpperCase()}
                </div>
              </div>

              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-right">Name</Label>
                  <div className="col-span-2">{selectedUser.name || "N/A"}</div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-right">Email</Label>
                  <div className="col-span-2">{selectedUser.email}</div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-right">Password</Label>
                  <div className="col-span-2 relative">
                    <Input
                      type={showPasswords[selectedUser.id] ? "text" : "password"}
                      defaultValue={selectedUser.password || "password123"}
                      className="h-8 pr-8"
                      onChange={(e) => {
                        setSelectedUser({ ...selectedUser, password: e.target.value })
                      }}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => {
                        setShowPasswords((prev) => ({
                          ...prev,
                          [selectedUser.id]: !prev[selectedUser.id],
                        }))
                      }}
                    >
                      {showPasswords[selectedUser.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-right">Phone</Label>
                  <div className="col-span-2">{selectedUser.phone || "N/A"}</div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-right">Role</Label>
                  <div className="col-span-2">
                    <Badge variant={selectedUser.role === "admin" ? "default" : "outline"}>{selectedUser.role}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-right">Provider</Label>
                  <div className="col-span-2">
                    <Badge variant="secondary">{selectedUser.provider || "email"}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-right">Created</Label>
                  <div className="col-span-2">{new Date(selectedUser.created_at).toLocaleString()}</div>
                </div>
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-2">
              <div className="flex flex-wrap gap-2">
                {selectedUser.role === "user" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => handleUpdateUserRole(selectedUser.id, "admin")}
                  >
                    <UserCheck className="h-4 w-4" />
                    Make Admin
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => handleUpdateUserRole(selectedUser.id, "user")}
                  >
                    <UserX className="h-4 w-4" />
                    Remove Admin
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => handleResetPassword(selectedUser.id, selectedUser.email)}
                >
                  <Key className="h-4 w-4" />
                  Reset Password
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => {
                    setShowUserDialog(false)
                    setDeleteConfirmation(selectedUser.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>

              <Button variant="default" onClick={() => setShowUserDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Prediction Details Dialog */}
      {selectedPrediction && (
        <Dialog open={showPredictionDialog} onOpenChange={setShowPredictionDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Prediction Details</DialogTitle>
              <DialogDescription>Detailed information about the selected prediction.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex justify-center">
                <div
                  className={`h-20 w-20 rounded-full flex items-center justify-center text-white text-2xl font-bold ${
                    selectedPrediction.result > 0.5 ? "bg-red-500" : "bg-green-500"
                  }`}
                >
                  {(selectedPrediction.result * 100).toFixed(0)}%
                </div>
              </div>

              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-right">User</Label>
                  <div className="col-span-2">{selectedPrediction.userName}</div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-right">User ID</Label>
                  <div className="col-span-2">{selectedPrediction.userId}</div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-right">Risk Level</Label>
                  <div className="col-span-2">
                    <Badge
                      variant={selectedPrediction.result > 0.5 ? "destructive" : "success"}
                      className={selectedPrediction.result > 0.5 ? "bg-red-600" : "bg-green-600"}
                    >
                      {(selectedPrediction.result * 100).toFixed(1)}% Risk
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-right">Date</Label>
                  <div className="col-span-2">{new Date(selectedPrediction.timestamp).toLocaleString()}</div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Label className="text-right pt-2">Input Data</Label>
                  <div className="col-span-2 max-h-40 overflow-y-auto rounded-md bg-muted p-2 text-xs">
                    <pre>{JSON.stringify(selectedPrediction.data, null, 2)}</pre>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="default" onClick={() => setShowPredictionDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation && (
        <Dialog open={!!deleteConfirmation} onOpenChange={() => setDeleteConfirmation(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this user? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-2">
              <Button variant="outline" onClick={() => setDeleteConfirmation(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => handleDeleteUser(deleteConfirmation)}>
                Delete User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Reset Password Dialog */}
      {showResetDialog && (
        <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reset User Password</DialogTitle>
              <DialogDescription>Send a password reset link to the user's email address.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-right">Email</Label>
                  <div className="col-span-2">
                    <Input
                      value={resetUserEmail}
                      onChange={(e) => setResetUserEmail(e.target.value)}
                      placeholder="user@example.com"
                    />
                  </div>
                </div>
              </div>
              {resetMessage && (
                <div className={`text-sm ${resetMessage.includes("Error") ? "text-red-500" : "text-green-500"}`}>
                  {resetMessage}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowResetDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={confirmResetPassword}
                disabled={isResetting || !resetUserEmail}
                className="flex items-center gap-2"
              >
                {isResetting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4" />
                    Send Reset Link
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
