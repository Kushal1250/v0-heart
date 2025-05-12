"use client"

import { Bell, Heart, Activity, Calendar, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"

interface Notification {
  id: string
  title: string
  message: string
  date: string
  type: "reminder" | "alert" | "info" | "achievement"
  read: boolean
}

export function RecentHealthNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch notifications from API
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        // In a real app, this would be an API call
        // For demo purposes, we'll use mock data
        const mockNotifications: Notification[] = [
          {
            id: "1",
            title: "Blood Pressure Check Reminder",
            message: "Remember to check your blood pressure today.",
            date: new Date().toISOString(),
            type: "reminder",
            read: false,
          },
          {
            id: "2",
            title: "Heart Rate Elevated",
            message: "Your heart rate was above normal during your last workout.",
            date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            type: "alert",
            read: true,
          },
          {
            id: "3",
            title: "New Health Article",
            message: "Check out our new article on heart-healthy foods.",
            date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            type: "info",
            read: false,
          },
          {
            id: "4",
            title: "Walking Goal Achieved",
            message: "Congratulations! You reached your weekly walking goal.",
            date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
            type: "achievement",
            read: true,
          },
        ]

        setNotifications(mockNotifications)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching notifications:", error)
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const markAsRead = async (id: string) => {
    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll just update the state
      setNotifications((prev) =>
        prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "reminder":
        return <Calendar className="h-5 w-5 text-blue-500" />
      case "alert":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "info":
        return <Bell className="h-5 w-5 text-purple-500" />
      case "achievement":
        return <Activity className="h-5 w-5 text-green-500" />
      default:
        return <Heart className="h-5 w-5 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="text-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading notifications...</p>
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-6">
        <Bell className="h-10 w-10 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500">No notifications found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-start p-3 rounded-lg ${notification.read ? "bg-gray-50" : "bg-blue-50 border-l-4 border-blue-500"}`}
          onClick={() => !notification.read && markAsRead(notification.id)}
        >
          <div className="mr-3 mt-1">{getNotificationIcon(notification.type)}</div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{notification.title}</h4>
              {!notification.read && (
                <Badge variant="secondary" className="ml-2">
                  New
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
            <p className="text-xs text-gray-500 mt-2">{new Date(notification.date).toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
