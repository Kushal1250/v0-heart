"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, Users, Shield, Activity, RefreshCw, Eye, Database } from "lucide-react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  name: string | null
  password?: string
  role: string
  created_at: string
  provider?: string
  phone?: string
}

interface Prediction {
  id: string
  userId: string
  userName: string
  result: number
  timestamp: string
  data: Record<string, any>
}

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
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
  const [userStats, setUserStats] = useState({
    total: 0,
    admins: 0,
    newToday: 0,
  })
  const [activeTab, setActiveTab] = useState("users")

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = () => {
      // Check for admin cookie
      const cookies = document.cookie.split(";")
      const isAdminCookie = cookies.find((cookie) => cookie.trim().startsWith("is_admin="))
      const isAdmin = isAdminCookie ? isAdminCookie.split("=")[1] === "true" : false

      console.log("Admin check:", { isAdmin, cookies: document.cookie })
      setIsAdmin(isAdmin)

      if (!isAdmin) {
        setError("Not authenticated as admin. Please login again.")
      }
    }

    checkAdmin()
  }, [])

  // Function to fetch users from the API
  const fetchUsers = async () => {
    try {
      setRefreshing(true)
      setError("")

      const response = await fetch("/api/admin/users", {
        credentials: "include", // Important: include cookies in the request
        cache: "no-store", // Don't cache the response
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
        setUserStats({
          total: data.users.length,
          admins: data.users.filter((user: User) => user.role === "admin").length,
          newToday: data.users.filter((user: User) => {
            const createdDate = new Date(user.created_at)
            const today = new Date()
            return (
              createdDate.getDate() === today.getDate() &&
              createdDate.getMonth() === today.getMonth() &&
              createdDate.getFullYear() === today.getFullYear()
            )
          }).length,
        })
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
        credentials: "include", // Important: include cookies in the request
        cache: "no-store", // Don't cache the response
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

  useEffect(() => {
    // If admin, fetch data
    if (isAdmin) {
      fetchUsers()
      fetchPredictions()
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
    } else {
      fetchUsers()
      fetchPredictions()
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
    // For now, just show an alert with the prediction data
    alert(JSON.stringify(prediction.data, null, 2))
    // In a real app, you might want to open a modal or navigate to a details page
  }

  if (loading && activeTab === "users") {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    )
  }

  if (predictionLoading && activeTab === "predictions") {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading prediction data...</p>
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
          <Button onClick={handleLoginRetry}>Login as Admin</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
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

      {error && activeTab === "users" && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={handleLoginRetry}>
              Re-login
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {predictionError && activeTab === "predictions" && (
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

      {predictionMessage && activeTab === "predictions" && !predictionError && (
        <Alert className="mb-6">
          <AlertDescription className="flex items-center justify-between">
            <span>{predictionMessage}</span>
            <Button variant="outline" size="sm" onClick={runMigration}>
              Run Migration
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="users" className="mb-6" value={activeTab} onValueChange={(value) => setActiveTab(value)}>
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

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
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Created</TableHead>
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
                      <TableCell className="font-medium">{user.name || "N/A"}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.password || "••••••••"}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "outline"}>{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{user.provider || "email"}</Badge>
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

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
          </div>

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
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.admins}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Today</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.newToday}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
