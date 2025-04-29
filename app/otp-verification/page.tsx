"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Check, X } from "lucide-react"

export default function OTPVerificationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const identifier = searchParams.get("identifier") || ""
  const method = "email"

  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)

  // Password change states
  const [isVerified, setIsVerified] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Password validation states
  const hasMinLength = password.length >= 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const passwordsMatch = password === confirmPassword && password !== ""

  useEffect(() => {
    if (!identifier) {
      router.push("/forgot-password")
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
      console.log("Verifying OTP:", otp, "for identifier:", identifier)

      // Make sure the OTP is exactly 6 digits
      if (!/^\d{6}$/.test(otp)) {
        setError("Please enter a valid 6-digit verification code")
        setLoading(false)
        return
      }

      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier,
          code: otp,
        }),
      })

      const result = await response.json()
      console.log("Verification result:", result)

      if (response.ok && result.success) {
        setSuccess(true)
        setIsVerified(true)
        setError("") // Clear any previous errors
      } else {
        setError(result.message || "Invalid verification code. Please try again.")
      }
    } catch (err) {
      console.error("Error during verification:", err)
      setError("An error occurred during verification. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    setResendSuccess(false)
    setError("")

    try {
      const response = await fetch("/api/auth/send-verification-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier,
          method,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setResendSuccess(true)
        setCountdown(60)
        setCanResend(false)
        setError("") // Clear any previous errors
      } else {
        setError(result.message || "Failed to resend verification code. Please try again.")
      }
    } catch (err) {
      console.error("Error resending code:", err)
      setError("An error occurred. Please try again.")
    } finally {
      setResendLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")
    setPasswordSuccess(false)

    // Validate password
    if (!hasMinLength || !hasUpperCase || !hasLowerCase || !hasNumber) {
      setPasswordError("Please ensure your password meets all requirements")
      return
    }

    // Check if passwords match
    if (!passwordsMatch) {
      setPasswordError("Passwords do not match")
      return
    }

    setPasswordLoading(true)

    try {
      // Call API to change password
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier,
          newPassword: password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setPasswordSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        setPasswordError(data.message || "Failed to change password. Please try again.")
      }
    } catch (err) {
      console.error("Error changing password:", err)
      setPasswordError("An error occurred. Please try again.")
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            {isVerified ? "Set New Password" : "Verification Code"}
          </CardTitle>
          <CardDescription className="text-center">
            {!isVerified && `We've sent a verification code to your email ${identifier}`}
            {isVerified && "Please create a new secure password for your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isVerified ? (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="otp" className="block text-sm font-medium">
                  Enter Verification Code
                </label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                  className="block w-full"
                  required
                  maxLength={6}
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
                  <AlertDescription>Verification successful! Please set your new password.</AlertDescription>
                </Alert>
              )}

              {resendSuccess && (
                <Alert>
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>A new verification code has been sent to your email.</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                {loading ? "Verifying..." : "Verify"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  New password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="mt-1 block w-full"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Password requirements:</p>
                  <ul className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                    <li className="flex items-center">
                      {hasMinLength ? (
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <X className="h-4 w-4 text-gray-300 mr-2" />
                      )}
                      At least 8 characters
                    </li>
                    <li className="flex items-center">
                      {hasUpperCase ? (
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <X className="h-4 w-4 text-gray-300 mr-2" />
                      )}
                      At least one uppercase letter
                    </li>
                    <li className="flex items-center">
                      {hasLowerCase ? (
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <X className="h-4 w-4 text-gray-300 mr-2" />
                      )}
                      At least one lowercase letter
                    </li>
                    <li className="flex items-center">
                      {hasNumber ? (
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <X className="h-4 w-4 text-gray-300 mr-2" />
                      )}
                      At least one number
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium">
                  Confirm new password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="mt-1 block w-full"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <div className="mt-1 flex items-center">
                  {confirmPassword && (
                    <>
                      {passwordsMatch ? (
                        <span className="text-sm text-green-500 flex items-center">
                          <Check className="h-4 w-4 mr-1" /> Passwords match
                        </span>
                      ) : (
                        <span className="text-sm text-red-500 flex items-center">
                          <X className="h-4 w-4 mr-1" /> Passwords do not match
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {passwordError && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}

              {passwordSuccess && (
                <Alert>
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>Password changed successfully! Redirecting to login...</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={
                  passwordLoading || !passwordsMatch || !hasMinLength || !hasUpperCase || !hasLowerCase || !hasNumber
                }
              >
                {passwordLoading ? "Changing password..." : "Change password"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {!isVerified && (
            <div className="text-center text-sm">
              <p className="text-gray-600 dark:text-gray-400">Didn't receive the code?</p>
              {canResend ? (
                <Button variant="link" onClick={handleResend} disabled={resendLoading}>
                  {resendLoading ? "Sending..." : "Resend Code"}
                </Button>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Resend code in {countdown} seconds</p>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
