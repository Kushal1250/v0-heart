import Link from "next/link"
import { Heart, Shield, UserPlus, User, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="relative mb-6">
            <div className="absolute -inset-1 bg-red-500/30 rounded-full blur-lg animate-pulse"></div>
            <Heart className="w-20 h-20 text-red-500 relative z-10" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">HeartPredict</h1>
          <p className="text-xl text-gray-300 max-w-3xl mb-10">
            Advanced AI-powered heart disease risk assessment platform for healthcare professionals and individuals
          </p>

          {/* Authentication Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
            {/* Login Card */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 flex flex-col items-center hover:border-red-500/50 transition-all hover:shadow-lg hover:shadow-red-500/10">
              <User className="w-12 h-12 text-gray-300 mb-4" />
              <h2 className="text-xl font-bold mb-2">User Login</h2>
              <p className="text-gray-400 mb-6 text-sm">Access your account to view your heart health assessments</p>
              <Button asChild className="w-full bg-red-600 hover:bg-red-700">
                <Link href="/login">
                  Login <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Signup Card */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 flex flex-col items-center hover:border-red-500/50 transition-all hover:shadow-lg hover:shadow-red-500/10">
              <UserPlus className="w-12 h-12 text-gray-300 mb-4" />
              <h2 className="text-xl font-bold mb-2">New User</h2>
              <p className="text-gray-400 mb-6 text-sm">Create an account to start monitoring your heart health</p>
              <Button asChild variant="outline" className="w-full border-red-500/50 text-red-500 hover:bg-red-950/30">
                <Link href="/signup">
                  Sign Up <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Admin Card */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 flex flex-col items-center hover:border-red-500/50 transition-all hover:shadow-lg hover:shadow-red-500/10">
              <Shield className="w-12 h-12 text-gray-300 mb-4" />
              <h2 className="text-xl font-bold mb-2">Administrator</h2>
              <p className="text-gray-400 mb-6 text-sm">
                Secure access for healthcare professionals and administrators
              </p>
              <Button asChild variant="secondary" className="w-full">
                <Link href="/admin-login">
                  Admin Access <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose HeartPredict?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-800">
              <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Accurate Predictions</h3>
              <p className="text-gray-400">
                Our AI model is trained on extensive clinical data to provide highly accurate risk assessments.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-800">
              <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Detailed Reports</h3>
              <p className="text-gray-400">
                Receive comprehensive reports with actionable insights about your heart health.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-800">
              <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-400">
                Your health data is encrypted and protected with industry-leading security measures.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to take control of your heart health?</h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8">
            Join thousands of users who have already benefited from our advanced heart disease prediction platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-red-600 hover:bg-red-700">
              <Link href="/signup">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
