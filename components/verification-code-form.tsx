"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

interface VerificationCodeFormProps {
  phone?: string
  email?: string
  onSuccess: (code: string) => void
  onCancel?: () => void
  isLoggedIn?: boolean
}

export function VerificationCodeForm({
  phone,
  email,
  onSuccess,
  onCancel,
  isLoggedIn = false,
}: VerificationCodeFormProps) {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [method, setMethod] = useState<"sms" | "email" | null>(null)
  const [fallbackUsed, setFallbackUsed] = useState(false)

  const handleSendCode = async () => {
    if (!phone && !email) {
      setError("Phone number or email is required")
      return
    }

    setSendingCode(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/auth/send-verification-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          email,
          isLoggedIn,
          method: "auto", // Let the server decide the best method
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMethod(data.method)
        setFallbackUsed(data.fallbackUsed || false)

        if (data.fallbackUsed) {
          setSuccess(`SMS delivery failed, but we sent your code via email instead. Please check your email.`)
        } else {
          setSuccess(
            `Verification code sent via ${data.method === "sms" ? "SMS" : "email"}. ${
              data.method === "email" ? "Please check your inbox." : ""
            }`,
          )
        }
      } else {
        // Handle specific error cases
        if (data.message.includes("unverified") || data.message.includes("trial account")) {
          setError(
            "This phone number is not verified with our SMS provider. For security reasons, we can only send SMS to verified numbers during the trial period. Please try using email verification instead.",
          )
        } else {
          setError(data.message || "Failed to send verification code. Please try again.")
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setSendingCode(false)
    }
  }

  const handleVerify = async () => {
    if (!code) {
      setError("Please enter the verification code")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Call the onSuccess callback with the code
      // The parent component will handle the verification
      onSuccess(code)
    } catch (err) {
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="bg-green-50 border-green-200 text-green-800">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {!success && !method && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {phone
              ? `We'll send a verification code to ${phone}`
              : email
                ? `We'll send a verification code to ${email}`
                : "Please provide a phone number or email to receive a verification code"}
          </p>
          <Button onClick={handleSendCode} disabled={sendingCode || (!phone && !email)} className="w-full">
            {sendingCode ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Verification Code"
            )}
          </Button>
        </div>
      )}

      {method && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="code" className="text-sm font-medium">
              Verification Code
            </label>
            <Input
              id="code"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
            />
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleVerify} disabled={loading || !code} className="flex-1">
              {loading ? "Verifying..." : "Verify"}
            </Button>
            <Button variant="outline" onClick={handleSendCode} disabled={sendingCode} className="flex items-center">
              {sendingCode ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Resend Code"}
            </Button>
          </div>

          {onCancel && (
            <Button variant="ghost" onClick={onCancel} className="w-full">
              Cancel
            </Button>
          )}
        </div>
      )}

      {fallbackUsed && (
        <p className="text-sm text-amber-600">
          Note: We sent your code via email because SMS delivery failed. Please check your email inbox.
        </p>
      )}

      <div className="text-xs text-muted-foreground mt-4">
        <p>Having trouble?</p>
        <ul className="list-disc pl-4 mt-1 space-y-1">
          {phone && (
            <>
              <li>Make sure your phone number is entered correctly with country code</li>
              <li>Check if your phone can receive SMS messages</li>
            </>
          )}
          {email && (
            <>
              <li>Check your spam or junk folder</li>
              <li>Make sure your email address is entered correctly</li>
            </>
          )}
          <li>Try again in a few minutes</li>
        </ul>
      </div>
    </div>
  )
}
