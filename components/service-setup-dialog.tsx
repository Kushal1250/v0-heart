"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Settings, Database, Mail, MessageSquare, Lock, CheckCircle } from "lucide-react"

interface ServiceSetupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  serviceType: "database" | "migration" | "verification" | "password-reset" | "email" | "sms"
  onSetupComplete: () => void
}

export function ServiceSetupDialog({
  open,
  onOpenChange,
  title,
  serviceType,
  onSetupComplete,
}: ServiceSetupDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const getServiceIcon = () => {
    switch (serviceType) {
      case "database":
      case "migration":
        return <Database className="h-5 w-5" />
      case "verification":
      case "password-reset":
        return <Lock className="h-5 w-5" />
      case "email":
        return <Mail className="h-5 w-5" />
      case "sms":
        return <MessageSquare className="h-5 w-5" />
      default:
        return <Settings className="h-5 w-5" />
    }
  }

  const getServiceFields = () => {
    switch (serviceType) {
      case "database":
      case "migration":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="db-host">Database Host</Label>
                <Input id="db-host" placeholder="localhost" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="db-port">Port</Label>
                <Input id="db-port" placeholder="5432" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="db-name">Database Name</Label>
              <Input id="db-name" placeholder="heart_predict" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="db-user">Username</Label>
                <Input id="db-user" placeholder="postgres" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="db-password">Password</Label>
                <Input id="db-password" type="password" />
              </div>
            </div>
          </div>
        )
      case "email":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email-server">SMTP Server</Label>
                <Input id="email-server" placeholder="smtp.example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-port">Port</Label>
                <Input id="email-port" placeholder="587" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-from">From Email</Label>
              <Input id="email-from" placeholder="noreply@example.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email-user">Username</Label>
                <Input id="email-user" placeholder="user@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-password">Password</Label>
                <Input id="email-password" type="password" />
              </div>
            </div>
          </div>
        )
      case "sms":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="twilio-sid">Twilio Account SID</Label>
              <Input id="twilio-sid" placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twilio-token">Auth Token</Label>
              <Input id="twilio-token" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twilio-phone">Twilio Phone Number</Label>
              <Input id="twilio-phone" placeholder="+1234567890" />
            </div>
          </div>
        )
      case "verification":
      case "password-reset":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="secret-key">Secret Key</Label>
              <Input id="secret-key" placeholder="your-secret-key" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="token-expiry">Token Expiry (minutes)</Label>
              <Input id="token-expiry" type="number" placeholder="30" />
            </div>
            <Tabs defaultValue="email">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">Email Verification</TabsTrigger>
                <TabsTrigger value="sms">SMS Verification</TabsTrigger>
              </TabsList>
              <TabsContent value="email" className="space-y-4 mt-4">
                <Alert>
                  <AlertDescription>Email verification requires a configured email service.</AlertDescription>
                </Alert>
              </TabsContent>
              <TabsContent value="sms" className="space-y-4 mt-4">
                <Alert>
                  <AlertDescription>SMS verification requires a configured SMS service.</AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          </div>
        )
      default:
        return (
          <div className="py-4 text-center text-muted-foreground">
            No configuration options available for this service.
          </div>
        )
    }
  }

  const handleSetup = async () => {
    setLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setSuccess(true)
      setTimeout(() => {
        onSetupComplete()
        onOpenChange(false)
      }, 1000)
    } catch (err) {
      console.error(`Error setting up ${title}:`, err)
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getServiceIcon()}
            Configure {title}
          </DialogTitle>
          <DialogDescription>Enter the required information to set up {title.toLowerCase()}.</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success ? (
          <div className="py-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium mt-2">Setup Complete</h3>
              <p className="text-sm text-muted-foreground">{title} has been successfully configured.</p>
            </div>
          </div>
        ) : (
          <>
            {getServiceFields()}

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleSetup} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting Up...
                  </>
                ) : (
                  "Save & Connect"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
