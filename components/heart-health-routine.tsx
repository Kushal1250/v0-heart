"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Activity, Utensils, Moon, Droplet } from "lucide-react"

type RiskLevel = "low" | "moderate" | "high"

interface RoutineItem {
  id: string
  title: string
  description: string
  category: "exercise" | "nutrition" | "sleep" | "hydration" | "other"
  completed: boolean
}

interface HealthRoutineProps {
  riskLevel?: RiskLevel
  predictionScore?: number
  userAge?: number
}

export function HeartHealthRoutine({ riskLevel = "moderate", predictionScore = 65, userAge = 45 }: HealthRoutineProps) {
  const [selectedDay, setSelectedDay] = useState("weekday")
  const [completedItems, setCompletedItems] = useState<string[]>([])
  const [routineItems, setRoutineItems] = useState<RoutineItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch routine items from API
    const fetchRoutineItems = async () => {
      try {
        setLoading(true)
        // In a real app, this would be an API call
        // For demo purposes, we'll use mock data
        const mockRoutineItems: RoutineItem[] = [
          {
            id: "1",
            title: "30-Minute Cardio",
            description: "Moderate intensity cardio exercise like brisk walking, cycling, or swimming.",
            category: "exercise",
            completed: false,
          },
          {
            id: "2",
            title: "Heart-Healthy Breakfast",
            description: "Include whole grains, fruits, and lean protein in your breakfast.",
            category: "nutrition",
            completed: true,
          },
          {
            id: "3",
            title: "Strength Training",
            description: "15-20 minutes of resistance exercises for major muscle groups.",
            category: "exercise",
            completed: false,
          },
          {
            id: "4",
            title: "Hydration Goal",
            description: "Drink at least 8 glasses of water throughout the day.",
            category: "hydration",
            completed: false,
          },
          {
            id: "5",
            title: "Quality Sleep",
            description: "Aim for 7-8 hours of uninterrupted sleep.",
            category: "sleep",
            completed: false,
          },
        ]

        setRoutineItems(mockRoutineItems)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching routine items:", error)
        setLoading(false)
      }
    }

    fetchRoutineItems()
  }, [])

  // Reset completed items when risk level changes
  useEffect(() => {
    setCompletedItems([])
  }, [riskLevel])

  const toggleCompleted = (id: string) => {
    setCompletedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  // Morning routines based on risk level
  const getMorningRoutine = (): RoutineItem[] => {
    const baseRoutine: RoutineItem[] = [
      {
        id: "morning-1",
        title: "Wake up at a consistent time",
        description: "Maintain a regular sleep schedule to improve heart health.",
        category: "other",
        completed: false,
      },
      {
        id: "morning-2",
        title: "Drink a glass of water",
        description: "Hydrate first thing in the morning to improve circulation.",
        category: "hydration",
        completed: false,
      },
      {
        id: "morning-3",
        title: "Light stretching or yoga",
        description: "Gentle movement to get your blood flowing.",
        category: "exercise",
        completed: false,
      },
    ]

    if (riskLevel === "moderate" || riskLevel === "high") {
      baseRoutine.push({
        id: "morning-4",
        title: "Check blood pressure",
        description: "Monitor your blood pressure if prescribed by your doctor.",
        category: "other",
        completed: false,
      })
    }

    baseRoutine.push({
      id: "morning-5",
      title: "Heart-healthy breakfast",
      description:
        riskLevel === "high"
          ? "Oatmeal with berries and nuts, or whole grain toast with avocado."
          : "Balanced breakfast with whole grains, protein, and fruits.",
      category: "nutrition",
      completed: false,
    })

    if (riskLevel === "high") {
      baseRoutine.push({
        id: "morning-6",
        title: "Take prescribed medications",
        description: "Follow your doctor's instructions precisely.",
        category: "other",
        completed: false,
      })
    }

    return baseRoutine
  }

  // Afternoon routines based on risk level
  const getAfternoonRoutine = (): RoutineItem[] => {
    const baseRoutine: RoutineItem[] = [
      {
        id: "afternoon-1",
        title: "Balanced lunch",
        description: "Focus on vegetables, lean proteins, and whole grains.",
        category: "nutrition",
        completed: false,
      },
      {
        id: "afternoon-2",
        title: "Short walk after lunch",
        description: "Even 10 minutes helps digestion and heart health.",
        category: "exercise",
        completed: false,
      },
    ]

    if (riskLevel === "moderate" || riskLevel === "high") {
      baseRoutine.push({
        id: "afternoon-3",
        title: "Stress management break",
        description: "5-10 minutes of deep breathing or meditation.",
        category: "other",
        completed: false,
      })
    }

    baseRoutine.push({
      id: "afternoon-4",
      title: "Healthy snack",
      description: "Nuts, fruits, or yogurt to maintain energy levels.",
      category: "nutrition",
      completed: false,
    })

    return baseRoutine
  }

  // Evening routines based on risk level
  const getEveningRoutine = (): RoutineItem[] => {
    const baseRoutine: RoutineItem[] = [
      {
        id: "evening-1",
        title: "Heart-healthy dinner",
        description:
          riskLevel === "high"
            ? "Low-sodium meal with fish, vegetables, and whole grains."
            : "Balanced dinner with vegetables, lean protein, and whole grains.",
        category: "nutrition",
        completed: false,
      },
      {
        id: "evening-2",
        title: selectedDay === "weekday" ? "Evening activity" : "Family activity",
        description:
          selectedDay === "weekday"
            ? "Light exercise, gardening, or a leisure walk."
            : "Engage in low-intensity family activities.",
        category: "exercise",
        completed: false,
      },
    ]

    if (riskLevel === "moderate" || riskLevel === "high") {
      baseRoutine.push({
        id: "evening-3",
        title: "Limit screen time",
        description: "Reduce exposure to screens at least 1 hour before bed.",
        category: "sleep",
        completed: false,
      })
    }

    baseRoutine.push({
      id: "evening-4",
      title: "Relaxation routine",
      description: "Reading, gentle stretching, or meditation to prepare for sleep.",
      category: "other",
      completed: false,
    })

    if (riskLevel === "high") {
      baseRoutine.push({
        id: "evening-5",
        title: "Evening medication",
        description: "Take evening medications as prescribed.",
        category: "other",
        completed: false,
      })
    }

    baseRoutine.push({
      id: "evening-6",
      title: "Consistent bedtime",
      description: "Aim for 7-8 hours of quality sleep each night.",
      category: "sleep",
      completed: false,
    })

    return baseRoutine
  }

  const morningRoutine = getMorningRoutine()
  const afternoonRoutine = getAfternoonRoutine()
  const eveningRoutine = getEveningRoutine()

  const totalItems = morningRoutine.length + afternoonRoutine.length + eveningRoutine.length
  const completionPercentage = Math.round((completedItems.length / totalItems) * 100)

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case "essential":
        return <Badge variant="destructive">Essential</Badge>
      case "recommended":
        return <Badge variant="secondary">Recommended</Badge>
      case "optional":
        return <Badge variant="outline">Optional</Badge>
      default:
        return null
    }
  }

  const getRiskLevelColor = () => {
    switch (riskLevel) {
      case "low":
        return "text-green-600"
      case "moderate":
        return "text-amber-600"
      case "high":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const toggleCompletion = async (id: string) => {
    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll just update the state
      setRoutineItems((prev) => prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
    } catch (error) {
      console.error("Error toggling routine item completion:", error)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "exercise":
        return <Activity className="h-5 w-5 text-green-500" />
      case "nutrition":
        return <Utensils className="h-5 w-5 text-orange-500" />
      case "sleep":
        return <Moon className="h-5 w-5 text-purple-500" />
      case "hydration":
        return <Droplet className="h-5 w-5 text-blue-500" />
      default:
        return <Heart className="h-5 w-5 text-red-500" />
    }
  }

  if (loading) {
    return (
      <div className="text-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading your routine...</p>
      </div>
    )
  }

  if (routineItems.length === 0) {
    return (
      <div className="text-center py-6">
        <Heart className="h-10 w-10 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500">No routine items found</p>
        <p className="text-sm text-gray-400">Complete a health assessment to get personalized recommendations</p>
      </div>
    )
  }

  const completedCount = routineItems.filter((item) => item.completed).length
  const progress = Math.round((completedCount / routineItems.length) * 100)

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">Daily Progress</p>
          <p className="text-sm font-medium">{progress}% Complete</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {routineItems.map((item) => (
          <Card
            key={item.id}
            className={`cursor-pointer transition-colors ${item.completed ? "bg-green-50 border-green-200" : "hover:bg-gray-50"}`}
            onClick={() => toggleCompletion(item.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start">
                <div className="mr-3 mt-1">{getCategoryIcon(item.category)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{item.title}</h4>
                    <Badge variant={item.completed ? "success" : "outline"} className="ml-2">
                      {item.completed ? "Completed" : "To Do"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
