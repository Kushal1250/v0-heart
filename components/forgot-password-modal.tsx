"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, Mail, KeyRound, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

type ForgotPasswordModalProps = {
  isOpen: boolean
  onClose: () => void
  email?: string
}

export function ForgotPasswordModal({ isOpen, onClose, email = "" }: ForgotPasswordModalProps) {
  const [step, setStep] = useState(1)
  const [userEmail, setUserEmail] = useState(email)
  const [verificationCode, setVerificationCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const handleSendCode = async () => {
    setError("")
    if (!userEmail) {
      setError("Please enter your email address")
      return
    }

    setIsLoading(true)
    try {
      // Use the direct API endpoint for sending verification codes
      const response = await fetch("/api/auth/send-verification-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: userEmail,
          method: "email",
          purpose: "password_reset",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("Server error response:", data)
        throw new Error(data.message || "Failed to send verification code")
      }

      toast({
        title: "Verification code sent",
        description: "Please check your email for the verification code",
      })

      setStep(2)
    } catch (err: any) {
      console.error("Error sending verification code:", err)
      setError(
        err.message || "An unexpected error occurred while sending the verification email. Please try again later.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    setError("")
    if (!verificationCode) {
      setError("Please enter the verification code")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: userEmail,
          code: verificationCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to verify code")
      }

      setStep(3)
    } catch (err: any) {
      console.error("Error verifying code:", err)
      setError(err.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    setError("")
    if (!newPassword) {
      setError("Please enter a new password")
      return
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          password: newPassword,
          code: verificationCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password")
      }

      toast({
        title: "Password reset successful",
        description: "Your password has been reset successfully",
      })

      // Reset form and close modal
      setStep(1)
      setUserEmail("")
      setVerificationCode("")
      setNewPassword("")
      setConfirmPassword("")
      onClose()
    } catch (err: any) {
      console.error("Error resetting password:", err)
      setError(err.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setStep(1)
    setError("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#0f1729] text-white border-gray-800">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription className="text-gray-400">
            {step === 1 && "Enter your email address to receive a verification code."}
            {step === 2 && "Enter the verification code sent to your email."}
            {step === 3 && "Create a new password for your account."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4 bg-transparent border border-red-800 text-red-500">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10 bg-[#1a2236] border-gray-700 text-white"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSendCode}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Code"
                )}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-gray-300">
                Verification Code
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="code"
                  placeholder="123456"
                  className="pl-10 bg-[#1a2236] border-gray-700 text-white text-center text-lg py-6"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
              </div>
              <p className="text-sm text-gray-400">
                Enter the 6-digit code sent to {userEmail}.{" "}
                <button
                  type="button"
                  className="text-blue-400 hover:text-blue-300"
                  onClick={handleSendCode}
                  disabled={isLoading}
                >
                  Resend code
                </button>
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleVerifyCode}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Code"
                )}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-gray-300">
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                className="bg-[#1a2236] border-gray-700 text-white"
              />
              <p className="text-xs text-gray-400">Password must be at least 8 characters long.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-300">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-[#1a2236] border-gray-700 text-white"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleResetPassword}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" /> Reset Password
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
