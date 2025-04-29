"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { verifyOTPAction, resendVerificationAction } from "@/app/auth/actions"

export default function OTPVerificationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const identifier = searchParams.get("identifier") || ""
  const method = (searchParams.get("method") as "email" | "sms") || "email"
  const redirectUrl = searchParams.get("redirectUrl") || "/reset-password-profile"

  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    if (!identifier) {
      router.push("/forgot-password-profile")
    }
  }, [identifier, router])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0 && !canResend) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    } else {
      setCanResend(true)
    }
    return () => clearTimeout(timer)
  }, [countdown, canResend])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setLoading(true)

    try {
      const result = await verifyOTPAction(identifier, otp)

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push(`${redirectUrl}?token=${result.token}`)
        }, 1500)
      } else {
        setError(result.message || "Invalid verification code. Please try again.")
      }
    } catch (err) {
      setError("An error occurred during verification. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    setResendSuccess(false)
    setError("")

    try {
      const result = await resendVerificationAction(identifier, method)

      if (result.success) {
        setResendSuccess(true)
        setCountdown(60)
        setCanResend(false)
      } else {
        setError(result.message || "Failed to resend verification code. Please try again.")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error(err)
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Verification Code</CardTitle>
          <CardDescription className="text-center">
            {method === "email"
              ? `We've sent a verification code to your email ${identifier}`
              : `We've sent a verification code to your phone ${identifier}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                Enter Verification Code
              </label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
                maxLength={6}
                pattern="\d{6}"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>Verification successful! Redirecting...</AlertDescription>
              </Alert>
            )}

            {resendSuccess && (
              <Alert>
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  {method === "email"
                    ? "A new verification code has been sent to your email."
                    : "A new verification code has been sent to your phone."}
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
              {loading ? "Verifying..." : "Verify"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-center text-sm">
            <p className="text-gray-600">Didn't receive the code?</p>
            {canResend ? (
              <Button variant="link" onClick={handleResend} disabled={resendLoading}>
                {resendLoading ? "Sending..." : "Resend Code"}
              </Button>
            ) : (
              <p className="text-gray-500">Resend code in {countdown} seconds</p>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
