"use client"

import { useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"

export function SessionKeeper() {
  const { refreshSession } = useAuth()
  const refreshAttempted = useRef(false)

  useEffect(() => {
    // Add event listeners for visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !refreshAttempted.current) {
        refreshAttempted.current = true
        // Refresh the session when the page becomes visible
        refreshSession()
          .catch(() => {
            // Silently handle refresh errors
          })
          .finally(() => {
            // Reset the flag after a delay
            setTimeout(() => {
              refreshAttempted.current = false
            }, 60000) // Only try once per minute
          })
      }
    }

    // Add event listeners for online/offline status
    const handleOnline = () => {
      if (!refreshAttempted.current) {
        refreshAttempted.current = true
        // Refresh the session when the device comes online
        refreshSession()
          .catch(() => {
            // Silently handle refresh errors
          })
          .finally(() => {
            // Reset the flag after a delay
            setTimeout(() => {
              refreshAttempted.current = false
            }, 60000) // Only try once per minute
          })
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("online", handleOnline)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.addEventListener("online", handleOnline)
    }
  }, [refreshSession])

  // This component doesn't render anything
  return null
}
