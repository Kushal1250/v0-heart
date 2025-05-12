"use client"

import { useEffect } from "react"

export function SessionRefresh() {
  useEffect(() => {
    const refreshSession = async () => {
      try {
        await fetch("/api/auth/refresh-session")
      } catch (error) {
        console.error("Failed to refresh session:", error)
      }
    }

    // Refresh session every 15 minutes
    const interval = setInterval(refreshSession, 15 * 60 * 1000)

    // Initial refresh
    refreshSession()

    return () => clearInterval(interval)
  }, [])

  return null
}
