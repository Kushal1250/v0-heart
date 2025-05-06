"use client"

import { useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function LoadingIndicator() {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Reset loading state when route changes
    setIsLoading(false)
  }, [pathname, searchParams])

  useEffect(() => {
    // Add event listeners for navigation
    const handleStart = () => setIsLoading(true)
    const handleComplete = () => setIsLoading(false)

    window.addEventListener("beforeunload", handleStart)
    window.addEventListener("load", handleComplete)

    return () => {
      window.removeEventListener("beforeunload", handleStart)
      window.removeEventListener("load", handleComplete)
    }
  }, [])

  if (!isLoading) return null

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50">
      <div className="h-full bg-blue-500 animate-pulse"></div>
    </div>
  )
}
