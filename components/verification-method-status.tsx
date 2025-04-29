"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"

interface VerificationMethodStatusProps {
  type: "sms" | "email"
}

export function VerificationMethodStatus({ type }: VerificationMethodStatusProps) {
  const [status, setStatus] = useState<"checking" | "configured" | "not-configured">("checking")
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/verification/check-status?type=${type}`)
        const data = await response.json()

        if (response.ok && data.configured) {
          setStatus("configured")
          setMessage(data.message || `${type.toUpperCase()} verification is configured`)
        } else {
          setStatus("not-configured")
          setMessage(data.message || `${type.toUpperCase()} verification is not configured`)
        }
      } catch (error) {
        setStatus("not-configured")
        setMessage("Could not check verification status")
      }
    }

    checkStatus()
  }, [type])

  return (
    <div className="flex items-center gap-2">
      {status === "checking" && (
        <>
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Checking...
          </Badge>
          <AlertCircle className="h-4 w-4 text-gray-400" />
        </>
      )}

      {status === "configured" && (
        <>
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Configured
          </Badge>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        </>
      )}

      {status === "not-configured" && (
        <>
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Not Configured
          </Badge>
          <XCircle className="h-4 w-4 text-red-600" />
        </>
      )}

      <span className="text-sm text-gray-600">{message}</span>
    </div>
  )
}
