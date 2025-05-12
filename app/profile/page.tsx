"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Heart, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [assessments, setAssessments] = useState([])
  const [isLoadingAssessments, setIsLoadingAssessments] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    } else if (user) {
      fetchUserAssessments()
    }
  }, [user, isLoading, router])

  const fetchUserAssessments = async () => {
    setIsLoadingAssessments(true)
    try {
      const response = await fetch("/api/user/predictions", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
      })

      if (response.ok) {
        const data = await response.json()
        setAssessments(data)
      } else {
        console.error("Failed to fetch assessments")
      }
    } catch (error) {
      console.error("Error fetching assessments:", error)
    } finally {
      setIsLoadingAssessments(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Recent Health Assessments Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Heart className="h-6 w-6" /> Recent Health Assessments
          </h2>
          <div className="bg-white text-gray-700 rounded-lg p-8">
            {isLoadingAssessments ? (
              <div className="flex justify-center items-center h-32">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : assessments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Score</th>
                      <th className="text-left py-3 px-4">Risk Level</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessments.map((assessment) => (
                      <tr key={assessment.id} className="border-b">
                        <td className="py-3 px-4">{new Date(assessment.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4">{Math.round(assessment.risk_score)}%</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              assessment.risk_level === "low"
                                ? "bg-green-100 text-green-800"
                                : assessment.risk_level === "moderate"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {assessment.risk_level.charAt(0).toUpperCase() + assessment.risk_level.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Link href={`/predict/results/${assessment.id}`}>
                            <Button variant="link" size="sm" className="p-0 h-auto text-blue-600">
                              View Details
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-gray-500 mb-4">No health assessments found</p>
                <Link href="/predict">
                  <Button className="text-blue-600 bg-transparent hover:bg-blue-50">Take an assessment</Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Heart Health Score Trend Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-6 w-6" /> Heart Health Score Trend
          </h2>
          <div className="bg-white text-gray-700 rounded-lg p-8">
            {isLoadingAssessments ? (
              <div className="flex justify-center items-center h-32">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : assessments.length > 0 ? (
              <div className="h-64 flex items-end justify-between gap-2 pt-4">
                {assessments
                  .slice()
                  .reverse()
                  .slice(0, 7)
                  .map((assessment, index) => {
                    const score = Math.round(assessment.risk_score)
                    return (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className={`w-12 rounded-t-sm ${
                            score > 80 ? "bg-green-500" : score > 60 ? "bg-yellow-500" : "bg-red-500"
                          }`}
                          style={{ height: `${score * 0.5}%` }}
                        ></div>
                        <span className="text-xs mt-1">{score}%</span>
                        <span className="text-xs text-gray-500">
                          {new Date(assessment.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )
                  })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-gray-500 mb-2">No heart health scores available</p>
                <p className="text-gray-400 text-sm mb-4">Complete a health assessment to view your trend</p>
                <Link href="/predict">
                  <Button className="text-blue-600 bg-transparent hover:bg-blue-50">Take an assessment</Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
