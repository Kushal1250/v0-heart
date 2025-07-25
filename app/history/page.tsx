"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Clock, Heart, Trash2 } from "lucide-react"
import { getCurrentEmail, clearAssessmentHistory } from "@/lib/simplified-history"
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
  const [assessments, setAssessments] = useState([])
  const [userEmail, setUserEmail] = useState("")
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [newEmail, setNewEmail] = useState("")

  // Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [assessmentToDelete, setAssessmentToDelete] = useState(null)

  const { user } = useAuth() // Get user from auth context at the top level
  const initialEmail = user?.email || getCurrentEmail() // Get initial email here

  useEffect(() => {
    // Try to get email from multiple sources
    const userEmail =
      user?.email ||
      localStorage.getItem("currentUserEmail") ||
      localStorage.getItem("heart_current_user_email") ||
      initialEmail ||
      "guest@example.com"

    setUserEmail(userEmail)

    // Save this email to both storage locations for consistency
    if (typeof window !== "undefined") {
      localStorage.setItem("currentUserEmail", userEmail)
      localStorage.setItem("heart_current_user_email", userEmail)
    }

    loadAssessmentHistory(userEmail)
  }, [initialEmail, user])

  const loadAssessmentHistory = (email) => {
    setLoading(true)
    try {
      // Try multiple storage keys to find history
      const historyKeys = [
        `assessmentHistory_${email}`,
        `heart_assessment_history_${email}`,
        `heart_assessment_history_${email.toLowerCase()}`,
      ]

      let history = []

      // Check each possible key
      for (const key of historyKeys) {
        const data = localStorage.getItem(key)
        if (data) {
          try {
            const parsed = JSON.parse(data)
            if (Array.isArray(parsed) && parsed.length > 0) {
              console.log(`Found history in key: ${key} with ${parsed.length} items`)
              history = parsed
              break // Use the first valid history we find
            }
          } catch (e) {
            console.error(`Error parsing data from ${key}:`, e)
          }
        }
      }

      // Check if we have a recent prediction that's not in history
      const recentPrediction = localStorage.getItem("predictionResult")
      if (recentPrediction && history.length === 0) {
        try {
          const prediction = JSON.parse(recentPrediction)
          if (prediction && prediction.result) {
            // Add ID and timestamp if missing
            if (!prediction.id) {
              prediction.id = Math.random().toString(36).substring(2, 15)
            }
            if (!prediction.timestamp) {
              prediction.timestamp = Date.now()
            }

            history = [prediction]

            // Save this to all history keys
            for (const key of historyKeys) {
              localStorage.setItem(key, JSON.stringify(history))
            }
            console.log("Created history from recent prediction")
          }
        } catch (e) {
          console.error("Error using recent prediction:", e)
        }
      }

      console.log(`Loaded ${history.length} assessments for ${email}`)
      setAssessments(history)
    } catch (error) {
      console.error("Error loading assessment history:", error)
      setAssessments([])
    } finally {
      setLoading(false)
    }
  }

  const handleClearHistory = () => {
    setClearDialogOpen(true)
  }

  const confirmClearHistory = () => {
    clearAssessmentHistory(userEmail)
    setAssessments([])
    setClearDialogOpen(false)
  }

  const handleViewAssessment = (assessment) => {
    // Store the assessment in localStorage for the results page to access
    localStorage.setItem("predictionResult", JSON.stringify(assessment))

    // Navigate to results page
    router.push("/predict/results")
  }

  const handleChangeEmail = () => {
    setNewEmail(userEmail)
    setIsEditingEmail(true)
  }

  const handleSaveEmail = () => {
    if (newEmail && newEmail !== userEmail) {
      setUserEmail(newEmail)
      localStorage.setItem("currentUserEmail", newEmail)
      localStorage.setItem("heart_current_user_email", newEmail)
      loadAssessmentHistory(newEmail)
    }
    setIsEditingEmail(false)
  }

  const handleCancelEmailEdit = () => {
    setIsEditingEmail(false)
  }

  // Filter assessments based on active tab
  const filteredAssessments = assessments.filter((assessment) => {
    if (activeTab === "all") return true
    if (activeTab === "high" && assessment.result?.risk === "high") return true
    if (activeTab === "moderate" && assessment.result?.risk === "moderate") return true
    if (activeTab === "low" && assessment.result?.risk === "low") return true
    return false
  })

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString() + " " + date.toLocaleTimeString()
    } catch (e) {
      return "Unknown date"
    }
  }

  const handleDeleteAssessment = (index) => {
    setAssessmentToDelete(index)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteAssessment = () => {
    if (assessmentToDelete !== null) {
      const updatedAssessments = [...assessments]
      updatedAssessments.splice(assessmentToDelete, 1)
      setAssessments(updatedAssessments)

      // Update localStorage with all possible keys
      const historyKeys = [
        `assessmentHistory_${userEmail}`,
        `heart_assessment_history_${userEmail}`,
        `heart_assessment_history_${userEmail.toLowerCase()}`,
      ]

      for (const key of historyKeys) {
        localStorage.setItem(key, JSON.stringify(updatedAssessments))
      }

      setDeleteDialogOpen(false)
      setAssessmentToDelete(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={() => router.push("/dashboard")} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Assessment History</CardTitle>
              {isEditingEmail ? (
                <div className="flex items-center mt-2">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mr-2 text-sm"
                    placeholder="Enter email address"
                  />
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSaveEmail}
                    className="bg-blue-600 hover:bg-blue-700 mr-2"
                  >
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancelEmailEdit}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <CardDescription>
                  Viewing history for: {userEmail}{" "}
                  <Button variant="link" className="p-0 h-auto text-blue-400" onClick={handleChangeEmail}>
                    Change
                  </Button>
                </CardDescription>
              )}
            </div>
            {assessments.length > 0 && (
              <Button variant="destructive" size="sm" onClick={handleClearHistory}>
                <Trash2 className="h-4 w-4 mr-1" /> Clear History
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-pulse">Loading assessment history...</div>
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
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="high">High Risk</TabsTrigger>
                  <TabsTrigger value="moderate">Moderate Risk</TabsTrigger>
                  <TabsTrigger value="low">Low Risk</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-4">
                {filteredAssessments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No assessments found for this filter.</p>
                  </div>
                ) : (
                  filteredAssessments.map((assessment, index) => (
                    <Card key={index} className="bg-gray-800 border-gray-700 overflow-hidden">
                      <div className="flex">
                        <div
                          className={`w-2 ${
                            assessment.result?.risk === "high"
                              ? "bg-red-500"
                              : assessment.result?.risk === "moderate"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                        ></div>
                        <div className="p-4 flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium mb-1">
                                {assessment.result?.risk === "high"
                                  ? "High Risk Assessment"
                                  : assessment.result?.risk === "moderate"
                                    ? "Moderate Risk Assessment"
                                    : "Low Risk Assessment"}
                              </h3>
                              <div className="flex items-center text-sm text-gray-400 mb-2">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatDate(assessment.timestamp)}
                              </div>
                            </div>
                            <div className="flex flex-col items-center">
                              <div
                                className={`flex items-center justify-center rounded-full w-10 h-10 ${
                                  assessment.result?.risk === "high"
                                    ? "bg-red-900/30"
                                    : assessment.result?.risk === "moderate"
                                      ? "bg-yellow-900/30"
                                      : "bg-green-900/30"
                                }`}
                              >
                                <Heart
                                  className={`h-5 w-5 ${
                                    assessment.result?.risk === "high"
                                      ? "text-red-500"
                                      : assessment.result?.risk === "moderate"
                                        ? "text-yellow-500"
                                        : "text-green-500"
                                  }`}
                                />
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-0 h-6 w-6 mt-1 text-gray-400 hover:text-red-500"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteAssessment(index)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                            <div>
                              <p className="text-xs text-gray-500">Age</p>
                              <p className="text-sm">{assessment.age} years</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Gender</p>
                              <p className="text-sm">{assessment.sex === "1" ? "Male" : "Female"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Blood Pressure</p>
                              <p className="text-sm">{assessment.trestbps} mm Hg</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Cholesterol</p>
                              <p className="text-sm">{assessment.chol} mg/dl</p>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewAssessment(assessment)}
                              className="text-xs"
                            >
                              View Details
                            </Button>
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

      {/* Delete Assessment Dialog */}
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
            <AlertDialogAction onClick={confirmDeleteAssessment} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear History Dialog */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Assessment History</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear your entire assessment history? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 hover:bg-gray-700 border-gray-700">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClearHistory} className="bg-red-600 hover:bg-red-700">
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
