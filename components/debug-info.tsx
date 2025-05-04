"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function DebugInfo() {
  const [showDebug, setShowDebug] = useState(false)
  const [clickCount, setClickCount] = useState(0)
  const [lastError, setLastError] = useState<string | null>(null)

  const testNavigation = () => {
    try {
      setClickCount((prev) => prev + 1)
      window.location.href = "/about"
    } catch (error) {
      setLastError(error instanceof Error ? error.message : String(error))
    }
  }

  if (!showDebug) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button variant="outline" size="sm" onClick={() => setShowDebug(true)} className="bg-white shadow-md">
          Debug
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Debug Info</h3>
        <Button variant="ghost" size="sm" onClick={() => setShowDebug(false)}>
          Close
        </Button>
      </div>
      <div className="text-sm space-y-2">
        <p>Click Count: {clickCount}</p>
        {lastError && <p className="text-red-500">Error: {lastError}</p>}
        <div className="space-y-2">
          <Button size="sm" onClick={testNavigation} className="w-full">
            Test Navigation
          </Button>
          <Button size="sm" variant="outline" onClick={() => window.location.reload()} className="w-full">
            Reload Page
          </Button>
        </div>
      </div>
    </div>
  )
}
