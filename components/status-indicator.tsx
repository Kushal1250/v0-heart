"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { DatabaseStatusDialog } from "./database-status-dialog"

type StatusType = "connected" | "active" | "configured" | "up-to-date" | "error" | "warning" | "unknown"

interface StatusIndicatorProps {
  label: string
  status: StatusType
  onClick?: () => Promise<void>
  className?: string
  showDetailedView?: boolean
  type?: "database" | "verification" | "password-reset" | "email" | "sms" | "migration"
}

export function StatusIndicator({
  label,
  status,
  onClick,
  className,
  showDetailedView = false,
  type,
}: StatusIndicatorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<StatusType>(status)
  const [showDatabaseDialog, setShowDatabaseDialog] = useState(false)

  const handleClick = async () => {
    if (type === "database") {
      setShowDatabaseDialog(true)
      return
    }

    if (!onClick) return

    setIsLoading(true)
    try {
      await onClick()
      // Status will be updated by parent component
    } catch (error) {
      console.error(`Error refreshing ${label} status:`, error)
      setCurrentStatus("error")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case "connected":
      case "active":
      case "configured":
      case "up-to-date":
        return "bg-green-500 hover:bg-green-600"
      case "warning":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "error":
        return "bg-red-500 hover:bg-red-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  const getStatusIcon = (status: StatusType) => {
    if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />

    switch (status) {
      case "connected":
      case "active":
      case "configured":
      case "up-to-date":
        return <CheckCircle className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "error":
        return <XCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <>
      <div className={cn("flex flex-col space-y-1", className)}>
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <Button variant="ghost" className="p-0 h-auto" onClick={handleClick} disabled={isLoading && !type}>
          <Badge
            className={cn(
              "px-3 py-1 transition-colors",
              getStatusColor(currentStatus),
              onClick || type ? "cursor-pointer" : "cursor-default",
            )}
          >
            <span className="flex items-center gap-1.5">
              {getStatusIcon(currentStatus)}
              <span className="font-medium">{currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}</span>
            </span>
          </Badge>
        </Button>
      </div>

      {type === "database" && <DatabaseStatusDialog open={showDatabaseDialog} onOpenChange={setShowDatabaseDialog} />}
    </>
  )
}
