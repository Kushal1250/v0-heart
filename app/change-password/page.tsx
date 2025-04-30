"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Eye, EyeOff, ArrowLeft, Check, X } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { checkPasswordRequirements } from "@/lib/client-validation"

export default function ChangePasswordPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Password requirements state
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  })

  // Update password requirements check when password changes
  useEffect(() => {
    if (formData.newPassword) {
      setPasswordRequirements(checkPasswordRequirements(formData.newPassword))
    }
  }, [formData.newPassword])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    if (!formData.currentPassword) {
      setError("Current password is required")
      return false
    }

    if (!formData.newPassword) {
      setError("New password is required")
      return false
    }

    // Check all password requirements
    const requirements = checkPasswordRequirements(formData.newPassword)
    if (!requirements.minLength) {
      setError("Password must be at least 8 characters long")
      return false
    }

    if (!requirements.hasUppercase) {
      setError("Password must contain at least one uppercase letter (A-Z)")
      return false
    }

    if (!requirements.hasLowercase) {
      setError("Password must contain at least one lowercase letter (a-z)")
      return false
    }

    if (!requirements.hasNumber) {
      setError("Password must contain at least one number (0-9)")
      return false
    }

    if (!requirements.hasSpecialChar) {
      setError("Password must contain at least one special character (e.g., !@#$%^&*)")
      return false
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password")
      }

      setSuccess(true)
      toast({
        title: "Success",
        description: "Your password has been changed successfully",
      })

      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      // Redirect to profile after 2 seconds
      setTimeout(() => {
        router.push("/profile")
      }, 2000)
    } catch (error: any) {
      setError(error.message || "An error occurred while changing your password")
      toast({
        title: "Error",
        description: error.message || "An error occurred while changing your password",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>Your password has been changed successfully!</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="mt-1">
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                  Forgot Password?
                </Link>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password requirements checklist */}
              <div className="mt-2 space-y-1 text-sm">
                <p className="font-medium text-gray-700">Password must contain:</p>
                <ul className="space-y-1 pl-1">
                  <li className="flex items-center gap-2">
                    {passwordRequirements.minLength ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-gray-400" />
                    )}
                    <span className={passwordRequirements.minLength ? "text-green-600" : "text-gray-600"}>
                      At least 8 characters
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    {passwordRequirements.hasUppercase ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-gray-400" />
                    )}
                    <span className={passwordRequirements.hasUppercase ? "text-green-600" : "text-gray-600"}>
                      At least one uppercase letter (A–Z)
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    {passwordRequirements.hasLowercase ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-gray-400" />
                    )}
                    <span className={passwordRequirements.hasLowercase ? "text-green-600" : "text-gray-600"}>
                      At least one lowercase letter (a–z)
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    {passwordRequirements.hasNumber ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-gray-400" />
                    )}
                    <span className={passwordRequirements.hasNumber ? "text-green-600" : "text-gray-600"}>
                      At least one number (0–9)
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    {passwordRequirements.hasSpecialChar ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-gray-400" />
                    )}
                    <span className={passwordRequirements.hasSpecialChar ? "text-green-600" : "text-gray-600"}>
                      At least one special character (e.g., !@#$%^&*)
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Changing Password..." : "Change Password"}
            </Button>

            <div className="text-center">
              <Link
                href="/profile"
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Profile
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
