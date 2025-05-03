"use client"

import { useEffect, useState } from "react"

export function SessionKeeper() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Only run session keeping logic on the client side
    setIsMounted(true)

    // Session refresh logic
    const refreshInterval = setInterval(
      () => {
        try {
          fetch("/api/auth/refresh-session", {
            method: "POST",
            credentials: "include",
          }).catch((err) => {
            console.log("Session refresh error (non-critical):", err)
          })
        } catch (error) {
          console.log("Session keeper error (non-critical):", error)
        }
      },
      5 * 60 * 1000,
    ) // 5 minutes

    return () => clearInterval(refreshInterval)
  }, [])

  // Return null during SSR to prevent hydration issues
  if (!isMounted) return null

  // Return null as this component doesn't render anything
  return null
}
