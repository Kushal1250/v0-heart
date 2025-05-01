"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function HistoryFixButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const fixHistory = async () => {
    setStatus("loading")
    setMessage("Fixing history...")

    try {
      // Step 1: Get the correct email
      const userEmail =
        localStorage.getItem("currentUserEmail") ||
        localStorage.getItem("heart_current_user_email") ||
        "user@example.com"

      // Step 2: Check for existing assessment data
      const predictionResult = localStorage.getItem("predictionResult")

      // Step 3: Fix the email in localStorage
      localStorage.setItem("currentUserEmail", userEmail)
      localStorage.setItem("heart_current_user_email", userEmail)

      // Step 4: Check for existing history under different keys
      const historyKeys = [
        `assessmentHistory_${userEmail}`,
        `heart_assessment_history_${userEmail}`,
        `heart_assessment_history_${userEmail.toLowerCase()}`,
      ]

      let historyItems: any[] = []

      historyKeys.forEach((key) => {
        const data = localStorage.getItem(key)
        if (data) {
          try {
            const parsed = JSON.parse(data)
            if (Array.isArray(parsed)) {
              historyItems = [...historyItems, ...parsed]
            }
          } catch (e) {
            console.error(`Error parsing data from ${key}:`, e)
          }
        }
      })

      // Remove duplicates by ID if present
      const uniqueItems = historyItems.filter((item, index, self) => index === self.findIndex((t) => t.id === item.id))

      // Step 5: If we have a prediction result but no history, add it to history
      if (uniqueItems.length === 0 && predictionResult) {
        try {
          const assessment = JSON.parse(predictionResult)

          // Add ID and timestamp if missing
          if (!assessment.id) {
            assessment.id = Math.random().toString(36).substring(2, 15)
          }
          if (!assessment.timestamp) {
            assessment.timestamp = Date.now()
          }

          uniqueItems.push(assessment)
        } catch (e) {
          console.error("Error parsing prediction result:", e)
        }
      }

      // Step 6: Save consolidated history to all keys
      if (uniqueItems.length > 0) {
        historyKeys.forEach((key) => {
          localStorage.setItem(key, JSON.stringify(uniqueItems))
        })
      }

      setStatus("success")
      setMessage("History fixed successfully! Please refresh the page to see your history.")

      // Force reload the page after a short delay
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      setStatus("error")
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <div className="mt-4">
      {status === "success" && (
        <Alert className="mb-4">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {status === "error" && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Button onClick={fixHistory} disabled={status === "loading"} className="w-full">
        {status === "loading" ? "Fixing..." : "Fix My History"}
      </Button>
    </div>
  )
}
