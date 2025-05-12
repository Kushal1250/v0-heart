"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, Utensils, Moon, Droplets } from "lucide-react"

interface RoutineItem {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  progress: number
  target: string
  status: "completed" | "in-progress" | "not-started"
}

export function HeartHealthRoutine() {
  const [routineItems, setRoutineItems] = useState<RoutineItem[]>([
    {
      id: "1",
      title: "Daily Exercise",
      description: "Complete 30 minutes of moderate activity",
      icon: <Activity className="h-5 w-5 text-indigo-500" />,
      progress: 75,
      target: "30 min",
      status: "in-progress",
    },
    {
      id: "2",
      title: "Heart-Healthy Diet",
      description: "Consume 5 servings of fruits and vegetables",
      icon: <Utensils className="h-5 w-5 text-green-500" />,
      progress: 100,
      target: "5 servings",
      status: "completed",
    },
    {
      id: "3",
      title: "Adequate Sleep",
      description: "Get 7-8 hours of quality sleep",
      icon: <Moon className="h-5 w-5 text-purple-500" />,
      progress: 0,
      target: "8 hours",
      status: "not-started",
    },
    {
      id: "4",
      title: "Hydration",
      description: "Drink 8 glasses of water",
      icon: <Droplets className="h-5 w-5 text-blue-500" />,
      progress: 50,
      target: "8 glasses",
      status: "in-progress",
    },
  ])

  const updateProgress = (id: string, increment: boolean) => {
    setRoutineItems(
      routineItems.map((item) => {
        if (item.id === id) {
          const newProgress = increment ? Math.min(item.progress + 25, 100) : Math.max(item.progress - 25, 0)

          let newStatus: "completed" | "in-progress" | "not-started" = "in-progress"
          if (newProgress === 100) newStatus = "completed"
          if (newProgress === 0) newStatus = "not-started"

          return { ...item, progress: newProgress, status: newStatus }
        }
        return item
      }),
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "in-progress":
        return <Badge className="bg-amber-500">In Progress</Badge>
      case "not-started":
        return <Badge variant="outline">Not Started</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {routineItems.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              <div className="bg-muted rounded-md p-2 mt-1">{item.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium">{item.title}</h4>
                  {getStatusBadge(item.status)}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                <div className="flex items-center space-x-2 mb-3">
                  <Progress value={item.progress} className="h-2" />
                  <span className="text-xs font-medium">{item.progress}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Target: {item.target}</span>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateProgress(item.id, false)}
                      disabled={item.progress === 0}
                      className="h-7 px-2"
                    >
                      -
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateProgress(item.id, true)}
                      disabled={item.progress === 100}
                      className="h-7 px-2"
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
