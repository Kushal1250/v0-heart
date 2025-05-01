"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Loader2, XCircle, Shield } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export function TwoFactorAuth({ isEnabled = false }: { isEnabled?: boolean }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [method, setMethod] = useState<"sms" | "email">("sms")
  const { toast } = useToast()

  const handleToggle2FA = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/user/settings/two-factor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enabled: !isEnabled,
          method,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update two-factor authentication")
      }

      toast({
        title: !isEnabled ? "Two-factor authentication enabled" : "Two-factor authentication disabled",
        description: !isEnabled
          ? `You will now receive a verification code via ${method === "sms" ? "SMS" : "email"} when logging in.`
          : "Two-factor authentication has been disabled for your account.",
      })

      // Close the dialog and refresh the page to update the UI
      setOpen(false)
      window.location.reload()
    } catch (err) {
      console.error("Error updating two-factor authentication:", err)
      setError(err instanceof Error ? err.message : "Failed to update two-factor authentication")
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update two-factor authentication",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        variant={isEnabled ? "destructive" : "default"}
        onClick={() => setOpen(true)}
        className="w-full md:w-auto"
      >
        {isEnabled ? "Disable" : "Enable"}
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isEnabled ? "Disable Two-Factor Authentication" : "Enable Two-Factor Authentication"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isEnabled
                ? "Are you sure you want to disable two-factor authentication? This will make your account less secure."
                : "Two-factor authentication adds an extra layer of security to your account by requiring a verification code when you log in."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {error && (
            <div className="flex items-center gap-2 text-red-500 mb-4">
              <XCircle className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!isEnabled && (
            <div className="py-4">
              <p className="text-sm font-medium mb-3">Verification method:</p>
              <RadioGroup
                value={method}
                onValueChange={(value) => setMethod(value as "sms" | "email")}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sms" id="sms" />
                  <Label htmlFor="sms">SMS (Text Message)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email" />
                  <Label htmlFor="email">Email</Label>
                </div>
              </RadioGroup>

              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md">
                <p className="text-sm text-amber-800 dark:text-amber-300 flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  {method === "sms"
                    ? "Make sure your phone number is verified before enabling SMS-based two-factor authentication."
                    : "Make sure your email address is verified before enabling email-based two-factor authentication."}
                </p>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <Button onClick={handleToggle2FA} disabled={isLoading} variant={isEnabled ? "destructive" : "default"}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEnabled ? "Disabling..." : "Enabling..."}
                </>
              ) : isEnabled ? (
                "Disable"
              ) : (
                "Enable"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
