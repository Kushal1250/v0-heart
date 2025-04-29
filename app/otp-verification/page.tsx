"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function OTPVerificationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const phone = searchParams.get("phone")
  const isProfile = searchParams.get("profile") === "true"
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [verificationMethod, setVerificationMethod] = useState<"email" | "sms">(phone ? "sms" : "email")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Focus the first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(0, 1)
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus()
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text")

    // Check if pasted content is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("")
      setOtp(digits)

      // Focus the last input
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus()
      }
    }
  }

  const handleVerify = async () => {
    const otpValue = otp.join("")

    if (otpValue.length !== 6) {
      setError("Please enter all 6 digits of the verification code")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          phone,
          code: otpValue,
          isProfile,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Verification failed")
        setLoading(false)
        return
      }

      // Redirect based on the response
      if (isProfile) {
        router.push(`/reset-password-profile?token=${data.token}`)
      } else {
        router.push(`/reset-password?token=${data.token}`)
      }
    } catch (err) {
      setError("An error occurred during verification")
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!canResend) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/resend-verification-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          phone,
        }),
      })

      const data = await response.json()

      if (data.method) {
        setVerificationMethod(data.method as "email" | "sms")
      }

      // Reset countdown
      setCountdown(60)
      setCanResend(false)

      // Start countdown again
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            setCanResend(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err) {
      setError("Failed to resend verification code")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Verification Code</CardTitle>
          <CardDescription>
            {verificationMethod === "sms"
              ? `Enter the 6-digit code sent to your phone ${phone ? `(${phone})` : ""}`
              : `Enter the 6-digit code sent to your email ${email ? `(${email})` : ""}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between gap-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="h-12 w-12 text-center text-lg"
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button onClick={handleVerify} className="w-full" disabled={loading || otp.join("").length !== 6}>
            {loading ? "Verifying..." : "Verify Code"}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <div className="text-sm text-gray-500">
            {canResend ? (
              <Button variant="link" onClick={handleResend} disabled={loading}>
                Resend verification code
              </Button>
            ) : (
              <span>Resend code in {countdown} seconds</span>
            )}
          </div>
          <div className="mt-4">
            <Link href={isProfile ? "/profile" : "/login"} className="text-sm text-blue-600 hover:underline">
              {isProfile ? "Back to Profile" : "Back to Login"}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
