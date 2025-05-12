"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle } from "lucide-react"

interface HealthService {
  id: string
  name: string
  connected: boolean
  lastSync: string
}

interface ExternalServicesSyncProps {
  services: HealthService[]
  onToggleService: (id: string) => void
}

export function ExternalServicesSync({ services, onToggleService }: ExternalServicesSyncProps) {
  if (!services || services.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">No external services available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {services.map((service) => (
        <div key={service.id} className="flex items-center justify-between border-b pb-3 last:border-0">
          <div>
            <div className="flex items-center">
              <p className="font-medium">{service.name}</p>
              {service.connected && (
                <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                  Connected
                </Badge>
              )}
            </div>
            {service.connected && service.lastSync && (
              <p className="text-sm text-gray-500 flex items-center mt-1">
                <Clock className="h-3 w-3 mr-1" />
                Last synced: {new Date(service.lastSync).toLocaleDateString()}
              </p>
            )}
          </div>
          <Button
            variant={service.connected ? "outline" : "default"}
            size="sm"
            onClick={() => onToggleService(service.id)}
          >
            {service.connected ? (
              <>
                <XCircle className="h-4 w-4 mr-1" /> Disconnect
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-1" /> Connect
              </>
            )}
          </Button>
        </div>
      ))}
    </div>
  )
}
