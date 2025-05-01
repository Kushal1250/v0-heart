"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle2, Shield } from "lucide-react"
import { PhoneVerificationModal } from "@/components/phone-verification-modal"
import { TwoFactorModal } from "@/components/two-factor-modal"
import { useAuth } from "@/hooks/use-auth"

interface SecuritySettingsProps {
  className?: string
}

export function SecuritySettings({ className }: SecuritySettingsProps) {
  const { user } = useAuth()
  const { toast } = useToast()

  const [settings, setSettings] = useState({
    twoFactorEnabled: false,
    twoFactorMethod: "email",
    emailVerified: true,
    phoneVerified: false,
  })

  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false)
  const [isTwoFactorModalOpen, setIsTwoFactorModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch user settings
    const fetchSettings = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/user/settings")

        if (response.ok) {
          const data = await response.json()
          setSettings({
            twoFactorEnabled: data.twoFactorEnabled || false,
            twoFactorMethod: data.twoFactorMethod || "email",
            emailVerified: data.emailVerified || true,
            phoneVerified: data.phoneVerified || false,
          })
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handlePhoneVerificationSuccess = () => {
    setSettings((prev) => ({
      ...prev,
      phoneVerified: true,
    }))

    toast({
      title: "Phone verified",
      description: "Your phone number has been successfully verified.",
    })
  }

  const handleTwoFactorSuccess = () => {
    setSettings((prev) => ({
      ...prev,
      twoFactorEnabled: true,
    }))

    toast({
      title: "Two-factor authentication enabled",
      description: "Your account is now more secure with two-factor authentication.",
    })
  }

  const handleDisableTwoFactor = async () => {
    try {
      const response = await fetch("/api/user/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          twoFactorEnabled: false,
        }),
      })

      if (response.ok) {
        setSettings((prev) => ({
          ...prev,
          twoFactorEnabled: false,
        }))

        toast({
          title: "Two-factor authentication disabled",
          description: "Two-factor authentication has been turned off.",
        })
      } else {
        throw new Error("Failed to disable two-factor authentication")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disable two-factor authentication. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Shield className="h-5 w-5" /> Security Settings
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Manage your account security and verification settings</p>
        </div>

        {/* Two-Factor Authentication */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Two-Factor Authentication</h4>
              <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
            </div>
            <div>
              {settings.twoFactorEnabled ? (
                <div className="flex items-center gap-2">
                  <span className="text-green-600 text-sm font-medium flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Enabled
                  </span>
                  <Button variant="outline" size="sm" onClick={handleDisableTwoFactor}>
                    Disable
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setIsTwoFactorModalOpen(true)}>Enable</Button>
              )}
            </div>
          </div>
        </div>

        {/* Email Verification */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Email Verification</h4>
              <p className="text-sm text-muted-foreground">Verify your email address</p>
            </div>
            <div>
              {settings.emailVerified ? (
                <span className="text-green-600 font-medium flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Verified
                </span>
              ) : (
                <Button variant="outline" size="sm">
                  Verify Email
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Phone Verification */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Phone Verification</h4>
              <p className="text-sm text-muted-foreground">Verify your phone number</p>
            </div>
            <div>
              {settings.phoneVerified ? (
                <span className="text-green-600 font-medium flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Verified
                </span>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsPhoneModalOpen(true)}>
                  Verify Phone
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Phone Verification Modal */}
      <PhoneVerificationModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        onSuccess={handlePhoneVerificationSuccess}
        currentPhone={user?.phone || ""}
      />

      {/* Two-Factor Authentication Modal */}
      <TwoFactorModal
        isOpen={isTwoFactorModalOpen}
        onClose={() => setIsTwoFactorModalOpen(false)}
        onSuccess={handleTwoFactorSuccess}
        userEmail={user?.email || ""}
        userPhone={user?.phone || ""}
      />
    </div>
  )
}
