"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"

export default function FixHistory() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const { user } = useAuth()

  const fixHistory = async () => {
    setStatus("loading")
    setMessage("Fixing history...")
    const logs: string[] = []

    try {
      // Step 1: Get the correct email
      const userEmail = user?.email || localStorage.getItem("currentUserEmail") || ""
      if (!userEmail) {
        logs.push("❌ No user email found")
        throw new Error("No user email found. Please log in again.")
      }
      logs.push(`✅ Found user email: ${userEmail}`)

      // Step 2: Check for existing assessment data
      const predictionResult = localStorage.getItem("predictionResult")
      if (!predictionResult) {
        logs.push("⚠️ No recent prediction result found")
      } else {
        logs.push("✅ Found recent prediction result")
      }

      // Step 3: Fix the email in localStorage
      localStorage.setItem("currentUserEmail", userEmail)
      localStorage.setItem("heart_current_user_email", userEmail)
      logs.push("✅ Updated email in localStorage")

      // Step 4: Check for existing history under different keys
      const possibleKeys = [
        `assessmentHistory_${userEmail}`,
        `heart_assessment_history_${userEmail}`,
        `heart_assessment_history_${userEmail.toLowerCase()}`,
      ]

      let foundHistory = false
      let historyItems: any[] = []

      possibleKeys.forEach((key) => {
        const data = localStorage.getItem(key)
        if (data) {
          try {
            const parsed = JSON.parse(data)
            if (Array.isArray(parsed) && parsed.length > 0) {
              logs.push(`✅ Found history at key: ${key} (${parsed.length} items)`)
              foundHistory = true
              historyItems = [...historyItems, ...parsed]
            }
          } catch (e) {
            logs.push(`❌ Invalid JSON at key: ${key}`)
          }
        }
      })

      // Step 5: Consolidate history under all keys
      if (historyItems.length > 0) {
        // Remove duplicates by ID if present
        const uniqueItems = historyItems.filter(
          (item, index, self) => index === self.findIndex((t) => t.id === item.id),
        )

        logs.push(`✅ Consolidated ${uniqueItems.length} unique history items`)

        // Save to all keys for compatibility
        possibleKeys.forEach((key) => {
          localStorage.setItem(key, JSON.stringify(uniqueItems))
        })

        logs.push("✅ Saved consolidated history to all keys")
      } else if (predictionResult) {
        // If we have a prediction result but no history, add it to history
        try {
          const assessment = JSON.parse(predictionResult)

          // Add ID and timestamp if missing
          if (!assessment.id) {
            assessment.id = Math.random().toString(36).substring(2, 15)
          }
          if (!assessment.timestamp) {
            assessment.timestamp = Date.now()
          }

          // Save to all keys
          possibleKeys.forEach((key) => {
            localStorage.setItem(key, JSON.stringify([assessment]))
          })

          logs.push("✅ Added recent assessment to history")
        } catch (e) {
          logs.push(`❌ Failed to parse prediction result: ${e instanceof Error ? e.message : String(e)}`)
        }
      }

      // Step 6: Fix the simplified history system
      const simplifiedKey = `assessmentHistory_${userEmail}`
      const existingData = localStorage.getItem(simplifiedKey)

      if (!existingData || existingData === "[]") {
        // Try to get data from other keys
        const otherKey = `heart_assessment_history_${userEmail.toLowerCase()}`
        const otherData = localStorage.getItem(otherKey)

        if (otherData && otherData !== "[]") {
          localStorage.setItem(simplifiedKey, otherData)
          logs.push(`✅ Copied history from ${otherKey} to ${simplifiedKey}`)
        } else if (predictionResult) {
          // Use the prediction result
          try {
            const assessment = JSON.parse(predictionResult)
            if (!assessment.timestamp) assessment.timestamp = Date.now()
            localStorage.setItem(simplifiedKey, JSON.stringify([assessment]))
            logs.push(`✅ Created history from prediction result`)
          } catch (e) {
            logs.push(`❌ Failed to create history from prediction: ${e instanceof Error ? e.message : String(e)}`)
          }
        }
      }

      setStatus("success")
      setMessage("History fixed successfully! Please refresh the page to see your history.")
    } catch (error) {
      setStatus("error")
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`)
    }

    setDebugInfo(logs)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Fix History Issues</CardTitle>
        <CardDescription>This tool will fix issues with your assessment history not appearing</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {status === "success" && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="destructive">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <Button onClick={fixHistory} disabled={status === "loading"} className="w-full">
            {status === "loading" ? "Fixing..." : "Fix My History"}
          </Button>

          {debugInfo.length > 0 && (
            <div className="mt-4 p-3 bg-gray-800 rounded-md text-xs font-mono text-gray-300 max-h-40 overflow-y-auto">
              {debugInfo.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          )}

          <div className="text-xs text-gray-500 mt-4">
            <p>After fixing, please refresh the history page to see your assessments.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
