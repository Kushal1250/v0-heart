"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { subDays, startOfDay, endOfDay, addDays } from "date-fns"
import {
  Heart,
  Activity,
  Droplet,
  Scale,
  Clock,
  Plus,
  ChevronLeft,
  AlertCircle,
  Info,
  TrendingUp,
  Target,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { HealthMetricsChart } from "@/components/health-metrics-chart"
import { HealthMetricsTable } from "@/components/health-metrics-table"
import { AddMetricForm } from "@/components/add-metric-form"
import { MetricInsights } from "@/components/metric-insights"
import { HealthMetricGoals, type MetricGoal } from "@/components/health-metric-goals"

// Define types for health metrics
export type MetricType =
  | "blood_pressure"
  | "heart_rate"
  | "weight"
  | "cholesterol"
  | "blood_glucose"
  | "oxygen_saturation"
  | "sleep"
  | "steps"
  | "water_intake"

export interface MetricReading {
  id: string
  type: MetricType
  value: number | string | { systolic: number; diastolic: number }
  unit: string
  timestamp: string
  notes?: string
}

export interface MetricDefinition {
  id: MetricType
  name: string
  icon: React.ReactNode
  unit: string
  normalRange: string
  description: string
  frequency: string
  color: string
}

// Define the metrics and their properties
const metricDefinitions: MetricDefinition[] = [
  {
    id: "blood_pressure",
    name: "Blood Pressure",
    icon: <Droplet className="h-5 w-5" />,
    unit: "mmHg",
    normalRange: "90-120/60-80",
    description: "The pressure of blood against the walls of your arteries",
    frequency: "Daily",
    color: "text-red-500",
  },
  {
    id: "heart_rate",
    name: "Heart Rate",
    icon: <Heart className="h-5 w-5" />,
    unit: "bpm",
    normalRange: "60-100",
    description: "The number of times your heart beats per minute",
    frequency: "Daily",
    color: "text-pink-500",
  },
  {
    id: "weight",
    name: "Weight",
    icon: <Scale className="h-5 w-5" />,
    unit: "kg",
    normalRange: "Varies by height",
    description: "Your body weight",
    frequency: "Weekly",
    color: "text-blue-500",
  },
  {
    id: "cholesterol",
    name: "Cholesterol",
    icon: <Droplet className="h-5 w-5" />,
    unit: "mg/dL",
    normalRange: "Total: <200, LDL: <100, HDL: >40",
    description: "A fatty substance found in your blood",
    frequency: "Every 3-6 months",
    color: "text-yellow-500",
  },
  {
    id: "blood_glucose",
    name: "Blood Glucose",
    icon: <Droplet className="h-5 w-5" />,
    unit: "mg/dL",
    normalRange: "Fasting: 70-99",
    description: "The amount of glucose in your blood",
    frequency: "As recommended",
    color: "text-purple-500",
  },
  {
    id: "oxygen_saturation",
    name: "Oxygen Saturation",
    icon: <Activity className="h-5 w-5" />,
    unit: "%",
    normalRange: "95-100",
    description: "The percentage of oxygen-saturated hemoglobin in your blood",
    frequency: "As needed",
    color: "text-cyan-500",
  },
  {
    id: "sleep",
    name: "Sleep",
    icon: <Clock className="h-5 w-5" />,
    unit: "hours",
    normalRange: "7-9",
    description: "The amount of sleep you get each night",
    frequency: "Daily",
    color: "text-indigo-500",
  },
  {
    id: "steps",
    name: "Steps",
    icon: <Activity className="h-5 w-5" />,
    unit: "steps",
    normalRange: "7,000-10,000",
    description: "The number of steps you take each day",
    frequency: "Daily",
    color: "text-green-500",
  },
  {
    id: "water_intake",
    name: "Water Intake",
    icon: <Droplet className="h-5 w-5" />,
    unit: "ml",
    normalRange: "2000-3000",
    description: "The amount of water you drink each day",
    frequency: "Daily",
    color: "text-blue-400",
  },
]

export default function HealthMetricsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [activeMetric, setActiveMetric] = useState<MetricType>("blood_pressure")
  const [timeRange, setTimeRange] = useState<"week" | "month" | "3months" | "6months" | "year">("month")
  const [activeTab, setActiveTab] = useState<"chart" | "table" | "insights" | "goals">("chart")
  const [isAddingMetric, setIsAddingMetric] = useState(false)
  const [metrics, setMetrics] = useState<MetricReading[]>([])
  const [goals, setGoals] = useState<MetricGoal[]>([])
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false)
  const [isLoadingGoals, setIsLoadingGoals] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get the current metric definition
  const currentMetric = metricDefinitions.find((m) => m.id === activeMetric)!

  // Get the latest value for the current metric
  const getLatestValue = () => {
    if (metrics.length === 0) return undefined

    // Sort by timestamp (newest first)
    const sortedMetrics = [...metrics].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Get the latest reading
    const latestReading = sortedMetrics[0]

    if (activeMetric === "blood_pressure" && typeof latestReading.value === "object") {
      return latestReading.value
    } else if (typeof latestReading.value === "number") {
      return latestReading.value
    } else if (typeof latestReading.value === "string") {
      return Number.parseFloat(latestReading.value)
    }

    return undefined
  }

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    } else if (user) {
      fetchMetrics()
      fetchGoals()
    }
  }, [user, isLoading, router, activeMetric, timeRange])

  // Function to fetch metrics from the API
  const fetchMetrics = async () => {
    setIsLoadingMetrics(true)
    setError(null)

    try {
      // Calculate date range based on selected time range
      const endDate = new Date()
      let startDate: Date

      switch (timeRange) {
        case "week":
          startDate = subDays(endDate, 7)
          break
        case "month":
          startDate = subDays(endDate, 30)
          break
        case "3months":
          startDate = subDays(endDate, 90)
          break
        case "6months":
          startDate = subDays(endDate, 180)
          break
        case "year":
          startDate = subDays(endDate, 365)
          break
        default:
          startDate = subDays(endDate, 30)
      }

      const response = await fetch(
        `/api/health-metrics?type=${activeMetric}&startDate=${startOfDay(startDate).toISOString()}&endDate=${endOfDay(endDate).toISOString()}`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch health metrics")
      }

      const data = await response.json()
      setMetrics(data)
    } catch (err) {
      console.error("Error fetching metrics:", err)
      setError("Failed to load health metrics. Please try again.")
    } finally {
      setIsLoadingMetrics(false)
    }
  }

  // Function to fetch goals from the API
  const fetchGoals = async () => {
    setIsLoadingGoals(true)

    try {
      const response = await fetch(`/api/health-metric-goals?type=${activeMetric}`)

      if (!response.ok) {
        throw new Error("Failed to fetch health metric goals")
      }

      const data = await response.json()

      // Calculate progress for each goal
      const goalsWithProgress = data.map((goal: MetricGoal) => {
        return calculateGoalProgress(goal)
      })

      setGoals(goalsWithProgress)
    } catch (err) {
      console.error("Error fetching goals:", err)
      // Don't set error state here to avoid disrupting the metrics view
    } finally {
      setIsLoadingGoals(false)
    }
  }

  // Calculate progress for a goal
  const calculateGoalProgress = (goal: MetricGoal): MetricGoal => {
    // If goal is already achieved, progress is 100%
    if (goal.achieved) {
      return { ...goal, progress: 100 }
    }

    // Get the latest value for this metric
    const latestValue = getLatestValue()
    if (!latestValue) {
      return { ...goal, progress: 0, currentValue: undefined }
    }

    let progress = 0

    if (activeMetric === "blood_pressure") {
      if (typeof goal.targetValue === "object" && typeof latestValue === "object") {
        // For blood pressure, calculate progress based on both systolic and diastolic
        const systolicProgress = calculateSingleValueProgress(latestValue.systolic, goal.targetValue.systolic, "lower")
        const diastolicProgress = calculateSingleValueProgress(
          latestValue.diastolic,
          goal.targetValue.diastolic,
          "lower",
        )
        progress = Math.floor((systolicProgress + diastolicProgress) / 2)
      }
    } else if (typeof goal.targetValue === "number" && typeof latestValue === "number") {
      // For other metrics, calculate progress based on whether higher or lower is better
      const direction = ["weight", "cholesterol", "blood_glucose"].includes(activeMetric)
        ? "lower"
        : ["steps", "water_intake", "oxygen_saturation"].includes(activeMetric)
          ? "higher"
          : "target"

      progress = calculateSingleValueProgress(latestValue, goal.targetValue, direction)
    }

    return {
      ...goal,
      progress,
      currentValue: latestValue,
    }
  }

  // Calculate progress for a single value
  const calculateSingleValueProgress = (
    current: number,
    target: number,
    direction: "higher" | "lower" | "target",
  ): number => {
    if (direction === "lower") {
      // For metrics where lower is better (like weight, blood pressure)
      if (current <= target) return 100 // Already reached target

      // Assume starting point was 50% higher than target (arbitrary but reasonable)
      const startValue = target * 1.5
      const totalChange = startValue - target
      const currentChange = startValue - current

      return Math.min(100, Math.max(0, Math.floor((currentChange / totalChange) * 100)))
    } else if (direction === "higher") {
      // For metrics where higher is better (like steps, water intake)
      if (current >= target) return 100 // Already reached target

      // Assume starting point was 50% lower than target (arbitrary but reasonable)
      const startValue = target * 0.5
      const totalChange = target - startValue
      const currentChange = current - startValue

      return Math.min(100, Math.max(0, Math.floor((currentChange / totalChange) * 100)))
    } else {
      // For metrics where we want to hit a specific target (like sleep)
      const difference = Math.abs(current - target)
      const percentDifference = (difference / target) * 100

      return Math.min(100, Math.max(0, Math.floor(100 - percentDifference)))
    }
  }

  // Function to add a new metric reading
  const addMetricReading = async (reading: Omit<MetricReading, "id" | "timestamp">) => {
    try {
      const response = await fetch("/api/health-metrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...reading,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add metric reading")
      }

      toast({
        title: "Success",
        description: "Your health metric has been recorded successfully!",
      })

      // Refresh metrics
      fetchMetrics()
      // Also refresh goals to update progress
      fetchGoals()
      setIsAddingMetric(false)
    } catch (err) {
      console.error("Error adding metric:", err)
      toast({
        title: "Error",
        description: "Failed to record health metric. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Function to delete a metric reading
  const deleteMetricReading = async (id: string) => {
    try {
      const response = await fetch(`/api/health-metrics/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete metric reading")
      }

      toast({
        title: "Success",
        description: "Health metric deleted successfully!",
      })

      // Refresh metrics
      fetchMetrics()
      // Also refresh goals to update progress
      fetchGoals()
    } catch (err) {
      console.error("Error deleting metric:", err)
      toast({
        title: "Error",
        description: "Failed to delete health metric. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Function to add a new goal
  const addGoal = async (goalData: Omit<MetricGoal, "id" | "progress" | "achieved" | "achievedDate">) => {
    try {
      const response = await fetch("/api/health-metric-goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(goalData),
      })

      if (!response.ok) {
        throw new Error("Failed to add goal")
      }

      // Refresh goals
      fetchGoals()
    } catch (err) {
      console.error("Error adding goal:", err)
      toast({
        title: "Error",
        description: "Failed to add goal. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Function to update a goal
  const updateGoal = async (goal: MetricGoal) => {
    try {
      const response = await fetch(`/api/health-metric-goals/${goal.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(goal),
      })

      if (!response.ok) {
        throw new Error("Failed to update goal")
      }

      // Refresh goals
      fetchGoals()
    } catch (err) {
      console.error("Error updating goal:", err)
      toast({
        title: "Error",
        description: "Failed to update goal. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Function to delete a goal
  const deleteGoal = async (goalId: string) => {
    try {
      const response = await fetch(`/api/health-metric-goals/${goalId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete goal")
      }

      toast({
        title: "Success",
        description: "Goal deleted successfully!",
      })

      // Refresh goals
      fetchGoals()
    } catch (err) {
      console.error("Error deleting goal:", err)
      toast({
        title: "Error",
        description: "Failed to delete goal. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Generate sample data for demonstration purposes
  const generateSampleData = () => {
    const sampleData: MetricReading[] = []
    const endDate = new Date()
    let startDate: Date

    switch (timeRange) {
      case "week":
        startDate = subDays(endDate, 7)
        break
      case "month":
        startDate = subDays(endDate, 30)
        break
      case "3months":
        startDate = subDays(endDate, 90)
        break
      case "6months":
        startDate = subDays(endDate, 180)
        break
      case "year":
        startDate = subDays(endDate, 365)
        break
      default:
        startDate = subDays(endDate, 30)
    }

    // Generate random data points between start and end dates
    const daysBetween = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const numDataPoints = Math.min(daysBetween, 30) // Cap at 30 data points for clarity

    for (let i = 0; i < numDataPoints; i++) {
      const date = subDays(endDate, Math.floor(i * (daysBetween / numDataPoints)))

      let value: number | string | { systolic: number; diastolic: number }

      // Generate appropriate random values based on metric type
      switch (activeMetric) {
        case "blood_pressure":
          value = {
            systolic: Math.floor(Math.random() * 30) + 100, // 100-130
            diastolic: Math.floor(Math.random() * 20) + 60, // 60-80
          }
          break
        case "heart_rate":
          value = Math.floor(Math.random() * 30) + 60 // 60-90
          break
        case "weight":
          // Start with a base weight and add small variations
          const baseWeight = 70
          value = baseWeight + (Math.random() * 2 - 1) // +/- 1kg
          break
        case "cholesterol":
          value = Math.floor(Math.random() * 50) + 150 // 150-200
          break
        case "blood_glucose":
          value = Math.floor(Math.random() * 30) + 80 // 80-110
          break
        case "oxygen_saturation":
          value = Math.floor(Math.random() * 5) + 95 // 95-100
          break
        case "sleep":
          value = 5 + Math.random() * 4 // 5-9 hours
          break
        case "steps":
          value = Math.floor(Math.random() * 5000) + 5000 // 5000-10000
          break
        case "water_intake":
          value = Math.floor(Math.random() * 1000) + 1500 // 1500-2500
          break
        default:
          value = 0
      }

      sampleData.push({
        id: `sample-${i}`,
        type: activeMetric,
        value,
        unit: currentMetric.unit,
        timestamp: date.toISOString(),
      })
    }

    // Sort by date
    sampleData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    return sampleData
  }

  // Generate sample goals for demonstration purposes
  const generateSampleGoals = () => {
    const sampleGoals: MetricGoal[] = []

    // Create a goal that's in progress
    const inProgressGoal: Omit<MetricGoal, "progress"> = {
      id: `sample-goal-1-${activeMetric}`,
      metricType: activeMetric,
      targetValue: getTargetValueForMetric(activeMetric, "in-progress"),
      startDate: subDays(new Date(), 15).toISOString(),
      targetDate: addDays(new Date(), 15).toISOString(),
      notes: "My in-progress goal",
      reminderEnabled: true,
      reminderFrequency: "daily",
      reminderTime: "09:00",
      achieved: false,
    }

    // Create a goal that's achieved
    const achievedGoal: Omit<MetricGoal, "progress"> = {
      id: `sample-goal-2-${activeMetric}`,
      metricType: activeMetric,
      targetValue: getTargetValueForMetric(activeMetric, "achieved"),
      startDate: subDays(new Date(), 30).toISOString(),
      targetDate: subDays(new Date(), 5).toISOString(),
      notes: "My achieved goal",
      reminderEnabled: false,
      reminderFrequency: "daily",
      achieved: true,
      achievedDate: subDays(new Date(), 5).toISOString(),
    }

    // Create a new goal
    const newGoal: Omit<MetricGoal, "progress"> = {
      id: `sample-goal-3-${activeMetric}`,
      metricType: activeMetric,
      targetValue: getTargetValueForMetric(activeMetric, "new"),
      startDate: new Date().toISOString(),
      targetDate: addDays(new Date(), 30).toISOString(),
      notes: "My new goal",
      reminderEnabled: true,
      reminderFrequency: "weekly",
      reminderDays: [1, 4], // Monday and Thursday
      reminderTime: "18:00",
      achieved: false,
    }

    // Add the goals with calculated progress
    sampleGoals.push({
      ...inProgressGoal,
      progress: 50,
      currentValue: getLatestValue(),
    })

    sampleGoals.push({
      ...achievedGoal,
      progress: 100,
      currentValue: getLatestValue(),
    })

    sampleGoals.push({
      ...newGoal,
      progress: 10,
      currentValue: getLatestValue(),
    })

    return sampleGoals
  }

  // Helper function to get appropriate target values for sample goals
  const getTargetValueForMetric = (metricType: MetricType, goalType: "in-progress" | "achieved" | "new") => {
    switch (metricType) {
      case "blood_pressure":
        if (goalType === "achieved") {
          return { systolic: 120, diastolic: 80 }
        } else if (goalType === "in-progress") {
          return { systolic: 115, diastolic: 75 }
        } else {
          return { systolic: 110, diastolic: 70 }
        }
      case "heart_rate":
        return goalType === "achieved" ? 70 : goalType === "in-progress" ? 65 : 60
      case "weight":
        return goalType === "achieved" ? 70 : goalType === "in-progress" ? 68 : 65
      case "cholesterol":
        return goalType === "achieved" ? 180 : goalType === "in-progress" ? 170 : 160
      case "blood_glucose":
        return goalType === "achieved" ? 95 : goalType === "in-progress" ? 90 : 85
      case "oxygen_saturation":
        return goalType === "achieved" ? 97 : goalType === "in-progress" ? 98 : 99
      case "sleep":
        return goalType === "achieved" ? 7 : goalType === "in-progress" ? 7.5 : 8
      case "steps":
        return goalType === "achieved" ? 8000 : goalType === "in-progress" ? 9000 : 10000
      case "water_intake":
        return goalType === "achieved" ? 2000 : goalType === "in-progress" ? 2500 : 3000
      default:
        return 0
    }
  }

  // Use sample data for demonstration
  useEffect(() => {
    // In a real app, you would use fetchMetrics() instead
    setMetrics(generateSampleData())
    setGoals(generateSampleGoals())
  }, [activeMetric, timeRange])

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <Card className="w-full max-w-6xl mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground mt-4">Loading health metrics...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Activity className="h-6 w-6" /> Health Metrics Tracker
              </CardTitle>
              <CardDescription>Track and monitor your health metrics over time</CardDescription>
            </div>
            <Button onClick={() => setIsAddingMetric(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Metric
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Metric Selection */}
          <div className="mb-6 overflow-x-auto">
            <div className="flex space-x-2 pb-2 min-w-max">
              {metricDefinitions.map((metric) => (
                <Button
                  key={metric.id}
                  variant={activeMetric === metric.id ? "default" : "outline"}
                  className="flex items-center gap-2"
                  onClick={() => setActiveMetric(metric.id)}
                >
                  <span className={metric.color}>{metric.icon}</span>
                  <span className="whitespace-nowrap">{metric.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Time Range Selection */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">{currentMetric.name} Tracking</h3>
              <div className="flex space-x-2">
                <Button
                  variant={timeRange === "week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange("week")}
                >
                  Week
                </Button>
                <Button
                  variant={timeRange === "month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange("month")}
                >
                  Month
                </Button>
                <Button
                  variant={timeRange === "3months" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange("3months")}
                >
                  3 Months
                </Button>
                <Button
                  variant={timeRange === "6months" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange("6months")}
                >
                  6 Months
                </Button>
                <Button
                  variant={timeRange === "year" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange("year")}
                >
                  Year
                </Button>
              </div>
            </div>
          </div>

          {/* Metric Info */}
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertTitle className="text-blue-700">{currentMetric.name}</AlertTitle>
            <AlertDescription className="text-blue-600">
              <p>{currentMetric.description}</p>
              <p className="mt-1">
                <strong>Normal Range:</strong> {currentMetric.normalRange}
              </p>
              <p>
                <strong>Recommended Frequency:</strong> {currentMetric.frequency}
              </p>
            </AlertDescription>
          </Alert>

          {/* Metric Visualization and Data */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="chart">Chart</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="goals" className="flex items-center gap-1">
                <Target className="h-4 w-4" /> Goals
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chart">
              {isLoadingMetrics ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="text-sm text-muted-foreground mt-4">Loading chart data...</p>
                </div>
              ) : metrics.length > 0 ? (
                <div className="h-80">
                  <HealthMetricsChart data={metrics} metricType={activeMetric} metricDefinition={currentMetric} />
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-md border border-gray-200">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
                  <p className="text-gray-500 mb-4">
                    You haven't recorded any {currentMetric.name.toLowerCase()} metrics yet.
                  </p>
                  <Button onClick={() => setIsAddingMetric(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Your First Reading
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="table">
              {isLoadingMetrics ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="text-sm text-muted-foreground mt-4">Loading metric data...</p>
                </div>
              ) : metrics.length > 0 ? (
                <HealthMetricsTable
                  data={metrics}
                  metricType={activeMetric}
                  metricDefinition={currentMetric}
                  onDelete={deleteMetricReading}
                />
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-md border border-gray-200">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
                  <p className="text-gray-500 mb-4">
                    You haven't recorded any {currentMetric.name.toLowerCase()} metrics yet.
                  </p>
                  <Button onClick={() => setIsAddingMetric(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Your First Reading
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="insights">
              {metrics.length > 0 ? (
                <MetricInsights data={metrics} metricType={activeMetric} metricDefinition={currentMetric} />
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-md border border-gray-200">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No insights available</h3>
                  <p className="text-gray-500 mb-4">
                    Add more {currentMetric.name.toLowerCase()} readings to see insights and trends.
                  </p>
                  <Button onClick={() => setIsAddingMetric(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Metric Reading
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="goals">
              {isLoadingGoals ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="text-sm text-muted-foreground mt-4">Loading goals data...</p>
                </div>
              ) : (
                <HealthMetricGoals
                  metricType={activeMetric}
                  metricDefinition={currentMetric}
                  goals={goals.filter((goal) => goal.metricType === activeMetric)}
                  onAddGoal={addGoal}
                  onUpdateGoal={updateGoal}
                  onDeleteGoal={deleteGoal}
                  latestValue={getLatestValue()}
                />
              )}
            </TabsContent>
          </Tabs>

          {/* Add Metric Modal */}
          {isAddingMetric && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Add {currentMetric.name} Reading</h3>
                  <Button variant="ghost" size="sm" onClick={() => setIsAddingMetric(false)}>
                    ✕
                  </Button>
                </div>
                <AddMetricForm
                  metricType={activeMetric}
                  metricDefinition={currentMetric}
                  onSubmit={addMetricReading}
                  onCancel={() => setIsAddingMetric(false)}
                />
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" onClick={() => router.push("/profile")}>
            <ChevronLeft className="h-4 w-4 mr-2" /> Back to Profile
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            <ChevronLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
