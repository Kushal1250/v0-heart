"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

// Define a server action to check verification status
async function checkVerificationStatus() {
  try {
    const response = await fetch("/api/verification/check-status")
    if (!response.ok) {
      throw new Error("Failed to fetch verification status")
    }
    return await response.json()
  } catch (error) {
    console.error("Error checking verification status:", error)
    return {
      sms: { configured: false, message: "Error checking status" },
      email: { configured: false, message: "Error checking status" },
    }
  }
}

export function VerificationMethodStatus() {
  const [status, setStatus] = useState({
    sms: { configured: false, message: "Checking..." },
    email: { configured: false, message: "Checking..." },
    loading: true,
  })

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const result = await checkVerificationStatus()
        setStatus({
          ...result,
          loading: false,
        })
      } catch (error) {
        console.error("Error fetching verification status:", error)
        setStatus((prev) => ({
          ...prev,
          loading: false,
        }))
      }
    }

    fetchStatus()
  }, [])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Verification Methods Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-medium">SMS Verification:</span>
                {status.loading ? (
                  <Badge variant="outline" className="animate-pulse">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Checking...
                  </Badge>
                ) : status.sms.configured ? (
                  <Badge variant="success">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Configured
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-4 w-4 mr-1" />
                    Not Configured
                  </Badge>
                )}
              </div>
              <span className="text-sm text-muted-foreground">{!status.loading && status.sms.message}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-medium">Email Verification:</span>
                {status.loading ? (
                  <Badge variant="outline" className="animate-pulse">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Checking...
                  </Badge>
                ) : status.email.configured ? (
                  <Badge variant="success">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Configured
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-4 w-4 mr-1" />
                    Not Configured
                  </Badge>
                )}
              </div>
              <span className="text-sm text-muted-foreground">{!status.loading && status.email.message}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
