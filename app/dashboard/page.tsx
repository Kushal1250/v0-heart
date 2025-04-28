"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Heart,
  Activity,
  Clock,
  Settings,
  ChevronRight,
  ArrowUpRight,
  X,
  CheckCircle,
  Bell,
  Lightbulb,
  Apple,
  HeartPulse,
  Dumbbell,
  Moon,
  ArrowRight,
} from "lucide-react"
import { HealthMetricsOverview } from "@/components/health-metrics-overview"

export default function Dashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [greeting, setGreeting] = useState("")
  const [currentTime, setCurrentTime] = useState("")
  const [showLoginSuccess, setShowLoginSuccess] = useState(false)
  const [healthTipIndex, setHealthTipIndex] = useState(0)

  // Health tips array
  const healthTips = [
    {
      title: "Eat Heart-Healthy Foods",
      description: "Include plenty of fruits, vegetables, whole grains, and lean proteins in your diet.",
      icon: <Apple className="h-6 w-6 text-green-600" />,
    },
    {
      title: "Monitor Your Blood Pressure",
      description: "Regular blood pressure checks can help detect issues early.",
      icon: <HeartPulse className="h-6 w-6 text-red-600" />,
    },
    {
      title: "Stay Active Daily",
      description: "Aim for at least 30 minutes of moderate exercise most days of the week.",
      icon: <Dumbbell className="h-6 w-6 text-blue-600" />,
    },
    {
      title: "Get Enough Sleep",
      description: "Quality sleep is essential for heart health. Aim for 7-8 hours nightly.",
      icon: <Moon className="h-6 w-6 text-purple-600" />,
    },
  ]

  useEffect(() => {
    // If not authenticated and not loading, redirect to login
    if (!user && !isLoading) {
      router.push("/login")
    }

    // Set greeting based on time of day
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good morning")
    else if (hour < 18) setGreeting("Good afternoon")
    else setGreeting("Good evening")

    // Format current time
    const formatTime = () => {
      const now = new Date()
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
      setCurrentTime(now.toLocaleDateString(undefined, options))
    }

    formatTime()
    const timer = setInterval(formatTime, 60000)

    // Check for login success message
    const loginSuccess = sessionStorage.getItem("loginSuccess")
    if (loginSuccess === "true") {
      setShowLoginSuccess(true)
      // Clear the flag after showing the message
      setTimeout(() => {
        sessionStorage.removeItem("loginSuccess")
        setShowLoginSuccess(false)
      }, 5000)
    }

    // Rotate health tips every 10 seconds
    const tipTimer = setInterval(() => {
      setHealthTipIndex((prevIndex) => (prevIndex + 1) % healthTips.length)
    }, 10000)

    return () => {
      clearInterval(timer)
      clearInterval(tipTimer)
    }
  }, [user, isLoading, router, healthTips.length])

  const dismissLoginSuccess = () => {
    setShowLoginSuccess(false)
    sessionStorage.removeItem("loginSuccess")
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-900 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Login success notification */}
      {showLoginSuccess && (
        <div className="fixed top-20 right-4 z-50 max-w-md">
          <Alert className="bg-green-600 text-white animate-slide-in-right">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                <AlertDescription>
                  You have successfully logged in. Your personalized dashboard is ready to assist you with your heart
                  health assessments and predictions.
                </AlertDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={dismissLoginSuccess}
                className="text-white hover:bg-green-700 p-1 h-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Alert>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, {user.name || "User"}!
          </h1>
          <p className="text-gray-500">{currentTime}</p>
        </div>

        {/* Health Tip of the Day */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
            Health Tip of the Day
          </h2>
          <Card className="p-6 border border-yellow-100 bg-yellow-50 overflow-hidden">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-white rounded-full p-3 shadow-sm">{healthTips[healthTipIndex].icon}</div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900">{healthTips[healthTipIndex].title}</h3>
                <p className="text-sm text-gray-700 mt-1">{healthTips[healthTipIndex].description}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick actions */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/predict" className="block">
              <Card className="p-6 hover:shadow-md transition-shadow duration-200 border border-gray-100 bg-white hover:scale-[1.02] transition-transform">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary/10 rounded-lg p-3">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Create New Assessment</h3>
                    <p className="text-sm text-gray-500">Assess your heart health</p>
                  </div>
                  <ChevronRight className="ml-auto h-5 w-5 text-gray-400" />
                </div>
              </Card>
            </Link>

            <Link href="/history" className="block">
              <Card className="p-6 hover:shadow-md transition-shadow duration-200 border border-gray-100 bg-white hover:scale-[1.02] transition-transform">
                <div className="flex-shrink-0 bg-gray-100 rounded-lg p-3">
                  <Clock className="h-6 w-6 text-gray-900" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Review Past Assessments</h3>
                  <p className="text-sm text-gray-500">View your assessment history</p>
                </div>
              </Card>
            </Link>

            <Link href="/settings" className="block">
              <Card className="p-6 hover:shadow-md transition-shadow duration-200 border border-gray-100 bg-white hover:scale-[1.02] transition-transform">
                <div className="flex-shrink-0 bg-gray-100 rounded-lg p-3">
                  <Settings className="h-6 w-6 text-gray-900" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Settings</h3>
                  <p className="text-sm text-gray-500">Manage your preferences</p>
                </div>
              </Card>
            </Link>
          </div>
        </div>

        <div className="mb-8">
          <Card className="p-6 border-l-4 border-l-primary bg-primary/5">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Next Steps</h3>
            <p className="text-gray-700 mb-4">Click below to create a new health assessment.</p>
            <Button onClick={() => router.push("/predict")} className="bg-primary hover:bg-primary/90">
              Create New Assessment <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>
        </div>

        {/* Health Overview */}
        <HealthMetricsOverview />

        {/* Recent activity */}
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
            <div className="divide-y divide-gray-200">
              <div className="p-6 flex items-center hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 bg-gray-100 rounded-full p-2">
                  <Heart className="h-5 w-5 text-gray-900" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-sm font-medium text-gray-900">Heart Disease Risk Assessment</h3>
                  <p className="text-sm text-gray-500">Completed on April 26, 2025</p>
                </div>
                <div className="ml-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Low Risk
                  </span>
                </div>
                <Button variant="ghost" size="sm" className="ml-4 hover:bg-gray-100">
                  View
                </Button>
              </div>

              <div className="p-6 flex items-center hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 bg-gray-100 rounded-full p-2">
                  <Activity className="h-5 w-5 text-gray-900" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-sm font-medium text-gray-900">Profile Updated</h3>
                  <p className="text-sm text-gray-500">Updated personal information on April 24, 2025</p>
                </div>
                <Button variant="ghost" size="sm" className="ml-4 hover:bg-gray-100">
                  View
                </Button>
              </div>

              <div className="p-6 flex items-center hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 bg-gray-100 rounded-full p-2">
                  <Heart className="h-5 w-5 text-gray-900" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-sm font-medium text-gray-900">Heart Disease Risk Assessment</h3>
                  <p className="text-sm text-gray-500">Completed on April 20, 2025</p>
                </div>
                <div className="ml-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Moderate Risk
                  </span>
                </div>
                <Button variant="ghost" size="sm" className="ml-4 hover:bg-gray-100">
                  View
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* New Feature Notification */}
        <div className="mt-8">
          <Card className="p-6 border border-blue-200 bg-blue-50">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-blue-900">New Features Available!</h3>
                <p className="text-sm text-blue-700 mt-1">
                  We've added new prediction models and improved accuracy. Try them out and let us know what you think!
                </p>
                <div className="mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    Learn More
                  </Button>
                  <Button variant="ghost" size="sm" className="ml-2 text-blue-700 hover:bg-blue-100">
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
