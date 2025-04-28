"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getHistory, type AssessmentHistoryItem } from "@/lib/history-storage"
import { TrendingUp, TrendingDown, Activity } from "lucide-react"

export default function HistoryStatistics() {
  const [history, setHistory] = useState<AssessmentHistoryItem[]>([])
  const [stats, setStats] = useState({
    totalAssessments: 0,
    highRiskCount: 0,
    moderateRiskCount: 0,
    lowRiskCount: 0,
    averageRiskScore: 0,
    averageAge: 0,
    averageBP: 0,
    averageChol: 0,
    riskTrend: "stable" as "improving" | "worsening" | "stable",
  })

  useEffect(() => {
    const assessmentHistory = getHistory()
    setHistory(assessmentHistory)
  }, [])

  useEffect(() => {
    if (history.length === 0) return

    // Calculate statistics
    const highRiskCount = history.filter((item) => item.result.risk === "high").length
    const moderateRiskCount = history.filter((item) => item.result.risk === "moderate").length
    const lowRiskCount = history.filter((item) => item.result.risk === "low").length

    const totalRiskScore = history.reduce((sum, item) => sum + item.result.score, 0)
    const averageRiskScore = Math.round(totalRiskScore / history.length)

    const totalAge = history.reduce((sum, item) => sum + Number.parseInt(item.age), 0)
    const averageAge = Math.round(totalAge / history.length)

    const totalBP = history.reduce((sum, item) => sum + Number.parseInt(item.trestbps), 0)
    const averageBP = Math.round(totalBP / history.length)

    const totalChol = history.reduce((sum, item) => sum + Number.parseInt(item.chol), 0)
    const averageChol = Math.round(totalChol / history.length)

    // Calculate risk trend (if there are at least 2 assessments)
    let riskTrend: "improving" | "worsening" | "stable" = "stable"

    if (history.length >= 2) {
      // Sort by date (newest first)
      const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      // Compare the most recent two assessments
      const newestAssessment = sortedHistory[0]
      const previousAssessment = sortedHistory[1]

      if (newestAssessment.result.score < previousAssessment.result.score) {
        riskTrend = "improving"
      } else if (newestAssessment.result.score > previousAssessment.result.score) {
        riskTrend = "worsening"
      }
    }

    setStats({
      totalAssessments: history.length,
      highRiskCount,
      moderateRiskCount,
      lowRiskCount,
      averageRiskScore,
      averageAge,
      averageBP,
      averageChol,
      riskTrend,
    })
  }, [history])

  if (history.length === 0) {
    return null
  }

  return (
    <Card className="bg-gray-900 border-gray-800 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-red-500" />
          Assessment Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 p-3 rounded-md">
            <p className="text-xs text-gray-400">Total Assessments</p>
            <p className="text-xl font-medium">{stats.totalAssessments}</p>
          </div>

          <div className="bg-gray-800/50 p-3 rounded-md">
            <p className="text-xs text-gray-400">Average Risk Score</p>
            <p className="text-xl font-medium">{stats.averageRiskScore}%</p>
          </div>

          <div className="bg-gray-800/50 p-3 rounded-md">
            <p className="text-xs text-gray-400">Risk Trend</p>
            <div className="flex items-center gap-1">
              {stats.riskTrend === "improving" ? (
                <>
                  <TrendingDown className="h-4 w-4 text-green-500" />
                  <p className="text-xl font-medium text-green-500">Improving</p>
                </>
              ) : stats.riskTrend === "worsening" ? (
                <>
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  <p className="text-xl font-medium text-red-500">Worsening</p>
                </>
              ) : (
                <p className="text-xl font-medium">Stable</p>
              )}
            </div>
          </div>

          <div className="bg-gray-800/50 p-3 rounded-md">
            <p className="text-xs text-gray-400">Risk Distribution</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
                <span className="text-xs">{stats.highRiskCount}</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>
                <span className="text-xs">{stats.moderateRiskCount}</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                <span className="text-xs">{stats.lowRiskCount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-800">
          <h3 className="text-sm font-medium mb-3">Average Health Metrics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-800/50 p-3 rounded-md">
              <p className="text-xs text-gray-400">Age</p>
              <p className="text-lg font-medium">{stats.averageAge} years</p>
            </div>
            <div className="bg-gray-800/50 p-3 rounded-md">
              <p className="text-xs text-gray-400">Blood Pressure</p>
              <p className="text-lg font-medium">{stats.averageBP} mm Hg</p>
            </div>
            <div className="bg-gray-800/50 p-3 rounded-md">
              <p className="text-xs text-gray-400">Cholesterol</p>
              <p className="text-lg font-medium">{stats.averageChol} mg/dl</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
