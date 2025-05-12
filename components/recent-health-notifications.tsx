"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Info, Heart, CheckCircle, ArrowRight, Bell } from "lucide-react"

// Mock data
const mockNotifications = [
  {
    id: 1,
    type: "alert",
    title: "High Heart Rate Detected",
    description: "Your heart rate was above 120 BPM for over 10 minutes while at rest.",
    date: "2023-11-01T15:34:00Z",
    unread: true,
    actionLabel: "View Details",
    actionUrl: "/health/heart-rate",
  },
  {
    id: 2,
    type: "info",
    title: "Blood Pressure Check Reminder",
    description: "It's been 2 weeks since your last blood pressure reading.",
    date: "2023-10-28T09:15:00Z",
    unread: false,
    actionLabel: "Log Reading",
    actionUrl: "/health/blood-pressure",
  },
  {
    id: 3,
    type: "success",
    title: "Activity Goal Achieved",
    description: "Congratulations! You've reached your daily step goal for 5 days in a row.",
    date: "2023-10-25T18:20:00Z",
    unread: false,
    actionLabel: "See Activity",
    actionUrl: "/health/activity",
  },
]

interface RecentHealthNotificationsProps {
  hasPendingHealth?: boolean
}

export function RecentHealthNotifications({ hasPendingHealth = false }: RecentHealthNotificationsProps) {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [showAll, setShowAll] = useState(false)

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, unread: false } : notification)),
    )
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <Heart className="h-5 w-5 text-rose-500" />
    }
  }

  const displayedNotifications = showAll ? notifications : notifications.slice(0, 2)

  return (
    <div className="space-y-4">
      {displayedNotifications.length > 0 ? (
        <>
          {displayedNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`overflow-hidden ${notification.unread ? "border-l-4 border-l-blue-500" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium mb-1 flex items-center">
                        {notification.title}
                        {notification.unread && (
                          <Badge variant="secondary" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                            New
                          </Badge>
                        )}
                      </h4>
                      <span className="text-xs text-gray-500">{new Date(notification.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-600">{notification.description}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between bg-gray-50 px-4 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAsRead(notification.id)}
                  className={notification.unread ? "opacity-100" : "opacity-0 pointer-events-none"}
                >
                  Mark as read
                </Button>
                <Button variant="ghost" size="sm" className="text-blue-600">
                  {notification.actionLabel} <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}

          {notifications.length > 2 && (
            <Button variant="outline" className="w-full" onClick={() => setShowAll(!showAll)}>
              {showAll ? "Show Less" : `Show All (${notifications.length})`}
            </Button>
          )}
        </>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-md border border-gray-200">
          <Bell className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <p className="text-muted-foreground">No health notifications</p>
          <p className="text-xs text-muted-foreground mt-1">You'll be notified about important health events here</p>
        </div>
      )}
    </div>
  )
}
