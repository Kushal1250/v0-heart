"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Trash2, ArrowUpDown, Filter, Calendar, Heart, Info, Shield, User, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useMediaQuery } from "@/hooks/use-media-query"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  getCurrentUserEmail,
  setCurrentUserEmail,
  getHistoryByEmail,
  deleteHistoryItem,
  clearHistory,
} from "@/lib/user-specific-storage"
import HistoryStatistics from "@/components/history-statistics"

// Define types
type AssessmentHistoryItem = {
  id: string
  date: string
  result: {
    risk: string
    score: number
    hasDisease: boolean
  }
  age: string | number
  sex: string | number
  trestbps: string | number
  chol: string | number
  cp?: string | number
  fbs?: string | number
  restecg?: string | number
  thalach?: string | number
  exang?: string | number
  oldpeak?: string | number
  slope?: string | number
  ca?: string | number
  thal?: string | number
}

type SortOption = "date-newest" | "date-oldest" | "risk-highest" | "risk-lowest" | "age-highest" | "age-lowest"
type FilterOption = "all" | "high" | "moderate" | "low"

export default function HistoryPage() {
  const [history, setHistory] = useState<AssessmentHistoryItem[]>([])
  const [filteredHistory, setFilteredHistory] = useState<AssessmentHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>("date-newest")
  const [filterBy, setFilterBy] = useState<FilterOption>("all")
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("history")
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [tempEmail, setTempEmail] = useState<string>("")
  const [showEmailInput, setShowEmailInput] = useState<boolean>(false)
  const router = useRouter()
  const isMobile = useMediaQuery("(max-width: 640px)")

  // Load current user email and history on component mount
  useEffect(() => {
    const storedEmail = getCurrentUserEmail()
    setUserEmail(storedEmail)

    if (storedEmail) {
      loadHistoryForEmail(storedEmail)
    } else {
      setIsLoading(false)
    }
  }, [])

  // Load history for a specific email
  const loadHistoryForEmail = (email: string) => {
    setIsLoading(true)
    try {
      const userHistory = getHistoryByEmail(email)
      setHistory(userHistory)
      setFilteredHistory(userHistory)
    } catch (err) {
      setError(`Failed to load history: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle email submission
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tempEmail || !tempEmail.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    setCurrentUserEmail(tempEmail)
    setUserEmail(tempEmail)
    loadHistoryForEmail(tempEmail)
    setShowEmailInput(false)
    setError(null)
  }

  // Handle email change
  const changeEmail = () => {
    setTempEmail("")
    setShowEmailInput(true)
  }

  // Apply filtering and sorting
  useEffect(() => {
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
        result.sort((a, b) => Number(b.age) - Number(a.age))
        break
      case "age-lowest":
        result.sort((a, b) => Number(a.age) - Number(b.age))
        break
    }

    setFilteredHistory(result)
  }, [history, filterBy, sortBy])

  const handleDeleteItem = async (id: string) => {
    if (!userEmail) return

    deleteHistoryItem(userEmail, id)
    setHistory((prev) => prev.filter((item) => item.id !== id))
  }

  const handleClearHistory = async () => {
    if (!userEmail) return

    clearHistory(userEmail)
    setHistory([])
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

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case "date-newest":
        return "Date (Newest First)"
      case "date-oldest":
        return "Date (Oldest First)"
      case "risk-highest":
        return "Risk (Highest First)"
      case "risk-lowest":
        return "Risk (Lowest First)"
      case "age-highest":
        return "Age (Highest First)"
      case "age-lowest":
        return "Age (Lowest First)"
    }
  }

  const getFilterLabel = (option: FilterOption) => {
    switch (option) {
      case "all":
        return "All Risk Levels"
      case "high":
        return "High Risk Only"
      case "moderate":
        return "Moderate Risk Only"
      case "low":
        return "Low Risk Only"
    }
  }

  // Navigate to predict page
  const goToPredict = () => {
    router.push("/predict")
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex justify-center py-12">
          <div className="animate-pulse">Loading assessment history...</div>
        </div>
      </div>
    )
  }

  // Show email input if no email is set
  if (!userEmail || showEmailInput) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center mb-6">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card className="max-w-md mx-auto bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-400" />
              Enter Your Email to View History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-400">
                  Please enter your email address to view your assessment history. This helps us keep your history
                  private and separate from others.
                </p>
                {error && (
                  <div className="bg-red-900/30 border border-red-800 text-red-400 p-3 rounded-md text-sm">{error}</div>
                )}
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                View My History
              </Button>
              <div className="text-xs text-gray-500 text-center mt-4">
                <p>Your email is stored locally and is only used to associate your assessments with you.</p>
                <p>We do not send any emails or share this information.</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
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
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
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

        {/* User information banner */}
        <Card className="mb-6 bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-blue-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-300">Viewing history for:</p>
                <p className="font-medium text-white flex items-center gap-2">
                  {userEmail}
                  <Button variant="outline" size="sm" className="h-7 px-2 ml-2 text-xs" onClick={changeEmail}>
                    Change Email
                  </Button>
                </p>
              </div>
              <div className="flex items-center gap-1 bg-blue-900/30 text-blue-400 border border-blue-800 rounded-full px-2 py-1">
                <Shield className="h-3 w-3" />
                <span className="text-xs">Personal</span>
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

        <Tabs defaultValue="history" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="history">Assessment History</TabsTrigger>
            <TabsTrigger value="about">About Heart Health Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            {history.length === 0 ? (
              <Card className="bg-gray-900 border-gray-800 mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Your Previous Assessments
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-12">
                  <p className="text-gray-400 mb-4">No assessment history found for this email address.</p>
                  <Button onClick={goToPredict} className="bg-red-600 hover:bg-red-700">
                    Take an assessment
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
                    <DropdownMenu open={isFilterMenuOpen} onOpenChange={setIsFilterMenuOpen}>
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
                          <DropdownMenuLabel className="text-xs text-gray-500 font-normal">Date</DropdownMenuLabel>
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
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="text-xs text-gray-500 font-normal">
                            Risk Level
                          </DropdownMenuLabel>
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
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="text-xs text-gray-500 font-normal">Age</DropdownMenuLabel>
                          <DropdownMenuItem
                            className={sortBy === "age-highest" ? "bg-accent" : ""}
                            onClick={() => setSortBy("age-highest")}
                          >
                            Highest Age First
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={sortBy === "age-lowest" ? "bg-accent" : ""}
                            onClick={() => setSortBy("age-lowest")}
                          >
                            Lowest Age First
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Mobile active filters display */}
                {isMobile && (
                  <div className="mb-4 text-sm">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-gray-400">Showing:</span>
                      <Badge variant="outline" className="bg-gray-800">
                        {getFilterLabel(filterBy)}
                      </Badge>
                      <span className="text-gray-400">Sorted by:</span>
                      <Badge variant="outline" className="bg-gray-800">
                        {getSortLabel(sortBy)}
                      </Badge>
                    </div>
                  </div>
                )}

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
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Why Track Your Heart Health?</h3>
                  <p className="text-gray-300 mb-4">
                    Regular monitoring of your heart health is crucial for early detection of potential issues.
                    HeartPredict allows you to track changes in your cardiovascular health over time, helping you make
                    informed decisions about lifestyle changes and medical interventions.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">Early Detection</h4>
                      <p className="text-sm text-gray-300">
                        Identify potential heart issues before they become serious medical problems.
                      </p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">Track Progress</h4>
                      <p className="text-sm text-gray-300">
                        Monitor how lifestyle changes affect your heart disease risk over time.
                      </p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">Data-Driven Decisions</h4>
                      <p className="text-sm text-gray-300">
                        Share your history with healthcare providers for more informed medical care.
                      </p>
                    </div>
                  </div>
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

                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Your Data Privacy</h3>
                  <p className="text-gray-300 mb-4">
                    We take your privacy seriously. Here's how your assessment data is stored:
                  </p>
                  <div className="bg-gray-800 p-4 rounded-lg space-y-3">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-white">Email-Based Privacy</p>
                        <p className="text-sm text-gray-300">
                          Your assessments are associated with your email address and stored locally in your browser.
                          This ensures your heart health data is kept private and only accessible to you.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-white">Local Storage</p>
                        <p className="text-sm text-gray-300">
                          All data is stored locally on your device. We don't send your email or assessment data to any
                          servers, ensuring complete privacy.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Taking Action</h3>
                  <p className="text-gray-300 mb-2">
                    Based on your assessment history, here are recommended next steps:
                  </p>
                  <ul className="list-disc pl-5 text-gray-300 space-y-2">
                    <li>Schedule regular assessments (at least quarterly) to track changes in your heart health</li>
                    <li>Share your assessment history with your healthcare provider during checkups</li>
                    <li>Implement recommended lifestyle changes based on your risk factors</li>
                    <li>Export your data as PDF reports for your personal health records</li>
                  </ul>
                  <div className="mt-6">
                    <Button onClick={goToPredict} className="bg-red-600 hover:bg-red-700">
                      Take a New Assessment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm text-gray-500 mt-8">
          <div className="space-y-1">
            <p>Your assessment history is securely associated with your email: {userEmail}</p>
            <p className="text-blue-500 flex items-center justify-center gap-1">
              <Shield className="h-3 w-3" /> Your data is private and only stored locally on this device
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
