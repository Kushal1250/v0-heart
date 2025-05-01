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
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2, ShieldCheck } from "lucide-react"
import { VerificationCodeForm } from "@/components/verification-code-form"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface TwoFactorModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  userEmail?: string
  userPhone?: string
}

export function TwoFactorModal({ isOpen, onClose, onSuccess, userEmail = "", userPhone = "" }: TwoFactorModalProps) {
  const [step, setStep] = useState<"select" | "verify">("select")
  const [method, setMethod] = useState<"email" | "sms">(userPhone ? "sms" : "email")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleMethodSelect = async () => {
    setLoading(true)
    setError(null)

    try {
      // Send verification code based on selected method
      const response = await fetch("/api/auth/send-verification-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: method === "email" ? userEmail : userPhone,
          method,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `Failed to send verification code to your ${method}`)
      }

      setSuccess(`Verification code sent to your ${method}`)
      setStep("verify")
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerificationSuccess = async (code: string) => {
    setLoading(true)
    setError(null)

    try {
      // First verify the code
      const verifyResponse = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otp: code,
          identifier: method === "email" ? userEmail : userPhone,
          isLoggedIn: true,
        }),
      })

      const verifyData = await verifyResponse.json()

      if (!verifyResponse.ok) {
        throw new Error(verifyData.message || "Verification failed")
      }

      // Then enable 2FA
      const enableResponse = await fetch("/api/user/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          twoFactorEnabled: true,
          twoFactorMethod: method,
        }),
      })

      const enableData = await enableResponse.json()

      if (!enableResponse.ok) {
        throw new Error(enableData.message || "Failed to enable two-factor authentication")
      }

      setSuccess("Two-factor authentication enabled successfully!")

      // Wait a moment before closing the modal
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1500)
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.")
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep("select")
    setError(null)
    setSuccess(null)
    setLoading(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            {step === "select"
              ? "Choose your preferred verification method"
              : "Enter the verification code to enable 2FA"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {step === "select" ? (
          <div className="py-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span className="font-medium">Select verification method:</span>
              </div>

              <RadioGroup value={method} onValueChange={(value) => setMethod(value as "email" | "sms")}>
                <div className="flex items-center space-x-2 rounded-md border p-3">
                  <RadioGroupItem value="email" id="email" disabled={!userEmail} />
                  <Label htmlFor="email" className={!userEmail ? "text-muted-foreground" : ""}>
                    Email ({userEmail || "Not available"})
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border p-3">
                  <RadioGroupItem value="sms" id="sms" disabled={!userPhone} />
                  <Label htmlFor="sms" className={!userPhone ? "text-muted-foreground" : ""}>
                    SMS ({userPhone || "Not available"})
                  </Label>
                </div>
              </RadioGroup>

              {!userPhone && method === "sms" && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please add a phone number in your profile before using SMS verification.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        ) : (
          <div className="py-4">
            <VerificationCodeForm
              phone={method === "sms" ? userPhone : undefined}
              email={method === "email" ? userEmail : undefined}
              onSuccess={handleVerificationSuccess}
              isLoggedIn={true}
            />
          </div>
        )}

        {step === "select" && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleMethodSelect}
              disabled={loading || (method === "sms" && !userPhone) || (method === "email" && !userEmail)}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
