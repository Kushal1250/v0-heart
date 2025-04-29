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
        const response = await fetch("/api/user/recent-activity")

        if (!response.ok) {
          throw new Error("Failed to fetch recent activity")
        }

        const data = await response.json()
        setActivities(data.activities)
      } catch (error) {
        console.error("Error fetching recent activity:", error)
      } finally {
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

  const handleViewDetails = (activity: ActivityItem) => {
    if (activity.detailsUrl) {
      router.push(activity.detailsUrl)
    } else if (activity.type === "assessment") {
      router.push(`/predict/results/${activity.id}`)
    } else if (activity.type === "profile_update") {
      router.push("/profile")
    }
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
              <div key={activity.id} className="p-6 flex items-center hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 bg-gray-100 rounded-full p-2">{getActivityIcon(activity.type)}</div>
                <div className="ml-4 flex-1">
                  <h3 className="text-sm font-medium text-gray-900">{activity.title}</h3>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                </div>
                {activity.risk && <div className="ml-4">{getRiskBadge(activity.risk)}</div>}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-4 hover:bg-gray-100"
                  onClick={() => handleViewDetails(activity)}
                >
                  View
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
