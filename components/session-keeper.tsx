"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"

/**
 * This component helps maintain the user's session by refreshing
 * the session expiry time when the user is active on the site.
 */
export function SessionKeeper() {
  const { user } = useAuth()

  useEffect(() => {
    const refreshToken = async () => {
      try {
        // Your existing token refresh logic
        const response = await fetch("/api/auth/refresh-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })

        // Only process if the response is ok
        if (response.ok) {
          const data = await response.json()
          // Process data safely
        }
      } catch (error) {
        console.error("Session refresh error:", error)
        // Don't throw, just log and continue
      }
    }

    // Existing interval setup code
    const interval = setInterval(
      () => {
        refreshToken()
      },
      14 * 60 * 1000,
    ) // 14 minutes

    return () => clearInterval(interval)
  }, [])

  return null
}
