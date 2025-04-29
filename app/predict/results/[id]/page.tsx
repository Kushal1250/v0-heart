"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Share } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

interface AssessmentResult {
  id: string
  date: string
  risk: "low" | "moderate" | "high"
  score: number
  hasDisease: boolean
  age: string
  sex: string
  trestbps: string
  chol: string
  cp?: string
  fbs?: string
  restecg?: string
  thalach?: string
  exang?: string
  oldpeak?: string
  slope?: string
  ca?: string
  thal?: string
  foodHabits?: string
  junkFoodConsumption?: string
  sleepingHours?: string
}

export default function AssessmentResultPage({ params }: { params: { id: string } }) {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAssessmentResult = async () => {
      if (!user) return

      try {
        setLoading(true)
        const response = await fetch(`/api/user/predictions/${params.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch assessment result")
        }

        const data = await response.json()
        setResult(data)
      } catch (error) {
        console.error("Error fetching assessment result:", error)
        setError("Failed to load assessment result. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchAssessmentResult()
    }
  }, [user, params.id])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-900 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push("/login")
    return null
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-green-600"
      case "moderate":
        return "text-yellow-600"
      case "high":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" className="mb-6 hover:bg-gray-100" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Card className="p-8 mt-6">
              <Skeleton className="h-8 w-1/3 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
              <Skeleton className="h-8 w-1/3 mt-8 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(9)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </Card>
          </div>
        ) : error ? (
          <Card className="p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
          </Card>
        ) : result ? (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Assessment Result</h1>
            <p className="text-gray-500 mb-6">Completed on {formatDate(result.date)}</p>

            <Card className="p-8 border border-gray-200 shadow-sm">
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Risk Assessment</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Risk Level</p>
                    <p className={`text-3xl font-bold ${getRiskColor(result.risk)}`}>
                      {result.risk.charAt(0).toUpperCase() + result.risk.slice(1)} Risk
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {result.risk === "low"
                        ? "Continue maintaining your healthy lifestyle."
                        : result.risk === "moderate"
                          ? "Consider lifestyle changes and regular check-ups."
                          : "Consult with a healthcare professional soon."}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Risk Score</p>
                    <p className="text-3xl font-bold text-gray-900">{result.score}%</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Based on your input parameters and our prediction model
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Assessment Parameters</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Age</p>
                    <p className="text-lg font-medium text-gray-900">{result.age} years</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Sex</p>
                    <p className="text-lg font-medium text-gray-900">{result.sex === "M" ? "Male" : "Female"}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Blood Pressure</p>
                    <p className="text-lg font-medium text-gray-900">{result.trestbps} mm Hg</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Cholesterol</p>
                    <p className="text-lg font-medium text-gray-900">{result.chol} mg/dl</p>
                  </div>
                  {result.cp && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Chest Pain Type</p>
                      <p className="text-lg font-medium text-gray-900">{result.cp}</p>
                    </div>
                  )}
                  {result.fbs && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Fasting Blood Sugar</p>
                      <p className="text-lg font-medium text-gray-900">
                        {result.fbs === "1" ? "> 120 mg/dl" : "≤ 120 mg/dl"}
                      </p>
                    </div>
                  )}
                  {result.restecg && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Resting ECG</p>
                      <p className="text-lg font-medium text-gray-900">{result.restecg}</p>
                    </div>
                  )}
                  {result.thalach && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Max Heart Rate</p>
                      <p className="text-lg font-medium text-gray-900">{result.thalach} bpm</p>
                    </div>
                  )}
                  {result.exang && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Exercise Induced Angina</p>
                      <p className="text-lg font-medium text-gray-900">{result.exang === "1" ? "Yes" : "No"}</p>
                    </div>
                  )}
                  {result.oldpeak && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">ST Depression</p>
                      <p className="text-lg font-medium text-gray-900">{result.oldpeak}</p>
                    </div>
                  )}
                  {result.slope && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">ST Slope</p>
                      <p className="text-lg font-medium text-gray-900">{result.slope}</p>
                    </div>
                  )}
                  {result.ca && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Major Vessels</p>
                      <p className="text-lg font-medium text-gray-900">{result.ca}</p>
                    </div>
                  )}
                  {result.thal && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Thalassemia</p>
                      <p className="text-lg font-medium text-gray-900">{result.thal}</p>
                    </div>
                  )}
                  {result.foodHabits && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Food Habits</p>
                      <p className="text-lg font-medium text-gray-900">{result.foodHabits}</p>
                    </div>
                  )}
                  {result.junkFoodConsumption && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Junk Food Consumption</p>
                      <p className="text-lg font-medium text-gray-900">{result.junkFoodConsumption}</p>
                    </div>
                  )}
                  {result.sleepingHours && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Sleeping Hours</p>
                      <p className="text-lg font-medium text-gray-900">{result.sleepingHours} hours</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Button className="flex items-center">
                  <Download className="mr-2 h-4 w-4" /> Download PDF Report
                </Button>
                <Button variant="outline" className="flex items-center">
                  <Share className="mr-2 h-4 w-4" /> Share Results
                </Button>
              </div>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  )
}
