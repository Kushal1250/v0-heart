"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"

export function SessionRefresh() {
  const [sessionStatus, setSessionStatus] = useState("active")
  const { toast } = useToast()

  useEffect(() => {
    // Function to refresh the session
    const refreshSession = async () => {
      try {
        const response = await fetch("/api/auth/refresh-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          setSessionStatus("expired")
          toast({
            title: "Session Warning",
            description: "Your session may be expiring soon. Please save your work.",
            variant: "destructive",
          })
          return
        }

        const data = await response.json()
        if (data.success) {
          setSessionStatus("active")
        } else {
          setSessionStatus("warning")
        }
      } catch (error) {
        console.error("Error refreshing session:", error)
        setSessionStatus("error")
      }
    }

    // Refresh the session every 5 minutes
    const intervalId = setInterval(refreshSession, 5 * 60 * 1000)

    // Initial refresh
    refreshSession()

    return () => clearInterval(intervalId)
  }, [toast])

  return null // This component doesn't render anything
}
