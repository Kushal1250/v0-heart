"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Activity, Watch, Smartphone, Link2, Heart, RefreshCw, Plus, X } from "lucide-react"

export interface HealthService {
  id: string
  name: string
  icon: string
  description: string
  connected: boolean
  lastSync?: string
}

const availableServices: HealthService[] = [
  {
    id: "fitbit",
    name: "Fitbit",
    icon: "watch",
    description: "Sync your Fitbit activity data",
    connected: false,
  },
  {
    id: "apple-health",
    name: "Apple Health",
    icon: "heart",
    description: "Sync your Apple Health data",
    connected: false,
  },
  {
    id: "google-fit",
    name: "Google Fit",
    icon: "activity",
    description: "Sync your Google Fit activity and heart rate data",
    connected: false,
  },
  {
    id: "samsung-health",
    name: "Samsung Health",
    icon: "smartphone",
    description: "Sync your Samsung Health data",
    connected: false,
  },
]

interface ExternalServicesSyncProps {
  connectedServices: HealthService[]
  onConnect: (service: HealthService) => void
  onDisconnect: (serviceId: string) => void
}

export function ExternalServicesSync({ connectedServices, onConnect, onDisconnect }: ExternalServicesSyncProps) {
  const [showConnectDialog, setShowConnectDialog] = useState(false)
  const [selectedService, setSelectedService] = useState<HealthService | null>(null)
  const [loading, setLoading] = useState(false)

  const handleConnect = (service: HealthService) => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      onConnect({ ...service, connected: true, lastSync: new Date().toISOString() })
      setLoading(false)
      setShowConnectDialog(false)
    }, 1500)
  }

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "watch":
        return <Watch className="h-5 w-5" />
      case "heart":
        return <Heart className="h-5 w-5" />
      case "activity":
        return <Activity className="h-5 w-5" />
      case "smartphone":
        return <Smartphone className="h-5 w-5" />
      default:
        return <Link2 className="h-5 w-5" />
    }
  }

  const renderAvailableServices = () => {
    // Filter out already connected services
    const availableToConnect = availableServices.filter(
      (service) => !connectedServices.some((cs) => cs.id === service.id),
    )

    if (availableToConnect.length === 0) {
      return (
        <div className="text-center py-4">
          <p className="text-muted-foreground">All available services are connected</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 gap-4">
        {availableToConnect.map((service) => (
          <div key={service.id} className="flex items-center justify-between p-4 rounded-md border">
            <div className="flex items-center gap-3">
              {getIconComponent(service.icon)}
              <div>
                <h4 className="font-medium">{service.name}</h4>
                <p className="text-sm text-muted-foreground">{service.description}</p>
              </div>
            </div>
            <Button
              onClick={() => {
                setSelectedService(service)
                setShowConnectDialog(true)
              }}
              size="sm"
            >
              Connect
            </Button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {connectedServices.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 mb-6">
          {connectedServices.map((service) => (
            <div key={service.id} className="flex items-center justify-between p-4 rounded-md border bg-slate-50">
              <div className="flex items-center gap-3">
                {getIconComponent(service.icon)}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{service.name}</h4>
                    <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                      Connected
                    </Badge>
                  </div>
                  {service.lastSync && (
                    <p className="text-xs text-muted-foreground">
                      Last synced: {new Date(service.lastSync).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-700"
                  onClick={() => onDisconnect(service.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-md border border-gray-200 mb-6">
          <p className="text-muted-foreground">No health services connected</p>
          <p className="text-xs text-muted-foreground mt-1">
            Connect your wearable devices and health apps to get more accurate insights
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h4 className="font-medium">Available Services</h4>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Plus className="h-4 w-4" /> Add Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect Health Services</DialogTitle>
              <DialogDescription>
                Connect your wearable devices and health apps to improve your heart health tracking.
              </DialogDescription>
            </DialogHeader>

            {renderAvailableServices()}
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect to {selectedService?.name}</DialogTitle>
            <DialogDescription>Provide your credentials to connect to {selectedService?.name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email or Username</Label>
              <Input id="email" placeholder="Enter your account email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Switch id="sync-data" />
              <Label htmlFor="sync-data">Allow ongoing data sync</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConnectDialog(false)}>
              Cancel
            </Button>
            <Button disabled={loading} onClick={() => selectedService && handleConnect(selectedService)}>
              {loading ? "Connecting..." : "Connect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
