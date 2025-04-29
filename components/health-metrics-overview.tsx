"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Activity, Calendar, BarChart, Users } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

interface HealthMetric {
  lastRiskScore: number | null
  lastAssessmentDate: string | null
  riskTrend: "improving" | "stable" | "worsening" | null
  communityRank: string | null
}

export function HealthMetricsOverview() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<HealthMetric>({
    lastRiskScore: null,
    lastAssessmentDate: null,
    riskTrend: null,
    communityRank: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHealthMetrics = async () => {
      if (!user) return

      try {
        setLoading(true)
        const response = await fetch("/api/user/health-metrics")

        if (!response.ok) {
          throw new Error("Failed to fetch health metrics")
        }

        const data = await response.json()
        setMetrics({
          lastRiskScore: data.lastRiskScore,
          lastAssessmentDate: data.lastAssessmentDate,
          riskTrend: data.riskTrend,
          communityRank: data.communityRank,
        })
      } catch (error) {
        console.error("Error fetching health metrics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchHealthMetrics()
  }, [user])

  // Format the last assessment date as "X days ago", "today", etc.
  const formatLastAssessment = () => {
    if (!metrics.lastAssessmentDate) return "No data"

    const lastDate = new Date(metrics.lastAssessmentDate)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - lastDate.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    return `${diffDays} days ago`
  }

  // Get appropriate color for risk trend
  const getTrendColor = () => {
    if (metrics.riskTrend === "improving") return "text-green-600"
    if (metrics.riskTrend === "worsening") return "text-red-600"
    return "text-primary"
  }

  // Get appropriate icon for risk trend
  const getTrendIcon = () => {
    if (metrics.riskTrend === "improving") return "↓"
    if (metrics.riskTrend === "worsening") return "↑"
    return ""
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Your Health Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 border border-gray-100 bg-white hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-10 w-10 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Last Risk Score</p>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-semibold text-gray-900">
                  {metrics.lastRiskScore !== null ? `${metrics.lastRiskScore}%` : "No data"}
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-gray-100 bg-white hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-10 w-10 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Last Assessment</p>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-semibold text-gray-900">{formatLastAssessment()}</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-gray-100 bg-white hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart className="h-10 w-10 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Risk Trend</p>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className={`text-2xl font-semibold ${getTrendColor()}`}>
                  {metrics.riskTrend
                    ? metrics.riskTrend.charAt(0).toUpperCase() + metrics.riskTrend.slice(1)
                    : "No data"}{" "}
                  {getTrendIcon()}
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-gray-100 bg-white hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-10 w-10 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Community Rank</p>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className="text-2xl font-semibold text-gray-900">{metrics.communityRank || "No data"}</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
