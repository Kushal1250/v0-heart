"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function PersistentSessionHandler() {
  const [status, setStatus] = useState<"checking" | "valid" | "expired">("checking")
  const [message, setMessage] = useState("Checking session status...")
  const router = useRouter()

  // Function to refresh the session
  const refreshSession = async () => {
    try {
      const response = await fetch("/api/auth/refresh-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for cookies
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setStatus("valid")
          setMessage("Session refreshed successfully")
          return true
        }
      }

      return false
    } catch (error) {
      console.error("Error refreshing session:", error)
      return false
    }
  }

  // Check session status on component mount and set up periodic checks
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/user", {
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          if (data.user && data.user.role === "admin") {
            setStatus("valid")
            setMessage("Session is valid")
          } else {
            // Try to refresh the session
            const refreshed = await refreshSession()
            if (!refreshed) {
              setStatus("expired")
              setMessage("Session expired. Redirecting to login...")
              setTimeout(() => {
                router.push("/admin-login")
              }, 2000)
            }
          }
        } else {
          // Try to refresh the session
          const refreshed = await refreshSession()
          if (!refreshed) {
            setStatus("expired")
            setMessage("Session expired. Redirecting to login...")
            setTimeout(() => {
              router.push("/admin-login")
            }, 2000)
          }
        }
      } catch (error) {
        console.error("Error checking session:", error)
        setStatus("expired")
        setMessage("Error checking session. Redirecting to login...")
        setTimeout(() => {
          router.push("/admin-login")
        }, 2000)
      }
    }

    // Check immediately on mount
    checkSession()

    // Set up periodic checks (every 5 minutes)
    const intervalId = setInterval(refreshSession, 5 * 60 * 1000)

    // Clean up interval on unmount
    return () => clearInterval(intervalId)
  }, [router])

  // Only show alert if there's an issue
  if (status === "expired") {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Session Status</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    )
  }

  // Show success message briefly when session is refreshed
  if (status === "valid" && message === "Session refreshed successfully") {
    return (
      <Alert variant="default" className="mb-4 bg-green-50 text-green-800 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle>Session Refreshed</AlertTitle>
        <AlertDescription>Your session has been refreshed automatically.</AlertDescription>
      </Alert>
    )
  }

  // Don't show anything during normal operation
  return null
}
