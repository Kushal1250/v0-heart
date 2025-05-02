"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { BackupSystem } from "@/components/backup-system"
import { MaintenanceMode } from "@/components/maintenance-mode"
import { PersistentSessionHandler } from "@/components/persistent-session-handler"

export default function SystemPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [systemStatus, setSystemStatus] = useState({
    database: { status: "unknown", value: 0 },
    auth: { status: "unknown", value: 0 },
    email: { status: "unknown", value: 0 },
    sms: { status: "unknown", value: 0 },
  })

  const [config, setConfig] = useState({
    enableNotifications: false,
    enableEmails: false,
    enableSMS: false,
    debugMode: false,
    maintenanceMode: false,
  })

  const { toast } = useToast()

  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        const response = await fetch("/api/admin/system-status")
        if (!response.ok) throw new Error("Failed to fetch system status")

        const data = await response.json()
        setSystemStatus(data.status)
        setConfig(data.config)
      } catch (error) {
        console.error("Error fetching system status:", error)
        toast({
          title: "Error",
          description: "Failed to fetch system status",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSystemStatus()
  }, [toast])

  const handleConfigChange = async (key: string, value: boolean) => {
    try {
      const response = await fetch("/api/admin/update-system-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key, value }),
      })

      if (!response.ok) throw new Error("Failed to update configuration")

      setConfig((prev) => ({ ...prev, [key]: value }))

      toast({
        title: "Success",
        description: "Configuration updated successfully",
      })
    } catch (error) {
      console.error("Error updating configuration:", error)
      toast({
        title: "Error",
        description: "Failed to update configuration",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-500"
      case "warning":
        return "bg-yellow-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-300"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-green-500">Healthy</Badge>
      case "warning":
        return <Badge className="bg-yellow-500">Warning</Badge>
      case "error":
        return <Badge className="bg-red-500">Error</Badge>
      default:
        return <Badge className="bg-gray-300">Unknown</Badge>
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <PersistentSessionHandler />

      <h1 className="text-2xl font-bold">System Administration</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* System Health Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">System Health</CardTitle>
            <CardDescription>Current status of system components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Database</span>
                {getStatusBadge(systemStatus.database.status)}
              </div>
              <Progress
                value={systemStatus.database.value}
                className={`h-2 ${getStatusColor(systemStatus.database.status)}`}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Authentication</span>
                {getStatusBadge(systemStatus.auth.status)}
              </div>
              <Progress value={systemStatus.auth.value} className={`h-2 ${getStatusColor(systemStatus.auth.status)}`} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Email Service</span>
                {getStatusBadge(systemStatus.email.status)}
              </div>
              <Progress
                value={systemStatus.email.value}
                className={`h-2 ${getStatusColor(systemStatus.email.status)}`}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>SMS Service</span>
                {getStatusBadge(systemStatus.sms.status)}
              </div>
              <Progress value={systemStatus.sms.value} className={`h-2 ${getStatusColor(systemStatus.sms.status)}`} />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
              Refresh Status
            </Button>
          </CardFooter>
        </Card>

        {/* Configuration Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Configuration</CardTitle>
            <CardDescription>System-wide settings and toggles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notifications</p>
                <p className="text-sm text-muted-foreground">Enable system notifications</p>
              </div>
              <Switch
                checked={config.enableNotifications}
                onCheckedChange={(checked) => handleConfigChange("enableNotifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Send email notifications</p>
              </div>
              <Switch
                checked={config.enableEmails}
                onCheckedChange={(checked) => handleConfigChange("enableEmails", checked)}
                disabled={!config.enableNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-muted-foreground">Send SMS notifications</p>
              </div>
              <Switch
                checked={config.enableSMS}
                onCheckedChange={(checked) => handleConfigChange("enableSMS", checked)}
                disabled={!config.enableNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Debug Mode</p>
                <p className="text-sm text-muted-foreground">Enable detailed logging</p>
              </div>
              <Switch
                checked={config.debugMode}
                onCheckedChange={(checked) => handleConfigChange("debugMode", checked)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">Reset to Defaults</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset Configuration</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reset all configuration settings to their default values. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Reset</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button onClick={() => (window.location.href = "/admin/system-logs")} variant="outline">
              View Logs
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <BackupSystem />
        <MaintenanceMode
          isEnabled={config.maintenanceMode}
          onToggle={(checked) => handleConfigChange("maintenanceMode", checked)}
        />
      </div>
    </div>
  )
}
