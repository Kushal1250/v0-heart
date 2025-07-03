"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Eye, Search, RefreshCw, AlertTriangle, BarChart3, Download, Filter, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

interface Prediction {
  id: string
  userId: string
  userName: string
  result: number
  timestamp: string
  data: Record<string, any>
}

interface PaginationInfo {
  total: number
  pages: number
  page: number
  limit: number
}

export default function AdminPredictions() {
  const router = useRouter()
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null)
  const [showPredictionDialog, setShowPredictionDialog] = useState(false)
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    pages: 1,
    page: 1,
    limit: 10,
  })
  const [activeTab, setActiveTab] = useState("all") // This will now control the riskFilter
  const [riskFilter, setRiskFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("newest")
  const [stats, setStats] = useState({
    totalPredictions: 0,
    averageRisk: 0,
    highRiskCount: 0,
    lowRiskCount: 0,
    mediumRiskCount: 0,
    newPredictionsToday: 0,
  })

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

  const fetchPredictions = useCallback(async () => {
    setRefreshing(true)
    setError("")

    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        riskFilter: activeTab === "high-risk" ? "high" : activeTab === "low-risk" ? "low" : riskFilter, // Use activeTab for main risk filter
        dateFilter: dateFilter,
        sortOrder: sortOrder,
      }).toString()

      const response = await fetch(`/api/admin/predictions?${queryParams}`, {
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
      }

      if (data.pagination) {
        setPagination(data.pagination)
      }
    } catch (err) {
      console.error("Error fetching predictions:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch predictions")
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, searchTerm, activeTab, riskFilter, dateFilter, sortOrder])

  // Fetch data when admin status is confirmed or filters/pagination change
  useEffect(() => {
    if (isAdmin) {
      fetchPredictions()
    } else {
      setLoading(false)
    }
  }, [isAdmin, fetchPredictions]) // fetchPredictions is now a dependency

  // Calculate statistics (these stats will now reflect the *entire* dataset, not just the current page)
  // To get stats for the filtered/paginated data, you'd need to calculate them from `predictions` state
  // For overall stats, you might need a separate API endpoint or fetch all data once.
  // For simplicity, let's calculate stats based on the currently fetched `predictions` (which are paginated)
  // If you need global stats, a separate API call for stats without pagination/filters would be ideal.
  useEffect(() => {
    if (predictions.length > 0 || pagination.total > 0) {
      const totalPredictionsInView = predictions.length // Predictions on current page
      const highRiskCountInView = predictions.filter((pred) => pred.result > 0.5).length
      const mediumRiskCountInView = predictions.filter((pred) => pred.result >= 0.3 && pred.result <= 0.5).length
      const lowRiskCountInView = predictions.filter((pred) => pred.result < 0.3).length
      const totalRiskInView = predictions.reduce((sum, pred) => sum + pred.result, 0)
      const averageRiskInView = totalPredictionsInView > 0 ? totalRiskInView / totalPredictionsInView : 0

      // For "new predictions today", we'd ideally need the full dataset or a specific API endpoint.
      // For now, we'll just count from the current page, which might not be accurate for "today".
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const newPredictionsTodayInView = predictions.filter((pred) => {
        const predDate = new Date(pred.timestamp)
        return predDate >= today
      }).length

      setStats({
        totalPredictions: pagination.total, // This should reflect total count from backend
        averageRisk: averageRiskInView, // This is average of current page
        highRiskCount: highRiskCountInView, // This is count on current page
        lowRiskCount: lowRiskCountInView, // This is count on current page
        mediumRiskCount: mediumRiskCountInView, // This is count on current page
        newPredictionsToday: newPredictionsTodayInView, // This is count on current page
      })
    } else {
      setStats({
        totalPredictions: 0,
        averageRisk: 0,
        highRiskCount: 0,
        lowRiskCount: 0,
        mediumRiskCount: 0,
        newPredictionsToday: 0,
      })
    }
  }, [predictions, pagination.total])

  const handlePredictionClick = (prediction: Prediction) => {
    setSelectedPrediction(prediction)
    setShowPredictionDialog(true)
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.pages) return
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleLimitChange = (limit: string) => {
    setPagination((prev) => ({ ...prev, limit: Number.parseInt(limit), page: 1 }))
  }

  const handleLoginRetry = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "is_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    router.push("/admin-login?redirect=/admin/predictions")
  }

  const exportPredictions = async () => {
    // To export all data, we need to fetch all data without pagination/filters
    // For simplicity, this will export the currently filtered/sorted data.
    // For a full export, you'd need a separate API endpoint that returns all data.
    setRefreshing(true)
    try {
      const queryParams = new URLSearchParams({
        search: searchTerm,
        riskFilter: activeTab === "high-risk" ? "high" : activeTab === "low-risk" ? "low" : riskFilter,
        dateFilter: dateFilter,
        sortOrder: sortOrder,
        limit: pagination.total.toString(), // Request all items for export
        page: "1",
      }).toString()

      const response = await fetch(`/api/admin/predictions?${queryParams}`, {
        credentials: "include",
        cache: "no-store",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to fetch all predictions for export: ${response.status}`)
      }

      const data = await response.json()
      const allPredictionsForExport = data.predictions || []

      // Create CSV content
      const headers = ["User", "Risk Level", "Date", "Age", "Gender", "Cholesterol", "Blood Pressure", "Heart Rate"]
      const rows = allPredictionsForExport.map((pred: Prediction) => {
        const data = pred.data || {}
        return [
          pred.userName,
          (pred.result * 100).toFixed(1) + "%",
          new Date(pred.timestamp).toLocaleString(),
          data.age || "N/A",
          data.gender || "N/A",
          data.cholesterol || "N/A",
          data.bloodPressure || "N/A",
          data.heartRate || "N/A",
        ]
      })

      const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `heart-predictions-${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error("Error exporting predictions:", err)
      setError(err instanceof Error ? err.message : "Failed to export predictions")
    } finally {
      setRefreshing(false)
    }
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
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Prediction Management</h1>
          <p className="text-muted-foreground">View and analyze all heart disease risk predictions</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPredictions}
            disabled={refreshing}
            className="flex items-center gap-2 bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportPredictions}
            className="flex items-center gap-2 bg-transparent"
          >
            <Download className="h-4 w-4" />
            Export CSV
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPredictions}</div>
            <p className="text-xs text-muted-foreground">{stats.newPredictionsToday} new today (current page)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Risk (Current Page)</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.averageRisk * 100).toFixed(1)}%</div>
            <Progress value={stats.averageRisk * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Cases (Current Page)</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highRiskCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.highRiskCount > 0
                ? `${((stats.highRiskCount / predictions.length) * 100).toFixed(1)}% of current page`
                : "No high risk cases on this page"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Risk Cases (Current Page)</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowRiskCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.lowRiskCount > 0
                ? `${((stats.lowRiskCount / predictions.length) * 100).toFixed(1)}% of current page`
                : "No low risk cases on this page"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        defaultValue="all"
        className="mb-6"
        onValueChange={(value) => {
          setActiveTab(value)
          setRiskFilter(value === "high-risk" ? "high" : value === "low-risk" ? "low" : "all")
          setPagination((prev) => ({ ...prev, page: 1 })) // Reset to first page on tab change
        }}
      >
        <TabsList className="grid w-full grid-cols-3 md:w-auto">
          <TabsTrigger value="all">All Predictions</TabsTrigger>
          <TabsTrigger value="high-risk">High Risk</TabsTrigger>
          <TabsTrigger value="low-risk">Low Risk</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search predictions by user"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPagination((prev) => ({ ...prev, page: 1 })) // Reset to first page on search
                }}
                className="pl-8"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                {/* This risk filter is for the "All Predictions" tab, if you want more granular filtering */}
                {activeTab === "all" && (
                  <Select
                    value={riskFilter}
                    onValueChange={(value) => {
                      setRiskFilter(value)
                      setPagination((prev) => ({ ...prev, page: 1 })) // Reset to first page on filter change
                    }}
                  >
                    <SelectTrigger className="w-[130px] bg-transparent">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Risk Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Risks</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="low">Low Risk</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                <Select
                  value={dateFilter}
                  onValueChange={(value) => {
                    setDateFilter(value)
                    setPagination((prev) => ({ ...prev, page: 1 })) // Reset to first page on filter change
                  }}
                >
                  <SelectTrigger className="w-[130px] bg-transparent">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={sortOrder}
                  onValueChange={(value) => {
                    setSortOrder(value)
                    setPagination((prev) => ({ ...prev, page: 1 })) // Reset to first page on sort change
                  }}
                >
                  <SelectTrigger className="w-[130px] bg-transparent">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="highest">Highest Risk</SelectItem>
                    <SelectItem value="lowest">Lowest Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                {predictions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No predictions found for current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  predictions.map((pred) => (
                    <TableRow key={pred.id}>
                      <TableCell className="font-medium">{pred.userName}</TableCell>
                      <TableCell>
                        <Badge
                          variant={pred.result > 0.5 ? "destructive" : pred.result >= 0.3 ? "outline" : "success"}
                          className={
                            pred.result > 0.5 ? "bg-red-600" : pred.result >= 0.3 ? "bg-yellow-600" : "bg-green-600"
                          }
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

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Select value={pagination.limit.toString()} onValueChange={handleLimitChange}>
                <SelectTrigger className="w-[70px] bg-transparent">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                Showing {predictions.length} of {pagination.total} predictions
              </span>
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(pagination.page - 1)}
                    className={pagination.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  let pageNum = pagination.page

                  if (pagination.pages <= 5) {
                    pageNum = i + 1
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1
                  } else if (pagination.page >= pagination.pages - 2) {
                    pageNum = pagination.pages - 4 + i
                  } else {
                    pageNum = pagination.page - 2 + i
                  }

                  return (
                    <PaginationItem key={i}>
                      <PaginationLink onClick={() => handlePageChange(pageNum)} isActive={pagination.page === pageNum}>
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}

                {pagination.pages > 5 && pagination.page < pagination.pages - 2 && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink onClick={() => handlePageChange(pagination.pages)}>
                        {pagination.pages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(pagination.page + 1)}
                    className={
                      pagination.page >= pagination.pages ? "pointer-events-none opacity-50" : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </TabsContent>
      </Tabs>

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
                    selectedPrediction.result > 0.5
                      ? "bg-red-500"
                      : selectedPrediction.result >= 0.3
                        ? "bg-yellow-500"
                        : "bg-green-500"
                  }`}
                >
                  {(selectedPrediction.result * 100).toFixed(0)}%
                </div>
              </div>

              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <div className="text-right font-medium">User</div>
                  <div className="col-span-2">{selectedPrediction.userName}</div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <div className="text-right font-medium">User ID</div>
                  <div className="col-span-2">{selectedPrediction.userId}</div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <div className="text-right font-medium">Risk Level</div>
                  <div className="col-span-2">
                    <Badge
                      variant={
                        selectedPrediction.result > 0.5
                          ? "destructive"
                          : selectedPrediction.result >= 0.3
                            ? "outline"
                            : "success"
                      }
                      className={
                        selectedPrediction.result > 0.5
                          ? "bg-red-600"
                          : selectedPrediction.result >= 0.3
                            ? "bg-yellow-600"
                            : "bg-green-600"
                      }
                    >
                      {(selectedPrediction.result * 100).toFixed(1)}% Risk
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <div className="text-right font-medium">Date</div>
                  <div className="col-span-2">{new Date(selectedPrediction.timestamp).toLocaleString()}</div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-right font-medium pt-2">Input Data</div>
                  <div className="col-span-2 max-h-60 overflow-y-auto rounded-md bg-muted p-2 text-xs">
                    {Object.entries(selectedPrediction.data).length > 0 ? (
                      <ul className="space-y-1">
                        {Object.entries(selectedPrediction.data).map(([key, value]) => (
                          <li key={key} className="flex justify-between">
                            <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</span>
                            <span>
                              {typeof value === "boolean"
                                ? value
                                  ? "Yes"
                                  : "No"
                                : value !== null && value !== undefined && value !== ""
                                  ? String(value)
                                  : "N/A"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-center text-muted-foreground">No detailed input data available.</p>
                    )}
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
