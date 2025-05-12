"use client"

import { useState, useEffect } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"

export function SessionExpiration() {
  const [showWarning, setShowWarning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(5 * 60) // 5 minutes in seconds
  const router = useRouter()

  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout
    let countdownTimer: NodeJS.Timeout

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer)
      clearInterval(countdownTimer)
      setShowWarning(false)
      setTimeLeft(5 * 60)

      // Set timer for 25 minutes of inactivity (30 min session - 5 min warning)
      inactivityTimer = setTimeout(
        () => {
          setShowWarning(true)

          // Start countdown
          countdownTimer = setInterval(() => {
            setTimeLeft((prev) => {
              if (prev <= 1) {
                clearInterval(countdownTimer)
                router.push("/login")
                return 0
              }
              return prev - 1
            })
          }, 1000)
        },
        25 * 60 * 1000,
      )
    }

    // Reset timer on user activity
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"]
    events.forEach((event) => {
      document.addEventListener(event, resetInactivityTimer)
    })

    // Initial setup
    resetInactivityTimer()

    return () => {
      clearTimeout(inactivityTimer)
      clearInterval(countdownTimer)
      events.forEach((event) => {
        document.removeEventListener(event, resetInactivityTimer)
      })
    }
  }, [router])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const extendSession = async () => {
    try {
      await fetch("/api/auth/refresh-session")
      setShowWarning(false)
    } catch (error) {
      console.error("Failed to extend session:", error)
    }
  }

  return (
    <AlertDialog open={showWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Session Expiring Soon</AlertDialogTitle>
          <AlertDialogDescription>
            Your session will expire in {formatTime(timeLeft)}. Would you like to stay logged in?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={extendSession}>Stay Logged In</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
