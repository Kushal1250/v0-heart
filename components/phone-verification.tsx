"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Loader2, XCircle } from "lucide-react"

export function PhoneVerification() {
  const [isOpen, setIsOpen] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const handleSendCode = async () => {
    if (!phoneNumber || phoneNumber.trim() === "") {
      setError("Please enter a valid phone number")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/verification/send-verification-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber, method: "sms" }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to send verification code")
      }

      setCodeSent(true)
      toast({
        title: "Verification code sent",
        description: "Please check your phone for the verification code",
      })
    } catch (err) {
      console.error("Error sending verification code:", err)
      setError(err instanceof Error ? err.message : "Failed to send verification code")
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to send verification code",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.trim() === "") {
      setError("Please enter the verification code")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/verification/verify-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber, code: verificationCode }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to verify code")
      }

      toast({
        title: "Phone verified",
        description: "Your phone number has been successfully verified",
      })

      // Close the dialog and refresh the page to update the UI
      setIsOpen(false)
      window.location.reload()
    } catch (err) {
      console.error("Error verifying code:", err)
      setError(err instanceof Error ? err.message : "Failed to verify code")
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to verify code",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)} className="w-full md:w-auto">
        Verify Phone
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Phone Verification</AlertDialogTitle>
            <AlertDialogDescription>
              {!codeSent
                ? "Enter your phone number to receive a verification code."
                : "Enter the verification code sent to your phone."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {error && (
            <div className="flex items-center gap-2 text-red-500 mb-4">
              <XCircle className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!codeSent ? (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="phone" className="text-right text-sm font-medium col-span-1">
                  Phone
                </label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="code" className="text-right text-sm font-medium col-span-1">
                  Code
                </label>
                <Input
                  id="code"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            {!codeSent ? (
              <Button onClick={handleSendCode} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Code"
                )}
              </Button>
            ) : (
              <Button onClick={handleVerifyCode} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
