"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { isValidPhone } from "@/lib/sms-utils"

export default function ForgotPasswordProfilePage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState("email")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate input based on active tab
    if (activeTab === "email" && !email.trim()) {
      setError("Please enter your email address")
      return
    }

    if (activeTab === "phone" && !phone.trim()) {
      setError("Please enter your phone number")
      return
    }

    if (activeTab === "phone" && !isValidPhone(phone)) {
      setError("Please enter a valid phone number")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/send-verification-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: activeTab === "email" ? email : undefined,
          phone: activeTab === "phone" ? phone : undefined,
          isLoggedIn: true,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Failed to send verification code")
        setLoading(false)
        return
      }

      setSuccess(true)

      // Redirect to OTP verification page
      router.push(
        `/otp-verification?${activeTab === "email" ? `email=${encodeURIComponent(email)}` : `phone=${encodeURIComponent(phone)}`}&profile=true`,
      )
    } catch (err) {
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>Choose how you want to receive your verification code</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="phone">Phone</TabsTrigger>
            </TabsList>

            <TabsContent value="email">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    disabled={loading}
                    className="w-full"
                  />
                </div>

                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send Verification Code"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="phone">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    disabled={loading}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: +1 (555) 123-4567 or 5551234567</p>
                </div>

                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send Verification Code"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/profile" className="text-sm text-blue-600 hover:underline">
            Back to Profile
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
