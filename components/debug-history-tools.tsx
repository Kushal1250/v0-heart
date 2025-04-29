"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { debugStorage } from "@/lib/user-specific-storage"
import { fixHistoryData } from "@/lib/fix-history-data"

export default function DebugHistoryTools({ email }: { email: string }) {
  const [message, setMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleDebugStorage = () => {
    debugStorage(email)
    setMessage("Debug information has been logged to the browser console (F12)")
    setIsSuccess(true)
  }

  const handleFixHistory = () => {
    try {
      const fixed = fixHistoryData(email)
      if (fixed) {
        setMessage("History data has been fixed. Please refresh the page to see the changes.")
        setIsSuccess(true)
      } else {
        setMessage("No issues found with history data or no data to fix.")
        setIsSuccess(true)
      }
    } catch (error) {
      setMessage(`Error fixing history data: ${error instanceof Error ? error.message : "Unknown error"}`)
      setIsSuccess(false)
    }
  }

  const handleClearLocalStorage = () => {
    if (confirm("This will clear ALL local storage data. This action cannot be undone. Continue?")) {
      localStorage.clear()
      setMessage("All local storage data has been cleared. Please refresh the page.")
      setIsSuccess(true)
    }
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-sm">Troubleshooting Tools</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {message && (
            <div
              className={`p-3 rounded-md text-sm ${isSuccess ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {message}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleDebugStorage}>
              Debug Storage
            </Button>
            <Button variant="outline" size="sm" onClick={handleFixHistory}>
              Fix History Data
            </Button>
            <Button variant="destructive" size="sm" onClick={handleClearLocalStorage}>
              Clear All Data
            </Button>
          </div>

          <p className="text-xs text-gray-500">
            These tools can help troubleshoot issues with your assessment history. Use the browser console (F12) to view
            debug information.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
