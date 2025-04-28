"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Trash2, Heart, Info, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getHistory, deleteHistoryItem, clearHistory, type AssessmentHistoryItem } from "@/lib/history-storage"
import { useRouter } from "next/navigation"
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
import { useAuth } from "@/lib/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import HistoryStatistics from "@/components/history-statistics"

export default function HistoryPage() {
  const [history, setHistory] = useState<AssessmentHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true)
      setError(null)

      if (isAuthenticated && user) {
        try {
          console.log(`Fetching predictions for user: ${user.email}`)

          // Fetch predictions for the logged-in user
          const response = await fetch("/api/user/predictions", {
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // Important for sending cookies
          })

          if (!response.ok) {
            throw new Error(`Failed to fetch predictions: ${response.statusText}`)
          }

          const userPredictions = await response.json()
          console.log(`Received ${userPredictions.length} predictions for ${user.email}`)

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
          }))

          setHistory(formattedHistory)
        } catch (error) {
          console.error("Error fetching predictions:", error)
          setError("Failed to load your prediction history. Please try again later.")

          // Fall back to local storage
          const localHistory = getHistory()
          setHistory(localHistory)
        }
      } else {
        // Not authenticated, use local storage
        const localHistory = getHistory()
        setHistory(localHistory)
      }

      setIsLoading(false)
    }

    loadHistory()
  }, [isAuthenticated, user])

  // Helper function to determine risk level from score
  const getRiskLevel = (score: number): "low" | "moderate" | "high" => {
    const percentage = score * 100
    if (percentage < 30) return "low"
    if (percentage < 70) return "moderate"
    return "high"
  }

  const handleDeleteItem = async (id: string) => {
    if (isAuthenticated && user) {
      try {
        const response = await fetch(`/api/user/predictions/${id}`, {
          method: "DELETE",
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error(`Failed to delete prediction: ${response.statusText}`)
        }

        setHistory((prev) => prev.filter((item) => item.id !== id))
      } catch (error) {
        console.error("Error deleting prediction:", error)
        setError("Failed to delete the assessment. Please try again.")
      }
    } else {
      // Delete from local storage if not authenticated
      deleteHistoryItem(id)
      setHistory((prev) => prev.filter((item) => item.id !== id))
    }
  }

  const handleClearHistory = async () => {
    if (isAuthenticated && user) {
      try {
        const response = await fetch("/api/user/predictions/clear", {
          method: "DELETE",
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error(`Failed to clear predictions: ${response.statusText}`)
        }

        setHistory([])
      } catch (error) {
        console.error("Error clearing predictions:", error)
        setError("Failed to clear history. Please try again.")
      }
    } else {
      // Clear local storage if not authenticated
      clearHistory()
      setHistory([])
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

  const handleViewDetails = (assessment: AssessmentHistoryItem) => {
    localStorage.setItem("predictionResult", JSON.stringify(assessment))
    router.push("/predict/results")
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
        {isAuthenticated && user && (
          <Card className="mb-6 bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-300">Showing assessment history for:</p>
                  <p className="font-medium text-white">{user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                <div className="animate-pulse">Loading history...</div>
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

                {/* Assessment count */}
                <div className="mb-4">
                  <span className="text-sm text-gray-400">
                    {history.length} {history.length === 1 ? "assessment" : "assessments"} found
                  </span>
                </div>

                {/* History list */}
                <div className="space-y-4">
                  {history.map((item) => (
                    <Card key={item.id} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
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
                                <AlertDialogAction onClick={() => handleDeleteItem(item.id)}>Delete</AlertDialogAction>
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm text-gray-500 mt-8">
          {isAuthenticated ? (
            <p>Your assessment history is securely stored in your account.</p>
          ) : (
            <>
              <p>Assessment history is stored locally in your browser.</p>
              <p>Create an account to save your history across devices.</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
