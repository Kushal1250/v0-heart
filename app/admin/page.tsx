"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  Users,
  Shield,
  Activity,
  RefreshCw,
  Eye,
  Database,
  BarChart3,
  FileText,
  HeartPulse,
  AlertTriangle,
  CheckCircle,
  User,
  UserCog,
  Mail,
  MessageSquare,
  Trash2,
  Download,
  ArrowUpDown,
} from "lucide-react"

interface UserInterface {
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

export default function AdminDashboard() {
  const router = useRouter()
  const [users, setUsers] = useState<UserInterface[]>([])
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserInterface[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [predictionSearchTerm, setPredictionSearchTerm] = useState("")
  const [error, setError] = useState("")
  const [predictionError, setPredictionError] = useState("")
  const [predictionMessage, setPredictionMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [predictionLoading, setPredictionLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [migrationMessage, setMigrationMessage] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null)
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "ascending" | "descending"
  } | null>(null)

  const [stats, setStats] = useState({
    users: {
      total: 0,
      admins: 0,
      newToday: 0,
      providers: { email: 0, google: 0, facebook: 0, github: 0 },
    },
    predictions: {
      total: 0,
      highRisk: 0,
      lowRisk: 0,
      avgRisk: 0,
      todayCount: 0,
    },
    system: {
      dbStatus: "Unknown",
      lastMigration: "Unknown",
      emailConfigured: false,
      smsConfigured: false,
    },
  })

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = () => {
      // Check for admin cookie
      const cookies = document.cookie.split(";")
      const isAdminCookie = cookies.find((cookie) => cookie.trim().startsWith("is_admin="))
      const isAdmin = isAdminCookie ? isAdminCookie.split("=")[1] === "true" : false

      console.log("Admin check:", { isAdmin })
      setIsAdmin(isAdmin)

      if (!isAdmin) {
        setError("Not authenticated as admin. Please login again.")
        // Redirect to admin login if not admin
        setTimeout(() => {
          router.push("/admin-login?redirect=/admin")
        }, 2000)
      }
    }

    checkAdmin()
  }, [router])

  // Function to fetch users from the API
  const fetchUsers = async () => {
    try {
      setRefreshing(true)
      setError("")

      const response = await fetch("/api/admin/users", {
        credentials: "include",
        cache: "no-store",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.message || `Failed to fetch users: ${response.status}`
        const errorDetails = errorData.error ? ` (${errorData.error})` : ""
        throw new Error(`${errorMessage}${errorDetails}`)
      }

      const data = await response.json()

      if (data.users) {
        setUsers(data.users)
        setFilteredUsers(data.users)

        // Calculate statistics
        const totalUsers = data.users.length
        const admins = data.users.filter((user: UserInterface) => user.role === "admin").length

        const newToday = data.users.filter((user: UserInterface) => {
          const createdDate = new Date(user.created_at)
          const today = new Date()
          return (
            createdDate.getDate() === today.getDate() &&
            createdDate.getMonth() === today.getMonth() &&
            createdDate.getFullYear() === today.getFullYear()
          )
        }).length

        // Count providers
        const providers = {
          email: data.users.filter((user: UserInterface) => !user.provider || user.provider === "email").length,
          google: data.users.filter((user: UserInterface) => user.provider === "google").length,
          facebook: data.users.filter((user: UserInterface) => user.provider === "facebook").length,
          github: data.users.filter((user: UserInterface) => user.provider === "github").length,
        }

        // Update stats
        setStats((prevStats) => ({
          ...prevStats,
          users: {
            total: totalUsers,
            admins,
            newToday,
            providers,
          },
        }))
      }
      setLoading(false)
      setRefreshing(false)
    } catch (err) {
      console.error("Error fetching users:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch users")
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Function to fetch predictions from the API
  const fetchPredictions = async () => {
    try {
      setPredictionLoading(true)
      setPredictionError("")
      setPredictionMessage("")

      const response = await fetch("/api/admin/predictions", {
        credentials: "include",
        cache: "no-store",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.message || `Failed to fetch predictions: ${response.status}`
        const errorDetails = errorData.error ? ` (${errorData.error})` : ""
        throw new Error(`${errorMessage}${errorDetails}`)
      }

      const data = await response.json()

      if (data.predictions) {
        setPredictions(data.predictions)

        // Calculate prediction statistics
        const totalPredictions = data.predictions.length
        const highRisk = data.predictions.filter((p: Prediction) => p.result > 0.5).length
        const lowRisk = data.predictions.filter((p: Prediction) => p.result <= 0.5).length

        let avgRisk = 0
        if (totalPredictions > 0) {
          const sum = data.predictions.reduce((acc: number, p: Prediction) => acc + p.result, 0)
          avgRisk = sum / totalPredictions
        }

        // Count predictions from today
        const todayCount = data.predictions.filter((p: Prediction) => {
          const predDate = new Date(p.timestamp)
          const today = new Date()
          return (
            predDate.getDate() === today.getDate() &&
            predDate.getMonth() === today.getMonth() &&
            predDate.getFullYear() === today.getFullYear()
          )
        }).length

        // Update stats
        setStats((prevStats) => ({
          ...prevStats,
          predictions: {
            total: totalPredictions,
            highRisk,
            lowRisk,
            avgRisk,
            todayCount,
          },
        }))
      }

      if (data.message) {
        setPredictionMessage(data.message)
      }

      setPredictionLoading(false)
    } catch (err) {
      console.error("Error fetching predictions:", err)
      setPredictionError(err instanceof Error ? err.message : "Failed to fetch predictions")
      setPredictionLoading(false)
    }
  }

  // Function to check system status
  const checkSystemStatus = async () => {
    try {
      const response = await fetch("/api/admin/diagnostics", {
        credentials: "include",
        cache: "no-store",
      })

      if (response.ok) {
        const data = await response.json()

        setStats((prevStats) => ({
          ...prevStats,
          system: {
            dbStatus: data.dbStatus || "Connected",
            lastMigration: data.lastMigration || "Unknown",
            emailConfigured: data.emailConfigured || false,
            smsConfigured: data.smsConfigured || false,
          },
        }))
      }
    } catch (error) {
      console.error("Error checking system status:", error)
    }
  }

  // Function to run database migration
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
        fetchUsers()
        fetchPredictions()
        checkSystemStatus()
      } else {
        setMigrationMessage(`Migration failed: ${data.error || "Unknown error"}`)
      }

      setMigrating(false)
    } catch (err) {
      console.error("Error during migration:", err)
      setMigrationMessage(err instanceof Error ? err.message : "Migration failed")
      setMigrating(false)
    }
  }

  // Function to fix verification codes table
  const fixVerificationCodes = async () => {
    try {
      setMigrating(true)
      setMigrationMessage("")

      const response = await fetch("/api/admin/migrate/fix-verification-codes", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      })

      const data = await response.json()

      if (response.ok) {
        setMigrationMessage(data.message || "Verification codes table fixed successfully")
      } else {
        setMigrationMessage(`Verification codes fix failed: ${data.message || "Unknown error"}`)
      }

      setMigrating(false)
    } catch (err) {
      console.error("Error fixing verification codes:", err)
      setMigrationMessage(err instanceof Error ? err.message : "Verification codes fix failed")
      setMigrating(false)
    }
  }

  // Function to fix password reset tokens
  const fixPasswordResetTokens = async () => {
    try {
      setMigrating(true)
      setMigrationMessage("")

      const response = await fetch("/api/admin/fix-reset-tokens", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      })

      const data = await response.json()

      if (response.ok) {
        setMigrationMessage(data.message || "Password reset tokens fixed successfully")
      } else {
        setMigrationMessage(`Password reset tokens fix failed: ${data.message || "Unknown error"}`)
      }

      setMigrating(false)
    } catch (err) {
      console.error("Error fixing password reset tokens:", err)
      setMigrationMessage(err instanceof Error ? err.message : "Password reset tokens fix failed")
      setMigrating(false)
    }
  }

  // Function to handle sorting
  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"

    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }

    setSortConfig({ key, direction })
  }

  // Apply sorting to users
  useEffect(() => {
    if (sortConfig !== null) {
      const sortedUsers = [...filteredUsers].sort((a, b) => {
        if (a[sortConfig.key as keyof UserInterface] < b[sortConfig.key as keyof UserInterface]) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (a[sortConfig.key as keyof UserInterface] > b[sortConfig.key as keyof UserInterface]) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
      })
      setFilteredUsers(sortedUsers)
    }
  }, [sortConfig])

  useEffect(() => {
    // If admin, fetch data
    if (isAdmin) {
      fetchUsers()
      fetchPredictions()
      checkSystemStatus()
    } else {
      setLoading(false)
      setPredictionLoading(false)
    }
  }, [isAdmin])

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.phone && user.phone.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchTerm, users])

  // Filter predictions based on search term
  const filteredPredictions = predictionSearchTerm
    ? predictions.filter(
        (pred) =>
          pred.userName.toLowerCase().includes(predictionSearchTerm.toLowerCase()) ||
          pred.userId.toLowerCase().includes(predictionSearchTerm.toLowerCase()),
      )
    : predictions

  // Handle manual refresh
  const handleRefresh = () => {
    if (activeTab === "users") {
      fetchUsers()
    } else if (activeTab === "predictions") {
      fetchPredictions()
    } else if (activeTab === "dashboard") {
      fetchUsers()
      fetchPredictions()
      checkSystemStatus()
    } else {
      fetchUsers()
      fetchPredictions()
      checkSystemStatus()
    }
  }

  // Handle admin login retry
  const handleLoginRetry = () => {
    // Clear any existing cookies
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "is_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

    // Redirect to admin login
    router.push("/admin-login?redirect=/admin")
  }

  // Handle view prediction details
  const handleViewPredictionDetails = (prediction: Prediction) => {
    setSelectedPrediction(prediction)
  }

  // Handle modal close
  const handleCloseModal = () => {
    setSelectedPrediction(null)
  }

  // Handle navigation to other admin pages
  const navigateToPage = (path: string) => {
    router.push(`/admin/${path}`)
  }

  // Handle user deletion (mock function)
  const handleDeleteUser = (userId: string) => {
    // In a real app, you would call an API to delete the user
    alert(`Delete user with ID: ${userId}`)
  }

  // Handle user role change (mock function)
  const handleChangeRole = (userId: string, currentRole: string) => {
    // In a real app, you would call an API to change the user's role
    const newRole = currentRole === "admin" ? "user" : "admin"
    alert(`Change user ${userId} role from ${currentRole} to ${newRole}`)
  }

  // Export users to CSV
  const exportUsers = () => {
    const headers = ["Name", "Email", "Role", "Provider", "Created"]
    const csvData = users.map((user) => [
      user.name || "N/A",
      user.email,
      user.role,
      user.provider || "email",
      new Date(user.created_at).toLocaleDateString(),
    ])

    const csvContent = [headers.join(","), ...csvData.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `users-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Export predictions to CSV
  const exportPredictions = () => {
    const headers = ["User", "Risk Score", "Date"]
    const csvData = predictions.map((pred) => [
      pred.userName,
      (pred.result * 100).toFixed(0) + "%",
      new Date(pred.timestamp).toLocaleString(),
    ])

    const csvContent = [headers.join(","), ...csvData.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `predictions-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>You do not have permission to access this page.</AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={handleLoginRetry}>Login as Admin</Button>
        </div>
      </div>
    )
  }

  const renderLoading = (message: string) => (
    <div className="flex h-[40vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, view predictions, and monitor system health</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
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
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={handleLoginRetry}>
              Re-login
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="dashboard" className="mb-6" value={activeTab} onValueChange={(value) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-4 md:w-auto md:grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="predictions">Assessments</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users.total}</div>
                <p className="text-xs text-muted-foreground">{stats.users.newToday} new today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assessments</CardTitle>
                <HeartPulse className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.predictions.total}</div>
                <p className="text-xs text-muted-foreground">{stats.predictions.todayCount} new today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Risk Score</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(stats.predictions.avgRisk * 100).toFixed(1)}%</div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-red-500"
                      style={{ width: `${stats.predictions.avgRisk * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Recently registered users</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex h-[200px] items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.slice(0, 5).map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name || "N/A"}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("users")}
                    className="flex items-center gap-2"
                  >
                    <Users className="h-3.5 w-3.5" />
                    View All Users
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Assessments</CardTitle>
                <CardDescription>Latest heart health assessments</CardDescription>
              </CardHeader>
              <CardContent>
                {predictionLoading ? (
                  <div className="flex h-[200px] items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Risk</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {predictions.slice(0, 5).map((pred) => (
                          <TableRow key={pred.id}>
                            <TableCell className="font-medium">{pred.userName}</TableCell>
                            <TableCell>
                              <Badge
                                variant={pred.result > 0.5 ? "destructive" : "success"}
                                className={pred.result > 0.5 ? "bg-red-600" : "bg-green-600"}
                              >
                                {(pred.result * 100).toFixed(0)}% Risk
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(pred.timestamp).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("predictions")}
                    className="flex items-center gap-2"
                  >
                    <HeartPulse className="h-3.5 w-3.5" />
                    View All Assessments
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Health of various system components</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Database</span>
                  <div className="flex items-center gap-2">
                    {stats.system.dbStatus === "Connected" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm">{stats.system.dbStatus}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Email Service</span>
                  <div className="flex items-center gap-2">
                    {stats.system.emailConfigured ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm">{stats.system.emailConfigured ? "Configured" : "Not Configured"}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">SMS Service</span>
                  <div className="flex items-center gap-2">
                    {stats.system.smsConfigured ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm">{stats.system.smsConfigured ? "Configured" : "Not Configured"}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Last Migration</span>
                  <span className="text-sm">{stats.system.lastMigration}</span>
                </div>
              </div>

              <Separator className="my-4" />

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
                  onClick={fixVerificationCodes}
                  disabled={migrating}
                  className="flex items-center gap-2"
                >
                  <User className={`h-4 w-4 ${migrating ? "animate-pulse" : ""}`} />
                  Fix Verification System
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={fixPasswordResetTokens}
                  disabled={migrating}
                  className="flex items-center gap-2"
                >
                  <Shield className={`h-4 w-4 ${migrating ? "animate-pulse" : ""}`} />
                  Fix Reset Tokens
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateToPage("diagnostics")}
                  className="flex items-center gap-2"
                >
                  <Activity className="h-4 w-4" />
                  System Diagnostics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4 pt-4">
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
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportUsers} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => navigateToPage("user-management")}
                className="flex items-center gap-2"
              >
                <UserCog className="h-4 w-4" />
                User Management
              </Button>
            </div>
          </div>

          {loading ? (
            renderLoading("Loading user data...")
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => requestSort("name")} className="cursor-pointer">
                      <div className="flex items-center">
                        Name
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead onClick={() => requestSort("email")} className="cursor-pointer">
                      <div className="flex items-center">
                        Email
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead onClick={() => requestSort("created_at")} className="cursor-pointer">
                      <div className="flex items-center">
                        Created
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {user.profile_picture ? (
                              <div
                                className="h-8 w-8 rounded-full bg-cover bg-center"
                                style={{ backgroundImage: `url(${user.profile_picture})` }}
                              />
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                <User className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                            <span>{user.name || "N/A"}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === "admin" ? "default" : "outline"}>{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{user.provider || "email"}</Badge>
                        </TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleChangeRole(user.id, user.role)}
                              className="h-8 w-8 p-0"
                            >
                              <Shield className="h-4 w-4" />
                              <span className="sr-only">Change Role</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4 pt-4">
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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Badge className="bg-red-600">High Risk</Badge>
                <span className="text-sm text-muted-foreground">{stats.predictions.highRisk}</span>
              </div>
              <div className="flex items-center gap-1">
                <Badge className="bg-green-600">Low Risk</Badge>
                <span className="text-sm text-muted-foreground">{stats.predictions.lowRisk}</span>
              </div>
              <Button variant="outline" size="sm" onClick={exportPredictions} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {predictionError && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription className="flex items-center justify-between">
                <span>{predictionError}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={runMigration}>
                    Run Migration
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleLoginRetry}>
                    Re-login
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {predictionMessage && !predictionError && (
            <Alert className="mb-6">
              <AlertDescription className="flex items-center justify-between">
                <span>{predictionMessage}</span>
                <Button variant="outline" size="sm" onClick={runMigration}>
                  Run Migration
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {predictionLoading ? (
            renderLoading("Loading prediction data...")
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Prediction Result</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPredictions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        {predictionMessage ? (
                          <div className="flex flex-col items-center gap-2">
                            <p>{predictionMessage}</p>
                            <Button variant="outline" size="sm" onClick={runMigration}>
                              Run Migration
                            </Button>
                          </div>
                        ) : (
                          "No predictions found"
                        )}
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
                            {(pred.result * 100).toFixed(0)}% Risk
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(pred.timestamp).toLocaleString()}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewPredictionDetails(pred)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Prediction Details Modal */}
          {selectedPrediction && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg bg-background p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Assessment Details</h3>
                  <Button variant="ghost" size="sm" onClick={handleCloseModal}>
                    &times;
                  </Button>
                </div>
                <Separator className="my-2" />
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">User</p>
                    <p>{selectedPrediction.userName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Risk Score</p>
                    <Badge
                      variant={selectedPrediction.result > 0.5 ? "destructive" : "success"}
                      className={selectedPrediction.result > 0.5 ? "bg-red-600" : "bg-green-600"}
                    >
                      {(selectedPrediction.result * 100).toFixed(0)}% Risk
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Date</p>
                    <p>{new Date(selectedPrediction.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">User ID</p>
                    <p className="truncate text-sm">{selectedPrediction.userId}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-semibold text-muted-foreground">Assessment Data</p>
                  <pre className="mt-2 max-h-[300px] overflow-auto rounded-md bg-muted p-4 text-xs">
                    {JSON.stringify(selectedPrediction.data, null, 2)}
                  </pre>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleCloseModal}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="system" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Database Management</CardTitle>
                <CardDescription>Manage database and migrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database Status:</span>
                  <Badge variant="outline">{stats.system.dbStatus}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Migration:</span>
                  <span className="text-sm text-muted-foreground">{stats.system.lastMigration}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={runMigration}
                    disabled={migrating}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Database className={`h-4 w-4 ${migrating ? "animate-pulse" : ""}`} />
                    {migrating ? "Migrating..." : "Run Migration"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateToPage("database-diagnostics")}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Database Diagnostics
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Authentication Systems</CardTitle>
                <CardDescription>Fix auth related issues</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Verification System:</span>
                  <Badge
                    variant={stats.system.emailConfigured ? "default" : "outline"}
                    className={stats.system.emailConfigured ? "bg-green-600" : ""}
                  >
                    {stats.system.emailConfigured ? "Active" : "Not Configured"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Password Reset System:</span>
                  <Badge variant="outline">Active</Badge>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fixVerificationCodes}
                    disabled={migrating}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <User className={`h-4 w-4 ${migrating ? "animate-pulse" : ""}`} />
                    Fix Verification System
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fixPasswordResetTokens}
                    disabled={migrating}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Shield className={`h-4 w-4 ${migrating ? "animate-pulse" : ""}`} />
                    Fix Password Reset System
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Services</CardTitle>
                <CardDescription>Manage email and SMS services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Service:</span>
                  <Badge
                    variant={stats.system.emailConfigured ? "default" : "outline"}
                    className={stats.system.emailConfigured ? "bg-green-600" : ""}
                  >
                    {stats.system.emailConfigured ? "Configured" : "Not Configured"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">SMS Service:</span>
                  <Badge
                    variant={stats.system.smsConfigured ? "default" : "outline"}
                    className={stats.system.smsConfigured ? "bg-green-600" : ""}
                  >
                    {stats.system.smsConfigured ? "Configured" : "Not Configured"}
                  </Badge>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateToPage("email-settings")}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Email Settings
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateToPage("verification-settings")}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    SMS Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Diagnostics</CardTitle>
                <CardDescription>Debug and repair tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateToPage("diagnostics")}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Activity className="h-4 w-4" />
                    General Diagnostics
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateToPage("email-diagnostics")}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Email Diagnostics
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateToPage("sms-diagnostics")}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    SMS Diagnostics
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateToPage("fix-issues")}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Fix System Issues
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Admin Tools</CardTitle>
                <CardDescription>Additional administrative tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateToPage("system-health")}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    System Health
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateToPage("detailed-db-diagnostics")}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Database className="h-4 w-4" />
                    Detailed DB Diagnostics
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateToPage("reset-token-diagnostics")}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Reset Token Diagnostics
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateToPage("fix-database")}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Database className="h-4 w-4" />
                    Fix Database
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
