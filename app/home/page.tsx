"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Activity, BarChart2, History, Calendar, User, Settings } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?redirect=/home")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome, {user.name || "User"}!</h1>
        <p className="text-gray-600 mt-2">Your heart health dashboard is ready. Here's what you can do today:</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-800">Take a Heart Assessment</CardTitle>
            <CardDescription className="text-blue-600">
              Check your heart disease risk with our AI-powered prediction tool
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/predict">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Start Assessment <Heart className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-800">View Assessment History</CardTitle>
            <CardDescription className="text-green-600">Track your heart health progress over time</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/history">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                View History <History className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-purple-800">Manage Your Profile</CardTitle>
            <CardDescription className="text-purple-600">
              Update your personal information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/profile">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Edit Profile <User className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-red-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">Last assessment:</span>
                </div>
                <Link href="/history" className="text-sm text-blue-600 hover:underline">
                  View all assessments
                </Link>
              </div>

              <div className="text-center py-6">
                <Link href="/history">
                  <Button variant="outline" className="w-full">
                    Go to History <History className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart2 className="h-5 w-5 mr-2 text-blue-500" />
              Health Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center">
                  <Heart className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">Heart health overview:</span>
                </div>
                <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
                  View dashboard
                </Link>
              </div>

              <div className="text-center py-6">
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full">
                    Go to Dashboard <BarChart2 className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-8">
        <p className="text-gray-500 text-sm mb-4">Need to adjust your account settings?</p>
        <Link href="/settings">
          <Button variant="outline" className="flex items-center mx-auto">
            <Settings className="mr-2 h-4 w-4" /> Account Settings
          </Button>
        </Link>
      </div>
    </div>
  )
}
