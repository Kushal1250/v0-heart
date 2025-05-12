"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Activity, Heart, Watch, RefreshCw } from "lucide-react"

interface ExternalService {
  id: string
  name: string
  connected: boolean
  icon: React.ReactNode
  lastSync?: string
}

export function ExternalServicesSync() {
  const [services, setServices] = useState<ExternalService[]>([
    {
      id: "fitbit",
      name: "Fitbit",
      connected: true,
      icon: <Activity className="h-5 w-5" />,
      lastSync: "2023-05-10T14:30:00Z",
    },
    {
      id: "apple_health",
      name: "Apple Health",
      connected: false,
      icon: <Heart className="h-5 w-5" />,
    },
    {
      id: "google_fit",
      name: "Google Fit",
      connected: true,
      icon: <Activity className="h-5 w-5" />,
      lastSync: "2023-05-09T10:15:00Z",
    },
    {
      id: "samsung_health",
      name: "Samsung Health",
      connected: false,
      icon: <Heart className="h-5 w-5" />,
    },
    {
      id: "garmin",
      name: "Garmin Connect",
      connected: false,
      icon: <Watch className="h-5 w-5" />,
    },
  ])

  const [syncing, setSyncing] = useState<string | null>(null)

  const toggleConnection = (id: string) => {
    setServices(
      services.map((service) => (service.id === id ? { ...service, connected: !service.connected } : service)),
    )
  }

  const syncService = async (id: string) => {
    setSyncing(id)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setServices(
      services.map((service) => (service.id === id ? { ...service, lastSync: new Date().toISOString() } : service)),
    )

    setSyncing(null)
  }

  return (
    <div className="space-y-4">
      {services.map((service) => (
        <Card key={service.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-muted rounded-md p-2">{service.icon}</div>
                <div>
                  <h4 className="font-medium">{service.name}</h4>
                  {service.connected && service.lastSync && (
                    <p className="text-xs text-muted-foreground">
                      Last synced: {new Date(service.lastSync).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {service.connected && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => syncService(service.id)}
                    disabled={syncing === service.id}
                  >
                    {syncing === service.id ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 mr-1" />
                        Sync
                      </>
                    )}
                  </Button>
                )}
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`${service.id}-switch`}
                    checked={service.connected}
                    onCheckedChange={() => toggleConnection(service.id)}
                  />
                  <Label htmlFor={`${service.id}-switch`} className="sr-only">
                    {service.connected ? "Disconnect" : "Connect"} {service.name}
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
