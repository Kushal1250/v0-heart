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
        try {
          refreshSessionExpiry()
        } catch (error) {
          console.error("Error refreshing session:", error)
          // Continue execution even if refresh fails
        }
      }
    }

    // Add event listeners for user activity with passive option for better performance
    window.addEventListener("click", refreshOnActivity, { passive: true })
    window.addEventListener("keypress", refreshOnActivity, { passive: true })
    window.addEventListener("scroll", refreshOnActivity, { passive: true })
    window.addEventListener("mousemove", refreshOnActivity, { passive: true })

    // Set up periodic check (every 5 minutes)
    const intervalId = setInterval(
      () => {
        if (user && isSessionValid()) {
          try {
            refreshSessionExpiry()
          } catch (error) {
            console.error("Error in periodic session refresh:", error)
          }
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
