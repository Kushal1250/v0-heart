"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Activity, BarChart2, ArrowRight, Database, Shield, Award, Users } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle } from "lucide-react"

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)
  const router = useRouter()

  // Fetch user data and handle authentication
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/user", {
          credentials: "include",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        })

        if (response.ok) {
          const userData = await response.json()
          setUser(userData)

          // Check if this is a redirect from login
          const loginSuccess = sessionStorage.getItem("loginSuccess")
          if (loginSuccess === "true") {
            setShowWelcome(true)
            // Clear the flag
            sessionStorage.removeItem("loginSuccess")

            // Hide welcome message after 5 seconds
            const timer = setTimeout(() => {
              setShowWelcome(false)
            }, 5000)

            return () => clearTimeout(timer)
          }
        } else {
          // If not authenticated, redirect to login
          router.push("/login")
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        // On error, redirect to login
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-900 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If no user data, return null (will redirect in useEffect)
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showWelcome && (
        <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-md animate-fade-in flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>Login successful! Welcome to HeartPredict.</span>
          </div>
          <button onClick={() => setShowWelcome(false)} className="text-green-700 hover:text-green-900">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome, {user?.name || "User"}!</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your heart health journey begins here. Use our tools to monitor and improve your heart health.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Heart Disease Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Get a personalized assessment of your heart disease risk based on your health data.
              </p>
              <Link href="/predict">
                <Button className="w-full">
                  Start Assessment <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Health Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Track your vital statistics over time and receive personalized insights about your heart health.
              </p>
              <Link href="/history">
                <Button className="w-full">
                  View History <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Data Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Intuitive charts and graphs help you understand your health data and track improvements over time.
              </p>
              <Link href="/dashboard">
                <Button className="w-full">
                  View Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <p className="text-gray-600">
            You haven't performed any assessments yet. Start by taking your first heart health assessment.
          </p>
          <div className="mt-4">
            <Link href="/predict">
              <Button>Take Assessment</Button>
            </Link>
          </div>
        </div>

        {/* Project Information Section */}
        <div className="mt-16 mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">About HeartPredict</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Our Mission</h3>
              <p className="text-gray-600 mb-4">
                HeartPredict is dedicated to revolutionizing heart disease prevention through accessible AI-powered risk
                assessment tools. Our mission is to empower individuals to take control of their heart health through
                early detection and personalized insights.
              </p>
              <p className="text-gray-600">
                By combining advanced machine learning algorithms with medical expertise, we aim to reduce the global
                burden of cardiovascular disease and save lives through preventive healthcare.
              </p>
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg">
              <Image
                src="/heart-health-dashboard.png"
                alt="Heart Health Dashboard"
                width={600}
                height={400}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>

        {/* Technology Section */}
        <div className="bg-gray-50 py-12 px-6 rounded-xl mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Our Technology</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Database className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Data-Driven</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Trained on comprehensive datasets from real heart disease cases to ensure high accuracy and
                  reliability.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Privacy-Focused</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Your health data is encrypted and protected. We adhere to strict privacy standards and regulations.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Clinically Validated</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our prediction models have been validated through rigorous testing and clinical evaluations.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-amber-600" />
                </div>
                <CardTitle className="text-xl">Expert-Backed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Developed in collaboration with cardiologists and healthcare professionals for medical accuracy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">HeartPredict Impact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl font-bold text-primary mb-2">95%</div>
              <p className="text-gray-600">Prediction Accuracy</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
              <p className="text-gray-600">Users Assessed</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl font-bold text-primary mb-2">15+</div>
              <p className="text-gray-600">Risk Factors Analyzed</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <p className="text-gray-600">Accessible Anywhere</p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-gray-900 text-white py-16 px-6 rounded-xl mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Input Your Data</h3>
              <p className="text-gray-300">Provide your health metrics through our simple and secure form.</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Advanced Analysis</h3>
              <p className="text-gray-300">
                Our model analyzes your data using patterns learned from thousands of cases.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Get Your Results</h3>
              <p className="text-gray-300">
                Receive an instant assessment of your heart disease risk with personalized insights.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Take Control of Your Heart Health?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Start your heart health journey today with a comprehensive risk assessment.
          </p>
          <Link href="/predict">
            <Button size="lg" className="px-8 py-6 text-lg">
              Start Your Assessment
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
