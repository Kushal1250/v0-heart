"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Activity, ArrowUpRight } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

interface ActivityItem {
  id: string
  type: "assessment" | "profile_update" | "other"
  title: string
  description: string
  date: string
  risk?: "low" | "moderate" | "high"
  detailsUrl?: string
}

export function RecentActivity() {
  const { user } = useAuth()
  const router = useRouter()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentActivity = async () => {
      if (!user) return

      try {
        setLoading(true)

        // In a real app, this would be an API call
        // For now, we'll use mock data that matches the image
        const mockActivities: ActivityItem[] = [
          {
            id: "1",
            type: "assessment",
            title: "Heart Disease Risk Assessment",
            description: "Completed on April 26, 2025",
            date: "2025-04-26",
            risk: "low",
            detailsUrl: "/predict/results/1",
          },
          {
            id: "2",
            type: "profile_update",
            title: "Profile Updated",
            description: "Updated personal information on April 24, 2025",
            date: "2025-04-24",
            detailsUrl: "/profile",
          },
          {
            id: "3",
            type: "assessment",
            title: "Heart Disease Risk Assessment",
            description: "Completed on April 20, 2025",
            date: "2025-04-20",
            risk: "moderate",
            detailsUrl: "/predict/results/3",
          },
        ]

        setActivities(mockActivities)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching recent activity:", error)
        setLoading(false)
      }
    }

    fetchRecentActivity()
  }, [user])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "assessment":
        return <Heart className="h-5 w-5 text-gray-900" />
      case "profile_update":
        return <Activity className="h-5 w-5 text-gray-900" />
      default:
        return <Activity className="h-5 w-5 text-gray-900" />
    }
  }

  const getRiskBadge = (risk?: "low" | "moderate" | "high") => {
    if (!risk) return null

    const colorMap = {
      low: "bg-green-100 text-green-800",
      moderate: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800",
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[risk]}`}>
        {risk.charAt(0).toUpperCase() + risk.slice(1)} Risk
      </span>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        <Link
          href="/history"
          className="text-sm font-medium text-gray-900 flex items-center hover:text-primary transition-colors"
        >
          View all <ArrowUpRight className="ml-1 h-4 w-4" />
        </Link>
      </div>

      <Card className="border border-gray-100 bg-white overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-200">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 flex items-center">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="ml-4 flex-1">
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-8 w-16 ml-4" />
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No recent activity found. Start by creating a new assessment.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-gray-100 rounded-full p-2">{getActivityIcon(activity.type)}</div>
                  <div className="ml-4">
                    <h3 className="text-base font-medium text-gray-900">{activity.title}</h3>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {activity.risk && getRiskBadge(activity.risk)}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-gray-100"
                    onClick={() => router.push(activity.detailsUrl || "#")}
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
