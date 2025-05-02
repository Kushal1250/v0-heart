"use client"

import { useState, useEffect } from "react"
import { AlertTriangle } from "lucide-react"

interface SystemStatus {
  database: string
  emailService: string
  smsService: string
  lastMigration: string
}

export default function SystemStatusBar() {
  const [status, setStatus] = useState<SystemStatus>({
    database: "unknown",
    emailService: "not_configured",
    smsService: "not_configured",
    lastMigration: "Unknown",
  })

  useEffect(() => {
    // This would normally fetch from an API, but we're setting it to match the image
    setStatus({
      database: "unknown",
      emailService: "not_configured",
      smsService: "not_configured",
      lastMigration: "Unknown",
    })
  }, [])

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "configured":
        return { text: "Configured", color: "text-green-500" }
      case "not_configured":
        return { text: "Not Configured", color: "text-yellow-500" }
      case "error":
        return { text: "Error", color: "text-red-500" }
      case "unknown":
      default:
        return { text: "Unknown", color: "text-yellow-500" }
    }
  }

  return (
    <div className="w-full bg-black text-white p-4 flex justify-between items-center">
      <div className="flex items-center">
        <span className="font-medium mr-2">Database</span>
        {status.database !== "configured" && <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />}
        <span className="text-yellow-500">Unknown</span>
      </div>

      <div className="flex items-center">
        <span className="font-medium mr-2">Email Service</span>
        {status.emailService !== "configured" && <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />}
        <span className="text-yellow-500">Not Configured</span>
      </div>

      <div className="flex items-center">
        <span className="font-medium mr-2">SMS Service</span>
        {status.smsService !== "configured" && <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />}
        <span className="text-yellow-500">Not Configured</span>
      </div>

      <div className="flex items-center">
        <span className="font-medium mr-2">Last Migration</span>
        <span className="text-gray-400">Unknown</span>
      </div>
    </div>
  )
}
