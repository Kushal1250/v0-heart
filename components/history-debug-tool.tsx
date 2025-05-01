"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function HistoryDebugTool({ email }: { email: string }) {
  const [logs, setLogs] = useState<string[]>([])
  const [fixAttempted, setFixAttempted] = useState(false)
  const [fixResult, setFixResult] = useState<{ success: boolean; message: string } | null>(null)
  const [storageData, setStorageData] = useState<Record<string, any>>({})

  useEffect(() => {
    // Initial scan of localStorage
    scanLocalStorage()
  }, [])

  const scanLocalStorage = () => {
    try {
      const data: Record<string, any> = {}
      const newLogs: string[] = []

      newLogs.push(`Scanning localStorage for email: ${email}`)

      // Check all localStorage keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (!key) continue

        try {
          const value = localStorage.getItem(key)
          if (value) {
            data[key] = value.length > 100 ? `${value.substring(0, 100)}... (${value.length} chars)` : value

            // Check if this key might be related to history
            if (key.includes("history") || key.includes("assessment") || key.includes(email.replace("@", ""))) {
              newLogs.push(`Found potentially relevant key: ${key}`)

              // Try to parse JSON
              try {
                const parsed = JSON.parse(value)
                if (Array.isArray(parsed)) {
                  newLogs.push(`  - Contains array with ${parsed.length} items`)
                } else {
                  newLogs.push(`  - Contains object: ${JSON.stringify(parsed).substring(0, 50)}...`)
                }
              } catch (e) {
                newLogs.push(`  - Contains non-JSON data: ${value.substring(0, 50)}...`)
              }
            }
          }
        } catch (e) {
          newLogs.push(`Error reading key ${key}: ${e instanceof Error ? e.message : String(e)}`)
        }
      }

      // Check specific history keys
      const historyKeys = [
        `assessmentHistory_${email}`,
        `heart_assessment_history_${email}`,
        `heart_history_${email.toLowerCase()}`,
        `assessment_history_${email}`,
      ]

      newLogs.push("\nChecking specific history keys:")
      historyKeys.forEach((key) => {
        const value = localStorage.getItem(key)
        if (value) {
          newLogs.push(`✓ Found history at key: ${key}`)
          try {
            const parsed = JSON.parse(value)
            newLogs.push(`  - Contains ${Array.isArray(parsed) ? parsed.length : 1} items`)
          } catch (e) {
            newLogs.push(`  - Contains invalid JSON`)
          }
        } else {
          newLogs.push(`✗ No history found at key: ${key}`)
        }
      })

      // Check current user email
      const currentEmail = localStorage.getItem("currentUserEmail") || localStorage.getItem("heart_current_email")

      if (currentEmail) {
        newLogs.push(`\nCurrent user email in storage: ${currentEmail}`)
        if (currentEmail !== email) {
          newLogs.push(`⚠️ Warning: Current email (${currentEmail}) doesn't match your email (${email})`)
        }
      } else {
        newLogs.push(`\n⚠️ No current user email found in storage`)
      }

      // Check for prediction result
      const predictionResult = localStorage.getItem("predictionResult")
      if (predictionResult) {
        newLogs.push(`\n✓ Found recent prediction result`)
        try {
          const parsed = JSON.parse(predictionResult)
          newLogs.push(`  - Result: ${parsed.result?.risk || "unknown"} risk (${parsed.result?.score || 0}%)`)
        } catch (e) {
          newLogs.push(`  - Contains invalid JSON`)
        }
      } else {
        newLogs.push(`\n✗ No prediction result found`)
      }

      setLogs(newLogs)
      setStorageData(data)
    } catch (e) {
      setLogs([`Error scanning localStorage: ${e instanceof Error ? e.message : String(e)}`])
    }
  }

  const fixHistoryStorage = () => {
    try {
      const newLogs = [...logs, "\n--- Attempting to fix history storage ---"]
      let fixed = false

      // 1. Check if we have a prediction result to save
      const predictionResult = localStorage.getItem("predictionResult")
      if (predictionResult) {
        try {
          const assessment = JSON.parse(predictionResult)

          // 2. Make sure we have the current email set
          localStorage.setItem("currentUserEmail", email)
          localStorage.setItem("heart_current_email", email)
          newLogs.push("✓ Set current user email")

          // 3. Save to all possible history keys to ensure compatibility
          const historyKeys = [
            `assessmentHistory_${email}`,
            `heart_assessment_history_${email}`,
            `heart_history_${email.toLowerCase()}`,
          ]

          historyKeys.forEach((key) => {
            try {
              // Get existing history or create new array
              const existingHistory = localStorage.getItem(key)
              const history = existingHistory ? JSON.parse(existingHistory) : []

              // Add timestamp if not present
              if (!assessment.timestamp) {
                assessment.timestamp = new Date().toISOString()
              }

              // Add to history
              history.unshift(assessment) // Add to beginning

              // Save back to localStorage
              localStorage.setItem(key, JSON.stringify(history))
              newLogs.push(`✓ Saved assessment to ${key}`)
              fixed = true
            } catch (e) {
              newLogs.push(`✗ Failed to save to ${key}: ${e instanceof Error ? e.message : String(e)}`)
            }
          })

          if (fixed) {
            setFixResult({
              success: true,
              message: "Successfully saved your assessment to history. Please refresh the page to see your history.",
            })
          } else {
            setFixResult({
              success: false,
              message: "Could not save assessment to history. See logs for details.",
            })
          }
        } catch (e) {
          newLogs.push(`✗ Error parsing prediction result: ${e instanceof Error ? e.message : String(e)}`)
          setFixResult({
            success: false,
            message: "Error parsing your assessment data. See logs for details.",
          })
        }
      } else {
        newLogs.push("✗ No prediction result found to save to history")
        setFixResult({
          success: false,
          message: "No assessment data found to save to history. Please take a new assessment first.",
        })
      }

      setLogs(newLogs)
      setFixAttempted(true)
    } catch (e) {
      setLogs([...logs, `Error fixing history: ${e instanceof Error ? e.message : String(e)}`])
      setFixResult({
        success: false,
        message: `Error: ${e instanceof Error ? e.message : String(e)}`,
      })
      setFixAttempted(true)
    }
  }

  const clearAllStorage = () => {
    if (confirm("This will clear ALL localStorage data. This action cannot be undone. Continue?")) {
      localStorage.clear()
      setLogs([...logs, "\nCleared all localStorage data"])
      setStorageData({})
      setFixResult({
        success: true,
        message: "All localStorage data has been cleared. You may need to log in again.",
      })
    }
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>History Debug Tool</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fixResult && (
            <Alert variant={fixResult.success ? "default" : "destructive"}>
              <AlertDescription>{fixResult.message}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={scanLocalStorage}>
              Scan Storage
            </Button>
            <Button variant="outline" size="sm" onClick={fixHistoryStorage}>
              Fix History
            </Button>
            <Button variant="destructive" size="sm" onClick={clearAllStorage}>
              Clear All Data
            </Button>
          </div>

          <Textarea readOnly className="font-mono text-xs h-64 bg-gray-900" value={logs.join("\n")} />

          <div className="text-xs text-gray-500">
            <p>This tool helps diagnose and fix issues with your assessment history.</p>
            <p>1. Click "Scan Storage" to check your browser's storage</p>
            <p>2. Click "Fix History" to attempt to repair your history</p>
            <p>3. Refresh the page after fixing to see your history</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
