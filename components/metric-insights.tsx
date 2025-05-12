"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown, Minus, TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from "lucide-react"

type HealthMetric = {
  id: string
  userId: string
  type: string
  value: number
  unit: string
  date: string
  notes?: string
}

type MetricInsight = {
  type: string
  current: number
  previous: number | null
  unit: string
  change: number | null
  changePercent: number | null
  trend: "up" | "down" | "stable" | "unknown"
  status: "good" | "warning" | "critical" | "neutral"
  message: string
}

type MetricInsightsProps = {
  metrics?: HealthMetric[]
  className?: string
  title?: string
  description?: string
}

export function MetricInsights({
  metrics = [],
  className = "",
  title = "Health Insights",
  description = "Analysis of your recent health metrics",
}: MetricInsightsProps) {
  // Group metrics by type
  const metricsByType = metrics.reduce(
    (acc, metric) => {
      if (!acc[metric.type]) {
        acc[metric.type] = []
      }
      acc[metric.type].push(metric)
      return acc
    },
    {} as Record<string, HealthMetric[]>,
  )

  // Sort each group by date (newest first)
  Object.keys(metricsByType).forEach((type) => {
    metricsByType[type].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  })

  // Generate insights for each metric type
  const insights: MetricInsight[] = Object.keys(metricsByType).map((type) => {
    const typeMetrics = metricsByType[type]
    const current = typeMetrics[0]
    const previous = typeMetrics.length > 1 ? typeMetrics[1] : null

    const change = previous ? current.value - previous.value : null
    const changePercent = previous ? (change! / previous.value) * 100 : null

    // Determine trend
    let trend: "up" | "down" | "stable" | "unknown" = "unknown"
    if (change !== null) {
      if (Math.abs(change) < 0.001) {
        trend = "stable"
      } else if (change > 0) {
        trend = "up"
      } else {
        trend = "down"
      }
    }

    // Determine status and message based on metric type and trend
    let status: "good" | "warning" | "critical" | "neutral" = "neutral"
    let message = "No previous data for comparison"

    if (change !== null) {
      switch (type) {
        case "weight":
          // For weight, stable or slight decrease might be good
          if (trend === "down" && Math.abs(changePercent!) < 5) {
            status = "good"
            message = "Healthy weight maintenance"
          } else if (trend === "down" && Math.abs(changePercent!) >= 5) {
            status = "warning"
            message = "Significant weight loss detected"
          } else if (trend === "up" && Math.abs(changePercent!) >= 3) {
            status = "warning"
            message = "Weight gain detected"
          } else {
            status = "neutral"
            message = "Weight is stable"
          }
          break

        case "blood_pressure":
          // For blood pressure, lower is generally better (within limits)
          if (trend === "down") {
            status = "good"
            message = "Blood pressure is improving"
          } else if (trend === "up") {
            status = "warning"
            message = "Blood pressure is increasing"
          } else {
            status = "neutral"
            message = "Blood pressure is stable"
          }
          break

        case "heart_rate":
          // For heart rate, stability is good
          if (trend === "stable") {
            status = "good"
            message = "Heart rate is stable"
          } else if (Math.abs(changePercent!) > 15) {
            status = "warning"
            message = "Significant heart rate change detected"
          } else {
            status = "neutral"
            message = "Heart rate shows normal variation"
          }
          break

        case "steps":
          // For steps, more is generally better
          if (trend === "up") {
            status = "good"
            message = "Activity level is increasing"
          } else if (trend === "down" && Math.abs(changePercent!) > 20) {
            status = "warning"
            message = "Activity level has decreased significantly"
          } else {
            status = "neutral"
            message = "Activity level is consistent"
          }
          break

        default:
          status = "neutral"
          message = `${type.replace("_", " ")} has changed by ${change > 0 ? "+" : ""}${change.toFixed(1)} ${current.unit}`
      }
    }

    return {
      type,
      current: current.value,
      previous: previous?.value || null,
      unit: current.unit,
      change,
      changePercent,
      trend,
      status,
      message,
    }
  })

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {insights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight) => (
              <Card key={insight.type} className="overflow-hidden">
                <div
                  className={`h-1 w-full ${
                    insight.status === "good"
                      ? "bg-green-500"
                      : insight.status === "warning"
                        ? "bg-yellow-500"
                        : insight.status === "critical"
                          ? "bg-red-500"
                          : "bg-gray-300"
                  }`}
                />
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium capitalize text-sm text-muted-foreground">
                        {insight.type.replace("_", " ")}
                      </h3>
                      <div className="text-2xl font-bold mt-1">
                        {insight.current} {insight.unit}
                      </div>
                    </div>

                    <Badge
                      variant={
                        insight.status === "good"
                          ? "default"
                          : insight.status === "warning"
                            ? "secondary"
                            : insight.status === "critical"
                              ? "destructive"
                              : "outline"
                      }
                    >
                      <div className="flex items-center gap-1">
                        {insight.trend === "up" && <ArrowUp className="h-3 w-3" />}
                        {insight.trend === "down" && <ArrowDown className="h-3 w-3" />}
                        {insight.trend === "stable" && <Minus className="h-3 w-3" />}
                        {insight.change !== null && (
                          <span>
                            {insight.change > 0 ? "+" : ""}
                            {insight.change.toFixed(1)} ({insight.changePercent! > 0 ? "+" : ""}
                            {insight.changePercent!.toFixed(1)}%)
                          </span>
                        )}
                        {insight.change === null && <span>No change</span>}
                      </div>
                    </Badge>
                  </div>

                  <div className="mt-4 flex items-start gap-2 text-sm">
                    {insight.status === "good" && <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />}
                    {insight.status === "warning" && <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />}
                    {insight.status === "critical" && <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />}
                    {insight.status === "neutral" &&
                      (insight.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5" />
                      ) : insight.trend === "down" ? (
                        <TrendingDown className="h-4 w-4 text-blue-500 mt-0.5" />
                      ) : (
                        <Minus className="h-4 w-4 text-gray-500 mt-0.5" />
                      ))}
                    <span>{insight.message}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Not enough data to generate insights. Add more health metrics to see trends and analysis.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
