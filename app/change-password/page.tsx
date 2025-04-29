"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Eye, EyeOff, ArrowLeft, AlertTriangle } from "lucide-react"
import { verifyPasswordResetToken } from "@/lib/token"
import { getUserById } from "@/lib/data"

export default function ChangePasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tokenVerified, setTokenVerified] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [dbConnectionError, setDbConnectionError] = useState(false)
  let hasToken = false

  // Verify token and pre-fill current password if token is valid
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) return

      try {
        setLoading(true)
        // If token is provided, verify it
        if (token) {
          const userId = await verifyPasswordResetToken(token)
          if (!userId) {
            return (
              <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
                  <h1 className="text-2xl font-bold text-center mb-6">Invalid or Expired Token</h1>
                  <p className="text-center mb-4">The password reset token is invalid or has expired.</p>
                  <div className="flex justify-center">
                    <Link href="/forgot-password" className="text-blue-600 hover:underline">
                      Request a new password reset
                    </Link>
                  </div>
                </div>
              </div>
            )
          }

          // Get user from database
          const user = await getUserById(userId)
          if (!user) {
            return (
              <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
                  <h1 className="text-2xl font-bold text-center mb-6">User Not Found</h1>
                  <p className="text-center mb-4">We couldn't find your account.</p>
                  <div className="flex justify-center">
                    <Link href="/login" className="text-blue-600 hover:underline">
                      Return to login
                    </Link>
                  </div>
                </div>
              </div>
            )
          }

          // Set hasToken to true
          hasToken = true
        }

        // Token is valid, pre-fill current password with a placeholder
        // The actual password will be used on the server side
        setCurrentPassword("••••••••••••")
        setTokenVerified(true)
      } catch (err: any) {
        console.error("Token verification error:", err)
        if (err.message && err.message.includes("database connection")) {
          setDbConnectionError(true)
          setError("Database connection error. Please try again later.")
        } else {
          setError("An error occurred while verifying your token.")
        }
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      verifyToken()
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if ((!currentPassword && !tokenVerified) || !newPassword || !confirmPassword) {
      setError("All fields are required")
      return
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }

    setLoading(true)
    setError("")

    try {
      // If we have a token, use the token-based password reset endpoint
      const endpoint = token ? "/api/auth/reset-password" : "/api/user/change-password"

      const payload = token ? { token, newPassword } : { currentPassword, newPassword }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.message && data.message.includes("database connection")) {
          setDbConnectionError(true)
          setError("Database connection error. Please try again later.")
        } else {
          setError(data.message || "Failed to change password")
        }
        setLoading(false)
        return
      }

      setSuccess(true)

      // Redirect after a short delay
      setTimeout(() => {
        router.push(token ? "/login" : "/profile")
      }, 2000)
    } catch (err: any) {
      console.error("Password change error:", err)
      if (err.message && err.message.includes("database connection")) {
        setDbConnectionError(true)
        setError("Database connection error. Please try again later.")
      } else {
        setError("An error occurred. Please try again.")
      }
      setLoading(false)
    }
  }

  // If there's a database connection error, show a special error message
  if (dbConnectionError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <Card className="w-full max-w-md shadow-lg border-red-200">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold flex items-center text-red-600">
              <AlertTriangle className="mr-2 h-6 w-6" />
              Database Connection Error
            </CardTitle>
            <CardDescription>
              We're having trouble connecting to our database. This is likely a temporary issue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>
                No database connection string was provided. Please contact support if this issue persists.
              </AlertDescription>
            </Alert>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Try the following:</p>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                <li>Refresh the page</li>
                <li>Clear your browser cache</li>
                <li>Try again later</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/profile")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Button>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="text-sm font-medium">
                Current Password
              </label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pr-10"
                  disabled={loading || tokenVerified}
                  required={!tokenVerified}
                />
                {!tokenVerified && (
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                )}
              </div>
              {!token && (
                <div className="text-right text-sm">
                  <Link href="/forgot-password-profile" className="text-blue-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <AlertDescription>Password changed successfully!</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? "Changing Password..." : "Change Password"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link
            href={token ? "/login" : "/profile"}
            className="flex items-center text-sm text-blue-600 hover:underline"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            {token ? "Back to Login" : "Back to Profile"}
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
