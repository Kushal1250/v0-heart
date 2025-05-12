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

    // Add event listeners for user activity - throttled to prevent excessive calls
    let lastRefresh = Date.now()
    const throttledRefresh = () => {
      const now = Date.now()
      if (now - lastRefresh > 60000) {
        // Only refresh once per minute at most
        lastRefresh = now
        refreshOnActivity()
      }
    }

    window.addEventListener("click", throttledRefresh)
    window.addEventListener("keypress", throttledRefresh)
    window.addEventListener("scroll", throttledRefresh)
    window.addEventListener("mousemove", throttledRefresh)

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
      window.removeEventListener("click", throttledRefresh)
      window.removeEventListener("keypress", throttledRefresh)
      window.removeEventListener("scroll", throttledRefresh)
      window.removeEventListener("mousemove", throttledRefresh)
      clearInterval(intervalId)
    }
  }, [user]) // Only depend on user

  // This component doesn't render anything
  return null
}
