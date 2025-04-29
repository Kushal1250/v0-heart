"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Info, CheckCircle } from "lucide-react"
import { isValidEmail, isValidPhone } from "@/lib/client-validation"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"email" | "sms">("email")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setPreviewUrl(null)
    setLoading(true)

    try {
      // Basic client-side validation
      if (activeTab === "email") {
        if (!email || !email.trim()) {
          setError("Please enter your email address")
          setLoading(false)
          return
        }

        if (!isValidEmail(email)) {
          setError("Please enter a valid email address")
          setLoading(false)
          return
        }
      }

      if (activeTab === "sms") {
        if (!phone || !phone.trim()) {
          setError("Please enter your phone number")
          setLoading(false)
          return
        }

        if (!isValidPhone(phone)) {
          setError("Please enter a valid phone number including country code (e.g., +1 for US)")
          setLoading(false)
          return
        }
      }

      console.log(`Attempting to send verification code via ${activeTab}`, {
        email: activeTab === "email" ? email : undefined,
        phone: activeTab === "sms" ? phone : undefined,
      })

      const response = await fetch("/api/auth/send-verification-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: activeTab === "email" ? email : undefined,
          phone: activeTab === "sms" ? phone : undefined,
          isLoggedIn: false,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setLoading(false)
        setSuccess(true)
        setError("")

        // If there's a preview URL (development environment), show it
        if (data.previewUrl) {
          setPreviewUrl(data.previewUrl)
        }

        // Redirect after a short delay to show success message
        setTimeout(() => {
          const identifier = activeTab === "email" ? email : phone
          router.push(`/otp-verification?identifier=${encodeURIComponent(identifier)}&method=${activeTab}`)
        }, 2000)
      } else {
        const errorData = await response.json()
        setLoading(false)
        setError(errorData.message || "An error occurred. Please try again.")

        // If there's still a preview URL despite the error, show it for debugging
        if (errorData.previewUrl) {
          setError(`${errorData.message} Preview: ${errorData.previewUrl}`)
          setPreviewUrl(errorData.previewUrl)
        }
      }
    } catch (err: any) {
      console.error("Error sending verification code:", err)
      setError(err.message || "An error occurred while sending the verification code. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Format phone number as user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow digits, spaces, parentheses, hyphens, and plus sign
    const filtered = value.replace(/[^\d\s()+-]/g, "")
    setPhone(filtered)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4 py-12 sm:px-6 lg:px-8 text-white">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-white">Reset Your Password</CardTitle>
          <CardDescription className="text-center text-gray-300">
            We'll send you a verification code to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "email" | "sms")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-700">
              <TabsTrigger value="email" className="data-[state=active]:bg-blue-600">
                Email
              </TabsTrigger>
              <TabsTrigger value="sms" className="data-[state=active]:bg-blue-600">
                SMS
              </TabsTrigger>
            </TabsList>
            <TabsContent value="email">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full bg-gray-700 border-gray-600 text-white"
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
                    <AlertDescription>Verification code sent! Redirecting...</AlertDescription>
                  </Alert>
                )}

                {previewUrl && (
                  <Alert className="bg-blue-900 border-blue-800 text-blue-200">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Development Mode</AlertTitle>
                    <AlertDescription>
                      <p>Email preview available:</p>
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-300 hover:text-blue-200"
                      >
                        View Email
                      </a>
                    </AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading || !email}>
                  {loading ? "Sending..." : "Send Verification Code"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="sms">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="block w-full bg-gray-700 border-gray-600 text-white"
                    required
                  />
                  <p className="text-xs text-gray-400">
                    Enter your full phone number including country code (e.g., +1 for US)
                  </p>
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
                    <AlertDescription>Verification code sent! Redirecting...</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading || !phone}>
                  {loading ? "Sending..." : "Send Verification Code"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" className="text-blue-400 hover:text-blue-300" asChild>
            <Link href="/login">Back to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
