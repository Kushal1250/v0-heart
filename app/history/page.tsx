"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Clock, Heart, Trash2, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function HistoryPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [predictionToDelete, setPredictionToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    loadUserPredictions()
  }, [user])

  const loadUserPredictions = async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/user/predictions?userId=${user.id}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch predictions: ${response.status}`)
      }

      const data = await response.json()
      setAssessments(data.predictions || [])
    } catch (error) {
      console.error("Error loading predictions:", error)
      setAssessments([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePrediction = (predictionId) => {
    setPredictionToDelete(predictionId)
    setDeleteDialogOpen(true)
  }

  const confirmDeletePrediction = async () => {
    if (!predictionToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/user/predictions/${predictionToDelete}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to delete prediction")
      }

      setAssessments(assessments.filter((p) => p.id !== predictionToDelete))
      setDeleteDialogOpen(false)
      setPredictionToDelete(null)
    } catch (error) {
      console.error("Error deleting prediction:", error)
      alert("Failed to delete prediction. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredAssessments = assessments.filter((assessment) => {
    if (activeTab === "all") return true
    const result = assessment.prediction_data?.risk || calculateRisk(assessment.result)
    if (activeTab === "high" && result === "high") return true
    if (activeTab === "moderate" && result === "moderate") return true
    if (activeTab === "low" && result === "low") return true
    return false
  })

  // Helper function to calculate risk from probability
  const calculateRisk = (probability) => {
    if (probability >= 0.7) return "high"
    if (probability >= 0.3) return "moderate"
    return "low"
  }

  const getRiskColor = (probability) => {
    const risk = calculateRisk(probability)
    if (risk === "high") return "bg-red-500"
    if (risk === "moderate") return "bg-yellow-500"
    return "bg-green-500"
  }

  const getRiskText = (probability) => {
    const risk = calculateRisk(probability)
    if (risk === "high") return "High Risk Assessment"
    if (risk === "moderate") return "Moderate Risk Assessment"
    return "Low Risk Assessment"
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString() + " " + date.toLocaleTimeString()
    } catch (e) {
      return "Unknown date"
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={() => router.push("/home")} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Assessment History</CardTitle>
              <CardDescription>Your heart disease risk assessments</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <p>Loading assessment history...</p>
              </div>
            </div>
          ) : assessments.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium mb-2">No assessment history found</h3>
              <p className="text-gray-400 mb-6">You haven't taken any assessments yet.</p>
              <Button onClick={() => router.push("/predict")}>Take an Assessment</Button>
            </div>
          ) : (
            <>
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="all">All ({assessments.length})</TabsTrigger>
                  <TabsTrigger value="high">
                    High Risk ({assessments.filter((a) => calculateRisk(a.result) === "high").length})
                  </TabsTrigger>
                  <TabsTrigger value="moderate">
                    Moderate ({assessments.filter((a) => calculateRisk(a.result) === "moderate").length})
                  </TabsTrigger>
                  <TabsTrigger value="low">
                    Low Risk ({assessments.filter((a) => calculateRisk(a.result) === "low").length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-4">
                {filteredAssessments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No assessments found for this filter.</p>
                  </div>
                ) : (
                  filteredAssessments.map((assessment) => (
                    <Card key={assessment.id} className="bg-gray-800 border-gray-700 overflow-hidden">
                      <div className="flex">
                        <div className={`w-2 ${getRiskColor(assessment.result)}`}></div>
                        <div className="p-4 flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium mb-1">{getRiskText(assessment.result)}</h3>
                              <div className="flex items-center text-sm text-gray-400 mb-2">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatDate(assessment.created_at)}
                              </div>
                            </div>
                            <div className="flex flex-col items-center">
                              <div
                                className={`flex items-center justify-center rounded-full w-10 h-10 ${
                                  calculateRisk(assessment.result) === "high"
                                    ? "bg-red-900/30"
                                    : calculateRisk(assessment.result) === "moderate"
                                      ? "bg-yellow-900/30"
                                      : "bg-green-900/30"
                                }`}
                              >
                                <Heart
                                  className={`h-5 w-5 ${
                                    calculateRisk(assessment.result) === "high"
                                      ? "text-red-500"
                                      : calculateRisk(assessment.result) === "moderate"
                                        ? "text-yellow-500"
                                        : "text-green-500"
                                  }`}
                                />
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-0 h-6 w-6 mt-1 text-gray-400 hover:text-red-500"
                                disabled={isDeleting}
                                onClick={() => handleDeletePrediction(assessment.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                            <div>
                              <p className="text-xs text-gray-500">Risk Score</p>
                              <p className="text-sm">{(assessment.result * 100).toFixed(1)}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Age</p>
                              <p className="text-sm">{assessment.prediction_data?.age || "N/A"} years</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Blood Pressure</p>
                              <p className="text-sm">{assessment.prediction_data?.trestbps || "N/A"} mm Hg</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Cholesterol</p>
                              <p className="text-sm">{assessment.prediction_data?.chol || "N/A"} mg/dl</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this assessment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 hover:bg-gray-700 border-gray-700">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePrediction}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
