"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleGetStarted = () => {
    setIsLoading(true)
    // Add a small delay to show loading state
    setTimeout(() => {
      router.push("/predict")
    }, 100)
  }

  const handleLearnMore = () => {
    router.push("/how-it-works")
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            <span className="text-slate-900">Predict Your </span>
            <span className="text-blue-500">Heart Disease Risk</span>
          </h1>

          <p className="mt-6 text-lg text-slate-700">
            Our advanced AI-powered platform helps you assess your heart health and take preventive measures before it's
            too late.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button
              size="lg"
              onClick={handleGetStarted}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8"
            >
              {isLoading ? "Loading..." : "Get Started"}
              {!isLoading && <span className="ml-2">→</span>}
            </Button>

            <Button size="lg" variant="outline" onClick={handleLearnMore} className="border-slate-300">
              Learn More
            </Button>
          </div>
        </div>

        <div className="relative">
          <Card className="overflow-hidden shadow-xl rounded-xl">
            <Image
              src="/heart-health-dashboard.png"
              alt="Heart Health Dashboard"
              width={600}
              height={400}
              className="w-full h-auto"
              priority
            />
          </Card>
        </div>
      </div>

      <div className="mt-24 text-center">
        <h2 className="text-3xl font-bold">Key Features</h2>
        <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">
          Our platform offers a comprehensive set of tools to help you monitor and improve your heart health.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <FeatureCard
            icon="heart"
            title="Risk Prediction"
            description="Advanced algorithms analyze your health data to predict potential heart disease risks with high accuracy."
          />

          <FeatureCard
            icon="activity"
            title="Health Monitoring"
            description="Track your vital statistics over time and receive personalized insights about your heart health."
          />

          <FeatureCard
            icon="bar-chart"
            title="Data Visualization"
            description="Intuitive charts and graphs help you understand your health data and track improvements over time."
          />
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-6 rounded-lg bg-white shadow-md">
      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
        {icon === "heart" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-500"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        )}
        {icon === "activity" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-500"
          >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        )}
        {icon === "bar-chart" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-500"
          >
            <line x1="12" x2="12" y1="20" y2="10" />
            <line x1="18" x2="18" y1="20" y2="4" />
            <line x1="6" x2="6" y1="20" y2="16" />
          </svg>
        )}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  )
}
