"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Sun,
  Salad,
  Dumbbell,
  Clock,
  Moon,
  Heart,
  Utensils,
  Droplets,
  Apple,
  BookOpen,
  Zap,
  HeartPulse,
  Printer,
  Download,
  Share2,
  CheckCircle2,
} from "lucide-react"

type RiskLevel = "low" | "moderate" | "high"

interface RoutineItem {
  id: string
  time: string
  title: string
  description: string
  icon: JSX.Element
  importance: "essential" | "recommended" | "optional"
}

interface HealthRoutineProps {
  riskLevel?: RiskLevel
  predictionScore?: number
  userAge?: number
}

export function HeartHealthRoutine({ riskLevel = "moderate", predictionScore = 65, userAge = 45 }: HealthRoutineProps) {
  const [selectedDay, setSelectedDay] = useState("weekday")
  const [completedItems, setCompletedItems] = useState<string[]>([])

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
        time: "6:00 AM",
        title: "Wake up at a consistent time",
        description: "Maintain a regular sleep schedule to improve heart health.",
        icon: <Sun className="h-5 w-5 text-yellow-500" />,
        importance: "recommended",
      },
      {
        id: "morning-2",
        time: "6:15 AM",
        title: "Drink a glass of water",
        description: "Hydrate first thing in the morning to improve circulation.",
        icon: <Droplets className="h-5 w-5 text-blue-500" />,
        importance: "essential",
      },
      {
        id: "morning-3",
        time: "6:30 AM",
        title: "Light stretching or yoga",
        description: "Gentle movement to get your blood flowing.",
        icon: <Dumbbell className="h-5 w-5 text-purple-500" />,
        importance: "recommended",
      },
    ]

    if (riskLevel === "moderate" || riskLevel === "high") {
      baseRoutine.push({
        id: "morning-4",
        time: "7:00 AM",
        title: "Check blood pressure",
        description: "Monitor your blood pressure if prescribed by your doctor.",
        icon: <HeartPulse className="h-5 w-5 text-red-500" />,
        importance: "essential",
      })
    }

    baseRoutine.push({
      id: "morning-5",
      time: "7:30 AM",
      title: "Heart-healthy breakfast",
      description:
        riskLevel === "high"
          ? "Oatmeal with berries and nuts, or whole grain toast with avocado."
          : "Balanced breakfast with whole grains, protein, and fruits.",
      icon: <Apple className="h-5 w-5 text-green-500" />,
      importance: "essential",
    })

    if (riskLevel === "high") {
      baseRoutine.push({
        id: "morning-6",
        time: "8:00 AM",
        title: "Take prescribed medications",
        description: "Follow your doctor's instructions precisely.",
        icon: <Zap className="h-5 w-5 text-amber-500" />,
        importance: "essential",
      })
    }

    return baseRoutine
  }

  // Afternoon routines based on risk level
  const getAfternoonRoutine = (): RoutineItem[] => {
    const baseRoutine: RoutineItem[] = [
      {
        id: "afternoon-1",
        time: "12:00 PM",
        title: "Balanced lunch",
        description: "Focus on vegetables, lean proteins, and whole grains.",
        icon: <Salad className="h-5 w-5 text-green-500" />,
        importance: "essential",
      },
      {
        id: "afternoon-2",
        time: "1:00 PM",
        title: "Short walk after lunch",
        description: "Even 10 minutes helps digestion and heart health.",
        icon: <Dumbbell className="h-5 w-5 text-purple-500" />,
        importance: "recommended",
      },
    ]

    if (riskLevel === "moderate" || riskLevel === "high") {
      baseRoutine.push({
        id: "afternoon-3",
        time: "3:00 PM",
        title: "Stress management break",
        description: "5-10 minutes of deep breathing or meditation.",
        icon: <BookOpen className="h-5 w-5 text-blue-500" />,
        importance: riskLevel === "high" ? "essential" : "recommended",
      })
    }

    baseRoutine.push({
      id: "afternoon-4",
      time: "4:00 PM",
      title: "Healthy snack",
      description: "Nuts, fruits, or yogurt to maintain energy levels.",
      icon: <Apple className="h-5 w-5 text-green-500" />,
      importance: "recommended",
    })

    return baseRoutine
  }

  // Evening routines based on risk level
  const getEveningRoutine = (): RoutineItem[] => {
    const baseRoutine: RoutineItem[] = [
      {
        id: "evening-1",
        time: "6:00 PM",
        title: "Heart-healthy dinner",
        description:
          riskLevel === "high"
            ? "Low-sodium meal with fish, vegetables, and whole grains."
            : "Balanced dinner with vegetables, lean protein, and whole grains.",
        icon: <Utensils className="h-5 w-5 text-orange-500" />,
        importance: "essential",
      },
      {
        id: "evening-2",
        time: "7:00 PM",
        title: selectedDay === "weekday" ? "Evening activity" : "Family activity",
        description:
          selectedDay === "weekday"
            ? "Light exercise, gardening, or a leisure walk."
            : "Engage in low-intensity family activities.",
        icon: <Dumbbell className="h-5 w-5 text-purple-500" />,
        importance: "recommended",
      },
    ]

    if (riskLevel === "moderate" || riskLevel === "high") {
      baseRoutine.push({
        id: "evening-3",
        time: "8:00 PM",
        title: "Limit screen time",
        description: "Reduce exposure to screens at least 1 hour before bed.",
        icon: <Moon className="h-5 w-5 text-indigo-500" />,
        importance: "recommended",
      })
    }

    baseRoutine.push({
      id: "evening-4",
      time: "9:00 PM",
      title: "Relaxation routine",
      description: "Reading, gentle stretching, or meditation to prepare for sleep.",
      icon: <BookOpen className="h-5 w-5 text-blue-500" />,
      importance: riskLevel === "high" ? "essential" : "recommended",
    })

    if (riskLevel === "high") {
      baseRoutine.push({
        id: "evening-5",
        time: "9:30 PM",
        title: "Evening medication",
        description: "Take evening medications as prescribed.",
        icon: <Zap className="h-5 w-5 text-amber-500" />,
        importance: "essential",
      })
    }

    baseRoutine.push({
      id: "evening-6",
      time: "10:00 PM",
      title: "Consistent bedtime",
      description: "Aim for 7-8 hours of quality sleep each night.",
      icon: <Moon className="h-5 w-5 text-indigo-500" />,
      importance: "essential",
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

  return (
    <Card className="w-full shadow-md border-t-4 border-t-primary">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl flex items-center">
              <Heart className="mr-2 h-5 w-5 text-primary" />
              Personalized Heart Health Routine
            </CardTitle>
            <CardDescription>Daily habits to reduce your risk of heart disease</CardDescription>
          </div>
          <div className="text-right">
            <span className={`font-bold ${getRiskLevelColor()}`}>
              {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
            </span>
            <div className="text-sm text-gray-500">Risk Score: {predictionScore}%</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Daily Progress</span>
            <span className="text-sm font-medium">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="morning" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="morning" className="flex items-center">
                <Sun className="mr-1 h-4 w-4" />
                Morning
              </TabsTrigger>
              <TabsTrigger value="afternoon" className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                Afternoon
              </TabsTrigger>
              <TabsTrigger value="evening" className="flex items-center">
                <Moon className="mr-1 h-4 w-4" />
                Evening
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDay("weekday")}
                className={selectedDay === "weekday" ? "bg-primary/10" : ""}
              >
                Weekday
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDay("weekend")}
                className={selectedDay === "weekend" ? "bg-primary/10" : ""}
              >
                Weekend
              </Button>
            </div>
          </div>

          <TabsContent value="morning" className="mt-0">
            <div className="space-y-4">
              {morningRoutine.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border ${
                    completedItems.includes(item.id) ? "bg-green-50 border-green-200" : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="p-2 bg-primary/10 rounded-full">{item.icon}</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-medium text-gray-500">{item.time}</div>
                          <h4 className="font-medium">{item.title}</h4>
                        </div>
                        <div>{getImportanceBadge(item.importance)}</div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`flex-shrink-0 ${
                        completedItems.includes(item.id)
                          ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                      onClick={() => toggleCompleted(item.id)}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="afternoon" className="mt-0">
            <div className="space-y-4">
              {afternoonRoutine.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border ${
                    completedItems.includes(item.id) ? "bg-green-50 border-green-200" : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="p-2 bg-primary/10 rounded-full">{item.icon}</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-medium text-gray-500">{item.time}</div>
                          <h4 className="font-medium">{item.title}</h4>
                        </div>
                        <div>{getImportanceBadge(item.importance)}</div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`flex-shrink-0 ${
                        completedItems.includes(item.id)
                          ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                      onClick={() => toggleCompleted(item.id)}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="evening" className="mt-0">
            <div className="space-y-4">
              {eveningRoutine.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border ${
                    completedItems.includes(item.id) ? "bg-green-50 border-green-200" : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="p-2 bg-primary/10 rounded-full">{item.icon}</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-medium text-gray-500">{item.time}</div>
                          <h4 className="font-medium">{item.title}</h4>
                        </div>
                        <div>{getImportanceBadge(item.importance)}</div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`flex-shrink-0 ${
                        completedItems.includes(item.id)
                          ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                      onClick={() => toggleCompleted(item.id)}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-sm text-gray-500">
          <span className="font-medium">Note:</span> This routine is personalized based on your risk assessment. Always
          consult with your healthcare provider before making significant lifestyle changes.
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center">
            <Printer className="mr-1 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" className="flex items-center">
            <Download className="mr-1 h-4 w-4" />
            Save
          </Button>
          <Button variant="outline" size="sm" className="flex items-center">
            <Share2 className="mr-1 h-4 w-4" />
            Share
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
