"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, Settings, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import logger from "@/lib/system-logger"

interface MaintenanceModeProps {
  isActive?: boolean
  onActivate?: () => Promise<void>
  onDeactivate?: () => Promise<void>
  adminOnly?: boolean
}

export function MaintenanceMode({
  isActive = false,
  onActivate,
  onDeactivate,
  adminOnly = true,
}: MaintenanceModeProps) {
  const [active, setActive] = useState(isActive)
  const [loading, setLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check if user is admin
    const checkAdmin = () => {
      const cookies = document.cookie.split(";")
      const isAdminCookie = cookies.find((cookie) => cookie.trim().startsWith("is_admin="))
      const isAdmin = isAdminCookie ? isAdminCookie.split("=")[1] === "true" : false
      setIsAdmin(isAdmin)
    }

    checkAdmin()
  }, [])

  useEffect(() => {
    setActive(isActive)
  }, [isActive])

  const handleToggle = async () => {
    if (adminOnly && !isAdmin) {
      setError("You must be an admin to toggle maintenance mode")
      return
    }

    setShowDialog(true)
  }

  const confirmToggle = async () => {
    try {
      setLoading(true)
      setError(null)

      if (active) {
        // Deactivate maintenance mode
        if (onDeactivate) {
          await onDeactivate()
        }
        logger.info("Maintenance mode deactivated", { module: "MaintenanceMode" })
      } else {
        // Activate maintenance mode
        if (onActivate) {
          await onActivate()
        }
        logger.info("Maintenance mode activated", { module: "MaintenanceMode" })
      }

      setActive(!active)
      setShowDialog(false)
    } catch (err) {
      logger.error("Error toggling maintenance mode", {
        module: "MaintenanceMode",
        data: { error: err },
      })
      setError("Failed to toggle maintenance mode")
    } finally {
      setLoading(false)
    }
  }

  // If admin only and user is not admin, don't render the component
  if (adminOnly && !isAdmin) {
    return null
  }

  return (
    <>
      {active && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Maintenance Mode Active</AlertTitle>
          <AlertDescription>
            The system is currently in maintenance mode. Some features may be unavailable.
          </AlertDescription>
        </Alert>
      )}

      <Button
        variant={active ? "destructive" : "outline"}
        size="sm"
        onClick={handleToggle}
        className="flex items-center gap-2"
      >
        {active ? <RefreshCw className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
        {active ? "Deactivate Maintenance Mode" : "Activate Maintenance Mode"}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{active ? "Deactivate Maintenance Mode?" : "Activate Maintenance Mode?"}</DialogTitle>
            <DialogDescription>
              {active
                ? "This will restore normal system operation. All features will be available again."
                : "This will put the system in maintenance mode. Some features will be unavailable to users."}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={confirmToggle} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  {active ? "Deactivating..." : "Activating..."}
                </>
              ) : (
                <>{active ? "Deactivate" : "Activate"}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default MaintenanceMode
