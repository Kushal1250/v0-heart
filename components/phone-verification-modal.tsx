"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2, Phone } from "lucide-react"
import { VerificationCodeForm } from "@/components/verification-code-form"

interface PhoneVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  currentPhone?: string
}

export function PhoneVerificationModal({ isOpen, onClose, onSuccess, currentPhone = "" }: PhoneVerificationModalProps) {
  const [step, setStep] = useState<"update" | "verify">("update")
  const [phone, setPhone] = useState(currentPhone)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleUpdatePhone = async () => {
    if (!phone) {
      setError("Please enter a phone number")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/user/profile/update-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update phone number")
      }

      setSuccess("Phone number updated successfully")
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
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otp: code,
          identifier: phone,
          isLoggedIn: true,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Verification failed")
      }

      setSuccess("Phone verified successfully!")

      // Wait a moment before closing the modal
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1500)
    } catch (err: any) {
      setError(err.message || "Verification failed. Please try again.")
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep("update")
    setError(null)
    setSuccess(null)
    setLoading(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{step === "update" ? "Update Phone Number" : "Verify Phone Number"}</DialogTitle>
          <DialogDescription>
            {step === "update"
              ? "Enter your phone number to receive verification code"
              : "Enter the verification code sent to your phone"}
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

        {step === "update" ? (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <div className="col-span-3 flex items-center">
                <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4">
            <VerificationCodeForm phone={phone} onSuccess={handleVerificationSuccess} isLoggedIn={true} />
          </div>
        )}

        {step === "update" && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePhone} disabled={loading || !phone}>
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
