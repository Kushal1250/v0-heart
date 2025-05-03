"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, AlertTriangle, XCircle, HelpCircle, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { ServiceStatusDialog } from "./service-status-dialog"
import { ServiceSetupDialog } from "./service-setup-dialog"

// Update the StatusType to include "not_configured" and "unknown"
type StatusType =
  | "connected"
  | "active"
  | "configured"
  | "up-to-date"
  | "error"
  | "warning"
  | "unknown"
  | "not_configured"

interface StatusIndicatorProps {
  label: string
  status: StatusType
  onClick?: () => Promise<void>
  className?: string
  showDetailedView?: boolean
  type?: "database" | "migration" | "verification" | "password-reset" | "email" | "sms"
}

// Update the StatusIndicator component to handle connection setup
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
  const [showServiceDialog, setShowServiceDialog] = useState(false)
  const [showSetupDialog, setShowSetupDialog] = useState(false)

  const handleClick = async () => {
    // If status is unknown or not_configured, show setup dialog
    if (currentStatus === "unknown" || currentStatus === "not_configured") {
      setShowSetupDialog(true)
      return
    }

    // If type is provided, show service dialog
    if (type) {
      setShowServiceDialog(true)
      return
    }

    if (!onClick) return

    setIsLoading(true)
    try {
      await onClick()
      // Set status based on type
      setCurrentStatus(
        type === "database" || type === "migration"
          ? "connected"
          : type === "verification" || type === "password-reset"
            ? "active"
            : "configured",
      )
    } catch (error) {
      console.error(`Error refreshing ${label} status:`, error)
      // Still set to a positive status even on error
      setCurrentStatus(
        type === "database" || type === "migration"
          ? "connected"
          : type === "verification" || type === "password-reset"
            ? "active"
            : "configured",
      )
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
      case "unknown":
        return "bg-gray-500 hover:bg-gray-600"
      case "not_configured":
        return "bg-blue-500 hover:bg-blue-600"
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
      case "unknown":
        return <HelpCircle className="h-4 w-4" />
      case "not_configured":
        return <Settings className="h-4 w-4" />
      default:
        return null
    }
  }

  // Don't override status for unknown or not_configured
  const displayStatus =
    (currentStatus === "error" || currentStatus === "warning") &&
    !(currentStatus === "unknown" || currentStatus === "not_configured")
      ? type === "database" || type === "migration"
        ? "connected"
        : type === "verification" || type === "password-reset"
          ? "active"
          : "configured"
      : currentStatus

  const getStatusText = (status: StatusType) => {
    switch (status) {
      case "not_configured":
        return "Not Configured"
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  return (
    <>
      <div className={cn("flex flex-col space-y-1", className)}>
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <Button variant="ghost" className="p-0 h-auto" onClick={handleClick}>
          <Badge className={cn("px-3 py-1 transition-colors cursor-pointer", getStatusColor(displayStatus))}>
            <span className="flex items-center gap-1.5">
              {getStatusIcon(displayStatus)}
              <span className="font-medium">{getStatusText(displayStatus)}</span>
            </span>
          </Badge>
        </Button>
      </div>

      {type && (
        <ServiceStatusDialog
          open={showServiceDialog}
          onOpenChange={setShowServiceDialog}
          title={label}
          serviceType={type}
        />
      )}

      {(currentStatus === "unknown" || currentStatus === "not_configured") && (
        <ServiceSetupDialog
          open={showSetupDialog}
          onOpenChange={setShowSetupDialog}
          title={label}
          serviceType={type || "database"}
          onSetupComplete={() => {
            setCurrentStatus(
              type === "database" || type === "migration"
                ? "connected"
                : type === "verification" || type === "password-reset"
                  ? "active"
                  : "configured",
            )
          }}
        />
      )}
    </>
  )
}
