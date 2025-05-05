"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Mail, Lock, Phone, ArrowRight, AlertCircle, CheckCircle, X, Check, Eye, EyeOff } from "lucide-react"
import { checkPasswordRequirements } from "@/lib/client-validation"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({})
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  // Update password requirements as user types
  useEffect(() => {
    if (password) {
      setPasswordRequirements(checkPasswordRequirements(password))
    } else {
      setPasswordRequirements({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false,
      })
    }
  }, [password])

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setFieldErrors({})

    // Enhanced validation
    if (!name.trim()) {
      setFieldErrors((prev) => ({ ...prev, name: "Full name is required" }))
      return
    }

    if (!email.trim()) {
      setFieldErrors((prev) => ({ ...prev, email: "Email address is required" }))
      return
    }

    if (!phone.trim()) {
      setFieldErrors((prev) => ({ ...prev, phone: "Phone number is required" }))
      return
    }

    // Check all password requirements
    const requirements = checkPasswordRequirements(password)
    if (!Object.values(requirements).every(Boolean)) {
      setFieldErrors((prev) => ({ ...prev, password: "Password does not meet all requirements" }))
      return
    }

    if (password !== confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }))
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, phone }),
      })

      // Get the response data regardless of status
      let data
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        try {
          data = await response.json()
        } catch (jsonError) {
          console.error("Error parsing JSON response:", jsonError)
          throw new Error("Invalid response from server")
        }
      } else {
        const textResponse = await response.text()
        console.error("Non-JSON response:", textResponse)
        throw new Error("Server returned non-JSON response")
      }

      // Check if the response is ok
      if (!response.ok) {
        // Handle field-specific errors
        if (response.status === 409 && data.field) {
          setFieldErrors((prev) => ({ ...prev, [data.field]: data.message }))
        } else {
          // Use the error message from the response if available
          const errorMessage = data?.message || `Signup failed: ${response.statusText || "Server error"}`
          throw new Error(errorMessage)
        }
        return
      }

      // Show success message before redirecting
      setSuccess("Account created successfully! Redirecting to dashboard...")

      // Delay redirect for animation
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (err: any) {
      console.error("Signup error:", err)
      setError(err.message || "An unexpected error occurred during signup")
    } finally {
      setIsLoading(false)
    }
  }

  // Password requirement item component
  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className="flex items-center space-x-2 text-sm">
      {met ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-gray-400" />}
      <span className={met ? "text-green-500" : "text-gray-400"}>{text}</span>
    </div>
  )

  const handleSocialLogin = (provider: string) => {
    window.location.href = `/api/auth/${provider}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center justify-center">
            <span className="sr-only">HeartPredict</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-primary animate-pulse-once"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 0.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </Link>
          <h2 className="mt-8 text-3xl font-extrabold text-white animate-slide-down">Create your account</h2>
          <p className="mt-3 text-sm text-gray-300 animate-slide-down" style={{ animationDelay: "0.1s" }}>
            Or{" "}
            <Link href="/login" className="font-medium text-primary hover:text-primary/80">
              sign in to your existing account
            </Link>
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="my-5 animate-slide-up error-message">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="my-5 animate-slide-up success-message bg-[hsl(var(--success))] text-white">
            <CheckCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="bg-black py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-800 animate-slide-up card-hover">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="form-group">
              <Label htmlFor="name" className="form-label text-white">
                Full name
              </Label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className={`form-input pl-20 bg-gray-900 border-gray-700 text-white placeholder-gray-400 ${
                    fieldErrors.name
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "focus:border-primary focus:ring-primary"
                  }`}
                  style={{ caretColor: "white", color: "white" }}
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    e.target.style.color = "white"
                  }}
                />
              </div>
              {fieldErrors.name && <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>}
            </div>

            <div className="form-group">
              <Label htmlFor="email" className="form-label text-white">
                Email address
              </Label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`form-input pl-20 bg-gray-900 border-gray-700 text-white placeholder-gray-400 ${
                    fieldErrors.email
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "focus:border-primary focus:ring-primary"
                  }`}
                  style={{ caretColor: "white", color: "white" }}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    e.target.style.color = "white"
                  }}
                />
              </div>
              {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
            </div>

            <div className="form-group">
              <Label htmlFor="phone" className="form-label text-white">
                Phone number
              </Label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  className={`form-input pl-20 bg-gray-900 border-gray-700 text-white placeholder-gray-400 ${
                    fieldErrors.phone
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "focus:border-primary focus:ring-primary"
                  }`}
                  style={{ caretColor: "white", color: "white" }}
                  placeholder="+1 (555) 123-4567"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    e.target.style.color = "white"
                  }}
                />
              </div>
              {fieldErrors.phone && <p className="mt-1 text-xs text-red-500">{fieldErrors.phone}</p>}
            </div>

            <div className="form-group">
              <Label htmlFor="password" className="form-label text-white">
                Password
              </Label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className={`form-input pl-20 bg-gray-900 border-gray-700 text-white placeholder-gray-400 ${
                    fieldErrors.password
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "focus:border-primary focus:ring-primary"
                  }`}
                  style={{ caretColor: "white", color: "white" }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    e.target.style.color = "white"
                  }}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {fieldErrors.password && <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>}

              <div className="mt-3 p-3 bg-gray-900 rounded-md border border-gray-700">
                <p className="text-sm font-medium text-gray-300 mb-2">Password must contain:</p>
                <div className="space-y-1">
                  <PasswordRequirement met={passwordRequirements.minLength} text="At least 8 characters" />
                  <PasswordRequirement
                    met={passwordRequirements.hasUppercase}
                    text="At least one uppercase letter (A–Z)"
                  />
                  <PasswordRequirement
                    met={passwordRequirements.hasLowercase}
                    text="At least one lowercase letter (a–z)"
                  />
                  <PasswordRequirement met={passwordRequirements.hasNumber} text="At least one number (0–9)" />
                  <PasswordRequirement
                    met={passwordRequirements.hasSpecialChar}
                    text="At least one special character (e.g., !@#$%^&*)"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <Label htmlFor="confirmPassword" className="form-label text-white">
                Confirm password
              </Label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className={`form-input pl-20 bg-gray-900 border-gray-700 text-white placeholder-gray-400 ${
                    fieldErrors.confirmPassword
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "focus:border-primary focus:ring-primary"
                  }`}
                  style={{ caretColor: "white", color: "white" }}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    e.target.style.color = "white"
                  }}
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 focus:outline-none"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary focus:ring-primary border-gray-700 rounded bg-gray-900"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-300">
                I agree to the{" "}
                <Link href="/legal/terms" className="font-medium text-primary hover:text-primary/80">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/legal/privacy-policy" className="font-medium text-primary hover:text-primary/80">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <div>
              <Button type="submit" className="form-button bg-[hsl(var(--primary))]" disabled={isLoading}>
                {isLoading ? (
                  "Creating account..."
                ) : (
                  <>
                    Create account <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSocialLogin("google")}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-700 rounded-md shadow-sm bg-gray-900 text-sm font-medium text-gray-300 hover:bg-gray-800 btn-hover-effect"
              >
                <span className="sr-only">Sign up with Google</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                </svg>
              </button>

              <button
                onClick={() => handleSocialLogin("github")}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-700 rounded-md shadow-sm bg-gray-900 text-sm font-medium text-gray-300 hover:bg-gray-800 btn-hover-effect"
              >
                <span className="sr-only">Sign up with GitHub</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
