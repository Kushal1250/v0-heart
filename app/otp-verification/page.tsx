"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, CheckCircle } from "lucide-react"

export default function OTPVerificationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const identifier = searchParams?.get("identifier") || ""
  const method = searchParams?.get("method") || "email"

  const [verificationCode, setVerificationCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [maskedIdentifier, setMaskedIdentifier] = useState("")

  useEffect(() => {
    if (identifier) {
      // Create a masked version of the identifier for display
      if (method === "email" && identifier.includes("@")) {
        const [username, domain] = identifier.split("@")
        const maskedUsername = username.substring(0, 2) + "*".repeat(username.length - 2)
        setMaskedIdentifier(`${maskedUsername}@${domain}`)
      } else {
        // For phone numbers or other identifiers
        const visiblePart = identifier.substring(0, 3)
        const hiddenPart = "*".repeat(identifier.length - 3)
        setMaskedIdentifier(`${visiblePart}${hiddenPart}`)
      }
    }
  }, [identifier, method])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setLoading(true)

    if (!verificationCode.trim()) {
      setError("Please enter the verification code")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier,
          code: verificationCode.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(true)
        setLoading(false)

        // Redirect to reset password page with token
        setTimeout(() => {
          router.push(`/reset-password?token=${data.token}`)
        }, 1500)
      } else {
        setLoading(false)
        setError(data.message || "Failed to verify code. Please try again.")
      }
    } catch (err: any) {
      console.error("Error verifying code:", err)
      setLoading(false)
      setError("An error occurred while verifying the code. Please try again.")
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
        // Show a temporary success message
        setError("")
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setLoading(false)
        setError(data.message || "Failed to resend code. Please try again.")
      }
    } catch (err: any) {
      console.error("Error resending code:", err)
      setLoading(false)
      setError("An error occurred while resending the code. Please try again.")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4 py-12 sm:px-6 lg:px-8 text-white">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-white">Verification Code</CardTitle>
          <CardDescription className="text-center text-gray-300">
            Enter the 6-digit code sent to your {method === "email" ? "email" : "phone"}
            <div className="mt-1 font-medium text-gray-200">{maskedIdentifier}</div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-300">
                Verification Code
              </label>
              <Input
                id="verificationCode"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ""))}
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
                <AlertDescription>{loading ? "Redirecting..." : "Code verified successfully!"}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading || verificationCode.length !== 6}
            >
              {loading ? "Verifying..." : "Verify Code"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button
              variant="link"
              className="text-blue-400 hover:text-blue-300"
              onClick={handleResendCode}
              disabled={loading}
            >
              Resend Code
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" className="text-blue-400 hover:text-blue-300 flex items-center gap-1" asChild>
            <Link href="/forgot-password">
              <ArrowLeft className="h-4 w-4" />
              Back to Reset Options
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
