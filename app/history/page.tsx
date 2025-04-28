"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Trash2, Shield, Heart, Info, Calendar, ArrowUpDown, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AssessmentHistoryItem } from "@/lib/history-storage"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { fetchWithAuth } from "@/lib/api-utils"
import HistoryStatistics from "@/components/history-statistics"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type SortOption = "date-newest" | "date-oldest" | "risk-highest" | "risk-lowest" | "age-highest" | "age-lowest"
type FilterOption = "all" | "high" | "moderate" | "low"

export default function HistoryPage() {
  const [history, setHistory] = useState<AssessmentHistoryItem[]>([])
  const [filteredHistory, setFilteredHistory] = useState<AssessmentHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>("date-newest")
  const [filterBy, setFilterBy] = useState<FilterOption>("all")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const isMobile = useMediaQuery("(max-width: 640px)")
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login?redirect=/history")
    }
  }, [isAuthenticated, isAuthLoading, router])

  useEffect(() => {
    // Only load history if user is authenticated
    const loadHistory = async () => {
      if (isAuthLoading) return // Wait for auth to complete

      setIsLoading(true)
      setError(null)

      if (isAuthenticated && user) {
        try {
          // Fetch user's predictions from the server
          const response = await fetchWithAuth("/api/user/predictions")

          if (response.ok) {
            const userPredictions = await response.json()

            // Transform server predictions to match AssessmentHistoryItem format
            const formattedHistory = userPredictions.map((pred: any) => ({
              id: pred.id,
              date: pred.created_at,
              result: {
                risk: getRiskLevel(pred.result),
                score: Math.round(pred.result * 100),
                hasDisease: pred.result >= 0.5,
              },
              age: pred.prediction_data?.age || "",
              sex: pred.prediction_data?.sex || "",
              trestbps: pred.prediction_data?.trestbps || "",
              chol: pred.prediction_data?.chol || "",
              cp: pred.prediction_data?.cp || "",
              fbs: pred.prediction_data?.fbs || "",
              restecg: pred.prediction_data?.restecg || "",
              thalach: pred.prediction_data?.thalach || "",
              exang: pred.prediction_data?.exang || "",
              oldpeak: pred.prediction_data?.oldpeak || "",
              slope: pred.prediction_data?.slope || "",
              ca: pred.prediction_data?.ca || "",
              thal: pred.prediction_data?.thal || "",
              foodHabits: pred.prediction_data?.foodHabits || "",
              junkFoodConsumption: pred.prediction_data?.junkFoodConsumption || "",
              sleepingHours: pred.prediction_data?.sleepingHours || "",
            }))

            setHistory(formattedHistory)
            setFilteredHistory(formattedHistory)
          } else {
            // Handle API error
            const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
            setError(`Failed to load history: ${errorData.error || response.statusText}`)
          }
        } catch (error) {
          console.error("Error fetching user predictions:", error)
          setError(`Failed to load history: ${error instanceof Error ? error.message : "Unknown error"}`)
        }
      } else if (!isAuthLoading && !isAuthenticated) {
        // Not authenticated - this should not happen due to the redirect
        router.push("/login?redirect=/history")
      }

      setIsLoading(false)
    }

    loadHistory()
  }, [isAuthenticated, user, isAuthLoading, router])

  useEffect(() => {
    // Apply filtering and sorting whenever history, filterBy, or sortBy changes
    let result = [...history]

    // Apply filters
    if (filterBy !== "all") {
      result = result.filter((item) => item.result.risk === filterBy)
    }

    // Apply sorting
    switch (sortBy) {
      case "date-newest":
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        break
      case "date-oldest":
        result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        break
      case "risk-highest":
        result.sort((a, b) => {
          const riskOrder = { high: 3, moderate: 2, low: 1 }
          return riskOrder[b.result.risk as keyof typeof riskOrder] - riskOrder[a.result.risk as keyof typeof riskOrder]
        })
        break
      case "risk-lowest":
        result.sort((a, b) => {
          const riskOrder = { high: 3, moderate: 2, low: 1 }
          return riskOrder[a.result.risk as keyof typeof riskOrder] - riskOrder[b.result.risk as keyof typeof riskOrder]
        })
        break
      case "age-highest":
        result.sort((a, b) => Number.parseInt(b.age as string) - Number.parseInt(a.age as string))
        break
      case "age-lowest":
        result.sort((a, b) => Number.parseInt(a.age as string) - Number.parseInt(b.age as string))
        break
    }

    setFilteredHistory(result)
  }, [history, filterBy, sortBy])

  // Helper function to determine risk level from score
  const getRiskLevel = (score: number): "low" | "moderate" | "high" => {
    const percentage = score * 100
    if (percentage < 30) return "low"
    if (percentage < 70) return "moderate"
    return "high"
  }

  const handleDeleteItem = async (id: string) => {
    try {
      // Delete from server
      const response = await fetchWithAuth(`/api/user/predictions/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setHistory((prev) => prev.filter((item) => item.id !== id))
      } else {
        console.error("Failed to delete prediction from server")
        setError("Failed to delete assessment. Please try again.")
      }
    } catch (error) {
      console.error("Error deleting prediction:", error)
      setError(`Failed to delete assessment: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleClearHistory = async () => {
    try {
      // Clear all user predictions from server
      const response = await fetchWithAuth("/api/user/predictions/clear", {
        method: "DELETE",
      })

      if (response.ok) {
        setHistory([])
      } else {
        console.error("Failed to clear predictions from server")
        setError("Failed to clear history. Please try again.")
      }
    } catch (error) {
      console.error("Error clearing predictions:", error)
      setError(`Failed to clear history: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "text-red-500"
      case "moderate":
        return "text-yellow-500"
      case "low":
        return "text-green-500"
      default:
        return "text-gray-500"
    }
  }

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "bg-red-900/30 text-red-400 border-red-800"
      case "moderate":
        return "bg-yellow-900/30 text-yellow-400 border-yellow-800"
      case "low":
        return "bg-green-900/30 text-green-400 border-green-800"
      default:
        return "bg-gray-900/30 text-gray-400 border-gray-800"
    }
  }

  const handleViewDetails = (assessment: AssessmentHistoryItem) => {
    // Store the assessment in localStorage to view in results page
    localStorage.setItem("predictionResult", JSON.stringify(assessment))
    router.push("/predict/results")
  }

  // If still loading auth or not authenticated, show loading or redirect
  if (isAuthLoading) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex justify-center py-12">
          <div className="animate-pulse">Verifying access...</div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect due to the useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 relative">
      <div className="history-bg-animation">
        <div className="timeline-element timeline-1"></div>
        <div className="timeline-element timeline-2"></div>
        <div className="timeline-element timeline-3"></div>
        <div className="timeline-element timeline-4"></div>
      </div>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>

          {history.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear History
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Assessment History</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your assessment history. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearHistory}>Clear History</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Privacy banner */}
        <Card className="mb-6 bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm text-gray-300">Private Assessment History</p>
                <p className="font-medium text-white">{user?.name ? `${user.name} (${user.email})` : user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error message if any */}
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-400 p-4 rounded-lg mb-6">
            <p>{error}</p>
          </div>
        )}

        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="history">Assessment History</TabsTrigger>
            <TabsTrigger value="about">About Heart Health Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-pulse">Loading your history...</div>
              </div>
            ) : history.length === 0 ? (
              <Card className="bg-gray-900 border-gray-800 mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Your Previous Assessments
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-12">
                  <p className="text-gray-400 mb-4">You haven't completed any assessments yet.</p>
                  <Button asChild className="bg-red-600 hover:bg-red-700">
                    <Link href="/predict">Take Your First Assessment</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Add Statistics Component */}
                <HistoryStatistics history={history} />

                {/* Filter and Sort Controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">
                      {filteredHistory.length} {filteredHistory.length === 1 ? "assessment" : "assessments"} found
                    </span>
                    {filterBy !== "all" && (
                      <Badge variant="outline" className={getRiskBadgeColor(filterBy)}>
                        {filterBy.charAt(0).toUpperCase() + filterBy.slice(1)} Risk
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {/* Filter Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          <span className="hidden md:inline">Filter</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Filter by Risk Level</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            className={filterBy === "all" ? "bg-accent" : ""}
                            onClick={() => setFilterBy("all")}
                          >
                            All Risk Levels
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={filterBy === "high" ? "bg-accent" : ""}
                            onClick={() => setFilterBy("high")}
                          >
                            <span className="text-red-500 mr-2">●</span> High Risk
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={filterBy === "moderate" ? "bg-accent" : ""}
                            onClick={() => setFilterBy("moderate")}
                          >
                            <span className="text-yellow-500 mr-2">●</span> Moderate Risk
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={filterBy === "low" ? "bg-accent" : ""}
                            onClick={() => setFilterBy("low")}
                          >
                            <span className="text-green-500 mr-2">●</span> Low Risk
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Sort Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <ArrowUpDown className="h-4 w-4" />
                          <span className="hidden md:inline">Sort</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            className={sortBy === "date-newest" ? "bg-accent" : ""}
                            onClick={() => setSortBy("date-newest")}
                          >
                            <Calendar className="h-4 w-4 mr-2" /> Newest First
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={sortBy === "date-oldest" ? "bg-accent" : ""}
                            onClick={() => setSortBy("date-oldest")}
                          >
                            <Calendar className="h-4 w-4 mr-2" /> Oldest First
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={sortBy === "risk-highest" ? "bg-accent" : ""}
                            onClick={() => setSortBy("risk-highest")}
                          >
                            <Heart className="h-4 w-4 mr-2 text-red-500" /> Highest Risk First
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={sortBy === "risk-lowest" ? "bg-accent" : ""}
                            onClick={() => setSortBy("risk-lowest")}
                          >
                            <Heart className="h-4 w-4 mr-2 text-green-500" /> Lowest Risk First
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {filteredHistory.length === 0 ? (
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
                    <p className="text-gray-400 mb-4">No assessments match your current filters.</p>
                    <Button variant="outline" onClick={() => setFilterBy("all")}>
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredHistory.map((item) => (
                      <Card
                        key={item.id}
                        className={`bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors history-item`}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="flex items-center gap-2 text-lg">
                                <span className={`font-semibold ${getRiskColor(item.result.risk)}`}>
                                  {item.result.risk.charAt(0).toUpperCase() + item.result.risk.slice(1)} Risk
                                </span>
                                <span className="text-sm text-gray-400">({item.result.score}%)</span>
                              </CardTitle>
                              <p className="text-sm text-gray-400">{formatDate(item.date)}</p>
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-400" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this assessment? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteItem(item.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                            <div>
                              <p className="text-xs text-gray-400">Age</p>
                              <p className="text-sm font-medium">{item.age} years</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Gender</p>
                              <p className="text-sm font-medium">{item.sex === "1" ? "Male" : "Female"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Blood Pressure</p>
                              <p className="text-sm font-medium">{item.trestbps} mm Hg</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Cholesterol</p>
                              <p className="text-sm font-medium">{item.chol} mg/dl</p>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleViewDetails(item)}
                            className="w-full bg-gray-800 hover:bg-gray-700"
                          >
                            View Full Details
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="about">
            <Card className="bg-gray-900 border-gray-800 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-500" />
                  About Heart Health Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* About content */}
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Why Track Your Heart Health?</h3>
                  <p className="text-gray-300 mb-4">
                    Regular monitoring of your heart health is crucial for early detection of potential issues.
                    HeartPredict allows you to track changes in your cardiovascular health over time, helping you make
                    informed decisions about lifestyle changes and medical interventions.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Understanding Your History</h3>
                  <p className="text-gray-300 mb-4">
                    Your assessment history provides valuable insights into your heart health journey. Here's how to
                    interpret the data:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-red-900/30 text-red-400 border border-red-800 rounded-full px-2 py-1 text-xs">
                        High Risk
                      </div>
                      <p className="text-sm text-gray-300">
                        Risk score of 70% or higher. Immediate consultation with a healthcare provider is recommended.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-yellow-900/30 text-yellow-400 border border-yellow-800 rounded-full px-2 py-1 text-xs">
                        Moderate Risk
                      </div>
                      <p className="text-sm text-gray-300">
                        Risk score between 30% and 69%. Regular monitoring and lifestyle adjustments are advised.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-green-900/30 text-green-400 border border-green-800 rounded-full px-2 py-1 text-xs">
                        Low Risk
                      </div>
                      <p className="text-sm text-gray-300">
                        Risk score below 30%. Continue maintaining a heart-healthy lifestyle.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm text-gray-500 mt-8">
          <div className="space-y-1">
            <p>Your assessment history is securely stored in your account.</p>
            <p className="text-green-500 flex items-center justify-center gap-1">
              <Shield className="h-3 w-3" /> Your data is private and only visible to you
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
