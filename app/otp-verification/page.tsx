"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function OTPVerificationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const identifier = searchParams?.get("identifier") || ""
  const method = searchParams?.get("method") || "email"
  const redirectTo = searchParams?.get("redirectTo") || ""

  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Mask the identifier for display
  const maskedIdentifier = useMemo(() => {
    if (!identifier) return ""

    if (method === "email") {
      const [username, domain] = identifier.split("@")
      if (!username || !domain) return identifier

      const maskedUsername =
        username.length > 2 ? `${username.substring(0, 2)}${"*".repeat(username.length - 2)}` : username

      return `${maskedUsername}@${domain}`
    } else {
      // For phone numbers
      return identifier.slice(0, 3) + "*".repeat(identifier.length - 6) + identifier.slice(-3)
    }
  }, [identifier, method])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!otp || otp.length !== 6) {
        setError("Please enter a valid 6-digit verification code")
        setLoading(false)
        return
      }

      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier,
          otp,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(true)
        setLoading(false)

        // Redirect after a short delay
        setTimeout(() => {
          if (redirectTo) {
            router.push(redirectTo)
          } else {
            router.push("/reset-password?token=" + data.token)
          }
        }, 1500)
      } else {
        setError(data.message || "Invalid verification code. Please try again.")
        setLoading(false)
      }
    } catch (err: any) {
      console.error("Error verifying code:", err)
      setError(err.message || "An error occurred while verifying the code. Please try again.")
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/resend-verification-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier,
          method,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setLoading(false)
        setError(`Verification code resent to your ${method === "email" ? "email" : "phone"}`)
      } else {
        setLoading(false)
        setError(data.message || "Failed to resend verification code. Please try again.")
      }
    } catch (err: any) {
      console.error("Error resending code:", err)
      setError(err.message || "An error occurred while resending the code. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4 py-12 sm:px-6 lg:px-8 text-white">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-white">Verification Code</CardTitle>
          <CardDescription className="text-center text-gray-300">
            {method === "email"
              ? `Enter the 6-digit code sent to your email ${maskedIdentifier}`
              : `Enter the 6-digit code sent to your phone ${maskedIdentifier}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="otp" className="block text-sm font-medium text-gray-300">
                Verification Code
              </label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="block w-full bg-gray-700 border-gray-600 text-white text-center text-xl tracking-widest"
                required
              />
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-900 border-red-800 text-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-900 border-green-800 text-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>Verification successful! Redirecting...</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col space-y-2">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading || otp.length !== 6}
              >
                {loading ? "Verifying..." : "Verify Code"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-blue-400 hover:text-blue-300"
                onClick={handleResendCode}
                disabled={loading}
              >
                Resend Code
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" className="text-blue-400 hover:text-blue-300" asChild>
            <Link href="/forgot-password" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Reset Options
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
