"use client"

import { useEffect } from "react"
import { setupGlobalErrorHandlers } from "@/lib/error-handler"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, Activity, BarChart2, Shield, Users, ArrowRight } from "lucide-react"

export default function HomePage() {
  useEffect(() => {
    setupGlobalErrorHandlers()
  }, [])

  return (
    <div className="min-h-screen bg-background relative">
      <div className="home-bg-animation">
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
      </div>
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slide-up">
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
                Predict Your <span className="text-primary">Heart Disease</span> Risk
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl">
                Our advanced AI-powered platform helps you assess your heart health and take preventive measures before
                it's too late.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white btn-hover-effect nav-link">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline" className="btn-hover-effect nav-link">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-lg blur opacity-30 animate-pulse"></div>
              <div className="relative bg-white p-6 rounded-lg shadow-xl">
                <div className="aspect-video rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img
                    src="/heart-health-dashboard.png"
                    alt="Heart Health Dashboard"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-3xl font-bold text-foreground">Key Features</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform offers a comprehensive set of tools to help you monitor and improve your heart health.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 card-hover animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Risk Prediction</h3>
              <p className="text-gray-600">
                Advanced algorithms analyze your health data to predict potential heart disease risks with high
                accuracy.
              </p>
            </div>

            {/* Feature 2 */}
            <div
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 card-hover animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Health Monitoring</h3>
              <p className="text-gray-600">
                Track your vital statistics over time and receive personalized insights about your heart health.
              </p>
            </div>

            {/* Feature 3 */}
            <div
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 card-hover animate-slide-up"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Data Visualization</h3>
              <p className="text-gray-600">
                Intuitive charts and graphs help you understand your health data and track improvements over time.
              </p>
            </div>

            {/* Feature 4 */}
            <div
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 card-hover animate-slide-up"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Secure & Private</h3>
              <p className="text-gray-600">
                Your health data is encrypted and securely stored, ensuring your privacy is always protected.
              </p>
            </div>

            {/* Feature 5 */}
            <div
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 card-hover animate-slide-up"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Expert Support</h3>
              <p className="text-gray-600">
                Connect with healthcare professionals who can provide guidance based on your prediction results.
              </p>
            </div>

            {/* Feature 6 */}
            <div
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 card-hover animate-slide-up"
              style={{ animationDelay: "0.6s" }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <ArrowRight className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Actionable Insights</h3>
              <p className="text-gray-600">
                Receive personalized recommendations to improve your heart health based on your unique profile.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary/5">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-slide-up">
            <h2 className="text-3xl font-bold text-foreground mb-6">Ready to Take Control of Your Heart Health?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Join thousands of users who have already taken the first step towards a healthier heart.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white btn-hover-effect">
                  Create Free Account
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="btn-hover-effect">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
