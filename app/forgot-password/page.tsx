"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react"
import { isValidEmail } from "@/lib/auth-utils"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState("")
  const [codeSent, setCodeSent] = useState(false)
  const router = useRouter()

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate email
    if (!email) {
      setError("Please enter your email address")
      return
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address")
      return
    }

    setIsLoading(true)

    try {
      console.log("Sending verification code to:", email)

      const response = await fetch("/api/auth/send-verification-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: email,
          method: "email",
          purpose: "password-reset",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to send verification code")
      }

      setCodeSent(true)
      console.log("Verification code sent successfully")

      // If we're in development, we can show the code for testing
      if (process.env.NODE_ENV === "development" && data.previewCode) {
        console.log("Verification code:", data.previewCode)
      }
    } catch (err: any) {
      console.error("Error sending verification code:", err)
      setError(err.message || "Failed to send verification code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate code
    if (!verificationCode) {
      setError("Please enter the verification code")
      return
    }

    if (verificationCode.length !== 6 || !/^\d+$/.test(verificationCode)) {
      setError("Please enter a valid 6-digit verification code")
      return
    }

    setIsVerifying(true)

    try {
      console.log("Verifying code:", verificationCode)

      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: email,
          code: verificationCode,
          purpose: "password-reset",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to verify code")
      }

      if (data.success && data.token) {
        // Redirect to reset password page with the token
        router.push(`/reset-password?token=${data.token}`)
      } else {
        setError("Invalid verification code. Please try again.")
      }
    } catch (err: any) {
      console.error("Error verifying code:", err)
      setError(err.message || "Failed to verify code. Please try again.")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendCode = async () => {
    setError("")
    setIsLoading(true)

    try {
      console.log("Resending verification code to:", email)

      const response = await fetch("/api/auth/send-verification-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: email,
          method: "email",
          purpose: "password-reset",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend verification code")
      }

      // Show success message
      setError("A new verification code has been sent to your email.")
    } catch (err: any) {
      console.error("Error resending verification code:", err)
      setError(err.message || "Failed to resend verification code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12 sm:px-6 lg:px-8 text-white">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-white">Reset Your Password</CardTitle>
          {!codeSent ? (
            <p className="text-center text-gray-300 mt-2">
              We&apos;ll send you a verification code to reset your password
            </p>
          ) : (
            <p className="text-center text-gray-300 mt-2">
              Enter the 6-digit code sent to your email
              <br />
              {email.replace(/(.{2})(.*)(@.*)/, "$1*****$3")}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4 bg-red-900 border-red-800 text-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!codeSent ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-gray-300">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Verification Code"
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="code" className="text-gray-300">
                    Verification Code
                  </label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white text-center text-xl py-6"
                    required
                    maxLength={6}
                    pattern="[0-9]{6}"
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isVerifying}>
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Code"
                  )}
                </Button>
              </form>
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Resend Code"}
                </button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {codeSent ? (
            <button
              onClick={() => setCodeSent(false)}
              className="flex items-center text-sm text-blue-400 hover:text-blue-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Reset Options
            </button>
          ) : (
            <Link href="/login" className="flex items-center text-sm text-blue-400 hover:text-blue-300">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
