"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function SessionStabilizer() {
  const router = useRouter()
  const [isStabilizing, setIsStabilizing] = useState(true)

  useEffect(() => {
    // Check if we have a session
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/user", {
          credentials: "include",
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        if (!response.ok) {
          // If no valid session, redirect once to login
          router.replace("/admin-login")
          return
        }

        setIsStabilizing(false)
      } catch (error) {
        console.error("Session check error:", error)
        setIsStabilizing(false)
      }
    }

    checkSession()

    // Cleanup
    return () => {
      setIsStabilizing(false)
    }
  }, [router])

  // Return null - this component just handles the session check
  return null
}
