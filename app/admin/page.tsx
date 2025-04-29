"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { AdminCheck } from "@/components/admin-check"

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
    <AdminCheck>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

        {/* Admin dashboard content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">User Management</h2>
            <p>Manage users and permissions</p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Content Management</h2>
            <p>Manage site content and resources</p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Analytics</h2>
            <p>View site analytics and reports</p>
          </div>
        </div>
      </div>
    </AdminCheck>
  )
}
