"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"

export default function SessionKeeper() {
  const { refreshSession } = useAuth()

  useEffect(() => {
    // Refresh session on initial load
    refreshSession()

    // Set up interval to refresh session every 25 minutes
    const intervalId = setInterval(
      () => {
        refreshSession()
      },
      25 * 60 * 1000,
    ) // 25 minutes

    return () => clearInterval(intervalId)
  }, [refreshSession])

  // This component doesn't render anything
  return null
}
