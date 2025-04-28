"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react"
import type { AssessmentHistoryItem } from "@/lib/history-storage"

interface HistoryStatisticsProps {
  history: AssessmentHistoryItem[]
}

export default function HistoryStatistics({ history }: HistoryStatisticsProps) {
  const [averageRisk, setAverageRisk] = useState(0)
  const [riskTrend, setRiskTrend] = useState<"improving" | "worsening" | "stable">("stable")
  const [riskDistribution, setRiskDistribution] = useState({ high: 0, moderate: 0, low: 0 })
  const [averageMetrics, setAverageMetrics] = useState({
    age: 0,
    bloodPressure: 0,
    cholesterol: 0,
  })

  useEffect(() => {
    if (history.length === 0) return

    // Calculate average risk score
    const totalRisk = history.reduce((sum, item) => sum + item.result.score, 0)
    const avgRisk = Math.round(totalRisk / history.length)
    setAverageRisk(avgRisk)

    // Calculate risk distribution
    const distribution = history.reduce(
      (counts, item) => {
        counts[item.result.risk]++
        return counts
      },
      { high: 0, moderate: 0, low: 0 },
    )
    setRiskDistribution(distribution)

    // Calculate average metrics
    const totalAge = history.reduce((sum, item) => sum + Number.parseInt(item.age || "0"), 0)
    const totalBP = history.reduce((sum, item) => sum + Number.parseInt(item.trestbps || "0"), 0)
    const totalChol = history.reduce((sum, item) => sum + Number.parseInt(item.chol || "0"), 0)

    setAverageMetrics({
      age: Math.round(totalAge / history.length),
      bloodPressure: Math.round(totalBP / history.length),
      cholesterol: Math.round(totalChol / history.length),
    })

    // Determine risk trend
    if (history.length >= 2) {
      // Sort by date (newest first)
      const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      // Compare most recent with previous
      const mostRecent = sortedHistory[0].result.score
      const previous = sortedHistory[1].result.score

      if (mostRecent < previous) {
        setRiskTrend("improving")
      } else if (mostRecent > previous) {
        setRiskTrend("worsening")
      } else {
        setRiskTrend("stable")
      }
    }
  }, [history])

  const getTrendIcon = () => {
    switch (riskTrend) {
      case "improving":
        return <TrendingDown className="h-5 w-5 text-green-500" />
      case "worsening":
        return <TrendingUp className="h-5 w-5 text-red-500" />
      case "stable":
        return <Minus className="h-5 w-5 text-gray-500" />
    }
  }

  const getTrendText = () => {
    switch (riskTrend) {
      case "improving":
        return "Improving"
      case "worsening":
        return "Worsening"
      case "stable":
        return "Stable"
    }
  }

  const getTrendColor = () => {
    switch (riskTrend) {
      case "improving":
        return "text-green-500"
      case "worsening":
        return "text-red-500"
      case "stable":
        return "text-gray-500"
    }
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-blue-500" />
        Assessment Statistics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="text-sm text-gray-400 mb-1">Total Assessments</div>
            <div className="text-3xl font-bold">{history.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="text-sm text-gray-400 mb-1">Average Risk Score</div>
            <div className="text-3xl font-bold">{averageRisk}%</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="text-sm text-gray-400 mb-1">Risk Trend</div>
            <div className="text-3xl font-bold flex items-center gap-2">
              {getTrendIcon()}
              <span className={getTrendColor()}>{getTrendText()}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="text-sm text-gray-400 mb-1">Risk Distribution</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
              <span className="text-xs text-gray-400">{riskDistribution.high}</span>
              <span className="inline-block w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="text-xs text-gray-400">{riskDistribution.moderate}</span>
              <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-xs text-gray-400">{riskDistribution.low}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-lg font-semibold mb-3">Average Health Metrics</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="text-sm text-gray-400 mb-1">Age</div>
            <div className="text-2xl font-bold">{averageMetrics.age} years</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="text-sm text-gray-400 mb-1">Blood Pressure</div>
            <div className="text-2xl font-bold">{averageMetrics.bloodPressure} mm Hg</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="text-sm text-gray-400 mb-1">Cholesterol</div>
            <div className="text-2xl font-bold">{averageMetrics.cholesterol} mg/dl</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
