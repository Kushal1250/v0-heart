import Link from "next/link"
import { Heart, Shield, UserPlus, User, ArrowRight, Activity, Database } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NewLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="relative mb-6">
            <div className="absolute -inset-1 bg-red-500/30 rounded-full blur-lg animate-pulse"></div>
            <Heart className="w-20 h-20 text-red-500 fill-red-500/30 relative z-10" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">HeartPredict</h1>
          <p className="text-xl text-gray-300 max-w-3xl mb-10">
            AI-powered heart disease risk assessment platform that provides accurate predictions based on your health
            data
          </p>

          {/* Authentication Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
            {/* Login Card */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 flex flex-col items-center hover:border-red-500/50 transition-all hover:shadow-lg hover:shadow-red-500/10">
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
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 flex flex-col items-center hover:border-red-500/50 transition-all hover:shadow-lg hover:shadow-red-500/10">
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
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 flex flex-col items-center hover:border-red-500/50 transition-all hover:shadow-lg hover:shadow-red-500/10">
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
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-gradient-to-br from-gray-900/50 to-black border border-gray-800 hover:border-red-500/20 transition-all">
              <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Predictions</h3>
              <p className="text-gray-400">
                Our machine learning model analyzes your health data to provide accurate heart disease risk assessments.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-gradient-to-br from-gray-900/50 to-black border border-gray-800 hover:border-red-500/20 transition-all">
              <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Comprehensive History</h3>
              <p className="text-gray-400">
                Track your heart health over time with detailed historical data and trend analysis.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-gradient-to-br from-gray-900/50 to-black border border-gray-800 hover:border-red-500/20 transition-all">
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

        {/* How It Works Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                step: "1",
                title: "Create Account",
                description: "Sign up for a free account to get started with HeartPredict.",
              },
              {
                step: "2",
                title: "Enter Health Data",
                description: "Input your health metrics through our secure and easy-to-use form.",
              },
              {
                step: "3",
                title: "Get Prediction",
                description: "Our AI model analyzes your data and provides a risk assessment.",
              },
              {
                step: "4",
                title: "Track Progress",
                description: "Monitor your heart health over time and see improvements.",
              },
            ].map((item, index) => (
              <div key={index} className="relative p-6 rounded-lg bg-gray-900/30 border border-gray-800">
                <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2 mt-2">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-24 text-center">
          <div className="bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-xl p-8 md:p-12">
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
    </div>
  )
}
