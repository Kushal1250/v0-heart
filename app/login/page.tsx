"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, AlertCircle, Phone } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

// Country codes with their respective codes and names
const countryCodes = [
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+1", country: "United States", flag: "🇺🇸" },
  { code: "+44", country: "United Kingdom", flag: "🇬🇧" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+39", country: "Italy", flag: "🇮🇹" },
  { code: "+7", country: "Russia", flag: "🇷🇺" },
  { code: "+55", country: "Brazil", flag: "🇧🇷" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+82", country: "South Korea", flag: "🇰🇷" },
  { code: "+34", country: "Spain", flag: "🇪🇸" },
  { code: "+31", country: "Netherlands", flag: "🇳🇱" },
  { code: "+46", country: "Sweden", flag: "🇸🇪" },
  { code: "+41", country: "Switzerland", flag: "🇨🇭" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+27", country: "South Africa", flag: "🇿🇦" },
]

// Phone number formatting function for display
function formatPhoneNumber(countryCode: string, phoneNumber: string): string {
  // Remove any non-digit characters from phone number
  const cleanNumber = phoneNumber.replace(/\D/g, "")

  // Format based on country code
  if (countryCode === "+91" && cleanNumber.length === 10) {
    // Indian format: +91-9016261380
    return `${countryCode}-${cleanNumber}`
  } else if (countryCode === "+1" && cleanNumber.length === 10) {
    // US format: +1-5551234567
    return `${countryCode}-${cleanNumber}`
  } else if (cleanNumber.length >= 7) {
    // Generic format for other countries
    return `${countryCode}-${cleanNumber}`
  }

  return `${countryCode}-${cleanNumber}`
}

// Phone number validation function
function isValidPhoneNumber(countryCode: string, phoneNumber: string): boolean {
  const cleanNumber = phoneNumber.replace(/\D/g, "")

  // Validation based on country code
  switch (countryCode) {
    case "+91": // India
      return cleanNumber.length === 10 && /^[6-9]/.test(cleanNumber)
    case "+1": // US/Canada
      return cleanNumber.length === 10
    case "+44": // UK
      return cleanNumber.length >= 10 && cleanNumber.length <= 11
    case "+86": // China
      return cleanNumber.length === 11
    case "+81": // Japan
      return cleanNumber.length >= 10 && cleanNumber.length <= 11
    default:
      return cleanNumber.length >= 7 && cleanNumber.length <= 15
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [countryCode, setCountryCode] = useState("+91") // Default to India
  const [phoneNumber, setPhoneNumber] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "") // Remove non-digits
    setPhoneNumber(value)
  }

  const getFormattedPhoneNumber = () => {
    return formatPhoneNumber(countryCode, phoneNumber)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Validate inputs
      if (!email || !password) {
        setError("Email and password are required")
        setLoading(false)
        return
      }

      if (!phoneNumber) {
        setError("Phone number is required")
        setLoading(false)
        return
      }

      // Validate phone number format
      if (!isValidPhoneNumber(countryCode, phoneNumber)) {
        let errorMessage = "Please enter a valid phone number"
        if (countryCode === "+91") {
          errorMessage = "Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9)"
        }
        setError(errorMessage)
        setLoading(false)
        return
      }

      // Format the complete phone number
      const formattedPhone = getFormattedPhoneNumber()

      const result = await login(email, password, formattedPhone)

      if (result.success) {
        router.push("/dashboard")
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="flex space-x-2">
                <Select value={countryCode} onValueChange={setCountryCode} disabled={loading}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countryCodes.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <div className="flex items-center space-x-2">
                          <span>{country.flag}</span>
                          <span>{country.code}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={countryCode === "+91" ? "9016261380" : "Phone number"}
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
                    className="pl-10"
                    required
                    disabled={loading}
                    maxLength={15}
                  />
                </div>
              </div>
              <div className="text-xs text-gray-500">
                <p>Format: {getFormattedPhoneNumber() || `${countryCode}-XXXXXXXXXX`}</p>
                {countryCode === "+91" && (
                  <p className="text-blue-600">Indian mobile numbers should start with 6, 7, 8, or 9</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={loading}
              />
              <Label htmlFor="remember" className="text-sm">
                Remember me
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-500 underline underline-offset-4"
            >
              Forgot password?
            </Link>
          </div>
        </CardContent>
        <CardFooter>
          <div className="text-center text-sm text-gray-500 w-full">
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-600 hover:text-blue-500 underline underline-offset-4">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
