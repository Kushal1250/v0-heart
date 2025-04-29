"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Heart, Info, Trash2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

// Define the assessment type
interface Assessment {
  id: string
  date: string
  risk: number
  inputs: Record<string, any>
}

export default function HistoryPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [currentEmail, setCurrentEmail] = useState<string>("Default User")
  const [isClient, setIsClient] = useState(false)

  // Function to get assessments from localStorage
  const getAssessments = () => {
    try {
      // Try to get the current email from localStorage
      const storedEmail = localStorage.getItem("currentUserEmail") || "Default User"
      setCurrentEmail(storedEmail)

      // Get assessments for this email
      const key = `assessmentHistory_${storedEmail}`
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : []
    } catch (e) {
      console.error("Error loading assessments:", e)
      return []
    }
  }

  // Function to save assessments to localStorage
  const saveAssessments = (newAssessments: Assessment[]) => {
    try {
      const key = `assessmentHistory_${currentEmail}`
      localStorage.setItem(key, JSON.stringify(newAssessments))
    } catch (e) {
      console.error("Error saving assessments:", e)
    }
  }

  // Function to handle email change
  const handleChangeEmail = () => {
    const newEmail = prompt("Enter your email address:", currentEmail)
    if (newEmail && newEmail !== currentEmail) {
      setCurrentEmail(newEmail)
      try {
        localStorage.setItem("currentUserEmail", newEmail)
        // Load assessments for the new email
        const newAssessments = getAssessments()
        setAssessments(newAssessments)
      } catch (e) {
        console.error("Error changing email:", e)
      }
    }
  }

  // Function to delete an assessment
  const handleDeleteAssessment = (index: number, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the card click

    if (window.confirm("Are you sure you want to delete this assessment?")) {
      const newAssessments = [...assessments]
      newAssessments.splice(index, 1)
      setAssessments(newAssessments)
      saveAssessments(newAssessments)
    }
  }

  // Load assessments on component mount
  useEffect(() => {
    setIsClient(true)
    const loadedAssessments = getAssessments()
    setAssessments(loadedAssessments)
  }, [])

  // Function to get risk level text and color
  const getRiskLevel = (risk: number) => {
    if (risk < 0.3) return { text: "Low Risk", color: "bg-green-500" }
    if (risk < 0.6) return { text: "Moderate Risk", color: "bg-yellow-500" }
    return { text: "High Risk", color: "bg-red-500" }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/home" className="flex items-center text-primary hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Info className="h-5 w-5 text-blue-400 mr-2" />
            <div>
              <h3 className="text-white font-medium">Local Assessment History</h3>
              <p className="text-slate-300 text-sm">Stored in your browser</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="text-white border-white hover:bg-slate-700">
            <span className="mr-1">Log in to save history</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="history">Assessment History</TabsTrigger>
          <TabsTrigger value="about">About Heart Health Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-1">Assessment History</h2>
              <p className="text-gray-500">
                Viewing history for: {currentEmail}
                <Button variant="link" className="p-0 h-auto text-primary ml-2" onClick={handleChangeEmail}>
                  Change Email
                </Button>
              </p>
            </div>
          </div>

          {isClient && assessments.length === 0 ? (
            <Card className="bg-slate-900 text-white border-slate-800">
              <CardContent className="pt-10 pb-10 flex flex-col items-center justify-center">
                <Heart className="h-12 w-12 text-red-500 mb-4" />
                <p className="text-lg mb-6">You haven't completed any assessments yet.</p>
                <Button asChild className="bg-red-600 hover:bg-red-700">
                  <Link href="/predict">Take Your First Assessment</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isClient &&
                assessments.map((assessment, index) => {
                  const riskLevel = getRiskLevel(assessment.risk)
                  return (
                    <Card
                      key={assessment.id || index}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => {
                        // Navigate to details page or show details modal
                        console.log("View details for assessment:", assessment)
                      }}
                    >
                      <CardHeader className="pb-2 flex flex-row justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Assessment Result</CardTitle>
                          <CardDescription>{formatDate(new Date(assessment.date))}</CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Heart className="h-5 w-5 text-red-500" />
                          <button
                            onClick={(e) => handleDeleteAssessment(index, e)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            aria-label="Delete assessment"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <Badge className={`${riskLevel.color} text-white`}>{riskLevel.text}</Badge>
                          <p className="mt-2 text-2xl font-bold">{Math.round(assessment.risk * 100)}%</p>
                          <p className="text-sm text-gray-500">Risk Score</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-500">Age</p>
                            <p>{assessment.inputs?.age || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Gender</p>
                            <p>{assessment.inputs?.sex === "1" ? "Male" : "Female"}</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" size="sm" className="w-full">
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  )
                })}
            </div>
          )}

          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>
              Assessment history is stored locally in your browser.
              <br />
              <Link href="/signup" className="text-primary hover:underline">
                Create an account
              </Link>{" "}
              to save your history across devices.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About Heart Health Tracking</CardTitle>
              <CardDescription>Understanding your heart health over time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Regular heart health assessments can help you track changes in your cardiovascular risk factors over
                time. By monitoring these changes, you can better understand how lifestyle modifications and medical
                interventions affect your overall heart health.
              </p>
              <h3 className="text-lg font-medium">Benefits of Tracking</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Identify trends in your heart health risk factors</li>
                <li>Measure the impact of lifestyle changes</li>
                <li>Share comprehensive health data with your healthcare provider</li>
                <li>Receive personalized recommendations based on your history</li>
                <li>Stay motivated by seeing your progress over time</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
