"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, ChevronRight, ArrowUpRight, X, CheckCircle, FileText, History } from "lucide-react"

export default function UserDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [showLoginSuccess, setShowLoginSuccess] = useState(false)

  useEffect(() => {
    // If not authenticated and not loading, redirect to login
    if (!user && !isLoading) {
      router.push("/login")
    }

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
  }, [user, isLoading, router])

  const dismissLoginSuccess = () => {
    setShowLoginSuccess(false)
    sessionStorage.removeItem("loginSuccess")
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
          <p className="mt-4 text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Custom navbar for this page */}
      <header className="bg-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-red-500 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              <span className="font-bold text-xl text-gray-900">HeartPredict</span>
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-red-600 hover:text-red-800">
              Home
            </Link>
            <Link href="/predict" className="text-gray-900 hover:text-gray-700">
              Predict
            </Link>
            <Link href="/history" className="text-gray-900 hover:text-gray-700">
              History
            </Link>
            <Link href="/about" className="text-gray-900 hover:text-gray-700">
              About
            </Link>
            <Link href="/settings" className="text-gray-900 hover:text-gray-700">
              Settings
            </Link>
          </nav>

          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center">
              {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Login success notification */}
      {showLoginSuccess && (
        <div className="fixed top-20 right-4 z-50 max-w-md">
          <Alert className="bg-green-600 text-white animate-slide-in-right">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                <AlertDescription>Login Successful!</AlertDescription>
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
          <h1 className="text-2xl font-bold text-white">Welcome, {user.name || "User"}!</h1>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Predict Your Heart Disease Risk</h2>
        </div>

        {/* Quick actions */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/predict" className="block">
              <Card className="p-6 hover:bg-gray-800 transition-colors duration-200 border border-gray-800 bg-gray-900">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-gray-800 rounded-lg p-3">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-white">New Prediction</h3>
                    <p className="text-sm text-gray-400">Assess your heart health</p>
                  </div>
                  <ChevronRight className="ml-auto h-5 w-5 text-gray-400" />
                </div>
              </Card>
            </Link>

            <Link href="/history" className="block">
              <Card className="p-6 hover:bg-gray-800 transition-colors duration-200 border border-gray-800 bg-gray-900">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-gray-800 rounded-lg p-3">
                    <History className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-white">View History</h3>
                    <p className="text-sm text-gray-400">See past predictions</p>
                  </div>
                  <ChevronRight className="ml-auto h-5 w-5 text-gray-400" />
                </div>
              </Card>
            </Link>

            <Link href="/profile" className="block">
              <Card className="p-6 hover:bg-gray-800 transition-colors duration-200 border border-gray-800 bg-gray-900">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-gray-800 rounded-lg p-3">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-white">My Profile</h3>
                    <p className="text-sm text-gray-400">Update your information</p>
                  </div>
                  <ChevronRight className="ml-auto h-5 w-5 text-gray-400" />
                </div>
              </Card>
            </Link>
          </div>
        </div>

        {/* Recent Predictions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-white">Recent Predictions</h2>
            <Link
              href="/history"
              className="text-sm font-medium text-white flex items-center hover:text-blue-400 transition-colors"
            >
              View all <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <Card className="border border-gray-800 bg-gray-900 overflow-hidden">
            <div className="divide-y divide-gray-800">
              <div className="p-6 flex items-center">
                <div className="flex-shrink-0 bg-gray-800 rounded-full p-2">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-sm font-medium text-white">Heart Disease Risk Assessment</h3>
                  <p className="text-sm text-gray-400">Completed on April 26, 2025</p>
                </div>
                <div className="ml-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-300">
                    Low Risk
                  </span>
                </div>
                <Button variant="ghost" size="sm" className="ml-4 text-white hover:bg-gray-700">
                  View
                </Button>
              </div>

              <div className="p-6 flex items-center">
                <div className="flex-shrink-0 bg-gray-800 rounded-full p-2">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-sm font-medium text-white">Heart Disease Risk Assessment</h3>
                  <p className="text-sm text-gray-400">Completed on April 20, 2025</p>
                </div>
                <div className="ml-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900 text-yellow-300">
                    Moderate Risk
                  </span>
                </div>
                <Button variant="ghost" size="sm" className="ml-4 text-white hover:bg-gray-700">
                  View
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-500 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
                <span className="font-bold text-lg">HeartCare</span>
              </div>
              <p className="mt-2 text-sm text-gray-400">Monitoring heart health with precision and care.</p>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">PRODUCT</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    Testimonials
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">COMPANY</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    Our Team
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">CONTACT</h3>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center text-gray-400 text-sm">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  heartguide108@gmail.com
                </li>
                <li className="flex items-center text-gray-400 text-sm">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  +91 (901) 626-1380
                </li>
                <li className="mt-3">
                  <a href="#" className="text-green-400 hover:text-green-300 text-sm flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    WhatsApp Support
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
