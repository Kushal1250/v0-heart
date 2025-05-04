"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface GetStartedButtonProps {
  className?: string
}

export function GetStartedButton({ className = "" }: GetStartedButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = () => {
    console.log("Get Started button clicked")
    setIsLoading(true)

    // Add a small timeout to show loading state
    setTimeout(() => {
      try {
        router.push("/predict")
      } catch (error) {
        console.error("Navigation error:", error)
        // Fallback to traditional navigation
        window.location.href = "/predict"
      }
    }, 100)
  }

  return (
    <Button
      size="lg"
      onClick={handleClick}
      disabled={isLoading}
      className={`bg-blue-500 hover:bg-blue-600 text-white px-8 ${className}`}
    >
      {isLoading ? "Loading..." : "Get Started"}
      {!isLoading && <span className="ml-2">→</span>}
    </Button>
  )
}
