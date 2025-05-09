"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, RefreshCw, Search } from "lucide-react"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"

interface Prediction {
  id: string
  userId: string
  userName: string
  email: string
  result: number
  timestamp: string
  data: Record<string, any>
}

type SortField = "userName" | "result" | "timestamp" | "userId" | "email"
type SortDirection = "asc" | "desc"

export function AdminPredictionsTable() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null)
  const [showPredictionDialog, setShowPredictionDialog] = useState(false)
  const [sortField, setSortField] = useState<SortField>("timestamp")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [searchTerm, setSearchTerm] = useState("")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    fetchPredictions()

    // Set up auto-refresh every 30 seconds
    const intervalId = setInterval(() => {
      fetchPredictions(true)
    }, 30000)

    return () => clearInterval(intervalId)
  }, [])

  const fetchPredictions = async (silent = false) => {
    try {
      if (!silent) {
        setRefreshing(true)
        setError(null)
      }

      // Add search term to query if provided
      const url = searchTerm
        ? `/api/admin/predictions?search=${encodeURIComponent(searchTerm)}`
        : "/api/admin/predictions"

      const response = await fetch(url, {
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
        setLastUpdated(new Date())
      }
    } catch (err) {
      console.error("Error fetching predictions:", err)
      if (!silent) {
        setError(err instanceof Error ? err.message : "Failed to fetch predictions")
      }
    } finally {
      if (!silent) {
        setRefreshing(false)
        setLoading(false)
      }
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchPredictions()
  }

  const handlePredictionClick = (prediction: Prediction) => {
    setSelectedPrediction(prediction)
    setShowPredictionDialog(true)
  }

  // Function to truncate UUID for display
  const truncateId = (id: string) => {
    if (!id) return "N/A"
    return id.substring(0, 8) + "..."
  }

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
  const sortedPredictions = [...predictions].sort((a, b) => {
    if (sortField === "userName") {
      return sortDirection === "asc" ? a.userName.localeCompare(b.userName) : b.userName.localeCompare(a.userName)
    } else if (sortField === "email") {
      return sortDirection === "asc" ? a.email.localeCompare(b.email) : b.email.localeCompare(a.email)
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

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="rounded-md border">
          <div className="border-b px-4 py-3">
            <Skeleton className="h-5 w-full" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-4 py-3 border-b last:border-0">
              <Skeleton className="h-5 w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recent Predictions</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : ""}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchPredictions()}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by user name or email..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("userName")}>
                User
                {getSortIcon("userName")}
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("email")}>
                Email
                {getSortIcon("email")}
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("result")}>
                Risk Level
                {getSortIcon("result")}
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("timestamp")}>
                Date
                {getSortIcon("timestamp")}
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPredictions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p>No predictions found</p>
                    <Button variant="outline" size="sm" onClick={() => fetchPredictions()}>
                      Refresh
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedPredictions.map((pred) => (
                <TableRow key={pred.id}>
                  <TableCell className="font-medium">{pred.userName}</TableCell>
                  <TableCell>{pred.email}</TableCell>
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
                  <Label className="text-right">Email</Label>
                  <div className="col-span-2">{selectedPrediction.email}</div>
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

                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-right">Prediction ID</Label>
                  <div className="col-span-2">
                    <code className="bg-muted px-1 py-0.5 rounded text-xs">{selectedPrediction.id}</code>
                  </div>
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
