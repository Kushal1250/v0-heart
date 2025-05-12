"use client"

import { useState } from "react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type HealthMetric = {
  id: string
  userId: string
  type: string
  value: number
  unit: string
  date: string
  notes?: string
}

type HealthMetricsChartProps = {
  metrics?: HealthMetric[]
  title?: string
  description?: string
  className?: string
}

export function HealthMetricsChart({
  metrics = [],
  title = "Health Metrics Trends",
  description = "Track your health metrics over time",
  className = "",
}: HealthMetricsChartProps) {
  const [timeRange, setTimeRange] = useState("30")

  // Group metrics by type
  const metricTypes = [...new Set(metrics.map((metric) => metric.type))]
  const [selectedMetricType, setSelectedMetricType] = useState(metricTypes[0] || "weight")

  // Filter metrics by selected type and time range
  const filteredMetrics = metrics
    .filter((metric) => metric.type === selectedMetricType)
    .filter((metric) => {
      if (!timeRange) return true
      const metricDate = new Date(metric.date)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - Number.parseInt(timeRange))
      return metricDate >= cutoffDate
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Format data for chart
  const chartData = filteredMetrics.map((metric) => ({
    date: new Date(metric.date).toLocaleDateString(),
    value: metric.value,
    unit: metric.unit,
  }))

  // Get unit for the selected metric type
  const unit = filteredMetrics.length > 0 ? filteredMetrics[0].unit : ""

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedMetricType} onValueChange={setSelectedMetricType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                {metricTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
                <SelectItem value="180">Last 6 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ChartContainer
            config={{
              value: {
                label: `${selectedMetricType.charAt(0).toUpperCase() + selectedMetricType.slice(1)} (${unit})`,
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 12 }} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-value)"
                  name={`${selectedMetricType} (${unit})`}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex justify-center items-center h-[300px] text-muted-foreground">
            No data available for the selected metric and time range
          </div>
        )}
      </CardContent>
    </Card>
  )
}
