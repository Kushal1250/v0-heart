"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"

export default function FixResetTokensButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleFix = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/debug/reset-token-system", {
        method: "POST",
      })

      const data = await response.json()

      setResult({
        success: data.success,
        message: data.message,
      })
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "An error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={handleFix} disabled={isLoading} className="bg-red-600 hover:bg-red-700">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Fixing Reset Tokens Table...
          </>
        ) : (
          "Fix Reset Tokens Table"
        )}
      </Button>

      {result && (
        <Alert className={result.success ? "bg-green-900 border-green-800" : "bg-red-900 border-red-800"}>
          {result.success ? (
            <CheckCircle className="h-4 w-4 text-green-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-400" />
          )}
          <AlertDescription className={result.success ? "text-green-200" : "text-red-200"}>
            {result.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
