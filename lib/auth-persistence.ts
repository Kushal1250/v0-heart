"use client"

// This file helps maintain authentication state across page refreshes

export function persistAuthState() {
  // Check if we're in a browser environment
  if (typeof window === "undefined") return

  // Set up an interval to refresh the auth token
  const intervalId = setInterval(
    () => {
      try {
        // Send a request to keep the session alive
        fetch("/api/auth/user", {
          method: "GET",
          credentials: "include",
          headers: {
            "Cache-Control": "no-cache",
          },
        })
          .then((response) => {
            if (!response.ok) {
              console.log("Session refresh failed, may need to re-login")
            } else {
              console.log("Session refreshed successfully")
            }
          })
          .catch((error) => {
            console.error("Error refreshing session:", error)
          })
      } catch (error) {
        console.error("Error in auth persistence interval:", error)
      }
    },
    10 * 60 * 1000,
  ) // Refresh every 10 minutes

  // Clean up the interval when the component unmounts
  return () => clearInterval(intervalId)
}

export function setupAuthPersistence() {
  // Check if we're in a browser environment
  if (typeof window === "undefined") return

  // Set up event listeners for page visibility changes
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      // When the page becomes visible again, check auth status
      fetch("/api/auth/user", {
        method: "GET",
        credentials: "include",
        headers: {
          "Cache-Control": "no-cache",
        },
      })
        .then((response) => {
          if (!response.ok) {
            console.log("Session may have expired while away")
          }
        })
        .catch((error) => {
          console.error("Error checking session on visibility change:", error)
        })
    }
  })

  // Return the cleanup function
  return () => {
    document.removeEventListener("visibilitychange", () => {})
  }
}

export function getStoredAuthData() {
  // Check if we're in a browser environment
  if (typeof window === "undefined") return null

  try {
    const userData = localStorage.getItem("user")
    if (!userData) return null

    return JSON.parse(userData)
  } catch (error) {
    console.error("Error getting stored auth data:", error)
    return null
  }
}
