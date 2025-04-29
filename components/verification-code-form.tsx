"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

interface VerificationCodeFormProps {
  identifier?: string
  method?: "email" | "sms"
  onVerified?: () => void
  redirectUrl?: string
}

export function VerificationCodeForm({
  identifier = "",
  method = "email",
  onVerified,
  redirectUrl,
}: VerificationCodeFormProps) {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [resendDisabled, setResendDisabled] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [localIdentifier, setLocalIdentifier] = useState(identifier)
  const [localMethod, setLocalMethod] = useState<"email" | "sms">(method)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false)
    }
  }, [countdown, resendDisabled])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!localIdentifier) {
      setError("Email or phone number is required")
      return
    }

    if (!code) {
      setError("Please enter the verification code")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: localIdentifier,
          code,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to verify code")
      }

      setSuccess("Verification successful!")

      // Call onVerified callback if provided
      if (onVerified) {
        onVerified()
      }

      // Redirect if URL is provided
      if (redirectUrl) {
        router.push(redirectUrl)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to verify code")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendCode = async () => {
    setError("")
    setSuccess("")

    if (!localIdentifier) {
      setError("Email or phone number is required")
      return
    }

    setResendDisabled(true)
    setCountdown(60) // Disable resend for 60 seconds

    try {
      const response = await fetch("/api/auth/resend-verification-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: localIdentifier,
          method: localMethod,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend code")
      }

      setSuccess(`Verification code resent to your ${localMethod}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to resend code")
      setResendDisabled(false)
      setCountdown(0)
    }
  }

  return (
    <div className="space-y-4">
      {!identifier && (
        <div className="space-y-2">
          <Label htmlFor="identifier">Email or Phone Number</Label>
          <Input
            id="identifier"
            type={localMethod === "email" ? "email" : "tel"}
            value={localIdentifier}
            onChange={(e) => setLocalIdentifier(e.target.value)}
            placeholder={localMethod === "email" ? "Enter your email" : "Enter your phone number"}
            required
          />
          <div className="flex space-x-2">
            <Button
              type="button"
              variant={localMethod === "email" ? "default" : "outline"}
              size="sm"
              onClick={() => setLocalMethod("email")}
            >
              Email
            </Button>
            <Button
              type="button"
              variant={localMethod === "sms" ? "default" : "outline"}
              size="sm"
              onClick={() => setLocalMethod("sms")}
            >
              SMS
            </Button>
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code">Verification Code</Label>
          <Input
            id="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 6-digit code"
            required
          />
        </div>

        <div className="flex flex-col space-y-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Verifying..." : "Verify Code"}
          </Button>
          <Button type="button" variant="outline" disabled={resendDisabled} onClick={handleResendCode} className="mt-2">
            {resendDisabled ? `Resend Code (${countdown}s)` : "Resend Code"}
          </Button>
        </div>
      </form>
    </div>
  )
}
