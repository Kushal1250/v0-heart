"use client"

import { useEffect, useState } from "react"
import { safeClientOperation } from "@/lib/safe-client-utils"

export function SessionKeeper() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Only run session keeping logic on the client side
    setIsMounted(true)

    const refreshSessionExpiry = () => {
      safeClientOperation(() => {
        try {
          const sessionExpiry = Date.now() + 8 * 60 * 60 * 1000 // 8 hours
          localStorage.setItem("sessionExpiry", sessionExpiry.toString())
        } catch (error) {
          console.error("Failed to refresh session expiry:", error)
        }
      })
    }

    const isSessionValid = () => {
      return (
        safeClientOperation(() => {
          try {
            const expiry = localStorage.getItem("sessionExpiry")
            return expiry && Number.parseInt(expiry) > Date.now()
          } catch (error) {
            console.error("Failed to check session validity:", error)
            return false
          }
        }) ?? false
      )
    }

    // Initial session check
    if (isSessionValid()) {
      refreshSessionExpiry()
    }

    // Set up event listeners for user activity
    const refreshOnActivity = () => {
      if (isSessionValid()) {
        refreshSessionExpiry()
      }
    }

    // Add event listeners with error handling
    const addSafeEventListener = (event: string, handler: () => void) => {
      try {
        window.addEventListener(event, handler)
      } catch (error) {
        console.error(`Failed to add ${event} event listener:`, error)
      }
    }

    addSafeEventListener("click", refreshOnActivity)
    addSafeEventListener("keypress", refreshOnActivity)
    addSafeEventListener("scroll", refreshOnActivity)
    addSafeEventListener("mousemove", refreshOnActivity)

    // Set up periodic check (every 5 minutes)
    let intervalId: number | undefined
    try {
      intervalId = window.setInterval(
        () => {
          if (isSessionValid()) {
            refreshSessionExpiry()
          }
        },
        5 * 60 * 1000,
      ) // 5 minutes
    } catch (error) {
      console.error("Failed to set up session refresh interval:", error)
    }

    // Clean up
    return () => {
      try {
        window.removeEventListener("click", refreshOnActivity)
        window.removeEventListener("keypress", refreshOnActivity)
        window.removeEventListener("scroll", refreshOnActivity)
        window.removeEventListener("mousemove", refreshOnActivity)
        if (intervalId) clearInterval(intervalId)
      } catch (error) {
        console.error("Failed to clean up session keeper:", error)
      }
    }
  }, [])

  // Return null during SSR to prevent hydration issues
  if (!isMounted) return null

  // This component doesn't render anything
  return null
}
