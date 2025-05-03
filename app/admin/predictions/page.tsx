"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, Search, RefreshCw, AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
import { Label } from "@/components/ui/label"

interface Prediction {
  id: string
  userId: string
  userName: string
  result: number
  timestamp: string
  data: Record<string, any>
}

type SortField = "userName" | "result" | "timestamp" | "userId"
type SortDirection = "asc" | "desc"

export default function PredictionsPage() {
  const router = useRouter()
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [filteredPredictions, setFilteredPredictions] = useState<Prediction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null)
  const [showPredictionDialog, setShowPredictionDialog] = useState(false)
  const [sortField, setSortField] = useState<SortField>("timestamp")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

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
          router.push("/admin-login?redirect=/admin/predictions")
        }, 2000)
      }
    }

    checkAdmin()
  }, [router])

  // Fetch data when admin status is confirmed
  useEffect(() => {
    if (isAdmin) {
      fetchPredictions()
    } else {
      setLoading(false)
    }
  }, [isAdmin])

  // Filter predictions based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = predictions.filter(
        (pred) =>
          pred.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pred.userId.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredPredictions(filtered)
    } else {
      setFilteredPredictions(predictions)
    }
  }, [searchTerm, predictions])

  // Function to handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // Set new field and default to ascending
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Function to get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />
    }
    return sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
  }

  // Sort predictions
  const sortedPredictions = [...filteredPredictions].sort((a, b) => {
    if (sortField === "userName") {
      return sortDirection === "asc" ? a.userName.localeCompare(b.userName) : b.userName.localeCompare(a.userName)
    } else if (sortField === "result") {
      return sortDirection === "asc" ? a.result - b.result : b.result - a.result
    } else if (sortField === "timestamp") {
      return sortDirection === "asc"
        ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    } else if (sortField === "userId") {
      return sortDirection === "asc" ? a.userId.localeCompare(b.userId) : b.userId.localeCompare(a.userId)
    }
    return 0
  })

  const fetchPredictions = async () => {
    try {
      setRefreshing(true)
      setError("")

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
    } catch (err) {
      console.error("Error fetching predictions:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch predictions")
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }

  const handlePredictionClick = (prediction: Prediction) => {
    setSelectedPrediction(prediction)
    setShowPredictionDialog(true)
  }

  const handleLoginRetry = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "is_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    router.push("/admin-login?redirect=/admin/predictions")
  }

  // Function to truncate UUID for display
  const truncateId = (id: string) => {
    if (!id) return "N/A"
    return id.substring(0, 8) + "..."
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-lg font-medium">Loading predictions...</p>
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
    <div className="container mx-auto p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Predictions</h1>
          <p className="text-muted-foreground">View and manage heart disease risk predictions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin")}>
            Back to Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={fetchPredictions}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

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

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search predictions by user"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("userName")}>
                <div className="flex items-center">
                  User
                  {getSortIcon("userName")}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("result")}>
                <div className="flex items-center">
                  Risk Level
                  {getSortIcon("result")}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("timestamp")}>
                <div className="flex items-center">
                  Date
                  {getSortIcon("timestamp")}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("userId")}>
                <div className="flex items-center">
                  User ID
                  {getSortIcon("userId")}
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPredictions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {predictions.length === 0 ? (
                    <div className="flex flex-col items-center gap-2">
                      <p>No predictions found</p>
                      <Button variant="outline" size="sm" onClick={() => router.push("/admin/sample-data")}>
                        Generate Sample Predictions
                      </Button>
                    </div>
                  ) : (
                    "No matching predictions found"
                  )}
                </TableCell>
              </TableRow>
            ) : (
              sortedPredictions.map((pred) => (
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
                  <TableCell>
                    <span title={pred.userId} className="text-xs font-mono bg-muted px-1 py-0.5 rounded">
                      {truncateId(pred.userId)}
                    </span>
                  </TableCell>
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
                  <div className="col-span-2">
                    <code className="bg-muted px-1 py-0.5 rounded text-xs">{selectedPrediction.userId}</code>
                  </div>
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
    </div>
  )
}
