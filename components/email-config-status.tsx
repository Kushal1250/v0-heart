"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function EmailConfigStatus() {
  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "error">("loading")
  const [message, setMessage] = useState("")
  const [details, setDetails] = useState<any>(null)

  useEffect(() => {
    checkEmailConfig()
  }, [])

  const checkEmailConfig = async () => {
    try {
      const response = await fetch("/api/email-test")
      const data = await response.json()

      if (data.status === "success") {
        setStatus("valid")
        setMessage("Email service is properly configured")
        setDetails(data.config)
      } else {
        setStatus("invalid")
        setMessage(data.message || "Email configuration is invalid")
        setDetails(data.config)
      }
    } catch (error) {
      setStatus("error")
      setMessage("Failed to check email configuration")
      setDetails(null)
    }
  }

  if (status === "loading") {
    return <div className="text-sm text-gray-400">Checking email configuration...</div>
  }

  if (status === "valid") {
    return (
      <Alert className="bg-green-900/20 border-green-600">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertTitle>Email Service Ready</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="bg-red-900/20 border-red-600">
      <AlertCircle className="h-4 w-4 text-red-500" />
      <AlertTitle>Email Configuration Issue</AlertTitle>
      <AlertDescription>
        {message}
        {details && (
          <details className="mt-2 text-xs">
            <summary>Configuration details</summary>
            <pre className="mt-1 p-2 bg-gray-800 rounded overflow-x-auto">{JSON.stringify(details, null, 2)}</pre>
          </details>
        )}
      </AlertDescription>
    </Alert>
  )
}
