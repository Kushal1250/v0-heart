"use client"

import { useEffect } from "react"
import { refreshSessionExpiry, isSessionValid } from "@/lib/auth-persistence"
import { useAuth } from "@/lib/auth-context"

/**
 * This component helps maintain the user's session by refreshing
 * the session expiry time when the user is active on the site.
 */
export function SessionKeeper() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    // Refresh session expiry on initial load if session is valid
    if (isSessionValid()) {
      refreshSessionExpiry()
    }

    // Set up event listeners to refresh session on user activity
    const refreshOnActivity = () => {
      if (user && isSessionValid()) {
        refreshSessionExpiry()
      }
    }

    // Add event listeners for user activity
    window.addEventListener("click", refreshOnActivity)
    window.addEventListener("keypress", refreshOnActivity)
    window.addEventListener("scroll", refreshOnActivity)
    window.addEventListener("mousemove", refreshOnActivity)

    // Set up periodic check (every 5 minutes)
    const intervalId = setInterval(
      () => {
        if (user && isSessionValid()) {
          refreshSessionExpiry()
        }
      },
      5 * 60 * 1000,
    ) // 5 minutes

    // Clean up event listeners and interval on unmount
    return () => {
      window.removeEventListener("click", refreshOnActivity)
      window.removeEventListener("keypress", refreshOnActivity)
      window.removeEventListener("scroll", refreshOnActivity)
      window.removeEventListener("mousemove", refreshOnActivity)
      clearInterval(intervalId)
    }
  }, [user])

  // This component doesn't render anything
  return null
}
