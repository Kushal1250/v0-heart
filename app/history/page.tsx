"use client"

import { useState, useEffect } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getCurrentUserEmail,
  setCurrentUserEmail,
  getHistoryByEmail,
  deleteHistoryItem,
} from "@/lib/user-specific-storage"
import { useAuth } from "@/hooks/use-auth"

export default function HistoryPage() {
  const [history, setHistory] = useState([])
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { isAuthenticated, login, logout } = useAuth()

  // Load history on mount and when email changes
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

    const userHistory = getHistoryByEmail(emailToLoad)
    setHistory(userHistory)
  }

  // Handle email submission
  const handleSubmitEmail = (e) => {
    e.preventDefault()
    if (!email) return

    setCurrentUserEmail(email)
    login(email)
    loadHistory(email)
  }

  // Handle deleting a history item
  const handleDelete = (id) => {
    deleteHistoryItem(email, id)
    loadHistory(email)
  }

  // Format date from timestamp
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString()
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
    const riskClass = getRiskClass(item.result.risk)
    const percentage = Math.round(item.result.score * 100)
    const riskText = `${item.result.risk.charAt(0).toUpperCase() + item.result.risk.slice(1)} Risk (${percentage}%)`

    return <span className={riskClass}>{riskText}</span>
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
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmitEmail} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Enter your email to view your assessment history</Label>
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

      {/* Current email display */}
      {email && (
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Viewing history for: <strong>{email}</strong>
            <Button
              variant="link"
              className="text-sm p-0 ml-2"
              onClick={() => {
                setEmail("")
                setHistory([])
                logout()
              }}
            >
              Change Email
            </Button>
          </p>
        </div>
      )}

      {/* History list */}
      {history.length > 0 ? (
        <div className="space-y-4">
          {history.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{renderRiskLevel(item)}</h3>
                      <p className="text-sm text-gray-500">{formatDate(item.timestamp)}</p>
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
                      <span className="text-gray-500">Age:</span> {item.age}
                    </div>
                    <div>
                      <span className="text-gray-500">Gender:</span> {item.sex === 1 ? "Male" : "Female"}
                    </div>
                    <div>
                      <span className="text-gray-500">Blood Pressure:</span> {item.trestbps}
                    </div>
                    <div>
                      <span className="text-gray-500">Cholesterol:</span> {item.chol}
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No assessment history found.</p>
          {email && (
            <p className="mt-2">
              <Button variant="link" onClick={() => (window.location.href = "/predict")}>
                Take an assessment
              </Button>
            </p>
          )}
        </div>
      )}
    </div>
  )
}
