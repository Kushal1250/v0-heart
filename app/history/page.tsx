"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Bug } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  getCurrentUserEmail,
  setCurrentUserEmail,
  getHistoryByEmail,
  deleteHistoryItem,
} from "@/lib/user-specific-storage"

export default function HistoryPage() {
  const [history, setHistory] = useState([])
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showDebugTools, setShowDebugTools] = useState(false)
  const router = useRouter()

  // Load history on mount
  useEffect(() => {
    const storedEmail = getCurrentUserEmail()
    if (storedEmail) {
      setEmail(storedEmail)
      loadHistory(storedEmail)
    }
    setIsLoading(false)
  }, [])

  // Load history for a specific email
  const loadHistory = (emailToLoad) => {
    if (!emailToLoad) return

    try {
      console.log(`Loading history for email: ${emailToLoad}`)
      const userHistory = getHistoryByEmail(emailToLoad)
      console.log("Retrieved history:", userHistory)
      setHistory(userHistory)
      setIsSubmitted(true)
    } catch (err) {
      console.error("Error loading history:", err)
      setError("Failed to load history. Please try again.")
    }
  }

  // Handle email submission
  const handleSubmitEmail = (e) => {
    e.preventDefault()
    if (!email) return

    console.log(`Submitting email: ${email}`)
    setCurrentUserEmail(email)
    loadHistory(email)
  }

  // Handle deleting a history item
  const handleDelete = (id) => {
    deleteHistoryItem(email, id)
    loadHistory(email)
  }

  // Format date from timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date"

    try {
      return new Date(timestamp).toLocaleString()
    } catch (e) {
      return "Invalid date"
    }
  }

  // Get risk level class
  const getRiskClass = (risk) => {
    switch (risk) {
      case "high":
        return "text-red-600 font-bold"
      case "moderate":
        return "text-amber-600 font-bold"
      case "low":
        return "text-green-600 font-bold"
      default:
        return "text-gray-600 font-bold"
    }
  }

  // Render risk level with percentage
  const renderRiskLevel = (item) => {
    if (!item || !item.result) {
      return <span className="text-gray-600 font-bold">Unknown Risk</span>
    }

    const riskClass = getRiskClass(item.result.risk)
    const percentage = Math.round((item.result.score || 0) * 100)
    const riskText = `${item.result.risk?.charAt(0).toUpperCase() + item.result.risk?.slice(1) || "Unknown"} Risk (${percentage}%)`

    return <span className={riskClass}>{riskText}</span>
  }

  // Navigate to predict page
  const goToPredict = () => {
    router.push("/predict")
  }

  // Toggle debug tools
  const toggleDebugTools = () => {
    setShowDebugTools(!showDebugTools)
  }

  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Assessment History</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Assessment History</h1>

      {/* Email input form */}
      {!isSubmitted && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmitEmail} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium">
                  Enter your email to view your assessment history
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit">View My History</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Error message */}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {/* Current email display */}
      {isSubmitted && (
        <div className="mb-6 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Viewing history for: <strong>{email}</strong>
            <Button
              variant="link"
              className="text-sm p-0 ml-2"
              onClick={() => {
                setEmail("")
                setHistory([])
                setIsSubmitted(false)
              }}
            >
              Change Email
            </Button>
          </p>

          <Button variant="ghost" size="sm" onClick={toggleDebugTools} className="flex items-center gap-1">
            <Bug className="h-4 w-4" />
            {showDebugTools ? "Hide Tools" : "Troubleshoot"}
          </Button>
        </div>
      )}

      {/* History list */}
      {isSubmitted && (
        <>
          {history.length > 0 ? (
            <div className="space-y-4">
              {history.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{renderRiskLevel(item)}</h3>
                        <p className="text-sm text-gray-500">{formatDate(item.timestamp || item.date)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                        aria-label="Delete assessment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Age:</span> {item.age || "N/A"}
                      </div>
                      <div>
                        <span className="text-gray-500">Gender:</span>{" "}
                        {item.sex === 1 || item.sex === "1" ? "Male" : "Female"}
                      </div>
                      <div>
                        <span className="text-gray-500">Blood Pressure:</span> {item.trestbps || "N/A"}
                      </div>
                      <div>
                        <span className="text-gray-500">Cholesterol:</span> {item.chol || "N/A"}
                      </div>
                    </div>

                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Navigate to details page
                          window.location.href = `/predict/results/${item.id}?email=${encodeURIComponent(email)}`
                        }}
                      >
                        View Full Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No assessment history found for {email}.</p>
              <p className="mt-2">
                <Button variant="link" onClick={goToPredict}>
                  Take an assessment
                </Button>
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
