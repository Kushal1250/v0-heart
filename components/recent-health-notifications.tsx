"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Calendar, Clock, AlertTriangle, Info } from "lucide-react"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "success"
  date: string
  read: boolean
}

export function RecentHealthNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Blood Pressure Check Reminder",
      message: "It's been 30 days since your last blood pressure reading. Consider taking a new measurement.",
      type: "info",
      date: "2023-05-10T09:00:00Z",
      read: false,
    },
    {
      id: "2",
      title: "Heart Rate Elevated",
      message: "Your resting heart rate has been higher than usual for the past 3 days.",
      type: "warning",
      date: "2023-05-09T14:30:00Z",
      read: true,
    },
    {
      id: "3",
      title: "Activity Goal Achieved",
      message: "Congratulations! You've reached your weekly activity goal.",
      type: "success",
      date: "2023-05-08T18:15:00Z",
      read: true,
    },
    {
      id: "4",
      title: "Medication Reminder",
      message: "Don't forget to take your evening medication.",
      type: "info",
      date: "2023-05-08T17:00:00Z",
      read: false,
    },
  ])

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "success":
        return <Heart className="h-5 w-5 text-green-500" />
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={`overflow-hidden cursor-pointer transition-colors hover:bg-muted/50 ${!notification.read ? "border-l-4 border-l-primary" : ""}`}
          onClick={() => markAsRead(notification.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              <div className="bg-muted rounded-md p-2 mt-1">{getIcon(notification.type)}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium">{notification.title}</h4>
                  {!notification.read && (
                    <Badge variant="outline" className="text-xs bg-primary/10">
                      New
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span className="mr-3">{formatDate(notification.date)}</span>
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{formatTime(notification.date)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
